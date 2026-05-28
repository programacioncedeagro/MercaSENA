import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const redesCards = [
  {
    num: 'Red Popular N° 1',
    nombre: 'Red Gastronómica del Corredor Central y Norte',
    territorio: 'Ricaurte · Sugamuxi · Tundama · Norte · Valderrama',
    mercado: 'Turismo Paipa · PAE · ICBF · Mercado Verde Duitama',
    productos: 'Amasijo, café, panela, bocadillo, miel, papa, hortalizas',
    turismo: 'Ruta del Sabor y el Saber Boyacense',
    color: 'bg-emerald-900',
  },
  {
    num: 'Red Popular N° 2',
    nombre: 'Red de Soberanía Alimentaria Oriente y Paz',
    territorio: 'Centro · Márquez · Neira · Oriente · Lengupá · Occidente',
    mercado: 'Turismo Puente Boyacá · RENAF · Bogotá · Honda',
    productos: 'Quesos, café, plátano, cacao, fique, frutas tropicales',
    turismo: 'Ruta del Valle de Tenza y los Territorios de Paz',
    color: 'bg-blue-900',
  },
];

const condiciones = [
  { ico: '🌱', title: 'Producen', desc: 'Asociaciones campesinas, cooperativas o grupos productivos que generen alimentos, productos agrícolas, artesanías, miel, lácteos, café, panela, frutas, hortalizas u otros bienes primarios del territorio boyacense, con un enfoque agroecológico o en proceso de transición hacia él.' },
  { ico: '🍳', title: 'Transforman', desc: 'Amasijos, panaderías, asaderos, comedores campesinos, queserías artesanales, procesadoras de panela o bocadillo, productoras de conservas, tiendas de café o cualquier establecimiento que transforme materias primas campesinas en productos de mayor valor y los comercialice directamente al consumidor.' },
  { ico: '🛒', title: 'Comercializan', desc: 'Tiendas artesanales, plazas de mercado campesinas, puntos de venta directa, organizaciones de ferias campesinas, colectivos de comercio justo o plataformas de venta que conecten la producción campesina con consumidores finales, reduciendo la cadena de intermediarios.' },
  { ico: '🌿', title: 'Generan turismo agroecológico', desc: 'Organizaciones que ofrezcan o puedan desarrollar experiencias de turismo rural, agroturismo, ecoturismo comunitario o turismo de paz articuladas con la producción campesina del territorio: visitas a fincas, talleres de elaboración, senderismo en entornos agrícolas, rutas gastronómicas o recorridos culturales.' },
  { ico: '🤝', title: 'Participan en la economía popular', desc: 'Formas organizativas cuyos miembros deriven sus principales ingresos de actividades productivas, de intercambio o de servicios a escala comunitaria; que tomen decisiones colectivamente; que redistribuyan ingresos entre sus integrantes; y que tengan como mínimo un (1) año de actividades continuas en el territorio.' },
  { ico: '🌾', title: 'Avanzan en transición agroecológica', desc: 'Organizaciones que estén implementando o dispuestas a implementar prácticas de producción sostenible: reducción de agroquímicos, uso de bioinsumos, diversificación de cultivos, conservación de suelos, aprovechamiento de agua lluvia o manejo integrado de plagas y enfermedades.' },
];

