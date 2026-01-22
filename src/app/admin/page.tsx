"use client";

import React, { useState } from 'react';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, setDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Booking } from '@/lib/aula-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, MapPin, Phone, User as UserIcon, CheckCircle2, Clock, Trash2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const adminsRef = useMemoFirebase(() => collection(firestore, 'admins'), [firestore]) as any;
  const { data: admins, isLoading } = useCollection<{ id: string; email: string; createdAt?: string; createdBy?: string }>(adminsRef);

  const bookingsRef = useMemoFirebase(() => collection(firestore, 'aulaMovilBookings'), [firestore]) as any;
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsRef as any);
  const [privateCache, setPrivateCache] = useState<Record<string, any>>({});

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isUserLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Verificando credenciales de administrador...</p>
      </div>
    </div>
  );

  const isCurrentAdmin = !!admins?.find(a => a.email === user?.email);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white border rounded-xl shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Módulo de Programación</h1>
        <p className="text-slate-600 mb-8">Debe iniciar sesión en el portal técnico para gestionar las capacitaciones.</p>
        <div className="space-y-4">
          <Button 
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold"
            onClick={() => router.push('/auth/programacion')}
          >
            Ir al Login de Programación
          </Button>
          <div className="bg-slate-50 p-3 rounded border text-sm text-left font-mono">
            <div className="text-[10px] text-slate-400 uppercase mb-1">Acceso Técnico</div>
            <div>User: harveydimate@gmail.com</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isCurrentAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white border rounded-xl shadow-xl text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h1>
        <p className="text-slate-600 mb-6 font-medium">La cuenta {user.email} no está registrada como administrador.</p>
        <Button variant="outline" onClick={() => router.push('/auth/programacion')} className="w-full">Usar otra cuenta</Button>
      </div>
    );
  }

  // --- Functions ---
  async function handleConfirm(b: any) {
    if (!b.id) return;
    try {
      const dateFromISO = (iso: string) => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
      };
      const isoFromDate = (dt: Date) => {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      const HOLIDAYS: string[] = (await import('@/lib/holidays')).default;
      const generateBusinessDays = (startIso: string, days: number) => {
        const res: string[] = [];
        let d = dateFromISO(startIso);
        while (res.length < days) {
          const wd = d.getDay();
          const iso = isoFromDate(d);
          const isHoliday = HOLIDAYS.includes(iso);
          if (wd !== 0 && wd !== 6 && !isHoliday) res.push(iso);
          d.setDate(d.getDate() + 1);
        }
        return res;
      };

      const daysNeeded = (function() {
        try {
          const courseId = b.public?.courseId || b.courseId || null;
          const AULA_COURSES = require('@/lib/aula-courses').default;
          const course = AULA_COURSES.find((c: any) => c.id === courseId);
          const hours = course?.hours || 8;
          return Math.max(1, Math.ceil(hours / 8));
        } catch (e) { return 1; }
      })();

      const startIso = b.public?.requestedDate || b.requestedDate;
      const reserved = startIso ? generateBusinessDays(startIso, daysNeeded) : (b.public?.reservedDates || b.reservedDates || []);

      await updateDoc(doc(firestore, 'aulaMovilBookings', b.id), { 
        'public.status': 'confirmada', 
        'public.confirmedAt': new Date().toISOString(), 
        'public.reservedDates': reserved,
        status: 'confirmada',
        reservedDates: reserved
      });
      alert('¡Solicitud Confirmada! El calendario del aula móvil ha sido actualizado.');
    } catch (err) {
      console.error(err);
      alert('Error confirmando la solicitud.');
    }
  }

  async function handleDelete(id: string) {
    if(!confirm('¿Eliminar esta solicitud definitivamente?')) return;
    try {
      await deleteDoc(doc(firestore, 'aulaMovilBookings', id));
    } catch (e) { console.error(e); }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminEmail) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const id = newAdminEmail.replace(/[.@]/g, '-');
      await setDoc(doc(firestore, 'admins', id), {
        email: newAdminEmail.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        createdBy: user?.email
      });
      setNewAdminEmail('');
      setMessage({ type: 'success', text: 'Administrador agregado correctamente.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al agregar administrador: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveAdmin(id: string, email: string) {
    if (email === user?.email) return;
    if (!confirm(`¿Eliminar a ${email} de los administradores?`)) return;
    try {
      await deleteDoc(doc(firestore, 'admins', id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar administrador.');
    }
  }

  const sortedBookings = [...(bookings || [])].sort((a,b) => {
    const da = a.public?.requestedDate || a.requestedDate || '';
    const db = b.public?.requestedDate || b.requestedDate || '';
    return db.localeCompare(da);
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-emerald-600" />
            Gestión Aula Móvil
          </h1>
          <p className="text-slate-500">Revisión de solicitudes y programación técnica</p>
        </div>
        <div className="bg-white px-4 py-2 border rounded-full shadow-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Admin: {user.email}</span>
        </div>
      </header>

      <Tabs defaultValue="programacion" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="programacion" className="px-8 font-bold">Solicitudes</TabsTrigger>
          <TabsTrigger value="usuarios" className="px-8 font-bold">Administradores</TabsTrigger>
        </TabsList>

        <TabsContent value="programacion" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {isLoadingBookings && (
              <div className="p-12 text-center text-slate-400">Cargando datos...</div>
            )}
            {!isLoadingBookings && sortedBookings.length === 0 && (
              <Card className="p-12 text-center border-dashed">
                <p className="text-slate-500 font-medium">No se han encontrado solicitudes registradas en la nueva base de datos.</p>
              </Card>
            )}

            {sortedBookings.map(b => (
              <Card key={b.id} className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${ (b.public?.status || b.status) === 'confirmada' ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Main Info */}
                    <div className="p-6 lg:col-span-8 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant={(b.public?.status || b.status) === 'confirmada' ? 'default' : 'outline'} className={ (b.public?.status || b.status) === 'confirmada' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none'}>
                            {(b.public?.status || b.status) === 'confirmada' ? 'CONFIRMADA' : 'PENDIENTE'}
                          </Badge>
                          <h2 className="text-xl font-extrabold text-slate-800 mt-2">{b.public?.courseTitle || b.courseTitle}</h2>
                          <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
                            <Clock className="w-4 h-4" />
                            <span>Solicitado: {b.public?.requestedDate || b.requestedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><UserIcon className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Asociación</p>
                            <p className="text-sm font-bold text-slate-700">{b.public?.associationName || b.associationName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><MapPin className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Ubicación</p>
                            <p className="text-sm font-bold text-slate-700">{b.public?.location?.municipio || b.location?.municipio} — {b.public?.location?.vereda || b.location?.vereda || 'Cabecera'}</p>
                            <p className="text-xs text-slate-500">{b.public?.location?.direccion || b.location?.direccion}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Box */}
                      <div className="bg-slate-50 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full border shadow-sm"><Phone className="w-4 h-4 text-emerald-600" /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-500">{b.contactName || 'Responsable'}</p>
                            <p className="text-sm font-extrabold text-emerald-700">{b.contactPhone || 'Sin teléfono'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Participantes</p>
                          <p className="text-xl font-black text-slate-800">{b.public?.participants || b.participants || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="p-6 lg:col-span-4 bg-slate-50/50 border-l flex flex-col justify-center gap-3">
                      {(b.public?.status || b.status) === 'propuesta' ? (
                        <Button 
                          onClick={() => handleConfirm(b)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold shadow-lg shadow-emerald-100"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          CONFIRMAR Y PROGRAMAR
                        </Button>
                      ) : (
                        <div className="p-4 bg-emerald-50 rounded border border-emerald-100 text-center">
                          <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Días Bloqueados</p>
                          <div className="text-[10px] text-emerald-600 overflow-hidden text-ellipsis whitespace-nowrap">
                            {(b.public?.reservedDates || b.reservedDates || []).join(', ')}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                         <Button variant="outline" className="flex-1 text-xs" asChild>
                           <a href={`https://www.google.com/maps/search/?api=1&query=${b.public?.location?.coordinates?.lat || b.location?.coordinates?.lat},${b.public?.location?.coordinates?.lng || b.location?.coordinates?.lng}`} target="_blank">Ver Mapa</a>
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Gestión de Accesos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddAdmin} className="flex gap-2">
                <Input value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="Nuevo correo de administrador..." className="flex-1" />
                <Button disabled={submitting} type="submit">Agregar Admin</Button>
              </form>
              
              {message && <div className={message.type === 'error' ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>{message.text}</div>}

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-bold text-slate-600">Email</th>
                      <th className="text-left p-3 font-bold text-slate-600">Fecha</th>
                      <th className="text-right p-3 font-bold text-slate-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins?.map(a => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="p-3 font-medium">{a.email}</td>
                        <td className="p-3 text-slate-500 text-xs">{a.createdAt ?? '-'}</td>
                        <td className="p-3 text-right">
                          {a.email !== user?.email && (
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveAdmin(a.id, a.email)} className="text-red-600">Eliminar</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

