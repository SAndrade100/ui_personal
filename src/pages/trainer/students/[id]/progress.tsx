import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Card from '../../../../components/Card';
import { apiFetch } from '../../../../lib/api';

type WeightEntry = { date: string; value: number };
type WeekEntry   = { week: string; count: number };
type PR          = { id: string; exercise: string; category: string; value: string; date: string; improvement: string };
type Summary     = { totalWorkouts: number; totalHours: number; weightLost: number; streak: number };
type ProgressData = { weightHistory: WeightEntry[]; weeklyWorkouts: WeekEntry[]; personalRecords: PR[]; summary: Summary };

type Student = { id: string; name: string; avatar: string; targetWeight: number };

// ── SVG helpers ────────────────────────────────────────────────────────────────
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1);
    d += ` C ${cx} ${pts[i - 1].y.toFixed(1)} ${cx} ${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
  }
  return d;
}

function WeightChart({ data, targetWeight }: { data: WeightEntry[]; targetWeight: number }) {
  const W = 600, H = 200, PL = 52, PR = 20, PT = 24, PB = 38;
  const cW = W - PL - PR, cH = H - PT - PB;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals, targetWeight), maxV = Math.max(...vals, targetWeight);
  const pad = (maxV - minV) * 0.35 || 1;
  const lo = minV - pad, hi = maxV + pad;
  const pts = data.map((d, i) => ({
    x: PL + (data.length < 2 ? cW / 2 : (i / (data.length - 1)) * cW),
    y: PT + cH - ((d.value - lo) / (hi - lo)) * cH,
    date: d.date, value: d.value,
  }));
  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x.toFixed(1)} ${(PT + cH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PT + cH).toFixed(1)} Z`;
  const yTicks = [0, 1, 2, 3, 4].map(i => ({ y: PT + (i / 4) * cH, label: (hi - (i / 4) * (hi - lo)).toFixed(1) }));
  const fmtDate = (iso: string) => new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const targetY = PT + cH - ((targetWeight - lo) / (hi - lo)) * cH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-label="Gráfico peso">
      <defs>
        <linearGradient id="wGradT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E86C2C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E86C2C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map(({ y, label }, i) => (
        <g key={i}>
          <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(74,52,42,0.07)" strokeWidth="1" />
          <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="rgba(74,52,42,0.4)">{label}</text>
        </g>
      ))}
      <line x1={PL} y1={targetY} x2={W - PR} y2={targetY} stroke="#B2967D" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
      <text x={W - PR - 2} y={targetY - 4} textAnchor="end" fontSize={9} fill="#B2967D" opacity="0.8">meta {targetWeight} kg</text>
      <path d={areaPath} fill="url(#wGradT)" />
      <path d={linePath} fill="none" stroke="#E86C2C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#E86C2C" />
          {i === pts.length - 1 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#E86C2C">{p.value}</text>
          )}
          {(i === 0 || i === pts.length - 1) && (
            <text x={p.x} y={PT + cH + 14} textAnchor="middle" fontSize={9} fill="rgba(74,52,42,0.45)">{fmtDate(p.date)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function WorkoutBar({ data }: { data: WeekEntry[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-center py-6" style={{ color: 'rgba(74,52,42,0.4)' }}>Nenhum treino registrado ainda.</div>;
  }
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map(({ week, count }) => (
        <div key={week} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: 'var(--color-espresso)' }}>{count}</span>
          <div className="w-full rounded-t-lg transition-all" style={{
            height: `${(count / max) * 72}px`,
            background: count >= 3 ? 'var(--color-accent)' : 'var(--color-camel)',
            opacity: 0.7 + (count / max) * 0.3,
          }} />
          <span className="text-xs" style={{ color: 'rgba(74,52,42,0.4)' }}>{week.replace('Sem ', '')}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrainerStudentProgress() {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const [data, setData] = useState<ProgressData | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<ProgressData>(`/api/trainer/students/${id}?section=progress`).then(setData).catch(() => null);
    apiFetch<Student>(`/api/trainer/students/${id}`).then(setStudent).catch(() => null);
  }, [id]);

  if (!data || !student) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
        <Header />
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Carregando…</div>
      </div>
    );
  }

  const { summary, weightHistory, weeklyWorkouts, personalRecords } = data;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href={`/trainer/students/${id}`} className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Voltar para aluno
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}>{student.avatar}</span>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Progresso — {student.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-8 space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de treinos', value: summary.totalWorkouts },
            { label: 'Horas de treino', value: `${summary.totalHours}h` },
            { label: 'Peso perdido', value: `${summary.weightLost} kg` },
            { label: 'Sequência atual', value: `${summary.streak}d 🔥` },
          ].map(({ label, value }) => (
            <Card key={label} className="text-center">
              <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-espresso)' }}>{value}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: 'var(--color-camel)' }}>{label}</div>
            </Card>
          ))}
        </div>

        {/* Weight chart */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>EVOLUÇÃO DE PESO</p>
          {weightHistory.length >= 2 ? (
            <WeightChart data={weightHistory} targetWeight={student.targetWeight} />
          ) : (
            <div className="text-center py-8 text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Dados insuficientes para gráfico.</div>
          )}
        </Card>

        {/* Weekly workouts */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>TREINOS POR SEMANA</p>
          <WorkoutBar data={weeklyWorkouts} />
        </Card>

        {/* PRs */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>RECORDES PESSOAIS</p>
          <div className="space-y-3">
            {personalRecords.map(pr => (
              <div key={pr.id} className="flex items-center gap-4 p-3 rounded-2xl flex-wrap"
                style={{ background: 'rgba(255,255,255,0.6)' }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{pr.exercise}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>
                    {pr.category} · {new Date(pr.date + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: 'var(--color-espresso)' }}>{pr.value}</div>
                  <div className="text-xs font-semibold" style={{ color: '#22c55e' }}>{pr.improvement}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