const criterios = [
  { num: 1, nombre: 'Ingresos provenientes del trabajo en la organización', desc: 'La forma organizativa se integra por personas y familias que derivan sus principales ingresos del trabajo que realizan en ella, ya sea mediante la venta de bienes y servicios o el intercambio asociativo a nivel comunitario.', esencial: true },
  { num: 2, nombre: 'Producción de bienes o servicios orientados al consumo o el intercambio', desc: 'La organización produce bienes y servicios orientados al consumo en pequeña escala, ya sea barrial, interveredal o a partir de circuitos cortos y directos de comercialización.', esencial: true },
  { num: 3, nombre: 'Generación de bienes o servicios para la supervivencia', desc: 'Los miembros de la forma organizativa generan bienes o servicios para garantizar la supervivencia de sus familias y del colectivo, contribuyendo a la seguridad alimentaria y el bienestar de la comunidad.', esencial: true },
  { num: 4, nombre: 'Integración parcial al mercado mediante circuitos formales e informales', desc: 'La organización tiene una integración parcial al mercado para obtener ingresos adicionales o excedentes, mediante circuitos asociativos y comunitarios, ferias campesinas, mercados locales o acuerdos directos con compradores.', esencial: false },
  { num: 5, nombre: 'Representación de la diversidad social y cultural', desc: 'La forma organizativa representa la diversidad social y cultural de la comunidad en la que opera. Tanto mujeres como jóvenes rurales son parte activa de su proceso productivo y organizativo.', esencial: false },
  { num: 6, nombre: 'Toma de decisiones colectiva y redistribución de ingresos', desc: 'La forma organizativa toma decisiones y redistribuye los ingresos obtenidos de manera colectiva entre sus integrantes. La estructura de gobernanza es participativa y no depende de una sola persona para su funcionamiento.', esencial: true },
  { num: 7, nombre: 'Al menos un (1) año de actividades continuas', desc: 'La forma organizativa lleva más de un (1) año realizando sus actividades productivas o de intercambio de manera continua en el territorio, lo que acredita su arraigo, estabilidad y compromiso con la comunidad.', esencial: true },
  { num: 8, nombre: 'Reinversión y distribución colectiva de los ingresos', desc: 'Los ingresos generados por la forma organizativa son reinvertidos en la actividad productiva o distribuidos entre sus integrantes de manera colectiva, fortaleciendo la capacidad productiva del grupo y el bienestar de la comunidad.', esencial: false },
];

const resultados = [
  { badge: 'Prioritaria', rango: '7 – 8 criterios', desc: 'Cumple todos los criterios esenciales y la mayoría de los deseables. Vinculación inmediata a la Red Popular con acompañamiento completo.', cls: 'bg-emerald-900 text-white' },
  { badge: 'Elegible', rango: '5 – 6 criterios', desc: 'Cumple los criterios esenciales (1, 2, 3, 6 y 7). Vinculación con plan de fortalecimiento en los criterios pendientes.', cls: 'bg-blue-800 text-white' },
  { badge: 'En formación', rango: '3 – 4 criterios', desc: 'Cumple criterios básicos pero requiere fortalecimiento organizativo antes de la vinculación formal a la red.', cls: 'bg-slate-600 text-white' },
  { badge: 'No elegible', rango: 'Menos de 3', desc: 'No cumple los criterios mínimos del Acuerdo 009/2023. Se orienta hacia rutas de formación y sensibilización SENA.', cls: 'bg-slate-200 text-slate-600' },
];

const pasos = [
  { num: 1, title: 'Manifestación de interés', desc: 'La forma organizativa interesada contacta al dinamizador territorial o al equipo SENA Regional Boyacá, manifestando su interés de vincularse a alguna de las dos redes y describiendo brevemente su actividad productiva y su territorio.' },
  { num: 2, title: 'Visita de reconocimiento', desc: 'El equipo dinamizador realiza una visita al territorio de la organización para conocer su actividad, sus productos, su estructura organizativa y sus condiciones de producción. Se aplica el instrumento de evaluación de los 8 criterios.' },
  { num: 3, title: 'Evaluación y asignación de puntaje', desc: 'El equipo SENA Regional Boyacá consolida el puntaje por ejes y determina la categoría de elegibilidad (Prioritaria, Elegible, En formación o No elegible). Se devuelven los resultados a la organización con retroalimentación.' },
  { num: 4, title: 'Suscripción del acta de vinculación', desc: 'Las organizaciones elegibles suscriben el acta de vinculación a la red, en la que se formalizan los compromisos mutuos: qué produce o comercializa la organización, a qué núcleos o establecimientos abastece, con qué periodicidad y en qué condiciones de calidad.' },
  { num: 5, title: 'Extensión campesina y popular', desc: 'Las organizaciones vinculadas reciben acompañamiento continuo del equipo SENA: talleres de transición agroecológica, formación en comercialización directa, desarrollo de experiencias de turismo agroecológico y articulación con los mercados destino de cada red.' },
];

