'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import type { PurchaseOrder, TrackingUpdate, InventoryMovement, Production } from '@/lib/types';

export function useOrders(userId?: string) {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pedidos del usuario
  useEffect(() => {
    if (!firestore || !userId) return;

    const ordersQuery = query(
      collection(firestore, 'orders'),
      where('buyerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, 
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PurchaseOrder[];
        
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading orders:', err);
        setError('Error al cargar pedidos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, userId]);

  // Crear nuevo pedido
  const createOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'trackingUpdates'>) => {
    if (!firestore) throw new Error('Firestore no disponible');

    try {
      // Usar transacción para asegurar consistencia
      const result = await runTransaction(firestore, async (transaction) => {
        // Verificar disponibilidad del producto
        const productionRef = doc(firestore, 'users', orderData.producerId, 'productions', orderData.productionId);
        const productionDoc = await transaction.get(productionRef);
        
        if (!productionDoc.exists()) {
          throw new Error('Producto no encontrado');
        }

        const production = productionDoc.data() as Production;
        const availableQuantity = production.availableQuantity ?? 0;
        const reservedQuantity = production.reservedQuantity ?? 0;
        const actualAvailable = availableQuantity - reservedQuantity;

        if (actualAvailable < orderData.quantity) {
          throw new Error(`Solo hay ${actualAvailable} kg disponibles`);
        }

        // Crear el pedido
        const orderRef = doc(collection(firestore, 'orders'));
        const newOrder: PurchaseOrder = {
          ...orderData,
          id: orderRef.id,
          status: 'pendiente',
          paymentStatus: 'pendiente',
          trackingUpdates: [{
            id: 'initial',
            timestamp: new Date().toISOString(),
            status: 'pendiente',
            message: 'Pedido creado y enviado al productor',
            updatedBy: orderData.buyerId,
            updatedByRole: 'comprador'
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        transaction.set(orderRef, newOrder);

        // Actualizar cantidad reservada del producto
        transaction.update(productionRef, {
          reservedQuantity: reservedQuantity + orderData.quantity,
          updatedAt: new Date().toISOString()
        });

        // Crear movimiento de inventario
        const inventoryRef = doc(collection(firestore, 'users', orderData.producerId, 'inventory'));
        const inventoryMovement: InventoryMovement = {
          id: inventoryRef.id,
          productionId: orderData.productionId,
          movementType: 'salida',
          quantity: orderData.quantity,
          reason: `Reserva por pedido ${orderRef.id}`,
          orderId: orderRef.id,
          previousQuantity: actualAvailable,
          newQuantity: actualAvailable - orderData.quantity,
          timestamp: new Date().toISOString(),
          createdBy: orderData.buyerId,
          notes: `Pedido de ${orderData.buyerName}`
        };

        transaction.set(inventoryRef, inventoryMovement);

        return orderRef.id;
      });

      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Actualizar estado del pedido
  const updateOrderStatus = async (orderId: string, status: PurchaseOrder['status'], message: string, updatedByRole: 'productor' | 'comprador' | 'transportador') => {
    if (!firestore || !userId) throw new Error('Firestore no disponible');

    try {
      const orderRef = doc(firestore, 'orders', orderId);
      
      const trackingUpdate: TrackingUpdate = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status,
        message,
        updatedBy: userId,
        updatedByRole
      };

      await updateDoc(orderRef, {
        status,
        trackingUpdates: [...orders.find(o => o.id === orderId)?.trackingUpdates || [], trackingUpdate],
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // Cancelar pedido
  const cancelOrder = async (orderId: string, reason: string) => {
    if (!firestore) throw new Error('Firestore no disponible');

    try {
      await runTransaction(firestore, async (transaction) => {
        const orderRef = doc(firestore, 'orders', orderId);
        const orderDoc = await transaction.get(orderRef);
        
        if (!orderDoc.exists()) {
          throw new Error('Pedido no encontrado');
        }

        const order = orderDoc.data() as PurchaseOrder;
        
        // Solo se puede cancelar si está pendiente o confirmado
        if (!['pendiente', 'confirmado'].includes(order.status)) {
          throw new Error('No se puede cancelar un pedido en este estado');
        }

        // Liberar cantidad reservada
        const productionRef = doc(firestore, 'users', order.producerId, 'productions', order.productionId);
        const productionDoc = await transaction.get(productionRef);
        
        if (productionDoc.exists()) {
          const production = productionDoc.data() as Production;
          const currentReserved = production.reservedQuantity ?? 0;
          
          transaction.update(productionRef, {
            reservedQuantity: Math.max(0, currentReserved - order.quantity),
            updatedAt: new Date().toISOString()
          });
        }

        // Actualizar pedido
        const trackingUpdate: TrackingUpdate = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          status: 'cancelado',
          message: `Pedido cancelado: ${reason}`,
          updatedBy: userId!,
          updatedByRole: 'comprador'
        };

        transaction.update(orderRef, {
          status: 'cancelado',
          trackingUpdates: [...order.trackingUpdates, trackingUpdate],
          updatedAt: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    cancelOrder
  };
}

// Hook para productores para manejar pedidos recibidos
export function useProducerOrders(producerId?: string) {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !producerId) return;

    const ordersQuery = query(
      collection(firestore, 'orders'),
      where('producerId', '==', producerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, 
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PurchaseOrder[];
        
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading producer orders:', err);
        setError('Error al cargar pedidos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, producerId]);

  // Confirmar pedido (productor)
  const confirmOrder = async (orderId: string) => {
    if (!firestore || !producerId) throw new Error('Firestore no disponible');

    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const trackingUpdate: TrackingUpdate = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'confirmado',
        message: 'Pedido confirmado por el productor',
        updatedBy: producerId,
        updatedByRole: 'productor'
      };

      await updateDoc(orderRef, {
        status: 'confirmado',
        confirmedDate: new Date().toISOString(),
        trackingUpdates: [...orders.find(o => o.id === orderId)?.trackingUpdates || [], trackingUpdate],
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  };

  return {
    orders,
    loading,
    error,
    confirmOrder,
    updateOrderStatus: (orderId: string, status: PurchaseOrder['status'], message: string) => 
      updateOrderStatus(orderId, status, message, 'productor')
  };
}

// Función auxiliar para actualizar estado (usada por ambos hooks)
async function updateOrderStatus(orderId: string, status: PurchaseOrder['status'], message: string, updatedByRole: 'productor' | 'comprador' | 'transportador') {
  // Esta función se implementa en los hooks individuales
}