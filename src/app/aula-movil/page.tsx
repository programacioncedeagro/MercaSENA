"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Booking } from '@/lib/aula-types';
import HOLIDAYS from '@/lib/holidays';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import AULA_COURSES from '@/lib/aula-courses';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { MapboxLocationPicker } from '@/components/mapbox-location-picker';

export default function AulaMovilPage() {
  const firestore = useFirestore();

  const bookingsRef = useMemoFirebase(() => collection(firestore, 'aulaMovilBookings'), [firestore]) as any;
  const { data: bookings, isLoading } = useCollection<Booking>(bookingsRef as any);

  const [associationName, setAssociationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [participants, setParticipants] = useState<number>(15);
  const [canReadWrite, setCanReadWrite] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [vereda, setVereda] = useState('');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Calendar helper: generate next N days
  const nextDays = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, []);

  // Helper: compute number of days (8h per day) for a course
  function getCourseDays(courseId: string | null) {
    const course = AULA_COURSES.find(c => c.id === courseId);
    const hours = course?.hours || 8;
    return Math.max(1, Math.ceil(hours / 8));
  }

  // Generate next N business days (skip weekends) starting at ISO date (YYYY-MM-DD)
  function generateBusinessDays(startIso: string, days: number) {
    const res: string[] = [];
    // local helpers to avoid TZ shifts
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

    // Holidays (ISO strings). Uses shared holidays list imported from `src/lib/holidays`.

    let d = dateFromISO(startIso);
    while (res.length < days) {
      const wd = d.getDay();
      const iso = isoFromDate(d);
      const isHoliday = HOLIDAYS.includes(iso);
      if (wd !== 0 && wd !== 6 && !isHoliday) res.push(iso);
      d.setDate(d.getDate() + 1);
    }
    return res;
  }

  // For an existing booking, compute its reserved dates (either stored or inferred)
  function bookingReservedDates(b: any) {
    // Support both legacy flat shape and new `public`/`private` split
    const reserved = b?.public?.reservedDates || b?.reservedDates || b?.public?.reserved || null;
    if (reserved && Array.isArray(reserved) && reserved.length) return reserved;

    const requested = b?.public?.requestedDate || b?.requestedDate || null;
    if (!requested) return [];
    const days = getCourseDays(b?.public?.courseId || b?.courseId || null);
    return generateBusinessDays(requested, days);
  }

  const bookedDates = useMemo(() => {
    const s = new Set<string>();
    (bookings || []).forEach(b => bookingReservedDates(b).forEach((d: string) => s.add(d)));
    return s;
  }, [bookings]);
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [requestedEndDate, setRequestedEndDate] = useState<string>('');
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AULA_COURSES;
    return AULA_COURSES.filter(c => c.title.toLowerCase().includes(q));
  }, [searchQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!associationName.trim()) {
      const text = 'Debe indicar el nombre de la asociación.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }
    if (!canReadWrite) {
      const text = 'Los participantes deben saber leer y escribir.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }
    if (!requestedDate) {
      const text = 'Seleccione una fecha preferida.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }
    // Ensure selected date is weekday (Mon-Fri)
    const selectedDay = new Date(requestedDate).getDay();
    if (selectedDay === 0 || selectedDay === 6) {
      const text = 'La formación solo puede programarse de lunes a viernes.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }
    if (!participants || participants < 15) {
      const text = 'Se requiere un mínimo de 15 participantes.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }

    if (!municipio.trim()) {
      const text = 'Indique el municipio donde se impartirá la formación.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }
    if (!direccion.trim()) {
      const text = 'Indique la dirección o vereda donde se impartirá la formación.';
      setMessage({ type: 'error', text });
      toast({ title: 'Error', description: text, variant: 'destructive' } as any);
      return;
    }

    // Determine reservation range (weekly scheduling: consecutive business days)
    const daysNeeded = getCourseDays(selectedCourseId || null);
    const plannedDates = generateBusinessDays(requestedDate, daysNeeded);

    // Check for conflicts across the entire planned range
      const conflict = (bookings || []).some(b => {
        const their = bookingReservedDates(b);
        return their.some((d: string) => plannedDates.includes(d));
      });
    if (conflict) {
      const text = 'Alguna fecha dentro del rango seleccionado ya está reservada. Elija otra fecha de inicio.';
      setMessage({ type: 'error', text });
      toast({ title: 'Fecha no disponible', description: text, variant: 'destructive' } as any);
      return;
    }

    setSubmitting(true);
    try {
      // Create a booking document with only public fields in the root
      const docRef = doc(bookingsRef); // generate id client-side
      await setDoc(docRef, {
        courseId: selectedCourseId || null,
        courseTitle: (AULA_COURSES.find(c => c.id === selectedCourseId)?.title) || null,
        associationName: associationName.trim(),
        participants,
        canReadWrite,
        // public fields visible in lists (no personal contact data)
        public: {
          courseId: selectedCourseId || null,
          courseTitle: (AULA_COURSES.find(c => c.id === selectedCourseId)?.title) || null,
          associationName: associationName.trim(),
          participants,
          requestedDate,
          reservedDates: generateBusinessDays(requestedDate, getCourseDays(selectedCourseId || null)),
          location: {
            municipio: municipio.trim(),
            vereda: vereda.trim() || null,
            direccion: direccion.trim(),
            coordinates: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : null,
          },
          status: 'propuesta',
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      });

      // Write private fields into a protected subcollection `private/private`
      try {
        const privateRefPath = `aulaMovilBookings/${docRef.id}/private/private`;
        const privateRef = doc(firestore, privateRefPath);
        await setDoc(privateRef, {
          contactName: contactName.trim() || null,
          contactPhone: contactPhone.trim() || null,
          createdAt: new Date().toISOString(),
        });
      } catch (innerErr) {
        // Non-fatal: log and continue. The public booking still exists.
        console.error('Error writing private subdocument:', innerErr);
      }

      const successText = 'Solicitud enviada correctamente. Le contactaremos para coordinar.';
      setMessage({ type: 'success', text: successText });
      toast({ title: 'Enviado', description: successText } as any);
      setAssociationName('');
      setContactName('');
      setContactPhone('');
      setParticipants(15);
      setCanReadWrite(false);
      setRequestedDate('');
      setRequestedEndDate('');
      setPreviewDates([]);
      setMunicipio('');
      setVereda('');
      setDireccion('');
      setLat('');
      setLng('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al enviar la solicitud. Intente de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectCourse(courseId: string) {
    setSelectedCourseId(courseId);
    setExpandedCourse(courseId);
    // Pre-fill association name hint (do not override existing)
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700">Aula Móvil CEDEAGRO — Cursos Especiales</h1>
        <p className="mt-2 text-lg text-slate-600">Fortalece las capacidades de tu asociación con formación práctica, gratuita y adaptada al campo. Selecciona un curso, elige una fecha y envía la intención.</p>
      </header>

      {/* Catalog */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Catálogo de cursos</h2>
          <div className="w-72">
            <Input placeholder="Buscar curso por nombre..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map(c => (
            <Card key={c.id} className={`${expandedCourse === c.id ? 'ring-2 ring-emerald-200' : ''} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl">{c.title}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Curso práctico dirigido a productores; contenido práctico y contextualizado.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary">{c.hours}h</Badge>
                    <div className="mt-2">
                      <Button variant={selectedCourseId === c.id ? 'secondary' : 'default'} size="sm" onClick={() => handleSelectCourse(c.id)}>
                        {selectedCourseId === c.id ? 'Seleccionado' : 'Seleccionar'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {expandedCourse === c.id && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{c.description || 'Curso práctico con contenido adaptado a productores.'}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Calendar */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Selecciona una fecha disponible</h2>
        <p className="text-sm text-slate-600 mb-4">Elige un día hábil (lunes a viernes). Las fechas en rojo están reservadas.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={requestedDate ? (function(){ const [y,m,d] = requestedDate.split('-').map(Number); return new Date(y,m-1,d); })() : undefined}
              onSelect={(d) => {
                if (!d) return;
                const day = d as Date;
                const weekday = day.getDay();
                if (weekday === 0 || weekday === 6) return; // ignore weekends
                // build ISO from local date to avoid TZ shift
                const iso = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
                const daysNeeded = getCourseDays(selectedCourseId || null);
                const planned = generateBusinessDays(iso, daysNeeded);

                // conflict across planned range
                const conflictPreview = (bookings || []).some(b => bookingReservedDates(b).some((dd: string) => planned.includes(dd)));
                if (conflictPreview) {
                  toast({ title: 'Rango ocupado', description: 'Alguna fecha dentro del rango está ocupada.', variant: 'destructive' } as any);
                  setPreviewDates([]);
                  setRequestedEndDate('');
                  return;
                }
                setRequestedDate(iso);
                setPreviewDates(planned);
                setRequestedEndDate(planned[planned.length - 1] || '');
              }}
              disabled={[{ dayOfWeek: [0,6] }]}
              modifiers={{
                booked: Array.from(bookedDates).map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }),
                preview: previewDates.map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }),
              }}
              modifiersClassNames={{ booked: 'bg-red-100 text-red-600', preview: 'bg-emerald-100/60 text-emerald-800' }}
            />
          </div>
          <div>
            <div className="p-4 border rounded">
              <h3 className="font-semibold">Leyenda</h3>
              <ul className="mt-3 text-sm space-y-2">
                <li><span className="inline-block w-3 h-3 bg-red-100 mr-2 align-middle rounded-full" /> Fecha reservada</li>
                <li><span className="inline-block w-3 h-3 bg-emerald-100 mr-2 align-middle rounded-full" /> Fecha seleccionada</li>
                <li>Solo se permiten días hábiles (L-V).</li>
              </ul>
              <div className="mt-4">
                <p className="text-sm">Fecha programada:</p>
                <div className="mt-2 font-medium">{requestedDate ? (requestedEndDate ? `${requestedDate} → ${requestedEndDate}` : requestedDate) : '—'}</div>
                {previewDates.length > 0 && (
                  <div className="mt-2 text-sm text-slate-600">Días calculados: {previewDates.length}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Agenda: Confirmadas vs Propuestas</h2>
        <p className="text-sm text-slate-600 mb-4">Vista mensual con las fechas ya reservadas (propuestas) y las confirmadas. Haz clic en un día disponible para seleccionarlo.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <Calendar
              mode="single"
              selected={requestedDate ? new Date(requestedDate) : undefined}
              onSelect={(d) => {
                if (!d) return;
                const day = d as Date;
                const weekday = day.getDay();
                if (weekday === 0 || weekday === 6) return; // ignore weekends
                const iso = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
                const daysNeeded = getCourseDays(selectedCourseId || null);
                const planned = generateBusinessDays(iso, daysNeeded);
                const conflict = (bookings || []).some(b => bookingReservedDates(b).some((d: string) => planned.includes(d)));
                if (conflict) {
                  toast({ title: 'Rango ocupado', description: 'Alguna fecha dentro del rango necesario está ocupada.', variant: 'destructive' } as any);
                  return;
                }
                // set preview (start date)
                setRequestedDate(iso);
                setPreviewDates(planned);
                setRequestedEndDate(planned[planned.length - 1] || '');
                // optionally could show a preview of reserved days
              }}
              disabled={[{ dayOfWeek: [0,6] }]}
              modifiers={{
                proposed: (bookings || []).flatMap((b: any) => ((b?.public?.status || b?.status) === 'propuesta' ? bookingReservedDates(b).map((d: string) => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }) : [])),
                confirmed: (bookings || []).flatMap((b: any) => ((b?.public?.status || b?.status) === 'confirmada' ? bookingReservedDates(b).map((d: string) => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }) : [])),
                preview: previewDates.map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }),
              }}
              modifiersClassNames={{ proposed: 'bg-amber-100 text-amber-700', confirmed: 'bg-emerald-100 text-emerald-700' }}
            />
          </div>
          <div>
            <div className="p-4 border rounded space-y-4">
              <h3 className="font-semibold">Leyenda</h3>
              <ul className="mt-1 text-sm space-y-2">
                <li><span className="inline-block w-3 h-3 bg-amber-100 mr-2 align-middle rounded-full" /> Propuesta</li>
                <li><span className="inline-block w-3 h-3 bg-emerald-100 mr-2 align-middle rounded-full" /> Confirmada</li>
                <li>Fechas no laborales están deshabilitadas.</li>
              </ul>
              <div>
                <p className="text-sm">Resumen:</p>
                <div className="mt-2 text-sm">
                  <div>Propuestas: <span className="font-medium">{(bookings || []).filter((b: Booking) => (b?.public?.status || b?.status) === 'propuesta').length}</span></div>
                  <div>Confirmadas: <span className="font-medium">{(bookings || []).filter((b: Booking) => (b?.public?.status || b?.status) === 'confirmada').length}</span></div>
                </div>
              </div>
              <div>
                <p className="text-sm">Fecha programada:</p>
                <div className="mt-2 font-medium">{requestedDate ? (requestedEndDate ? `${requestedDate} → ${requestedEndDate}` : requestedDate) : '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form (bottom) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">Enviar intención de capacitación</h2>
        <p className="text-sm text-slate-600 mb-4">Completa los datos para que el equipo coordine la visita del Aula Móvil.</p>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {selectedCourseId && (
            <div className="p-2 border-l-4 border-emerald-600 bg-emerald-50 rounded">
              <div className="text-sm">Curso seleccionado: <span className="font-semibold">{AULA_COURSES.find(c => c.id === selectedCourseId)?.title}</span></div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Nombre de la asociación</label>
            <Input value={associationName} onChange={e => setAssociationName(e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Persona de contacto (opcional)</label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Teléfono / WhatsApp (opcional)</label>
              <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium">Número de participantes</label>
                <Input type="number" min={15} value={participants} onChange={e => setParticipants(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha preferida</label>
                <Input type="text" value={requestedDate} readOnly className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Saben leer y escribir?</label>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={canReadWrite} onChange={e => setCanReadWrite(e.target.checked)} className="mr-2" />
                  Sí
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Municipio</label>
              <Input value={municipio} onChange={e => setMunicipio(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Vereda / Corregimiento</label>
              <Input value={vereda} onChange={e => setVereda(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Dirección / Referencia</label>
              <Input value={direccion} onChange={e => setDireccion(e.target.value)} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium">Seleccionar ubicación (mapa)</label>
              <div className="mt-2">
                <MapboxLocationPicker
                  onLocationSelect={(loc) => {
                    if (loc.municipality?.name) setMunicipio(loc.municipality.name);
                    if (loc.address) setDireccion(loc.address);
                    setLat(String(loc.coordinates[0]));
                    setLng(String(loc.coordinates[1]));
                  }}
                  initialLocation={undefined}
                  height="260px"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>{message.text}</div>
          )}

          <div>
            <button disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">
              {submitting ? 'Enviando...' : 'Enviar intención'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
