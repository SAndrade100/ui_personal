import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { Button } from '../../components/Button';

type Student = {
  id: string; name: string; avatar: string; status: string;
  currentWeight: number; targetWeight: number; startWeight: number;
  weeklyGoal: number; weeklyDone: number; streak: number;
  lastWorkout: string | null; nextWorkout: string | null;
  fatPercent: number; notes: string; goal: string; plan: string;
};

function ProgressBar({ start, current, target }: { start: number; current: number; target: number }) {
  const pct = Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(74,52,42,0.1)' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-camel), var(--color-accent))' }} />
    </div>
  );
}

function AlertBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(232,108,44,0.12)', color: 'var(--color-accent)' }}>
      {children}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso + 'T12:00').getTime();
  return Math.floor(diff / 86400000);
}

export default function TrainerDashboard() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch('/api/trainer/students')
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  const active = students.filter((s) => s.status === 'active');
  const inactive = students.filter((s) => s.status === 'inactive');
  const atRisk = active.filter((s) => s.lastWorkout && daysSince(s.lastWorkout) >= 4);
  const totalWorkoutsWeek = active.reduce((n, s) => n + s.weeklyDone, 0);

  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const todayFmt = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {todayFmt.toUpperCase()}
          </p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Olá, Ana Paula!
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Painel do treinador · {active.length} alunos ativos
          </p>
        </div>
      </div>

      <div className="app-container py-8 space-y-8">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Alunos ativos',       value: active.length,         sub: `${inactive.length} inativos`   },
            { label: 'Treinos esta semana',  value: totalWorkoutsWeek,     sub: 'no total'                      },
            { label: 'Sequência média',      value: `${(active.reduce((n,s)=>n+s.streak,0)/Math.max(1,active.length)).toFixed(0)} dias`, sub: 'entre alunos' },
            { label: 'Atenção necessária',   value: atRisk.length,         sub: 'alunos sem treinar há 4+ d'    },
          ].map(({ label, value, sub }) => (
            <Card key={label} className="text-center">
              <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-espresso)' }}>{value}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: 'var(--color-camel)' }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.45)' }}>{sub}</div>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        {atRisk.length > 0 && (
          <div className="rounded-card p-5" style={{ background: 'rgba(232,108,44,0.08)', border: '1px solid rgba(232,108,44,0.2)' }}>
            <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
              ⚠ ALUNOS QUE PRECISAM DE ATENÇÃO
            </p>
            <div className="space-y-2">
              {atRisk.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'var(--color-cocoa)' }}>{s.avatar}</span>
                    <div>
                      <span className="text-sm font-semibold">{s.name}</span>
                      <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>
                        Último treino: {s.lastWorkout ? fmtDate(s.lastWorkout) : '—'} ({s.lastWorkout ? daysSince(s.lastWorkout) : '?'}d atrás)
                      </div>
                    </div>
                  </div>
                  <AlertBadge>Sem treinar há {s.lastWorkout ? daysSince(s.lastWorkout) : '?'}d</AlertBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Meus Alunos</h2>
            <Link href="/trainer/students">
              <Button variant="ghost">Ver todos</Button>
            </Link>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {students.map((s) => {
              const pct = Math.min(100, Math.max(0, ((s.startWeight - s.currentWeight) / (s.startWeight - s.targetWeight)) * 100));
              const behind = s.weeklyDone < s.weeklyGoal;
              return (
                <Card key={s.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold text-white"
                      style={{ background: s.status === 'inactive' ? 'var(--color-camel)' : 'var(--color-cocoa)' }}>
                      {s.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{s.name}</span>
                        {s.status === 'inactive' && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,52,42,0.1)', color: 'rgba(74,52,42,0.5)' }}>
                            Inativo
                          </span>
                        )}
                        {behind && s.status === 'active' && (
                          <AlertBadge>{s.weeklyDone}/{s.weeklyGoal} treinos</AlertBadge>
                        )}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'rgba(74,52,42,0.5)' }}>{s.plan}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs" style={{ color: 'rgba(74,52,42,0.6)' }}>
                      <span>Progresso de peso</span>
                      <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <ProgressBar start={s.startWeight} current={s.currentWeight} target={s.targetWeight} />
                    <div className="flex justify-between text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>
                      <span>Início: {s.startWeight} kg</span>
                      <span>Atual: <strong style={{ color: 'var(--color-espresso)' }}>{s.currentWeight} kg</strong></span>
                      <span>Meta: {s.targetWeight} kg</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs" style={{ color: 'rgba(74,52,42,0.5)' }}>
                      {s.streak > 0
                        ? <span>🔥 {s.streak} dias seguidos</span>
                        : <span style={{ color: 'rgba(74,52,42,0.35)' }}>Sem sequência ativa</span>
                      }
                    </div>
                    <Link href={`/trainer/students/${s.id}`}>
                      <Button variant="outline" className="!py-1.5 !px-4 !text-xs">Ver aluno</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Ações rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Agenda',       href: '/trainer/schedule',  icon: '📅' },
              { label: 'Treinos',      href: '/trainer/trainings', icon: '🏋️' },
              { label: 'Chat',         href: '/trainer/chat',      icon: '💬' },
              { label: 'Alunos',       href: '/trainer/students',  icon: '👥' },
            ].map(({ label, href, icon }) => (
              <Link key={href} href={href}>
                <div className="rounded-card p-5 text-center cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-sm font-semibold">{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
