import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import { Button } from '../../../components/Button';

type Student = {
  id: string; name: string; avatar: string; status: string;
  goal: string; plan: string; currentWeight: number; targetWeight: number;
  startWeight: number; weeklyGoal: number; weeklyDone: number; streak: number;
  fatPercent: number; lastWorkout: string | null; totalWorkouts: number; notes: string;
};

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso + 'T12:00').getTime()) / 86400000);
}
function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TrainerStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (q.trim()) params.set('q', q.trim());
    fetch(`/api/trainer/students?${params}`)
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [filter, q]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            PAINEL DO TREINADOR
          </p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Meus Alunos
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {students.length} resultado{students.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="app-container py-8">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar aluno…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="field flex-1"
          />
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: filter === f ? 'var(--color-accent)' : 'var(--color-khaki)',
                  color: filter === f ? 'white' : 'var(--color-espresso)',
                }}>
                {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>
            Nenhum aluno encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((s) => {
              const pct = Math.min(100, Math.max(0, ((s.startWeight - s.currentWeight) / (s.startWeight - s.targetWeight)) * 100));
              const behind = s.status === 'active' && s.weeklyDone < s.weeklyGoal;
              const dormant = s.lastWorkout ? daysSince(s.lastWorkout) >= 4 : false;

              return (
                <Card key={s.id}>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Avatar */}
                    <span className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: s.status === 'inactive' ? 'var(--color-camel)' : 'var(--color-cocoa)' }}>
                      {s.avatar}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold">{s.name}</span>
                        {s.status === 'inactive' && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,52,42,0.1)', color: 'rgba(74,52,42,0.5)' }}>
                            Inativo
                          </span>
                        )}
                        {dormant && s.status === 'active' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(232,108,44,0.12)', color: 'var(--color-accent)' }}>
                            ⚠ {daysSince(s.lastWorkout!)}d sem treinar
                          </span>
                        )}
                        {behind && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(232,108,44,0.12)', color: 'var(--color-accent)' }}>
                            {s.weeklyDone}/{s.weeklyGoal} treinos
                          </span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>
                        {s.plan} · {s.goal}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="hidden md:flex items-center gap-6 text-center">
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--color-espresso)' }}>{s.currentWeight} kg</div>
                        <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>Peso atual</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--color-espresso)' }}>{s.fatPercent}%</div>
                        <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>% Gordura</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{pct.toFixed(0)}%</div>
                        <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>Meta</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--color-espresso)' }}>{s.totalWorkouts}</div>
                        <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>Treinos</div>
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/trainer/students/${s.id}`}>
                      <Button variant="outline" className="!py-1.5 !px-4 !text-xs flex-shrink-0">
                        Ver aluno →
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile metrics */}
                  <div className="flex md:hidden items-center gap-4 mt-4 text-center">
                    {[
                      { label: 'Peso', value: `${s.currentWeight} kg` },
                      { label: '% Gordura', value: `${s.fatPercent}%` },
                      { label: 'Meta', value: `${pct.toFixed(0)}%` },
                      { label: 'Treinos', value: String(s.totalWorkouts) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex-1">
                        <div className="text-sm font-bold" style={{ color: 'var(--color-espresso)' }}>{value}</div>
                        <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {s.notes && (
                    <div className="mt-3 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(74,52,42,0.06)' }}>
                      <span className="font-semibold" style={{ color: 'var(--color-camel)' }}>Obs: </span>
                      <span style={{ color: 'rgba(74,52,42,0.7)' }}>{s.notes}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
