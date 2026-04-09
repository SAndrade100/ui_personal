import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';
import { Button } from '../../components/Button';
import { apiFetch } from '../../lib/api';
import { Timer, BarChart3, Dumbbell } from 'lucide-react';

type Exercise = { id: string; name: string; reps: string };
type Training = { id: string; title: string; duration: number; level: string; exercises: Exercise[] };

export default function TrainingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [t, setT] = useState<Training | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<Training>('/api/trainings/' + id)
      .then(setT)
      .catch(() => setT(null));
  }, [id]);

  if (!t) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-linen)' }}>
      <span className="text-sm" style={{ color: 'rgba(74,52,42,0.5)' }}>Carregando...</span>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainings" className="inline-flex items-center gap-1.5 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            ← Voltar
          </Link>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>TREINO</p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{t.title}</h1>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.65)' }}><Timer size={14} /> {t.duration} min</span>
            <span className="text-sm flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.65)' }}><BarChart3 size={14} /> {t.level}</span>
            <span className="text-sm flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.65)' }}><Dumbbell size={14} /> {t.exercises.length} exercícios</span>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">

          {/* Exercise list */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Exercícios</h2>
            {t.exercises.map((e, idx) => (
              <div
                key={e.id}
                className="flex items-center gap-4 p-4 rounded-card"
                style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'var(--color-cocoa)' }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{e.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.6)' }}>{e.reps}</div>
                </div>
                <Dumbbell size={18} style={{ color: 'var(--color-camel)' }} aria-hidden />
              </div>
            ))}
          </div>

          {/* CTA card */}
          <div
            className="rounded-card p-6 flex flex-col justify-between h-fit"
            style={{
              background: 'linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)',
              boxShadow: 'var(--card-shadow-dark)',
            }}
          >
            <div>
              <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>PRONTO?</p>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Vamos começar!</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t.duration} min de pura dedicação te esperam.
              </p>
            </div>
            <Link href={`/trainings/${t.id}/run`}>
              <Button variant="accent" fullWidth>
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden><path d="M0 0l10 6-10 6z"/></svg>
                Iniciar treino
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
