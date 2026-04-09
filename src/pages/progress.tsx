import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { apiFetch } from '../lib/api';
import { useRequireAuth } from '../lib/auth';
import { Dumbbell, Flame, HeartPulse, Footprints } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type WeightEntry = { date: string; value: number };
type WeekEntry   = { week: string; count: number };
type Record_     = { id: string; exercise: string; category: string; value: string; date: string; improvement: string };
type Summary     = { totalWorkouts: number; totalHours: number; weightLost: number; streak: number };
type ProgressData = {
  weightHistory: WeightEntry[];
  weeklyWorkouts: WeekEntry[];
  personalRecords: Record_[];
  summary: Summary;
};

// ── SVG helpers ───────────────────────────────────────────────────────────────
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1);
    d += ` C ${cx} ${pts[i - 1].y.toFixed(1)} ${cx} ${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
  }
  return d;
}

// ── Weight Line Chart ─────────────────────────────────────────────────────────
function WeightChart({ data, targetWeight }: { data: WeightEntry[]; targetWeight: number }) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Nenhum dado de peso registrado ainda.</div>;
  }
  const W = 600, H = 200, PL = 52, PR = 20, PT = 24, PB = 38;
  const cW = W - PL - PR, cH = H - PT - PB;
  const vals = data.map((d) => d.value);
  const minV = Math.min(...vals, targetWeight), maxV = Math.max(...vals, targetWeight);
  const pad  = (maxV - minV) * 0.35 || 1;
  const lo = minV - pad, hi = maxV + pad;

  const pts = data.map((d, i) => ({
    x: PL + (data.length < 2 ? cW / 2 : (i / (data.length - 1)) * cW),
    y: PT + cH - ((d.value - lo) / (hi - lo)) * cH,
    date: d.date,
    value: d.value,
  }));

  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x.toFixed(1)} ${(PT + cH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PT + cH).toFixed(1)} Z`;

  const yTicks = [0, 1, 2, 3, 4].map((i) => ({
    y: PT + (i / 4) * cH,
    label: (hi - (i / 4) * (hi - lo)).toFixed(1),
  }));

  const fmtDate = (iso: string) =>
    new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-label="Gráfico de evolução de peso">
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#E86C2C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E86C2C" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map(({ y, label }, i) => (
        <g key={i}>
          <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(74,52,42,0.07)" strokeWidth="1" />
          <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="rgba(74,52,42,0.4)">{label}</text>
        </g>
      ))}

      {/* Target weight dashed line */}
      <line x1={PL} y1={PT + cH - ((targetWeight - lo) / (hi - lo)) * cH} x2={W - PR} y2={PT + cH - ((targetWeight - lo) / (hi - lo)) * cH}
        stroke="#B2967D" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
      <text x={W - PR - 2} y={PT + cH - ((targetWeight - lo) / (hi - lo)) * cH - 4} textAnchor="end" fontSize={9} fill="#B2967D" opacity="0.8">
        meta {targetWeight} kg
      </text>

      {/* Area fill */}
      <path d={areaPath} fill="url(#wGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#E86C2C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points + x labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#E86C2C" stroke="white" strokeWidth="2" />
          {i % 2 === 0 && (
            <text x={p.x} y={H - 6} textAnchor="middle" fontSize={9} fill="rgba(74,52,42,0.45)">{fmtDate(p.date)}</text>
          )}
        </g>
      ))}

      {/* Last value label */}
      <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 10} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#E86C2C">
        {pts[pts.length - 1].value} kg
      </text>
    </svg>
  );
}

