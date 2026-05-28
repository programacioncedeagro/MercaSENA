'use client';

import { useMemo, useState } from 'react';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Printer, Trophy, Medal, Users, MapPin, Calendar, User } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────────── */
type CriterionScore = {
  id: number;
  name: string;
  essential: boolean;
  max: number;
  score: number;
};

type Evaluation = {
  id: string;
  organization: {
    name: string;
    type: string;
    municipality: string;
    territory: string;
    members: number;
    representative: string;
    contact: string;
    targetNetwork: string;
    mainActivity: string;
  };
  dynamizer: {
    name: string;
    visitDate: string;
  };
  criteria: CriterionScore[];
  summary: {
    total: number;
    result: { key: string; label: string };
    essentialsWithScore: number;
    essentialsTotal: number;
  };
  submittedAtClient: string;
};

/* ─── Helpers ───────────────────────────────────────────────────────── */
function getCategory(total: number) {
  if (total >= 80) return { key: 'prioritaria', label: 'VINCULACIÓN PRIORITARIA', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (total >= 60) return { key: 'elegible',    label: 'ELEGIBLE',                color: 'bg-blue-100 text-blue-800 border-blue-300' };
  if (total >= 40) return { key: 'proceso',     label: 'EN PROCESO',              color: 'bg-amber-100 text-amber-800 border-amber-300' };
  return              { key: 'no_elegible',  label: 'NO ELEGIBLE',             color: 'bg-red-100 text-red-800 border-red-300' };
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function classifyNetwork(targetNetwork: string): 'red1' | 'red2' | 'ambas' | 'other' {
  if (!targetNetwork) return 'other';
  if (targetNetwork === 'red1') return 'red1';
  if (targetNetwork === 'red2') return 'red2';
  if (targetNetwork === 'ambas') return 'ambas';
  if (targetNetwork.startsWith('Red 1')) return 'red1';
  if (targetNetwork.startsWith('Red 2')) return 'red2';
  if (targetNetwork === 'Ambas redes') return 'ambas';
  return 'other';
}

function getTotalScore(ev: Evaluation): number {
  const summaryTotal = Number(ev?.summary?.total);
  if (Number.isFinite(summaryTotal)) return summaryTotal;

  if (Array.isArray(ev?.criteria)) {
    return ev.criteria.reduce((acc, c) => acc + Number(c?.score ?? 0), 0);
  }

  return 0;
}

/* ─── Rank icon ────────────────────────────────────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

/* ─── Score bar ─────────────────────────────────────────────────────── */
function ScoreBar({ total }: { total: number }) {
  const pct = Math.min(100, total);
  const progressTone =
    total >= 80
      ? '[&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500'
      : total >= 60
        ? '[&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500'
        : total >= 40
          ? '[&::-webkit-progress-value]:bg-amber-500 [&::-moz-progress-bar]:bg-amber-500'
          : '[&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-extrabold leading-none tabular-nums">{total}</span>
      <div className="flex-1">
        <progress
          value={pct}
          max={100}
          className={`h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-200 ${progressTone}`}
        />
        <span className="text-xs text-muted-foreground">de 100 pts</span>
      </div>
    </div>
  );
}

/* ─── Single org row ────────────────────────────────────────────────── */
function OrgRow({ ev, rank }: { ev: Evaluation; rank: number }) {
  const totalScore = getTotalScore(ev);
  const cat = getCategory(totalScore);
  const fullCriteria = ev.criteria?.filter(c => c.score === c.max).length ?? 0;
  const totalCriteria = ev.criteria?.length ?? 8;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm print:shadow-none print:border-gray-300">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center flex-shrink-0 mt-0.5">
          <RankBadge rank={rank} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-base leading-tight">{ev.organization?.name || '(sin nombre)'}</span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cat.color}`}>
              {cat.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            {ev.organization?.type && (
              <span>{ev.organization.type}</span>
            )}
            {ev.organization?.municipality && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {ev.organization.municipality}
                {ev.organization.territory ? ` · ${ev.organization.territory}` : ''}
              </span>
            )}
            {ev.organization?.mainActivity && (
              <span className="italic">{ev.organization.mainActivity}</span>
            )}
          </div>
        </div>
        {/* Score */}
        <div className="flex-shrink-0 w-36">
          <ScoreBar total={totalScore} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 pl-11 text-xs text-muted-foreground">
        {ev.organization?.members ? (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {ev.organization.members} integrantes
          </span>
        ) : null}
        {ev.organization?.representative && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {ev.organization.representative}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Visita: {formatDate(ev.dynamizer?.visitDate)}
        </span>
        <span>
          Criterios plenos: <strong className="text-foreground">{fullCriteria}/{totalCriteria}</strong>
        </span>
        <span>
          Esenciales: <strong className="text-foreground">{ev.summary?.essentialsWithScore ?? '—'}/{ev.summary?.essentialsTotal ?? 5}</strong>
        </span>
        {ev.dynamizer?.name && (
          <span>Dinamizador: {ev.dynamizer.name}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Network section ───────────────────────────────────────────────── */
const NETWORK_META = {
  red1: {
    label: 'Red 1',
    title: 'Corredor gastronómico central y norte',
    subtitle: 'Duitama · Paipa · Ricaurte · Sugamuxi · Norte · Valderrama',
    headerColor: 'bg-emerald-700',
  },
  red2: {
    label: 'Red 2',
    title: 'Soberanía alimentaria oriente y territorios de paz',
    subtitle: 'Ventaquemada · Garagoa · Valle de Tenza · Occidente',
    headerColor: 'bg-blue-700',
  },
  ambas: {
    label: 'Ambas redes',
    title: 'Postulantes a las dos redes',
    subtitle: 'Organizaciones que aplican a Red 1 y Red 2 simultáneamente',
    headerColor: 'bg-violet-700',
  },
} as const;

function NetworkSection({
  networkKey,
  evaluations,
}: {
  networkKey: keyof typeof NETWORK_META;
  evaluations: Evaluation[];
}) {
  const meta = NETWORK_META[networkKey];
  const sorted = [...evaluations].sort((a, b) => getTotalScore(b) - getTotalScore(a));

  const stats = {
    prioritaria: sorted.filter(e => getTotalScore(e) >= 80).length,
    elegible: sorted.filter(e => getTotalScore(e) >= 60 && getTotalScore(e) < 80).length,
    proceso: sorted.filter(e => getTotalScore(e) >= 40 && getTotalScore(e) < 60).length,
    no_elegible: sorted.filter(e => getTotalScore(e) < 40).length,
  };

  return (
    <div className="print:break-before-page">
      {/* Section header */}
      <div className={`${meta.headerColor} rounded-xl px-6 py-4 text-white mb-4 print:rounded-none print:-mx-0`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest opacity-75">{meta.label}</div>
            <h2 className="text-xl font-bold leading-tight">{meta.title}</h2>
            <div className="text-xs opacity-70 mt-0.5">{meta.subtitle}</div>
          </div>
          <div className="text-3xl font-extrabold opacity-90">{sorted.length}</div>
        </div>
        {/* Mini stats */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <span className="bg-white/20 rounded-full px-3 py-1 font-semibold">
            Prioritarias: {stats.prioritaria}
          </span>
          <span className="bg-white/20 rounded-full px-3 py-1 font-semibold">
            Elegibles: {stats.elegible}
          </span>
          <span className="bg-white/20 rounded-full px-3 py-1 font-semibold">
            En proceso: {stats.proceso}
          </span>
          <span className="bg-white/20 rounded-full px-3 py-1 font-semibold">
            No elegibles: {stats.no_elegible}
          </span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm px-2 py-4">Sin evaluaciones registradas para esta red.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((ev, idx) => (
            <OrgRow key={ev.id} ev={ev} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function InformePriorizacionPage() {
  const firestore = useFirestore();
  const [, setShowAll] = useState(false);

  const evalsQuery = useMemoFirebase(
    () => query(collection(firestore, 'redesPopularesEvaluaciones')),
    [firestore],
  );

  const evals2026Query = useMemoFirebase(
    () => query(collection(firestore, 'redesPopulares2026Evaluaciones')),
    [firestore],
  );

  const { data, isLoading, error } = useCollection<Evaluation>(evalsQuery);
  const { data: data2026, isLoading: isLoading2026, error: error2026 } = useCollection<Evaluation>(evals2026Query);

  const mergedData = useMemo(() => {
    const current = data ?? [];
    const legacy = data2026 ?? [];
    if (legacy.length === 0) return current;

    const out: Evaluation[] = [];
    const seen = new Set<string>();

    for (const ev of [...current, ...legacy]) {
      const key = `${ev.id}-${ev.submittedAtClient ?? ''}-${ev.organization?.name ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(ev);
    }

    return out;
  }, [data, data2026]);

  const groups = useMemo(() => {
    if (!mergedData) return { red1: [], red2: [], ambas: [], other: [] };
    const red1: Evaluation[] = [];
    const red2: Evaluation[] = [];
    const ambas: Evaluation[] = [];
    const other: Evaluation[] = [];
    for (const ev of mergedData) {
      const net = classifyNetwork(ev.organization?.targetNetwork ?? '');
      if (net === 'red1') red1.push(ev);
      else if (net === 'red2') red2.push(ev);
      else if (net === 'ambas') ambas.push(ev);
      else other.push(ev);
    }
    return { red1, red2, ambas, other };
  }, [mergedData]);

  const totalOrgs = (mergedData?.length ?? 0);
  const generatedAt = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  if (isLoading || isLoading2026) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Cargando evaluaciones...</span>
      </div>
    );
  }

  if (error || error2026) {
    const message = error?.message ?? error2026?.message ?? 'Error desconocido';
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-red-600">
        <AlertCircle className="h-8 w-8" />
        <p className="font-semibold">Error al cargar las evaluaciones</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Informe de Priorización</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Organizaciones evaluadas ordenadas de mayor a menor calificación, agrupadas por red postulante.
            Vigencia 2026 · Acuerdo 1-0009/2023.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimir / PDF
        </Button>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block mb-6">
        <div className="text-xs text-gray-500 mb-1">SENA Regional Boyacá · Estrategia CampeSENA y Full Popular · Vigencia 2026</div>
        <h1 className="text-2xl font-bold">Informe de Priorización – Redes Populares Boyacá 2026</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generado el {generatedAt} · {totalOrgs} organización{totalOrgs !== 1 ? 'es' : ''} evaluada{totalOrgs !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Base normativa: Acuerdo 1-0009 de 2023 · Circular 3-2025-000031 · Resolución 1-00249 de 2025</p>
      </div>

      {/* Global summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold text-emerald-700">{mergedData?.filter(e => getTotalScore(e) >= 80).length ?? 0}</div>
            <div className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wide">Prioritarias</div>
            <div className="text-xs text-muted-foreground">≥ 80 pts</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold text-blue-700">{mergedData?.filter(e => getTotalScore(e) >= 60 && getTotalScore(e) < 80).length ?? 0}</div>
            <div className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wide">Elegibles</div>
            <div className="text-xs text-muted-foreground">60–79 pts</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold text-amber-700">{mergedData?.filter(e => getTotalScore(e) >= 40 && getTotalScore(e) < 60).length ?? 0}</div>
            <div className="text-xs font-semibold text-amber-600 mt-1 uppercase tracking-wide">En proceso</div>
            <div className="text-xs text-muted-foreground">40–59 pts</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold text-red-700">{mergedData?.filter(e => getTotalScore(e) < 40).length ?? 0}</div>
            <div className="text-xs font-semibold text-red-600 mt-1 uppercase tracking-wide">No elegibles</div>
            <div className="text-xs text-muted-foreground">&lt; 40 pts</div>
          </CardContent>
        </Card>
      </div>

      {totalOrgs === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <AlertCircle className="h-10 w-10 opacity-40" />
            <p className="font-semibold text-lg">No hay evaluaciones registradas</p>
            <p className="text-sm text-center max-w-sm">
              Las evaluaciones guardadas desde el test de campo aparecerán aquí automáticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          <NetworkSection networkKey="red1" evaluations={groups.red1} />
          <NetworkSection networkKey="red2" evaluations={groups.red2} />
          {groups.ambas.length > 0 && (
            <NetworkSection networkKey="ambas" evaluations={groups.ambas} />
          )}
          {groups.other.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Sin red asignada ({groups.other.length})
              </h3>
              <div className="flex flex-col gap-3">
                {[...groups.other]
                  .sort((a, b) => getTotalScore(b) - getTotalScore(a))
                  .map((ev, idx) => (
                    <OrgRow key={ev.id} ev={ev} rank={idx + 1} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer (only print) */}
      <div className="hidden print:block mt-8 border-t pt-4 text-xs text-gray-400 text-center">
        Informe de priorización generado por la plataforma MercaSENA · SENA Regional Boyacá ·{' '}
        {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}
