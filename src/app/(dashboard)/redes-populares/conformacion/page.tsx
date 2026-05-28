import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const levels = [
  {
    label: 'Nivel 1',
    title: 'Núcleos productores',
    color: 'border-t-emerald-600',
    text: 'Asociaciones campesinas y pequeños productores que generan los bienes primarios del territorio: alimentos, artesanías, materias primas.',
  },
  {
    label: 'Nivel 2',
    title: 'Establecimientos comerciales',
    color: 'border-t-amber-600',
    text: 'Amasijos, asaderos, comedores campesinos, tiendas artesanales y tiendas de queso que compran, transforman y venden al consumidor.',
  },
  {
    label: 'Nivel 3',
    title: 'Mercado destino',
    color: 'border-t-purple-700',
    text: 'Turistas, instituciones (PAE, ICBF), consumidores locales, mercados mayoristas y exportadores. Define la sostenibilidad de la red.',
  },
];

const red1Nucleos = [
  { code: 'N-BOY-018 ★', name: 'Duitama – Vitrina comercial', provincia: 'Prov. Tundama · Nodo comercial Red 1', actividad: 'Panadería, amasijo, leche, flores, hortalizas, hongos medicinales, miel, huevos, pollo', sena: 'Adecuación puntos de venta – vitrina comercial' },
  { code: 'N-BOY-008', name: 'Huertos Altos Andinos – Mongua', provincia: 'Prov. Sugamuxi', actividad: 'Papa de páramo, ganado bovino (leche), alta montaña boyacense', sena: 'Biofábrica (insumos para papa y ganaderos)' },
  { code: 'COOAGROUVITA', name: 'COOAGROUVITA – La Uvita', provincia: 'Prov. Norte', actividad: 'Ganadería extensiva, panela, miel artesanal, maíz, frijol', sena: 'Apicultura (fortalecimiento colmenas existentes)' },
  { code: 'N-BOY-012', name: 'SEPAT Tipacoque', provincia: 'Prov. Norte', actividad: 'Café especial Norte Boyacá, caña panelera, cítricos (naranja, mandarina)', sena: 'Biofábrica (insumos para caficultores y cañicultores)' },
  { code: 'N-BOY-003', name: 'TECAM Moniquirá', provincia: 'Prov. Ricaurte', actividad: 'Bocadillo de guayaba, panela, café (1er productor café Boyacá), cítricos, caña', sena: 'Biofábrica (insumos para guayaba y caña)' },
  { code: 'N-BOY-001', name: 'ZRC Santuario del Rabanal', provincia: 'Prov. Ricaurte · Ráquira', actividad: 'Artesanías de cerámica (Ráquira, capital artesanal de Colombia), papa, maíz', sena: 'Labores agrícolas (producción de pan coger)' },
  { code: 'N-BOY-004', name: 'TECAM TUTA XUE – Sogamoso', provincia: 'Prov. Sugamuxi', actividad: 'Papa, zanahoria, arveja, cebolla de rama, hortalizas (corredor Sugamuxi-Tundama)', sena: 'Huerta comunitaria (organización y certificación BPA)' },
  { code: 'N-BOY-005', name: 'El CONVITE – Arcabuco', provincia: 'Prov. Ricaurte', actividad: 'Papa, maíz, frijol, conservación bosque andino (zona amortiguación Santuario Iguaque)', sena: 'Formación comunitaria (extensión campesina)' },
  { code: 'N-BOY-014', name: 'Socha – Valderrama', provincia: 'Prov. Valderrama', actividad: 'Ganadería bovina (leche), papa, hortalizas, huevos, ecoturismo alternativo a minería', sena: 'Labores pecuarias (diversificación productiva)' },
];