// ── Weekly Bar Chart ──────────────────────────────────────────────────────────
function WeeklyChart({ data }: { data: WeekEntry[] }) {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhum treino registrado ainda.</div>;
  }
  const W = 600, H = 170, PL = 28, PR = 8, PT = 20, PB = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxY = 6;
  const slotW = cW / data.length;
  const barW = slotW * 0.52;

  const gridLines = [0, 2, 4, 6];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-label="Gráfico de treinos por semana">
      {/* Grid */}
      {gridLines.map((v) => {
        const y = PT + cH - (v / maxY) * cH;
        return (
          <g key={v}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            {v > 0 && <text x={PL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.3)">{v}</text>}
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.count / maxY) * cH;
        const x = PL + i * slotW + (slotW - barW) / 2;
        const y = PT + cH - barH;
        const isLast = i === data.length - 1;
        const fill = isLast ? '#E86C2C' : '#B2967D';
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={fill} opacity={isLast ? 1 : 0.65} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fontWeight="bold"
              fill={isLast ? '#E86C2C' : 'rgba(255,255,255,0.45)'}>
              {d.count}
            </text>
            <text x={x + barW / 2} y={H - PB + 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)">
              {d.week.replace('Sem ', 'S')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Category styles ───────────────────────────────────────────────────────────
const catIcon: Record<string, LucideIcon> = {
  'Força': Dumbbell, 'Core': Flame, 'Cardio': HeartPulse, 'Costas': Footprints,
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Progress() {
  useRequireAuth('student');
  const [data, setData] = useState<ProgressData | null>(null);
  const [targetWeight, setTargetWeight] = useState(62);

  useEffect(() => {
    apiFetch<ProgressData>('/api/progress')
      .then(setData)
      .catch(() => null);
    apiFetch<{ targetWeight?: number }>('/api/user')
      .then((u) => { if (u.targetWeight) setTargetWeight(u.targetWeight); })
      .catch(() => null);
  }, []);

  const summary = data?.summary;

  const summaryCards = summary
    ? [
        { label: 'Treinos realizados', value: String(summary.totalWorkouts),      unit: 'sessões' },
        { label: 'Horas de treino',    value: String(summary.totalHours),         unit: 'horas'   },
        { label: 'Peso perdido',       value: `${summary.weightLost}`,            unit: 'kg'      },
        { label: 'Sequência atual',    value: String(summary.streak),             unit: 'semanas' },
      ]
    : [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            EVOLUÇÃO
          </p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Progresso
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Acompanhe sua evolução desde o primeiro treino.
          </p>

          {/* Summary row */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {summaryCards.map((c) => (
                <div key={c.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    {c.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.unit}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="app-container py-8 space-y-6">

        {/* ── Weight chart ── */}
        <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>PESO CORPORAL</p>
              <h2 className="text-lg font-semibold mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Evolução de Peso
              </h2>
            </div>
            {data && (
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#E86C2C' }} />
                  <span style={{ color: 'rgba(74,52,42,0.6)' }}>Peso atual</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0 border-t border-dashed" style={{ borderColor: '#B2967D' }} />
                  <span style={{ color: 'rgba(74,52,42,0.6)' }}>Meta</span>
                </span>
              </div>
            )}
          </div>
          {data ? (
            <WeightChart data={data.weightHistory} targetWeight={targetWeight} />
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>
              Carregando…
            </div>
          )}
        </div>

        {/* ── Weekly workouts chart ── */}
        <div
          className="rounded-card p-6"
          style={{
            background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))',
            boxShadow: 'var(--card-shadow-dark)',
          }}
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>FREQUÊNCIA</p>
              <h2 className="text-lg font-semibold text-white mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Treinos por Semana
              </h2>
            </div>
            {data && (
              <div
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'rgba(232,108,44,0.2)', color: '#E86C2C' }}
              >
                Média: {data.weeklyWorkouts.length > 0 ? (data.weeklyWorkouts.reduce((s, w) => s + w.count, 0) / data.weeklyWorkouts.length).toFixed(1) : '0'}× / sem
              </div>
            )}
          </div>
          {data ? (
            <WeeklyChart data={data.weeklyWorkouts} />
          ) : (
            <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Carregando…
            </div>
          )}
        </div>

        {/* ── Personal records ── */}
        <div>
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>
            RECORDES PESSOAIS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.personalRecords ?? []).map((rec) => (
              <div
                key={rec.id}
                className="rounded-card p-5 flex items-start gap-4"
                style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(178,150,125,0.3)' }}
                >
                  {React.createElement(catIcon[rec.category] ?? Dumbbell, { size: 22, style: { color: 'var(--color-camel)' } })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'var(--color-camel)' }}>{rec.category.toUpperCase()}</div>
                  <div className="text-sm font-semibold mt-0.5 truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                    {rec.exercise}
                  </div>
                  <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                    {rec.value}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(232,108,44,0.12)', color: 'var(--color-accent)' }}
                    >
                      {rec.improvement}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>
                      {new Date(rec.date + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
