import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';
import { apiFetch } from '../lib/api';
import { useRequireAuth } from '../lib/auth';
import { BarChart3, TrendingUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Measurements = Record<string, number>;
type Skinfolds    = Record<string, number>;
type Assessment   = {
  id: string; date: string; weight: number; fatPercent: number;
  leanMass: number; fatMass: number;
  measurements: Measurements; skinfolds: Skinfolds; notes: string;
};

// ─── SVG Trend chart (reusable mini line) ─────────────────────────────────────
function TrendLine({ values, color }: { values: number[]; color: string }) {
  const W = 120, H = 38;
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 8) - 4,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

// ─── Comparison bar ───────────────────────────────────────────────────────────
function CompareBar({ label, values, dates, unit, lowerIsBetter = false }:
  { label: string; values: number[]; dates: string[]; unit: string; lowerIsBetter?: boolean }) {
  if (values.length < 2) return null;
  const first = values[0], last = values[values.length - 1];
  const delta = last - first;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const max = Math.max(...values);
  const fmtDate = (iso: string) => new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>
        <span className="font-semibold">{label}</span>
        <span className="font-bold" style={{ color: improved ? '#22c55e' : 'var(--color-accent)' }}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)} {unit}
        </span>
      </div>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs w-16 flex-shrink-0" style={{ color: 'rgba(74,52,42,0.45)' }}>{fmtDate(dates[i])}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(74,52,42,0.08)' }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${(v / max) * 100}%`,
                  background: i === values.length - 1 ? 'var(--color-accent)' : 'var(--color-camel)',
                  opacity: 0.6 + (i / values.length) * 0.4,
                }}
              />
            </div>
            <span className="text-xs font-semibold w-12 text-right" style={{ color: 'var(--color-espresso)' }}>{v} {unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Measurement labels ───────────────────────────────────────────────────────
const measureLabels: Record<string, string> = {
  waist: 'Cintura', hip: 'Quadril', chest: 'Peitoral', rightArm: 'Bíceps D',
  leftArm: 'Bíceps E', rightThigh: 'Coxa D', leftThigh: 'Coxa E', abdomen: 'Abdômen', calf: 'Panturrilha',
};
const skinfoldLabels: Record<string, string> = {
  triceps: 'Tríceps', subscapular: 'Subescapular', suprailiac: 'Suprailíaca', abdominal: 'Abdominal', thigh: 'Coxa',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = 'latest' | 'evolution';

export default function Assessment() {
  useRequireAuth('student');
  const [data, setData] = useState<Assessment[]>([]);
  const [tab, setTab] = useState<Tab>('latest');
  const [selIdx, setSelIdx] = useState(0); // for latest tab

  useEffect(() => {
    apiFetch<Assessment[]>('/api/assessments')
      .then((d) => { setData(d); setSelIdx(d.length - 1); })
      .catch(() => null);
  }, []);

  const latest = data[selIdx] ?? null;
  const dates  = data.map((a) => a.date);
  const fmtDate = (iso: string) => new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            COMPOSIÇÃO CORPORAL
          </p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Avaliação Física
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Dobras cutâneas, medidas e composição corporal registradas pela personal.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {([['latest', 'Última avaliação'], ['evolution', 'Evolução das medidas']] as [Tab, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: tab === k ? 'white' : 'rgba(255,255,255,0.1)',
                  color:      tab === k ? 'var(--color-espresso)' : 'rgba(255,255,255,0.7)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <ErrorBoundary>

        {/* ══ Latest assessment ══ */}
        {tab === 'latest' && latest && (
          <div>
            {/* Assessment selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {data.map((a, i) => (
                <button key={a.id} onClick={() => setSelIdx(i)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: selIdx === i ? 'var(--color-espresso)' : 'var(--color-khaki)',
                    color:      selIdx === i ? 'white' : 'var(--color-espresso)',
                  }}
                >
                  {new Date(a.date + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </button>
              ))}
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

              {/* Composição */}
              <div className="rounded-card p-6" style={{ background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))', boxShadow: 'var(--card-shadow-dark)' }}>
                <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>COMPOSIÇÃO CORPORAL</p>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>{fmtDate(latest.date)}</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Peso',        value: `${latest.weight} kg`         },
                    { label: '% Gordura',   value: `${latest.fatPercent}%`        },
                    { label: 'Massa Magra', value: `${latest.leanMass} kg`        },
                    { label: 'Massa Gorda', value: `${latest.fatMass} kg`         },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{value}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                {latest.notes && (
                  <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>OBSERVAÇÕES</p>
                    <p className="text-sm text-white">{latest.notes}</p>
                  </div>
                )}
              </div>

              {/* Medidas */}
              <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
                <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>MEDIDAS (cm)</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(latest.measurements).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'rgba(74,52,42,0.6)' }}>{measureLabels[k] ?? k}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-espresso)' }}>{v} cm</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dobras */}
              <div className="rounded-card p-6 md:col-span-2" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
                <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>DOBRAS CUTÂNEAS (mm)</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {Object.entries(latest.skinfolds).map(([k, v]) => (
                    <div key={k} className="text-center rounded-xl py-4" style={{ background: 'rgba(255,255,255,0.55)' }}>
                      <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>{v}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>mm</div>
                      <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(74,52,42,0.65)' }}>{skinfoldLabels[k] ?? k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Evolution ══ */}
        {tab === 'evolution' && data.length >= 2 && (
          <div className="space-y-6">

            {/* Composition trend cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {([
                { label: 'Peso', key: 'weight' as const, unit: 'kg', lower: true },
                { label: '% Gordura', key: 'fatPercent' as const, unit: '%', lower: true },
                { label: 'Massa Magra', key: 'leanMass' as const, unit: 'kg', lower: false },
                { label: 'Massa Gorda', key: 'fatMass' as const, unit: 'kg', lower: true },
              ]).map(({ label, key, unit, lower }) => {
                const vals = data.map((a) => a[key]);
                const first = vals[0], last = vals[vals.length - 1];
                const delta = last - first;
                const improved = lower ? delta < 0 : delta > 0;
                return (
                  <div key={key} className="rounded-card p-5" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(74,52,42,0.5)' }}>{label.toUpperCase()}</p>
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-espresso)' }}>
                      {last} {unit}
                    </div>
                    <div className="text-xs font-semibold mb-3" style={{ color: improved ? '#22c55e' : 'var(--color-accent)' }}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)} {unit} desde o início
                    </div>
                    <TrendLine values={vals} color={improved ? '#22c55e' : 'var(--color-accent)'} />
                  </div>
                );
              })}
            </div>

            {/* Measurements comparison */}
            <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
              <p className="text-xs font-semibold tracking-widest mb-6" style={{ color: 'var(--color-camel)' }}>
                MEDIDAS AO LONGO DO TEMPO (cm)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                {Object.keys(data[0].measurements).map((k) => (
                  <CompareBar
                    key={k}
                    label={measureLabels[k] ?? k}
                    values={data.map((a) => a.measurements[k])}
                    dates={dates}
                    unit="cm"
                    lowerIsBetter={['waist', 'hip', 'abdomen'].includes(k)}
                  />
                ))}
              </div>
            </div>

            {/* Skinfolds comparison */}
            <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
              <p className="text-xs font-semibold tracking-widest mb-6" style={{ color: 'var(--color-camel)' }}>
                DOBRAS CUTÂNEAS (mm)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                {Object.keys(data[0].skinfolds).map((k) => (
                  <CompareBar
                    key={k}
                    label={skinfoldLabels[k] ?? k}
                    values={data.map((a) => a.skinfolds[k])}
                    dates={dates}
                    unit="mm"
                    lowerIsBetter
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        </ErrorBoundary>
      </div>
    </div>
  );
}