const red1Mercados = [
  { destino: 'Turismo Paipa – termas y hoteles', demanda: 'Alto volumen, pago al contado', acceso: 'Paipa, corredor Ruta 45', establecimientos: 'Amasijos, asaderos, tiendas artesanales' },
  { destino: 'PAE · ICBF', demanda: 'Contratos institucionales sostenidos', acceso: 'Duitama, Sogamoso, municipios corredor', establecimientos: 'Panaderías, amasijos, papa, hortalizas' },
  { destino: 'Mercado Verde Duitama', demanda: 'Mercado campesino directo, sin intermediarios', acceso: 'Plaza Los Libertadores, Duitama', establecimientos: 'Todos los núcleos Red 1' },
  { destino: 'Red Solidaria · consumidor local', demanda: 'Consumo comunitario cotidiano', acceso: 'Corredor Duitama-Sogamoso', establecimientos: 'Vitrina comercial N-BOY-018' },
  { destino: 'FNC – Federación Nacional de Cafeteros', demanda: 'Precio garantizado, exportación', acceso: 'Nacional e internacional', establecimientos: 'N-BOY-012 Tipacoque · N-BOY-003 Moniquirá' },
  { destino: 'Artesanías de Colombia', demanda: 'Canal nacional e internacional', acceso: 'Tiendas nacionales y exportación', establecimientos: 'N-BOY-001 cerámica Ráquira · bocadillo Moniquirá' },
];

const red1Establecimientos = [
  { nombre: 'Amasijos y panaderías — Duitama y Paipa', productos: 'Arepas boyacenses, almojábanas, bizcochos, pan, pandeyuca, changua', compranA: 'N-BOY-018 (leche, huevos, miel, panela) · COOAGROUVITA (miel artesanal)', vendenA: 'Turistas termas Paipa · PAE · ICBF · mercado local Duitama · Red Solidaria' },
  { nombre: 'Asaderos y comedores campesinos — Corredor Paipa', productos: 'Gallina asada, fritanga, papa criolla con costilla, ajiaco, caldo de costilla', compranA: 'N-BOY-008 (papa páramo) · N-BOY-018 (pollo, huevos) · N-BOY-004 (verduras)', vendenA: 'Turistas termas Paipa · trabajadores Duitama-Sogamoso · viajeros Ruta 45' },
  { nombre: 'Tiendas artesanales — Ráquira, Paipa, Monguí', productos: 'Cerámica boyacense, bocadillo empacado, miel artesanal, artesanías', compranA: 'N-BOY-001 (cerámica Ráquira) · N-BOY-003 (bocadillo) · COOAGROUVITA (miel)', vendenA: 'Turismo boyacense · Artesanías de Colombia (exportación) · mercado nacional' },
  { nombre: 'Cafeterías y tiendas de panela y café — Sogamoso-Duitama', productos: 'Café de origen Norte Boyacá, chocolate, panela en bloque y granulada', compranA: 'N-BOY-012 (café Tipacoque) · N-BOY-003 (café y panela Moniquirá) · COOAGROUVITA', vendenA: 'PAE municipal · ICBF · turistas · consumidor local corredor' },
];

const red2Nucleos = [
  { code: 'N-BOY-006 ★', name: 'TESOROS NATIVOS – Ventaquemada', provincia: 'Prov. Centro · Nodo comercial Red 2', actividad: 'Papa (>87% vocación agrícola FEDEPAPA), leche, cebolla. Proveedor directo asaderos y comedores del Puente de Boyacá', sena: 'Punto comercial – nodo Red 2 (articulación canales)' },
  { code: 'N-BOY-007', name: 'Guateque – Oriente', provincia: 'Prov. Oriente', actividad: 'Quesos madurados, yogurt, mantequilla, café, pollo, hortalizas', sena: 'Secado solar (post-cosecha café · tanques = suministro de agua de riego)' },
  { code: 'Sob. Alim. ★', name: 'Soberanía Alimentaria Garagoa', provincia: 'Prov. Neira · Valle de Tenza', actividad: 'Café, panela, bocadillo, cítricos, yuca, plátano. Hub comercial del Valle de Tenza', sena: 'Comercialización (articulación producción Valle de Tenza)' },
  { code: 'N-BOY-017', name: 'Asoc. Mujeres Campesinas – Ramiriquí', provincia: 'Prov. Márquez', actividad: 'Fique artesanal (bolsos, tapetes, sombreros con tradición histórica), papa, maíz, frijol', sena: 'Aromáticas y medicinales (nueva línea de ingresos)' },
  { code: 'N-BOY-015', name: 'Chívor – Oriente', provincia: 'Prov. Oriente', actividad: 'Hortalizas, verduras, frutales menores y cultivos diversificados en proceso de transición agroecológica. Ecoturismo embalse Chívor', sena: 'Tanques zamoranos = suministro de agua de riego para cultivos' },
  { code: 'N-BOY-016', name: 'Miraflores – Lengupá', provincia: 'Prov. Lengupá', actividad: 'Maracuyá, gulupa, café, huevos (clima cálido-templado <1.500 m)', sena: 'Tanques zamoranos = suministro de agua de riego para cultivos' },
  { code: 'N-BOY-009a', name: 'Paz y Víctimas Puerto Boyacá', provincia: 'Prov. Occidente', actividad: 'Pesca río Magdalena (cachama, mojarra, bocachico, bagre; subienda diciembre-febrero). Ganadería extensiva', sena: 'Pesca artesanal organizada (equipos, cuarto frío, trazabilidad)' },
  { code: 'N-BOY-009b', name: 'ASOPROAPE – Puerto Boyacá', provincia: 'Prov. Occidente', actividad: 'Cacao fino de aroma del Magdalena Medio (Colombia, 2° exportador mundial de cacao especial)', sena: 'Biofábrica (insumos orgánicos para mejorar calidad del cacao)' },
  { code: 'N-BOY-011', name: 'Puerto Boyacá – plátano y banano', provincia: 'Prov. Occidente', actividad: 'Plátano hartón, banano, yuca, ahuyama, sandía. Gran productor del Magdalena Medio', sena: 'Cultivo de plátano y banano (fortalecimiento y ampliación área)' },
];

