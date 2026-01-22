"use client";
import React, { useState, useMemo } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Booking } from '@/lib/aula-types';
import HOLIDAYS from '@/lib/holidays';
import { collection, addDoc, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useUser } from '@/firebase/provider';
import AULA_COURSES, { AulaCourse } from '@/lib/aula-courses';
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
  const { data: bookings } = useCollection(bookingsRef);
  // Form state
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
  // Courses state (initialized from static list) — allows add/edit in UI
  const [courses, setCourses] = useState<AulaCourse[]>(AULA_COURSES);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseHours, setCourseHours] = useState<number>(48);
  const [courseDescription, setCourseDescription] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseArea, setCourseArea] = useState('');

  const calendarRef = React.useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  const coursesRef = useMemoFirebase(() => collection(firestore, 'aulaCourses'), [firestore]) as any;
  const { data: coursesData } = useCollection(coursesRef);

  // Detect admin by checking existence of /admins/{email}
  React.useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user?.email) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      try {
        const ref = doc(firestore, 'admins', user.email);
        const snap = await getDoc(ref);
        if (!cancelled) setIsAdmin(!!snap.exists());
      } catch (err) {
        console.error('Error checking admin doc', err);
        if (!cancelled) setIsAdmin(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [user?.email, firestore]);

  // Sync remote courses into local state when available
  React.useEffect(() => {
    if (coursesData && Array.isArray(coursesData) && coursesData.length > 0) {
      setCourses(coursesData as AulaCourse[]);
    } else {
      setCourses(AULA_COURSES);
    }
  }, [coursesData]);

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
    const course = courses.find(c => c.id === courseId);
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
  }, [bookings, courses]); // Add courses dependency
  // Holiday Date objects for calendar disabled/modifiers
  const holidayDates = useMemo(() => HOLIDAYS.map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }), [HOLIDAYS]);
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [requestedEndDate, setRequestedEndDate] = useState<string>('');
  const overlappingBookings = useMemo(() => {
    if (!previewDates || previewDates.length === 0) return [] as any[];
    return (bookings || []).filter((b: any) => bookingReservedDates(b).some((d: string) => previewDates.includes(d)));
  }, [bookings, previewDates, courses]); // Add courses dependency

  const confirmedInMunicipio = useMemo(() => {
    if (!municipio) return [] as any[];
    return (bookings || []).filter((b: any) => ((b?.public?.status || b?.status) === 'confirmada') && (b?.public?.location?.municipio || b?.location?.municipio) === municipio);
  }, [bookings, municipio]);
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // Exclude courses with 96 hours from the public catalog
    const available = courses.filter(c => c.hours !== 96);
    if (!q) return available;
    return available.filter(c => c.title.toLowerCase().includes(q));
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
    // Weekday enforcement removed — selection logic already prevents weekends and preview checks conflicts
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
    const conflict = (bookings || []).some((b: any) => {
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
      // Get a fresh reference
      const colRef = collection(firestore, 'aulaMovilBookings');

      // Create a single booking document with all information
      const payload = {
        courseId: selectedCourseId || null,
        courseTitle: (courses.find(c => c.id === selectedCourseId)?.title) || null,
        associationName: associationName.trim(),
        contactName: contactName.trim() || null,
        contactPhone: contactPhone.trim() || null,
        participants,
        canReadWrite,
        requestedDate,
        reservedDates: plannedDates,
        status: 'propuesta',
        location: {
          municipio: municipio.trim(),
          vereda: vereda.trim() || null,
          direccion: direccion.trim(),
          coordinates: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : null,
        },
        // Compatibility with legacy "public" structure
        public: {
          courseId: selectedCourseId || null,
          courseTitle: (courses.find(c => c.id === selectedCourseId)?.title) || null,
          associationName: associationName.trim(),
          participants,
          requestedDate,
          reservedDates: plannedDates,
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
      };

      console.log('Sending payload to Firestore:', payload);
      await addDoc(colRef, payload);

      const successText = 'Solicitud enviada correctamente. Le contactaremos para coordinar.';
      setMessage({ type: 'success', text: successText });
      toast({ title: 'Enviado', description: successText } as any);
      
      // Clear all fields
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
    } catch (err: any) {
      console.error('Firestore Error:', err);
      const errorMsg = err?.message || 'Error al enviar la solicitud. Intente de nuevo.';
      setMessage({ type: 'error', text: errorMsg });
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' } as any);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectCourse(courseId: string) {
    setSelectedCourseId(courseId);
    setExpandedCourse(courseId);
    // Scroll to STEP 2 (Calendar)
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  // Course management helpers
  function handleEditCourse(courseId: string) {
    const c = courses.find(x => x.id === courseId);
    if (!c) return;
    setEditingCourseId(courseId);
    setCourseTitle(c.title || '');
    setCourseHours(c.hours || 48);
    setCourseDescription(c.description || '');
    setCourseInstructor(c.instructor || '');
    setCourseArea(c.area || '');
    setTimeout(() => setExpandedCourse(courseId), 40);
  }

  function handleCancelEdit() {
    setEditingCourseId(null);
    setCourseTitle('');
    setCourseHours(48);
    setCourseDescription('');
    setCourseInstructor('');
    setCourseArea('');
  }

  async function handleSaveCourse(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const title = courseTitle.trim();
    if (!title) {
      toast({ title: 'Error', description: 'El curso requiere un título.', variant: 'destructive' } as any);
      return;
    }

    if (editingCourseId) {
      const updatedCourse: AulaCourse = { id: editingCourseId, title, hours: courseHours, description: courseDescription, instructor: courseInstructor, area: courseArea };
      if (isAdmin) {
        try {
          await setDoc(doc(firestore, 'aulaCourses', editingCourseId), updatedCourse);
          setCourses(prev => prev.map(c => c.id === editingCourseId ? updatedCourse : c));
          toast({ title: 'Actualizado', description: 'Curso actualizado en Firestore.' } as any);
        } catch (err) {
          console.error('Error updating course in Firestore', err);
          toast({ title: 'Error', description: 'No se pudo actualizar el curso en Firestore.' , variant: 'destructive'} as any);
        }
      } else {
        setCourses(prev => prev.map(c => c.id === editingCourseId ? updatedCourse : c));
        toast({ title: 'Actualizado (local)', description: 'Curso actualizado localmente. Sign-in como admin para persistir.' } as any);
      }
    } else {
      const baseCourse = { title, hours: courseHours, description: courseDescription, instructor: courseInstructor, area: courseArea } as Omit<AulaCourse,'id'>;
      if (isAdmin) {
        try {
          const ref = await addDoc(coursesRef, baseCourse as any);
          const created: AulaCourse = { id: ref.id, ...baseCourse } as AulaCourse;
          setCourses(prev => [created, ...prev]);
          toast({ title: 'Añadido', description: 'Curso agregado a Firestore.' } as any);
        } catch (err) {
          console.error('Error adding course to Firestore', err);
          toast({ title: 'Error', description: 'No se pudo añadir el curso en Firestore.', variant: 'destructive' } as any);
        }
      } else {
        const id = `c${Date.now()}`;
        const created: AulaCourse = { id, ...baseCourse } as AulaCourse;
        setCourses(prev => [created, ...prev]);
        toast({ title: 'Añadido (local)', description: 'Curso agregado localmente. Sign-in como admin para persistir.' } as any);
      }
    }

    handleCancelEdit();
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm('¿Está seguro de eliminar este curso?')) return;
    if (isAdmin) {
      try {
        await deleteDoc(doc(firestore, 'aulaCourses', courseId));
        toast({ title: 'Eliminado', description: 'Curso eliminado de Firestore.' } as any);
      } catch (err) {
        console.error('Error deleting course from Firestore', err);
        toast({ title: 'Error', description: 'No se pudo eliminar el curso en Firestore.', variant: 'destructive' } as any);
        return;
      }
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (!isAdmin) {
      toast({ title: 'Eliminado (local)', description: 'Curso quitado localmente.' } as any);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700">Aula Móvil CEDEAGRO — Cursos Especiales</h1>
        <p className="mt-2 text-lg text-slate-600">Fortalece las capacidades de tu asociación con formación práctica, gratuita y adaptada al campo. Selecciona un curso, elige una fecha y envía la intención.</p>
      </header>

      {/* Catalog */}
      <section className="mb-10">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6">
          <h2 className="text-xl font-bold text-emerald-800">Paso 1: Busca y elige tu capacitación</h2>
          <p className="text-sm text-emerald-700">Selecciona el tema que le interesa a tu asociación. Haz clic en "Seleccionar".</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="w-full md:w-72">
            <Input placeholder="Escribe aquí para buscar el curso..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map(c => (
            <Card key={c.id} className={`${selectedCourseId === c.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''} hover:shadow-md transition-all cursor-pointer`} onClick={() => handleSelectCourse(c.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                  </div>
                  <Badge variant={selectedCourseId === c.id ? 'default' : 'secondary'}>{c.hours}h</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2">{c.description || 'Contenido adaptado para productores del campo.'}</p>
                {selectedCourseId === c.id && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <div className="text-xs text-emerald-700"><strong>Instructor:</strong> {c.instructor || 'Por asignar'}</div>
                    <div className="text-xs text-emerald-700"><strong>Área:</strong> {c.area || 'Técnica'}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant={selectedCourseId === c.id ? 'default' : 'outline'} className="w-full" size="sm">
                  {selectedCourseId === c.id ? '✓ Seleccionado' : 'Elegir este curso'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Admin Management Section - only visible to admins */}
      {isAdmin && (
        <section className="mb-10 p-6 bg-slate-100 border rounded-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Área del Instructor: Gestionar Catálogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleSaveCourse} className="space-y-4 bg-white p-4 border rounded shadow-sm">
              <h3 className="font-bold text-sm uppercase text-slate-500">{editingCourseId ? 'Editando curso' : 'Agregar nuevo curso'}</h3>
              <div>
                <label className="block text-sm font-medium">Nombre del curso</label>
                <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="Ej: Manejo de café" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Horas</label>
                  <Input type="number" min={1} value={courseHours} onChange={e => setCourseHours(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Área</label>
                  <Input value={courseArea} onChange={e => setCourseArea(e.target.value)} placeholder="Ej: Agroecología" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Instructor Sugerido</label>
                <Input value={courseInstructor} onChange={e => setCourseInstructor(e.target.value)} placeholder="Nombre completo" />
              </div>
              <div>
                <label className="block text-sm font-medium">Breve descripción</label>
                <Input value={courseDescription} onChange={e => setCourseDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="bg-slate-700">{editingCourseId ? 'Guardar Cambios' : 'Crear Curso'}</Button>
                {editingCourseId && <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>Cancelar</Button>}
              </div>
            </form>

            <div className="bg-white p-4 border rounded shadow-sm">
              <h3 className="font-bold text-sm uppercase text-slate-500 mb-3">Cursos actuales</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {courses.map(c => (
                  <div key={c.id} className="p-2 border rounded flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.hours}h - {c.area || 'Sin área'}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditCourse(c.id)}>✎</Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCourse(c.id)}>✕</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Calendar */}
      <section ref={calendarRef} className="mb-10">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h2 className="text-xl font-bold text-blue-800">Paso 2: Elige la fecha de inicio</h2>
          <p className="text-sm text-blue-700">Toca un día en el calendario que esté vacío. Los días en rojo ya están ocupados.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex justify-center bg-white p-4 border rounded shadow-sm">
            <Calendar
              mode="single"
              selected={requestedDate ? (function(){ const [y,m,d] = requestedDate.split('-').map(Number); return new Date(y,m-1,d); })() : undefined}
              onSelect={(d) => {
                if (!d) return;
                const day = d as Date;
                const weekday = day.getDay();
                if (weekday === 0 || weekday === 6) return;
                const iso = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
                const daysNeeded = getCourseDays(selectedCourseId || null);
                const planned = generateBusinessDays(iso, daysNeeded);

                const conflictPreview = (bookings || []).some(b => bookingReservedDates(b).some((dd: string) => planned.includes(dd)));
                if (conflictPreview) {
                  toast({ title: 'Fecha no disponible', description: 'Esos días ya están ocupados por otra asociación.', variant: 'destructive' } as any);
                  return;
                }
                setRequestedDate(iso);
                setPreviewDates(planned);
                setRequestedEndDate(planned[planned.length - 1] || '');
                // Scroll to Paso 3 (Form)
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
              }}
              disabled={[{ dayOfWeek: [0,6] }, ...holidayDates, ...Array.from(bookedDates).map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); })]}
              modifiers={{
                booked: Array.from(bookedDates).map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }),
                preview: previewDates.map(d => { const [y,m,dd] = d.split('-').map(Number); return new Date(y,m-1,dd); }),
                holiday: holidayDates,
              }}
              modifiersClassNames={{ 
                booked: 'bg-red-100 text-red-500 line-through cursor-not-allowed', 
                preview: 'bg-emerald-600 text-white font-bold scale-110 shadow-lg', 
                holiday: 'bg-slate-100 text-slate-400 opacity-50' 
              }}
              className="w-full max-w-md"
            />
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded bg-white shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Guía de colores</h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-center"><span className="w-4 h-4 bg-white border border-slate-300 mr-3 rounded" /> <span className="text-slate-700">Disponible (puedes elegirlo)</span></li>
                <li className="flex items-center"><span className="w-4 h-4 bg-red-100 mr-3 rounded" /> <span className="text-slate-700">Ocupado / No disponible</span></li>
                <li className="flex items-center"><span className="w-4 h-4 bg-emerald-600 mr-3 rounded" /> <span className="text-slate-700">Tu selección</span></li>
                <li className="flex items-center"><span className="w-4 h-4 bg-slate-100 mr-3 rounded" /> <span className="text-slate-400">Festivo o Fin de semana</span></li>
              </ul>
            </div>
            
            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader className="py-3">
                <CardTitle className="text-base text-emerald-800">Fecha seleccionada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-emerald-700">
                  {requestedDate ? requestedDate : 'Ninguna'}
                </div>
                {previewDates.length > 1 && (
                  <div className="text-sm text-emerald-600">
                    Termina el: <strong>{requestedEndDate}</strong>
                    <br />({previewDates.length} días de formación)
                  </div>
                )}
                {!requestedDate && (
                  <p className="text-xs text-amber-700">Por favor, selecciona un día blanco en el calendario.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Form (bottom) */}
      <section className="mb-12 max-w-2xl mx-auto">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <h2 className="text-xl font-bold text-amber-800">Paso 3: Envía tus datos</h2>
          <p className="text-sm text-amber-700">Escribe aquí la información de tu asociación para contactarte.</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 border rounded-lg shadow-sm">
          {selectedCourseId && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">✓</div>
              <div>
                <div className="text-xs text-emerald-600 uppercase tracking-wider font-bold">Curso seleccionado</div>
                <div className="text-xl font-extrabold text-slate-800">{(courses.find(c => c.id === selectedCourseId)?.title)}</div>
              </div>
            </div>
          )}

          {/* Section 1: Association & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">1. Datos de la Asociación y Contacto</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de la Asociación *</label>
              <Input 
                value={associationName} 
                onChange={e => setAssociationName(e.target.value)} 
                placeholder="Ej: Asociación de Productores de..." 
                className="h-12 text-lg" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Persona de contacto *</label>
                <Input 
                  value={contactName} 
                  onChange={e => setContactName(e.target.value)} 
                  placeholder="Nombre y apellido" 
                  className="h-12" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Número de Celular *</label>
                <Input 
                  value={contactPhone} 
                  onChange={e => setContactPhone(e.target.value)} 
                  placeholder="Ej: 310 123 4567" 
                  className="h-12" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">¿Cuántos asistirán? *</label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    min={15} 
                    value={participants} 
                    onChange={e => setParticipants(Number(e.target.value))} 
                    className="h-12 text-lg w-24 text-center font-bold" 
                    required
                  />
                  <span className="text-sm text-slate-500 font-medium">Mínimo 15 personas</span>
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center cursor-pointer p-3 border rounded-lg w-full hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <input 
                    type="checkbox" 
                    checked={canReadWrite} 
                    onChange={e => setCanReadWrite(e.target.checked)} 
                    className="w-6 h-6 mr-3 border-emerald-500 text-emerald-600 rounded" 
                  />
                  <span className="text-sm font-bold text-slate-700">Confirmamos que los participantes saben leer y escribir</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">2. Lugar de la capacitación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Municipio *</label>
                <Input 
                  value={municipio} 
                  onChange={e => setMunicipio(e.target.value)} 
                  placeholder="Ej: Tunja" 
                  className="h-12" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Vereda</label>
                <Input 
                  value={vereda} 
                  onChange={e => setVereda(e.target.value)} 
                  placeholder="Nombre de la vereda" 
                  className="h-12" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Dirección o Sitio de Referencia *</label>
              <Input 
                value={direccion} 
                onChange={e => setDireccion(e.target.value)} 
                placeholder="Ej: Escuela central o salón comunal" 
                className="h-12" 
                required
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-500 mb-2 italic">
                Opcional: Si puedes, marca el sitio exacto en el mapa
              </label>
              <div className="border rounded-lg overflow-hidden shadow-inner">
                <MapboxLocationPicker
                  onLocationSelect={(loc) => {
                    if (loc.municipality?.name) setMunicipio(loc.municipality.name);
                    if (loc.address) setDireccion(loc.address);
                    setLat(String(loc.coordinates[0]));
                    setLng(String(loc.coordinates[1]));
                  }}
                  height="250px"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`${message.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'} p-4 border rounded-lg font-bold text-center animate-in fade-in zoom-in duration-300`}>
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <Button 
              disabled={submitting || !selectedCourseId || !requestedDate} 
              className={`w-full h-16 text-xl font-extrabold shadow-xl transition-all ${submitting ? 'bg-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {submitting ? (
                <div className="flex items-center gap-3">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  GUARDANDO... POR FAVOR ESPERE
                </div>
              ) : 'ENVIAR SOLICITUD AHORA'}
            </Button>
            
            {(!selectedCourseId || !requestedDate) && (
              <p className="text-center mt-3 text-sm font-bold text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 animate-pulse">
                ⚠️ Debes elegir primero un curso y una fecha en los pasos anteriores.
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