export default function ConvocatoriaRedesPage() {
  return (
    <div className="space-y-10">
      {/* HERO */}
      <div className="rounded-2xl bg-emerald-900 p-8 text-white">
        <span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
          Convocatoria · Vigencia 2026
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight">
          Únete a las <span className="text-emerald-400">Redes Populares</span> de Boyacá
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
          Invitamos a formas organizativas de la economía popular a conformar las dos Redes Populares de la Regional
          Boyacá — CampeSENA y Full Popular —, articulando producción campesina, comercialización popular y turismo
          agroecológico en un circuito económico territorial justo y sostenible.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-2">
            <span className="block text-xs text-white/60">Convocatoria abierta</span>
            <span className="font-semibold">Vigencia 2026</span>
          </div>
          <div className="rounded-lg bg-emerald-600 px-4 py-2">
            <span className="block text-xs text-white/70">Entidad</span>
            <span className="font-semibold">SENA Regional Boyacá</span>
          </div>
        </div>
      </div>

      {/* QUÉ ES */}
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">¿Qué es una Red Popular?</p>
        <h2 className="text-2xl font-bold">Un circuito económico que ya existe en tu territorio</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Una Red Popular es la <strong className="text-foreground">alianza formal entre quienes producen, quienes
            transforman o comercializan, y los mercados que consumen</strong> los productos del territorio boyacense.
            No es un proyecto nuevo — es el fortalecimiento y la formalización de los circuitos económicos que ya
            funcionan en las comunidades.
          </p>
          <p>
            La red articula <strong className="text-foreground">núcleos campesinos productores</strong>,{' '}
            <strong className="text-foreground">establecimientos comerciales populares</strong> (amasijos, asaderos,
            comedores campesinos, tiendas de queso, tiendas artesanales) y{' '}
            <strong className="text-foreground">mercados definidos</strong> con potencial real de ventas, en un modelo
            de economía popular que dignifica el trabajo campesino y fortalece la soberanía alimentaria del territorio.
          </p>
        </div>
        <div className="rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Enfoque central:</strong> Las Redes Populares funcionan bajo tres principios:{' '}
          <strong>circuitos cortos de comercialización</strong> que acortan la distancia entre el productor y el
          consumidor; <strong>transición agroecológica</strong> que fortalece la producción sostenible y reduce la
          dependencia de insumos externos; y <strong>turismo agroecológico</strong> como fuente complementaria de
          ingresos que valoriza el territorio, la cultura campesina y los productos locales.
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {redesCards.map((r) => (
            <div key={r.num} className="overflow-hidden rounded-xl border">
              <div className={`p-5 text-white ${r.color}`}>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">{r.num}</p>
                <p className="mt-1 text-base font-semibold leading-snug">{r.nombre}</p>
                <p className="mt-1 text-xs opacity-70">{r.territorio}</p>
              </div>
              <div className="space-y-2 bg-white p-4 text-xs">
                <div className="flex gap-2"><span className="min-w-[70px] font-bold text-foreground">Mercado:</span><span className="text-muted-foreground">{r.mercado}</span></div>
                <div className="flex gap-2"><span className="min-w-[70px] font-bold text-foreground">Productos:</span><span className="text-muted-foreground">{r.productos}</span></div>
                <div className="flex gap-2"><span className="min-w-[70px] font-bold text-foreground">Turismo:</span><span className="text-muted-foreground">{r.turismo}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CONDICIONES */}
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">¿Quién puede participar?</p>
        <h2 className="text-2xl font-bold">Condiciones de vinculación a la Red Popular</h2>
        <p className="text-sm text-muted-foreground">
          Puede postularse cualquier forma organizativa de la economía popular que cumpla{' '}
          <strong className="text-foreground">al menos una de las siguientes condiciones</strong> y que tenga presencia
          o incidencia en el territorio de alguna de las dos redes:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {condiciones.map((c) => (
            <div key={c.title} className="flex gap-4 rounded-xl border bg-white p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xl">{c.ico}</div>
              <div>
                <p className="mb-1 font-bold text-sm">{c.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CRITERIOS */}
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Evaluación de postulaciones · Acuerdo 009 de 2023
        </p>
        <h2 className="text-2xl font-bold">Criterios para identificar formas organizativas populares</h2>
        <p className="text-sm text-muted-foreground">
          Los siguientes ocho (8) criterios son los establecidos en el{' '}
          <strong className="text-foreground">Acuerdo 1-0009 de 2023</strong> del SENA para la identificación de formas
          organizativas de la economía popular. La organización debe cumplir la mayoría de ellos para ser vinculada a
          la Red Popular. El equipo dinamizador de la estrategia verifica su cumplimiento mediante visita al territorio.
        </p>

        <div className="divide-y rounded-xl border bg-white">
          {criterios.map((c) => (
            <div key={c.num} className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 p-4">
              <span className="mt-0.5 text-sm font-bold text-muted-foreground">{c.num}</span>
              <div>
                <p className="font-bold text-sm">{c.nombre}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
              <span className={`mt-0.5 rounded-lg px-2 py-1 text-center text-xs font-bold ${c.esencial ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                {c.esencial ? '✓ esencial' : '✓ deseable'}
              </span>
            </div>
          ))}
        </div>

        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resultado de la verificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resultados.map((r) => (
              <div key={r.badge} className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`min-w-[90px] rounded-full px-3 py-1 text-center text-xs font-bold ${r.cls}`}>{r.badge}</span>
                <span className="font-bold">{r.rango}</span>
                <span className="text-muted-foreground">{r.desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Fuente:</strong> Los ocho criterios corresponden textualmente a los criterios de identificación de
          formas organizativas de la economía popular establecidos en el{' '}
          <strong>Acuerdo 1-0009 de 2023</strong> del Consejo Directivo Nacional del SENA, en concordancia con la{' '}
          <strong>Circular 31 de 2025</strong> y la <strong>Resolución 1-00249 de 2025</strong>. Los criterios marcados
          como <em>esenciales</em> son condición indispensable para la vinculación.
        </div>
      </section>

      <Separator />

      {/* PROCESO */}
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cómo postularse</p>
        <h2 className="text-2xl font-bold">Proceso de vinculación</h2>
        <div className="space-y-0">
          {pasos.map((p, i) => (
            <div key={p.num} className="relative grid grid-cols-[40px_1fr] gap-4">
              {i < pasos.length - 1 && (
                <div className="absolute left-5 top-10 h-full w-0.5 bg-border" />
              )}
              <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">
                {p.num}
              </div>
              <div className="pb-8">
                <p className="font-bold text-sm">{p.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <div className="rounded-2xl bg-emerald-900 p-6 text-center text-white">
        <h3 className="text-xl font-bold">¿Tu organización quiere hacer parte de la red?</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
          Comunícate con el equipo CampeSENA y Full Popular de SENA Regional Boyacá. El proceso de vinculación es
          gratuito y el acompañamiento es permanente durante toda la vigencia.
        </p>
        <div className="mt-4 space-y-1 text-sm text-white/80">
          <p><strong className="text-white">Centro:</strong> SENA Regional Boyacá · Estrategia CampeSENA y Full Popular</p>
          <p><strong className="text-white">Regional:</strong> SENA Regional Boyacá · Paipa, Boyacá</p>
          <p><strong className="text-white">Estrategias:</strong> CampeSENA · Full Popular · Vigencia 2026</p>
          <p><strong className="text-white">Cobertura:</strong> Red 1 – Corredor Central y Norte · Red 2 – Oriente y Territorios de Paz</p>
        </div>
      </div>
    </div>
  );
}