const red2Mercados = [
  { destino: 'Turismo Puente de Boyacá', demanda: 'Millones de visitantes al año', acceso: 'Ventaquemada, Vía 55 autopista', establecimientos: 'Asaderos, comedores campesinos, artesanías' },
  { destino: 'RENAF · Comité salsa Bogotá-Cundinamarca', demanda: 'Circuito soberanía alimentaria', acceso: 'Bogotá – Cundinamarca', establecimientos: 'Quesos Guateque · café y panela Valle de Tenza' },
  { destino: 'Bogotá vía autopista (100 km)', demanda: 'Mayor mercado consumidor del país', acceso: 'Bogotá, CORABASTOS', establecimientos: 'Papa N-BOY-006, hortalizas, frutas' },
  { destino: 'Bogotá vía Quetame (145 km)', demanda: 'Corredor Garagoa-Bogotá', acceso: 'Bogotá, mercados locales', establecimientos: 'Café, panela, bocadillo Valle de Tenza' },
  { destino: 'Mercado Honda – Magdalena Medio', demanda: 'Polo pesquero regional', acceso: 'Honda, Tolima (70 km de Puerto Boyacá)', establecimientos: 'Pesca artesanal Puerto Boyacá' },
  { destino: 'Exportación plátano y cacao', demanda: 'Demanda internacional creciente', acceso: 'Colombia – mercado internacional', establecimientos: 'N-BOY-011 plátano · N-BOY-009b cacao fino' },
];

const red2Establecimientos = [
  { nombre: 'Asaderos y comedores campesinos — Ventaquemada', productos: 'Arepa boyacense con hogao, gallina asada, fritanga, chicharrón, chocolate', compranA: 'N-BOY-006 (papa, leche, cebolla local) · productores de pollo zona Ventaquemada', vendenA: 'Turismo masivo Puente de Boyacá (millones de visitantes/año) · viajeros autopista Bogotá-Tunja' },
  { nombre: 'Tiendas de queso y lácteos — Guateque y Valle de Tenza', productos: 'Quesos madurados, yogurt, mantequilla, queso campesino fresco', compranA: 'N-BOY-007 (Guateque produce quesos, yogurt y mantequilla directamente)', vendenA: 'RENAF · Comité integración salsa Bogotá-Cundinamarca · mercado local Valle de Tenza' },
  { nombre: 'Productos de transición agroecológica y fique — Chívor y Ramiriquí', productos: 'Bisutería de esmeralda, artesanías de pino patula, productos de fique, aromáticas', compranA: 'N-BOY-015 Chívor (hortalizas de transición agroecológica) · N-BOY-017 Mujeres Ramiriquí (fique, aromáticas)', vendenA: 'Turistas esmeralderos · ferias Garagoa · Artesanías de Colombia (exportación)' },
  { nombre: 'Plaza de mercado Garagoa — Hub Valle de Tenza', productos: 'Café, panela, bocadillo, cítricos, frutas tropicales, yuca, plátano', compranA: 'Soberanía Alimentaria Garagoa y N-BOY-007 Guateque como proveedores principales', vendenA: 'Bogotá vía Quetame (145 km) · mercado regional · RENAF · ferias campesinas' },
];

