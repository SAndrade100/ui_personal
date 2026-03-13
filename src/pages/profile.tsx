import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  goal: string;
  startDate: string;
  trainer: string;
  plan: string;
};

function age(birthdate: string): number {
  const b = new Date(birthdate);
  const today = new Date();
  let a = today.getFullYear() - b.getFullYear();
  if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

function bmi(weight: number, heightCm: number): string {
  return (weight / Math.pow(heightCm / 100, 2)).toFixed(1);
}

function bmiLabel(b: number): string {
  if (b < 18.5) return 'Abaixo do peso';
  if (b < 25)   return 'Peso normal';
  if (b < 30)   return 'Sobrepeso';
  return 'Obesidade';
}

/** Progress bar: start → current → target */
function WeightBar({ start, current, target }: { start: number; current: number; target: number }) {
  const lo = Math.min(start, target) - 1;
  const hi = Math.max(start, target) + 1;
  const range = hi - lo;
  const pStart   = ((start   - lo) / range) * 100;
  const pCurrent = ((current - lo) / range) * 100;
  const pTarget  = ((target  - lo) / range) * 100;
  const pct = ((start - current) / (start - target)) * 100;
  const progress = Math.min(100, Math.max(0, pct));

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'rgba(74,52,42,0.55)' }}>
        <span>Início: <strong style={{ color: 'var(--color-espresso)' }}>{start} kg</strong></span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{progress.toFixed(0)}% concluído</span>
        <span>Meta: <strong style={{ color: 'var(--color-espresso)' }}>{target} kg</strong></span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(74,52,42,0.1)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--color-camel), var(--color-accent))' }}
        />
      </div>
      <div className="flex items-center justify-between text-xs mt-2">
        <span style={{ color: 'rgba(74,52,42,0.45)' }}>
          Perdido: <strong style={{ color: 'var(--color-accent)' }}>{(start - current).toFixed(1)} kg</strong>
        </span>
        <span style={{ color: 'rgba(74,52,42,0.45)' }}>
          Falta: <strong style={{ color: 'var(--color-espresso)' }}>{Math.max(0, current - target).toFixed(1)} kg</strong>
        </span>
      </div>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then(setUser)
      .catch(() => null);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-linen)' }}>
        <Header />
        <p className="text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Carregando…</p>
      </div>
    );
  }

  const bmiVal = parseFloat(bmi(user.currentWeight, user.height));
  const userAge = age(user.birthdate);
  const joined = new Date(user.startDate + 'T12:00').toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-14 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="flex items-center gap-8 flex-wrap">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-camel), var(--color-accent))',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            }}
          >
            {user.name[0]}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              PERFIL DO ALUNO
            </p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {user.name}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {user.plan} &bull; Desde {joined}
            </p>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

          {/* ── Dados pessoais ── */}
          <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
            <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>
              DADOS PESSOAIS
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Email',         value: user.email                                                        },
                { label: 'Telefone',      value: user.phone                                                        },
                { label: 'Data de nasc.', value: new Date(user.birthdate + 'T12:00').toLocaleDateString('pt-BR') + ` (${userAge} anos)` },
                { label: 'Personal',      value: user.trainer                                                      },
                { label: 'Objetivo',      value: user.goal                                                         },
              ].map(({ label, value }) => (
                <li key={label} className="flex items-start gap-3">
                  <span
                    className="text-xs font-semibold pt-0.5 w-28 flex-shrink-0"
                    style={{ color: 'rgba(74,52,42,0.5)' }}
                  >
                    {label}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-espresso)' }}>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Dados físicos ── */}
          <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
            <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>
              DADOS FÍSICOS
            </p>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Peso atual',  value: `${user.currentWeight}`, unit: 'kg'  },
                { label: 'Altura',      value: `${user.height}`,        unit: 'cm'  },
                { label: 'IMC',         value: bmiVal.toString(),        unit: bmiLabel(bmiVal) },
              ].map(({ label, value, unit }) => (
                <div key={label} className="text-center rounded-xl py-4 px-2" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-espresso)' }}>
                    {value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>{unit}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Weight goal progress */}
            <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>
              META DE PESO
            </p>
            <WeightBar
              start={user.startWeight}
              current={user.currentWeight}
              target={user.targetWeight}
            />
          </div>

          {/* ── Meta detalhada ── */}
          <div
            className="rounded-card p-6 md:col-span-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))',
              boxShadow: 'var(--card-shadow-dark)',
            }}
          >
            <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              SOBRE O PLANO
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '🎯', label: 'Objetivo',   value: user.goal           },
                { emoji: '📅', label: 'Início',     value: joined              },
                { emoji: '👩‍💼', label: 'Personal',  value: user.trainer        },
                { emoji: '💎', label: 'Plano',      value: user.plan           },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{emoji}</span>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label.toUpperCase()}</div>
                    <div className="text-sm font-medium mt-1 text-white">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
