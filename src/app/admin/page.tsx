"use client";

import React, { useState } from 'react';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { Booking } from '@/lib/aula-types';

export default function AdminPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const adminsRef = useMemoFirebase(() => collection(firestore, 'admins'), [firestore]) as any;
  const { data: admins, isLoading } = useCollection<{ email: string; createdAt?: string; createdBy?: string }>(adminsRef);

  const bookingsRef = useMemoFirebase(() => collection(firestore, 'aulaMovilBookings'), [firestore]) as any;
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsRef as any);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isUserLoading) return <div className="p-6">Verificando usuario...</div>;

  const isCurrentAdmin = !!admins?.find(a => a.email === user?.email);

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Área administrativa</h1>
        <p>Debe iniciar sesión con una cuenta válida para acceder a esta página.</p>
      </div>
    );
  }

  if (!isCurrentAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Área administrativa</h1>
        <p>Su cuenta ({user.email}) no tiene privilegios de administrador. Pídale a un administrador que agregue su correo.</p>
      </div>
    );
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) {
      setMessage({ type: 'error', text: 'Ingrese un correo electrónico.' });
      return;
    }

    if (admins?.some(a => a.email === email)) {
      setMessage({ type: 'error', text: 'El correo ya es administrador.' });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(adminsRef, { email, createdAt: new Date().toISOString(), createdBy: user?.email || null });
      setMessage({ type: 'success', text: 'Administrador agregado correctamente.' });
      setNewAdminEmail('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al agregar administrador.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveAdmin(id: string, email: string) {
    if (!confirm(`Eliminar administrador ${email}?`)) return;
    try {
      await deleteDoc(doc(firestore, 'admins', id));
      setMessage({ type: 'success', text: 'Administrador eliminado.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al eliminar administrador.' });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Panel de Administradores</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Agregar nuevo administrador</h2>
        <form onSubmit={handleAddAdmin} className="flex gap-2">
          <input value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="correo@dominio" className="border p-2 rounded flex-1" />
          <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">Agregar</button>
        </form>
        {message && <div className={message.type === 'error' ? 'text-red-700 mt-2' : 'text-green-700 mt-2'}>{message.text}</div>}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Administradores registrados</h2>
        {isLoading && <p>Cargando administradores...</p>}
        {!isLoading && (!admins || admins.length === 0) && <p>No hay administradores registrados.</p>}
        {!isLoading && admins && (
          <ul className="space-y-2">
            {admins.map(a => (
              <li key={a.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.email}</div>
                  <div className="text-sm text-slate-600">Creado: {a.createdAt ?? '-'}</div>
                </div>
                <div>
                  {a.email === user.email ? (
                    <span className="text-sm text-slate-500">(Usted)</span>
                  ) : (
                    <button onClick={() => handleRemoveAdmin(a.id, a.email)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-2">Solicitudes Aula Móvil</h2>
        {isLoadingBookings && <p>Cargando solicitudes...</p>}
        {!isLoadingBookings && (!bookings || bookings.length === 0) && <p>No hay solicitudes.</p>}
        {!isLoadingBookings && bookings && (
          <ul className="space-y-2">
            {bookings.map(b => (
              <li key={b.id} className="p-3 border rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{b.public?.courseTitle || b.courseTitle || '—'}</div>
                    <div className="text-sm text-slate-600">Asociación: {b.public?.associationName || b.associationName || '-'}</div>
                    <div className="text-sm text-slate-600">Fecha solicitada: {b.public?.requestedDate || b.requestedDate || '-'}</div>
                    <div className="text-sm text-slate-600">Estado: <span className="font-medium">{b.public?.status || b.status || 'propuesta'}</span></div>
                    {b.private?.contactName && <div className="text-sm">Contacto: {b.private.contactName} — {b.private.contactPhone}</div>}
                  </div>
                  <div className="space-y-2 text-right">
                    {(b.public?.status || b.status) === 'propuesta' && (
                      <button onClick={async () => {
                        if (!b.id) return;
                        try {
                          await updateDoc(doc(firestore, 'aulaMovilBookings', b.id), { 'public.status': 'confirmada', 'public.confirmedAt': new Date().toISOString() });
                          alert('Solicitud marcada como confirmada.');
                        } catch (err) {
                          console.error(err);
                          alert('Error al confirmar la solicitud.');
                        }
                      }} className="px-3 py-1 bg-emerald-600 text-white rounded">Confirmar</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