const normas = [
  { code: 'Acuerdo 003/2023', title: 'Marco de economía popular', desc: 'Define los principios de las formas organizativas de la economía popular y las condiciones para su vinculación a la estrategia SENA.' },
  { code: 'Acuerdo 009/2023', title: 'Identificación de formas organizativas', desc: 'Establece los 8 criterios para identificar formas organizativas de la economía popular y los niveles de elegibilidad.' },
  { code: 'Circular 31/2025', title: 'Circuitos cortos y turismo', desc: 'Directriz para la implementación de circuitos cortos de comercialización y turismo agroecológico en las estrategias CampeSENA y Full Popular.' },
  { code: 'Resolución 1-00249/2025', title: 'Redes Populares', desc: 'Reglamenta la conformación y operación de las Redes Populares territoriales de la Regional Boyacá.' },
  { code: 'PND 2022–2026 Art. 51 y 52', title: 'Economía popular en el Plan Nacional', desc: 'Artículos que reconocen y priorizan la economía popular como política de Estado y determinan la acción del SENA.' },
];

function EstablecimientoCard({ est, colorHeader }: { est: typeof red1Establecimientos[0]; colorHeader: string }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className={`px-4 py-2 text-sm font-bold text-white ${colorHeader}`}>{est.nombre}</div>
      <div className="space-y-2 p-3 text-xs">
        <div className="flex gap-2"><span className="min-w-[70px] font-semibold text-muted-foreground">Productos:</span><span>{est.productos}</span></div>
        <div className="flex gap-2"><span className="min-w-[70px] font-semibold text-muted-foreground">Compran a:</span><span>{est.compranA}</span></div>
        <div className="flex gap-2"><span className="min-w-[70px] font-semibold text-muted-foreground">Venden a:</span><span>{est.vendenA}</span></div>
      </div>
    </div>
  );
}

