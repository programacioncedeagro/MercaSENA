'use client';

import { useState, useEffect, useRef } from 'react';
import { DocumentData, DocumentReference, onSnapshot, Unsubscribe, DocumentSnapshot } from 'firebase/firestore';

// Cache en memoria para reducir consultas repetidas
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

// Configuración de cache por tipo de consulta
const CACHE_CONFIG = {
  productions: { ttl: 5 * 60 * 1000 }, // 5 minutos
  users: { ttl: 10 * 60 * 1000 }, // 10 minutos
  offers: { ttl: 2 * 60 * 1000 }, // 2 minutos
  workPlans: { ttl: 30 * 60 * 1000 }, // 30 minutos
  default: { ttl: 5 * 60 * 1000 } // 5 minutos por defecto
};

export function useOptimizedDoc<T = DocumentData>(
  ref: DocumentReference | null,
  options: {
    enableCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
    enableOffline?: boolean;
    retryAttempts?: number;
  } = {}
) {
  const {
    enableCache = true,
    cacheKey,
    cacheTTL,
    enableOffline = true,
    retryAttempts = 3
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const retryCountRef = useRef(0);

  const getCacheKey = (ref: DocumentReference | null): string => {
    if (cacheKey) return cacheKey;
    if (!ref) return 'null-ref';
    return `doc:${ref.path}`;
  };

  const getCacheTTL = (key: string): number => {
    if (cacheTTL) return cacheTTL;
    
    // Determinar TTL basado en el tipo de datos
    for (const [type, config] of Object.entries(CACHE_CONFIG)) {
      if (key.includes(type)) {
        return config.ttl;
      }
    }
    return CACHE_CONFIG.default.ttl;
  };

  const getCachedData = (key: string): T | null => {
    if (!enableCache) return null;
    
    const cached = queryCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    const ttl = getCacheTTL(key);
    
    if (now - cached.timestamp > ttl) {
      queryCache.delete(key);
      return null;
    }
    
    return cached.data;
  };

  const setCachedData = (key: string, data: T) => {
    if (!enableCache) return;
    
    queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: getCacheTTL(key)
    });
  };

  const setupFirestoreListener = async (ref: DocumentReference) => {
    const key = getCacheKey(ref);
    
    // Primero intentar obtener de cache
    const cachedData = getCachedData(key);
    if (cachedData) {
      setData(cachedData);
      setIsFromCache(true);
      setIsLoading(false);
    }

    try {
      const unsubscribe = onSnapshot(
        ref,
        (snapshot: DocumentSnapshot) => {
          try {
            let result: T | null = null;
            
            if (snapshot.exists()) {
              result = {
                id: snapshot.id,
                ...snapshot.data()
              } as T;
            }
            
            setData(result);
            setIsFromCache(false);
            setError(null);
            setIsLoading(false);
            retryCountRef.current = 0;
            
            // Actualizar cache
            if (result) {
              setCachedData(key, result);
            }
            
          } catch (err) {
            console.error('Error processing Firestore snapshot:', err);
            setError(err as Error);
            setIsLoading(false);
          }
        },
        (err: Error) => {
          console.error('Firestore listener error:', err);
          
          // En caso de error, intentar usar cache si está disponible
          const cachedData = getCachedData(key);
          if (cachedData && enableOffline) {
            setData(cachedData);
            setIsFromCache(true);
            setError(null);
          } else {
            setError(err);
          }
          
          setIsLoading(false);
          
          // Implementar retry con backoff exponencial
          if (retryCountRef.current < retryAttempts) {
            const delay = Math.pow(2, retryCountRef.current) * 1000; // 1s, 2s, 4s
            retryCountRef.current++;
            
            setTimeout(() => {
              console.log(`Retrying Firestore connection (attempt ${retryCountRef.current})`);
              setupFirestoreListener(ref);
            }, delay);
          }
        }
      );
      
      unsubscribeRef.current = unsubscribe;
      
    } catch (err) {
      console.error('Error setting up Firestore listener:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    setupFirestoreListener(ref);

    return () => {
      // Limpiar listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [ref?.path]); // Usar path para detectar cambios

  // Función para invalidar cache manualmente
  const invalidateCache = (key?: string) => {
    const keyToInvalidate = key || getCacheKey(ref);
    queryCache.delete(keyToInvalidate);
  };

  // Función para refrescar datos forzando bypass del cache
  const refresh = () => {
    if (ref) {
      invalidateCache();
      setupFirestoreListener(ref);
    }
  };

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh,
    invalidateCache
  };
}

// Hook para limpiar cache globalmente
export function useCacheManager() {
  const clearCache = () => {
    queryCache.clear();
    console.log('Firebase cache cleared');
  };

  const getCacheStats = () => {
    return {
      size: queryCache.size,
      keys: Array.from(queryCache.keys()),
      totalMemory: JSON.stringify(Array.from(queryCache.values())).length
    };
  };

  const pruneExpiredCache = () => {
    const now = Date.now();
    let prunedCount = 0;
    
    for (const [key, cached] of queryCache.entries()) {
      const ttl = getCacheTTL(key);
      if (now - cached.timestamp > ttl) {
        queryCache.delete(key);
        prunedCount++;
      }
    }
    
    console.log(`Pruned ${prunedCount} expired cache entries`);
    return prunedCount;
  };

  return {
    clearCache,
    getCacheStats,
    pruneExpiredCache
  };
}

// Función auxiliar privada para determinar TTL
function getCacheTTL(key: string): number {
  for (const [type, config] of Object.entries(CACHE_CONFIG)) {
    if (key.includes(type)) {
      return config.ttl;
    }
  }
  return CACHE_CONFIG.default.ttl;
}