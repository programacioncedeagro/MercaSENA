'use client';

import { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DATA = [
  {
    id: 1, max: 10, esencial: true,
    nombre: 'Ingresos provenientes del trabajo en la organización',
    norma: 'Art. 5° Acuerdo 1-0009/2023 · Criterio 1 de identificación de formas organizativas populares',
    preguntas: [
      '¿Cuántos integrantes viven principalmente de lo que produce o vende la organización?',
      '¿Tienen otra fuente de ingresos distinta a la actividad colectiva? ¿Cuál?',
      '¿Qué pasa con la organización si un integrante se retira? ¿Sigue funcionando?',
    ],
    evidencias: [
      'Lista de integrantes con actividad y fuente de ingresos declarada',
      'Registros de ventas o ingresos de la organización',
      'Declaración verbal concordante de al menos dos integrantes',
    ],
    opciones: [
      { pts: 10, label: '10 pts — Completo', desc: 'La mayoría de los integrantes vive principalmente del trabajo colectivo en la organización.' },
      { pts: 5, label: '5 pts — Parcial', desc: 'Al menos la mitad de los integrantes obtiene ingresos significativos del trabajo colectivo.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'Solo una o dos personas obtienen ingresos del trabajo colectivo.' },
    ],
  },
  {
    id: 2, max: 15, esencial: true,
    nombre: 'Producción de bienes o servicios para consumo o intercambio',
    norma: 'Art. 5° Acuerdo 1-0009/2023 · Criterios 2 y 3 de identificación · Circular 31/2025 – circuitos cortos',
    preguntas: [
      '¿Qué produce, transforma o comercializa la organización?',
      '¿A quién le venden o intercambian sus productos o servicios?',
      '¿El producto llega directamente al consumidor o pasa por varios intermediarios?',
    ],
    evidencias: [
      'Muestra física del producto o evidencia del servicio prestado',
      'Registro de clientes o compradores habituales (cuaderno, contactos)',
      'Facturas, remisiones o cuadernos de ventas',
    ],
    opciones: [
      { pts: 15, label: '15 pts — Completo', desc: 'Produce y vende directamente al consumidor o a establecimientos de la red, sin depender de intermediarios externos.' },
      { pts: 8, label: '8 pts — Parcial', desc: 'Produce regularmente pero depende de intermediarios para llegar al consumidor final.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'No produce ni comercializa de manera activa y regular.' },
    ],
  },
  {
    id: 3, max: 10, esencial: true,
    nombre: 'Generación de bienes o servicios para la supervivencia familiar',
    norma: 'Acuerdo 1-0009/2023 · Criterio 3 – sustento familiar y comunitario',
    preguntas: [
      '¿Lo que producen alcanza para el consumo propio de las familias además de lo que venden?',
      '¿La organización tiene algún mecanismo de apoyo cuando una familia integrante tiene dificultades?',
      '¿Hay producción para autoconsumo o trueque interno entre integrantes?',
    ],
    evidencias: [
      'Relato de integrantes sobre consumo propio y seguridad alimentaria',
      'Existencia de fondo solidario, trueque interno o apoyo mutual',
      'Diversificación de productos para autoconsumo además de los comercializados',
    ],
    opciones: [
      { pts: 10, label: '10 pts — Completo', desc: 'La organización garantiza autoconsumo de sus integrantes y tiene mecanismo de apoyo solidario ante dificultades.' },
      { pts: 5, label: '5 pts — Parcial', desc: 'Garantiza autoconsumo básico pero sin mecanismo formal de apoyo solidario.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'Solo produce para vender; no hay autoconsumo ni solidaridad interna.' },
    ],
  },
  {
    id: 4, max: 15, esencial: false,
    nombre: 'Integración parcial al mercado mediante circuitos formales e informales',
    norma: 'Acuerdo 1-0009/2023 · Criterio 4 – circuitos de comercialización · Circular 31/2025 – mercados campesinos',
    preguntas: [
      '¿Participan en ferias campesinas, mercados locales, plazas de mercado o tiendas veredales?',
      '¿Tienen acuerdos de compra directa con establecimientos, comedores, asaderos o tiendas?',
      '¿Han vendido alguna vez a una institución (colegio, hospital, alcaldía, PAE, ICBF)?',
    ],
    evidencias: [
      'Comprobantes de participación en ferias o mercados campesinos',
      'Acuerdos verbales o escritos con compradores directos',
      'Facturas o registros de ventas a instituciones',
    ],
    opciones: [
      { pts: 15, label: '15 pts — Completo', desc: 'Vende en mercados directos con regularidad y tiene acuerdos establecidos con compradores o instituciones.' },
      { pts: 8, label: '8 pts — Parcial', desc: 'Participa en ferias o mercados pero sin acuerdos regulares ni ventas institucionales.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'No tiene ningún canal de comercialización activo o acceso a mercados.' },
    ],
  },
  {
    id: 5, max: 15, esencial: false,
    nombre: 'Representación de la diversidad social y cultural del territorio',
    norma: 'Acuerdo 1-0009/2023 · Criterios 5 y 6 · PND 2022-2026 Art. 51 y 52 – enfoque diferencial',
    preguntas: [
      '¿Cuántas mujeres y cuántos hombres integran la organización?',
      '¿Hay jóvenes menores de 28 años participando activamente en la producción o la gestión?',
      '¿Hay integrantes víctimas del conflicto, adultos mayores, indígenas o personas con discapacidad?',
    ],
    evidencias: [
      'Lista de integrantes con género, edad y condición especial',
      'Roles asignados a mujeres y jóvenes en la dirección o producción',
      'Autodeclaración de condición diferencial (víctima, étnica, discapacidad)',
    ],
    opciones: [
      { pts: 15, label: '15 pts — Completo', desc: 'Más del 50% son mujeres o jóvenes con roles activos; hay integrantes de poblaciones en condición diferencial.' },
      { pts: 8, label: '8 pts — Parcial', desc: 'Al menos el 40% son mujeres o hay participación de jóvenes, aunque sin roles de liderazgo formal.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'No hay diversidad evidente ni participación de mujeres, jóvenes u otras poblaciones diferenciales.' },
    ],
  },
  {
    id: 6, max: 15, esencial: true,
    nombre: 'Toma de decisiones colectiva y redistribución de ingresos',
    norma: 'Acuerdo 1-0009/2023 · Criterio 7 – gobernanza colectiva · Circular 31/2025 – fortalecimiento asociativo',
    preguntas: [
      '¿Cómo toman las decisiones importantes? ¿Las decide una sola persona o el grupo?',
      '¿Cómo se distribuyen los ingresos o excedentes entre los integrantes?',
      '¿Tienen actas, registros de reuniones o reglamento interno?',
    ],
    evidencias: [
      'Actas de reunión o asamblea con firmas de asistentes',
      'Reglamento interno, estatutos o acuerdo de funcionamiento',
      'Relato concordante de al menos dos integrantes sobre la toma de decisiones',
    ],
    opciones: [
      { pts: 15, label: '15 pts — Completo', desc: 'Decisiones en asamblea o reunión colectiva, con actas verificables y distribución documentada de ingresos.' },
      { pts: 8, label: '8 pts — Parcial', desc: 'Decisiones colectivas verificadas por los integrantes pero sin documentación formal.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'Una sola persona toma las decisiones y controla los ingresos; no hay gobernanza colectiva.' },
    ],
  },
  {
    id: 7, max: 10, esencial: true,
    nombre: 'Al menos un (1) año de actividades continuas en el territorio',
    norma: 'Acuerdo 1-0009/2023 · Criterio 8 – trayectoria y arraigo territorial',
    preguntas: [
      '¿Cuándo comenzaron a funcionar como organización? ¿Recuerdan el mes y el año?',
      '¿Han tenido períodos sin actividad? ¿Por qué y cuánto tiempo?',
      '¿Alguien en la comunidad, en la alcaldía o en alguna institución conoce y puede dar fe de su trayectoria?',
    ],
    evidencias: [
      'Acta de constitución, primer registro o documento fundacional',
      'Certificación de Cámara de Comercio, alcaldía o entidad pública',
      'Testimonio de líder comunitario, junta de acción comunal, párroco o funcionario local',
    ],
    opciones: [
      { pts: 10, label: '10 pts — Completo', desc: 'Más de 2 años de actividad continua y verificable mediante documentos o testimonio institucional.' },
      { pts: 5, label: '5 pts — Parcial', desc: 'Entre 1 y 2 años de actividad; verificable por testimonio comunitario aunque sin documentos formales.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'Menos de un año de funcionamiento o actividad claramente interrumpida.' },
    ],
  },
  {
    id: 8, max: 10, esencial: false,
    nombre: 'Reinversión y distribución colectiva de los ingresos obtenidos',
    norma: 'Acuerdo 1-0009/2023 · Criterio 8 – sostenibilidad económica colectiva',
    preguntas: [
      '¿Qué hacen con las ganancias o excedentes que quedan después de cubrir los costos?',
      '¿Han reinvertido en equipos, herramientas, insumos o mejoras para la organización?',
      '¿Existe un fondo común, caja menor o ahorro colectivo manejado por el grupo?',
    ],
    evidencias: [
      'Cuadernos o registros contables básicos de ingresos y gastos',
      'Evidencia de compra colectiva de equipos, herramientas o insumos',
      'Relato verificable de al menos tres integrantes sobre el manejo de excedentes',
    ],
    opciones: [
      { pts: 10, label: '10 pts — Completo', desc: 'Reinvierte y distribuye excedentes con registro; tiene fondo común o ahorro colectivo verificable.' },
      { pts: 5, label: '5 pts — Parcial', desc: 'Reinvierte en la organización pero sin registro formal ni fondo documentado.' },
      { pts: 0, label: '0 pts — No cumple', desc: 'Sin reinversión ni distribución colectiva evidente; los ingresos se quedan en una sola persona.' },
    ],
  },
];

function getResultado(total: number) {
  if (total >= 80) return { label: 'VINCULACIÓN PRIORITARIA', desc: 'La organización cumple los criterios esenciales del Acuerdo 1-0009 de 2023 en su totalidad. Procede la vinculación inmediata a la Red Popular con acompañamiento completo de la estrategia CampeSENA y Full Popular.', color: 'bg-emerald-900 text-white' };
  if (total >= 60) return { label: 'ELEGIBLE PARA VINCULACIÓN', desc: 'La organización cumple los criterios esenciales. Se vincula a la Red Popular con un plan de fortalecimiento en los criterios con puntaje parcial, en el marco de los servicios de extensión campesina y popular SENA.', color: 'bg-blue-800 text-white' };
  if (total >= 40) return { label: 'EN PROCESO DE FORTALECIMIENTO', desc: 'La organización cumple algunos criterios básicos pero requiere acompañamiento previo en organización colectiva y comercialización antes de la vinculación formal. Se propone proceso de formación SENA.', color: 'bg-amber-700 text-white' };
  return { label: 'NO ELEGIBLE EN ESTA VIGENCIA', desc: 'La organización no cumple los criterios mínimos del Acuerdo 1-0009 de 2023. Se orienta hacia procesos de sensibilización y rutas de formación SENA para fortalecer las bases de la economía popular.', color: 'bg-slate-600 text-white' };
}

export default function EvaluacionRedesPage() {
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ msg: string; kind: 'ok' | 'warn' | 'error' } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [openCriteria, setOpenCriteria] = useState<Set<number>>(new Set([1]));
  const [scores, setScores] = useState<Record<number, number>>({});
  const [observations, setObservations] = useState<Record<number, string>>({});
  const [obsGenerales, setObsGenerales] = useState('');

  const [fNombre, setFNombre] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fMunicipio, setFMunicipio] = useState('');
  const [fVereda, setFVereda] = useState('');
  const [fIntegrantes, setFIntegrantes] = useState('');
  const [fAnios, setFAnios] = useState('');
  const [fRepresentante, setFRepresentante] = useState('');
  const [fContacto, setFContacto] = useState('');
  const [fRed, setFRed] = useState('');
  const [fActividad, setFActividad] = useState('');
  const [fProductos, setFProductos] = useState('');
  const [dNombre, setDNombre] = useState('');
  const [dFecha, setDFecha] = useState('');
  const [dCentro, setDCentro] = useState('');
  const [dLugar, setDLugar] = useState('');

  const total = useMemo(() => Object.values(scores).reduce((acc, v) => acc + v, 0), [scores]);

  const toggleCriterio = (id: number) => {
    setOpenCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleScore = (id: number, pts: number) => {
    setScores((prev) => ({ ...prev, [id]: pts }));
  };

  const calcular = () => {
    if (Object.keys(scores).length < 8) {
      setStatus({ msg: `Faltan ${8 - Object.keys(scores).length} criterio(s) por calificar. Complete todos los criterios antes de calcular.`, kind: 'warn' });
      return;
    }
    setShowResult(true);
    setStatus(null);
  };

  const handleSave = async () => {
    if (!firestore) { setStatus({ msg: 'Sin conexión con Firestore.', kind: 'error' }); return; }
    if (Object.keys(scores).length < 8) { setStatus({ msg: 'Califique los 8 criterios antes de guardar.', kind: 'warn' }); return; }
    if (!fNombre.trim()) { setStatus({ msg: 'El nombre de la organización es obligatorio.', kind: 'warn' }); return; }
    setIsSaving(true);
    setStatus(null);
    try {
      const resultado = getResultado(total);
      const ref = await addDoc(collection(firestore, 'redesPopularesEvaluaciones'), {
        source: 'test_redes_populares',
        organization: {
          name: fNombre, type: fTipo, municipality: fMunicipio, territory: fVereda,
          members: Number(fIntegrantes) || 0, operatingYears: Number(fAnios) || 0,
          representative: fRepresentante, contact: fContacto,
          targetNetwork: fRed, mainActivity: fActividad, productsAndServices: fProductos,
        },
        dynamizer: { name: dNombre, visitDate: dFecha, trainingCenter: dCentro, visitPlace: dLugar },
        criteria: DATA.map((d) => ({
          id: d.id, name: d.nombre, essential: d.esencial, max: d.max,
          score: scores[d.id] ?? 0, observation: observations[d.id] ?? '',
        })),
        summary: {
          total,
          result: resultado.label,
          essentialsWithScore: DATA.filter((d) => d.esencial && (scores[d.id] ?? 0) > 0).length,
          essentialsTotal: DATA.filter((d) => d.esencial).length,
          generalObservations: obsGenerales,
        },
        createdAt: serverTimestamp(),
        submittedAtClient: new Date().toISOString(),
      });
      setStatus({ msg: `Evaluación guardada. ID: ${ref.id}`, kind: 'ok' });
    } catch {
      setStatus({ msg: 'No se pudo guardar la evaluación. Verifique conexión y permisos.', kind: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const resultado = getResultado(total);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instrumento de verificación en campo</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Test de Evaluación para el Equipo Dinamizador</h1>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
          Se aplica mediante visita al territorio o entrevista con los representantes de la forma organizativa.
          Para cada criterio se formulan preguntas directas y se registra la evidencia. El puntaje final determina
          la categoría de elegibilidad. Normativa: <strong>Acuerdo 1-0009 de 2023 · Circular 31/2025</strong>.
        </p>
      </div>

      {/* DATOS ORGANIZACIÓN */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la organización</CardTitle>
          <CardDescription>Información básica registrada durante la visita de campo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="fNombre">Nombre de la organización *</Label>
            <Input id="fNombre" value={fNombre} onChange={(e) => setFNombre(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fTipo">Tipo de organización</Label>
            <Input id="fTipo" value={fTipo} onChange={(e) => setFTipo(e.target.value)} placeholder="Asoc. campesina, cooperativa..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fMunicipio">Municipio</Label>
            <Input id="fMunicipio" value={fMunicipio} onChange={(e) => setFMunicipio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fVereda">Vereda / Provincia</Label>
            <Input id="fVereda" value={fVereda} onChange={(e) => setFVereda(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fIntegrantes">N° de integrantes</Label>
            <Input id="fIntegrantes" type="number" min={1} value={fIntegrantes} onChange={(e) => setFIntegrantes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fAnios">Años de funcionamiento</Label>
            <Input id="fAnios" type="number" min={0} value={fAnios} onChange={(e) => setFAnios(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fRepresentante">Representante legal</Label>
            <Input id="fRepresentante" value={fRepresentante} onChange={(e) => setFRepresentante(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fContacto">Contacto (teléfono/correo)</Label>
            <Input id="fContacto" value={fContacto} onChange={(e) => setFContacto(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fRed">Red a la que postula</Label>
            <Select value={fRed} onValueChange={setFRed}>
              <SelectTrigger id="fRed"><SelectValue placeholder="Seleccione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="red1">Red 1 – Corredor gastronómico central y norte</SelectItem>
                <SelectItem value="red2">Red 2 – Soberanía alimentaria oriente y paz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fActividad">Actividad principal</Label>
            <Input id="fActividad" value={fActividad} onChange={(e) => setFActividad(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="fProductos">Productos o servicios que ofrece</Label>
            <Textarea id="fProductos" value={fProductos} onChange={(e) => setFProductos(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* DATOS DINAMIZADOR */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del dinamizador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="dNombre">Nombre del dinamizador</Label>
            <Input id="dNombre" value={dNombre} onChange={(e) => setDNombre(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dFecha">Fecha de visita</Label>
            <Input id="dFecha" type="date" value={dFecha} onChange={(e) => setDFecha(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dCentro">Centro de formación</Label>
            <Input id="dCentro" value={dCentro} onChange={(e) => setDCentro(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dLugar">Lugar de la visita</Label>
            <Input id="dLugar" value={dLugar} onChange={(e) => setDLugar(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* BARRA DE PROGRESO */}
      <div className="rounded-xl border bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span>Progreso de calificación</span>
          <span className="text-emerald-700">{total} / 100 pts · {Object.keys(scores).length}/8 criterios</span>
        </div>
        <progress
          value={Math.min(100, total)}
          max={100}
          className="h-3 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-emerald-600 [&::-moz-progress-bar]:bg-emerald-600"
        />
      </div>

      {/* INSTRUCCIONES */}
      <div className="rounded-xl border bg-white p-4 text-xs text-muted-foreground">
        <p className="mb-1 font-bold uppercase tracking-wide text-emerald-700">Instrucciones para el dinamizador</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Realice la visita al territorio, preferiblemente en el espacio de trabajo habitual de la organización.</li>
          <li>Aplique las preguntas en conversación abierta, no como cuestionario formal.</li>
          <li>Solicite evidencias físicas cuando estén disponibles, sin exigir documentos que la organización no tenga.</li>
          <li>Registre la evidencia observada para cada criterio en el campo de observaciones.</li>
          <li>Asigne el puntaje según la escala definida, justificando con la evidencia recogida.</li>
          <li>Comparta el resultado con la organización antes de remitirlo al equipo regional.</li>
        </ol>
      </div>

      {/* CRITERIOS */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Evaluación de criterios</h2>
        {DATA.map((criterio) => {
          const isOpen = openCriteria.has(criterio.id);
          const scored = scores[criterio.id];
          const hasScore = scored !== undefined;
          return (
            <div key={criterio.id} className={`overflow-hidden rounded-xl border bg-white transition-shadow ${isOpen ? 'shadow-md' : ''}`}>
              <button
                type="button"
                className="flex w-full items-start gap-3 p-4 text-left"
                onClick={() => toggleCriterio(criterio.id)}
              >
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${hasScore ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {criterio.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">
                    {criterio.nombre}
                    {criterio.esencial && <span className="ml-2 text-xs font-bold text-emerald-600">ESENCIAL</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{criterio.norma}</p>
                </div>
                <span className={`flex-shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${hasScore ? scored === criterio.max ? 'bg-emerald-100 text-emerald-800' : scored > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                  {hasScore ? `${scored}/${criterio.max} pts` : 'Sin calificar'}
                </span>
                <span className="ml-2 text-muted-foreground">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="border-t px-4 pb-4 pt-3 space-y-4">
                  <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Preguntas a realizar en campo</p>
                    {criterio.preguntas.map((q, i) => (
                      <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">?</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border bg-blue-50 p-3 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Evidencias a verificar</p>
                    <ul className="space-y-1 text-xs text-blue-900 list-disc pl-4">
                      {criterio.evidencias.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Asigne el puntaje según lo observado</p>
                    {criterio.opciones.map((opt) => (
                      <label
                        key={opt.pts}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${scores[criterio.id] === opt.pts ? opt.pts === criterio.max ? 'border-emerald-400 bg-emerald-50' : opt.pts > 0 ? 'border-amber-400 bg-amber-50' : 'border-red-300 bg-red-50' : 'hover:bg-slate-50'}`}
                      >
                        <input
                          type="radio"
                          name={`c${criterio.id}`}
                          value={opt.pts}
                          checked={scores[criterio.id] === opt.pts}
                          onChange={() => handleScore(criterio.id, opt.pts)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className={`font-bold text-xs rounded px-2 py-0.5 ${opt.pts === criterio.max ? 'bg-emerald-200 text-emerald-900' : opt.pts > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'}`}>{opt.label}</span>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`obs${criterio.id}`} className="text-xs">Evidencia registrada / Observación específica de este criterio</Label>
                    <Textarea
                      id={`obs${criterio.id}`}
                      rows={2}
                      value={observations[criterio.id] ?? ''}
                      onChange={(e) => setObservations((prev) => ({ ...prev, [criterio.id]: e.target.value }))}
                      placeholder="Describa la evidencia observada o el relato recogido para este criterio..."
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* OBSERVACIONES GENERALES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observaciones generales de la visita</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={obsGenerales}
            onChange={(e) => setObsGenerales(e.target.value)}
            placeholder="Describa aspectos generales de la visita, contexto territorial, condiciones observadas, recomendaciones..."
          />
        </CardContent>
      </Card>

      {/* BOTÓN CALCULAR */}
      <div className="flex gap-3">
        <Button onClick={calcular} className="bg-emerald-700 hover:bg-emerald-800">
          Calcular puntaje final
        </Button>
      </div>

      {/* RESULTADO */}
      {showResult && (
        <Card className={resultado.color}>
          <CardHeader>
            <CardTitle className="text-2xl font-black">{total} / 100 puntos</CardTitle>
            <p className="text-lg font-bold">{resultado.label}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed opacity-90">{resultado.desc}</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs opacity-70">Total</p>
                <p className="text-2xl font-black">{total}</p>
                <p className="text-xs opacity-70">de 100 puntos</p>
              </div>
              <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs opacity-70">Criterios esenciales</p>
                <p className="text-2xl font-black">{DATA.filter((d) => d.esencial && (scores[d.id] ?? 0) > 0).length}/{DATA.filter((d) => d.esencial).length}</p>
                <p className="text-xs opacity-70">con puntaje &gt; 0</p>
              </div>
              <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs opacity-70">Criterios plenos</p>
                <p className="text-2xl font-black">{DATA.filter((d) => (scores[d.id] ?? 0) >= d.max).length}/8</p>
                <p className="text-xs opacity-70">puntaje completo</p>
              </div>
              <div className="rounded-lg bg-black/20 p-3 text-center">
                <p className="text-xs opacity-70">Categoría</p>
                <p className="text-lg font-black leading-tight">{resultado.label.split(' ')[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABLA REFERENCIA */}
      <Card className="bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tabla de resultados — referencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { badge: 'Vinculación Prioritaria', rango: '80 – 100', desc: 'Vinculación inmediata. Cumple todos los criterios esenciales.', cls: 'bg-emerald-900 text-white' },
            { badge: 'Elegible', rango: '60 – 79', desc: 'Vinculación con plan de fortalecimiento.', cls: 'bg-blue-800 text-white' },
            { badge: 'En Proceso de Fortalecimiento', rango: '40 – 59', desc: 'Proceso de acompañamiento previo a la vinculación.', cls: 'bg-amber-700 text-white' },
            { badge: 'No Elegible', rango: 'Menos de 40', desc: 'Se orienta a formación SENA. No cumple mínimos Acuerdo 009.', cls: 'bg-slate-500 text-white' },
          ].map((r) => (
            <div key={r.badge} className="flex flex-wrap items-center gap-3 text-sm">
              <span className={`min-w-[100px] rounded-full px-3 py-1 text-center text-xs font-bold ${r.cls}`}>{r.badge}</span>
              <span className="font-bold">{r.rango}</span>
              <span className="text-muted-foreground">{r.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* GUARDAR / ESTADO */}
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold">Total: {total} / 100 puntos</p>
          <p className="text-xs text-muted-foreground">
            {Object.keys(scores).length < 8 ? `Faltan ${8 - Object.keys(scores).length} criterio(s) por calificar` : 'Todos los criterios calificados'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            {isSaving ? 'Guardando...' : 'Guardar evaluación'}
          </Button>
        </div>
      </div>

      {status && (
        <div className={`rounded-lg border-l-4 p-3 text-sm ${status.kind === 'ok' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : status.kind === 'warn' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-red-500 bg-red-50 text-red-900'}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}