export default function ConformacionRedesPage() {
  return (
    <div className="space-y-10">
      {/* ENCABEZADO */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marco conceptual</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Conformación de Redes Populares</h1>
        <p className="mt-2 max-w-4xl text-muted-foreground">
          Propuesta de dos redes territoriales que articulan núcleos campesinos, establecimientos comerciales populares y
          mercados definidos en un circuito económico sostenible. 18 Núcleos · 2 Redes Populares · 9 Provincias.
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          Normativa: Acuerdo 003/2023 · Acuerdo 009/2023 · Resolución 1-00249/2025 · Circular 31/2025 · PND 2022–2026 Art. 51 y 52
        </div>
      </div>

      {/* PRINCIPIO */}
      <Card className="border-l-4 border-l-emerald-600">
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Estructura del circuito territorial</p>
          <CardTitle className="text-xl">¿Qué es una Red Popular?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Las Redes Populares son alianzas estratégicas territoriales que integran en un mismo circuito económico a los
            núcleos campesinos productores, los establecimientos comerciales populares y los mercados destino.
          </p>
          <p>
            La Red Popular es el <strong className="text-foreground">circuito económico completo</strong> del territorio.
            Los <strong className="text-foreground">establecimientos comerciales populares</strong> — amasijos, asaderos,
            comedores campesinos, tiendas artesanales y tiendas de queso — son{' '}
            <strong className="text-foreground">nodos activos dentro de la red</strong>. Compran a los núcleos campesinos,
            transforman los productos y los venden al consumidor final. El circuito es:{' '}
            <strong className="text-foreground">Núcleo productor → Establecimiento comercial popular → Mercado definido.</strong>
          </p>
          <div className="grid gap-4 pt-2 md:grid-cols-3">
            {levels.map((l) => (
              <div key={l.title} className={`rounded-xl border bg-white p-5 border-t-4 ${l.color}`}>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.label}</p>
                <p className="mb-2 text-base font-bold">{l.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{l.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* RED 1 */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Red Popular N° 1</p>
          <h2 className="mt-1 text-2xl font-bold text-emerald-900">Red Gastronómica del Corredor Boyacense Central y Norte</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Corredor vial: Ruta 45 (Bogotá–Bucaramanga). Provincias: Ricaurte, Sugamuxi, Tundama, Norte, Valderrama.
            Nodo comercial: Duitama-Paipa.
          </p>
          <div className="mt-1 text-xs font-semibold text-emerald-700">
            Mercados destino: Turismo Paipa · PAE · ICBF · Mercado Verde Duitama. Productos: Amasijo, café, panela,
            bocadillo, miel, papa, hortalizas. Turismo: Ruta del Sabor y el Saber Boyacense.
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Establecimientos comerciales populares</p>
          <div className="grid gap-3 md:grid-cols-2">
            {red1Establecimientos.map((e) => <EstablecimientoCard key={e.nombre} est={e} colorHeader="bg-amber-700" />)}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Mercados destino</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-emerald-800 text-white">
                <tr>{['Mercado destino', 'Tipo de demanda', 'Acceso / Ubicación', 'Establecimientos que abastece'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {red1Mercados.map((m, i) => (
                  <tr key={m.destino} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">{m.destino}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.demanda}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.acceso}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.establecimientos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Núcleos campesinos — base productiva</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-emerald-700 text-white">
                <tr>{['Código', 'Núcleo / Municipio', 'Actividad productiva principal', 'Proyecto SENA (apoyo)'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {red1Nucleos.map((n, i) => (
                  <tr key={n.code} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-bold text-emerald-700 whitespace-nowrap">{n.code}</td>
                    <td className="px-3 py-2"><span className="block font-semibold">{n.name}</span><span className="text-xs text-muted-foreground">{n.provincia}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{n.actividad}</td>
                    <td className="px-3 py-2 text-muted-foreground italic">{n.sena}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
            <strong>SENA fortalece:</strong> biofábricas N-BOY-003, N-BOY-008, N-BOY-012 · huerta comunitaria N-BOY-004 · apicultura COOAGROUVITA · vitrina comercial N-BOY-018
          </p>
        </div>
      </section>

      <Separator />

      {/* RED 2 */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Red Popular N° 2</p>
          <h2 className="mt-1 text-2xl font-bold text-blue-900">Red de Soberanía Alimentaria – Oriente y Territorios de Paz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Corredor vial: Vía 55 (Bogotá-Tunja por Ventaquemada) y Vía 58 (Tunja-Guateque-Garagoa) + corredor del Magdalena.
            Provincias: Centro, Márquez, Neira, Oriente, Lengupá, Occidente. Nodos: Ventaquemada y Garagoa.
          </p>
          <div className="mt-1 text-xs font-semibold text-blue-700">
            Mercados destino: Turismo Puente Boyacá · RENAF · Bogotá · Honda. Productos: Quesos, café, plátano, cacao, fique,
            frutas tropicales. Turismo: Ruta del Valle de Tenza y los Territorios de Paz.
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Establecimientos comerciales populares</p>
          <div className="grid gap-3 md:grid-cols-2">
            {red2Establecimientos.map((e) => <EstablecimientoCard key={e.nombre} est={e} colorHeader="bg-blue-800" />)}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Mercados destino</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>{['Mercado destino', 'Tipo de demanda', 'Acceso / Ubicación', 'Establecimientos que abastece'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {red2Mercados.map((m, i) => (
                  <tr key={m.destino} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">{m.destino}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.demanda}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.acceso}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.establecimientos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Núcleos campesinos — base productiva</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>{['Código', 'Núcleo / Municipio', 'Actividad productiva principal', 'Proyecto SENA (apoyo)'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody>
                {red2Nucleos.map((n, i) => (
                  <tr key={n.code} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-3 py-2 font-bold text-blue-700 whitespace-nowrap">{n.code}</td>
                    <td className="px-3 py-2"><span className="block font-semibold">{n.name}</span><span className="text-xs text-muted-foreground">{n.provincia}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{n.actividad}</td>
                    <td className="px-3 py-2 text-muted-foreground italic">{n.sena}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-900">
            <strong>SENA fortalece:</strong> punto comercial N-BOY-006 · pesca artesanal N-BOY-009a · biofábrica cacao N-BOY-009b · tanques zamoranos (agua de riego) N-BOY-015 y N-BOY-016
          </p>
        </div>
      </section>

      <Separator />

      {/* NORMATIVA */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marco normativo</p>
          <h2 className="mt-1 text-xl font-bold">Normativa que rige las Redes Populares</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {normas.map((n) => (
            <Card key={n.code}>
              <CardHeader className="pb-2">
                <p className="text-xs font-bold tracking-wide text-emerald-700">{n.code}</p>
                <CardTitle className="text-sm">{n.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-foreground">{n.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
