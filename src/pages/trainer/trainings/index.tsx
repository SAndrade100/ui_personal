import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import { Button } from '../../../components/Button';

type Exercise = { id: string; name: string; reps: string; rest: string };
type Training = { id: string; title: string; duration: number; level: string; category: string; exercises: Exercise[] };

const levelColor: Record<string, string> = {
  Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#E86C2C',
};
const categoryEmoji: Record<string, string> = {
  'Full Body': '🏋️', HIIT: '🔥', Força: '💪', Pernas: '🦵', Funcional: '⚡',
};

export default function TrainerTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    fetch(`/api/trainings${params}`)
      .then((r) => r.json())
      .then(setTrainings)
      .catch(() => setTrainings([]));
  }, [q]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Treinos
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {trainings.length} treino{trainings.length !== 1 ? 's' : ''} cadastrado{trainings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="app-container py-8">
        {/* Search + New */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por título…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="field flex-1"
          />
          <Link href="/trainer/trainings/new/edit">
            <Button variant="accent">+ Novo treino</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {trainings.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-3xl flex-shrink-0">{categoryEmoji[t.category] ?? '🏋️'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold">{t.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${levelColor[t.level]}22`, color: levelColor[t.level] }}>
                      {t.level}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(178,150,125,0.2)', color: 'var(--color-camel)' }}>
                      {t.category}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(74,52,42,0.5)' }}>
                    ⏱ {t.duration} min · {t.exercises.length} exercícios
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                    style={{ background: 'rgba(74,52,42,0.08)', color: 'var(--color-espresso)' }}>
                    {expanded === t.id ? 'Ocultar' : 'Exercícios'}
                  </button>
                  <Link href={`/trainer/trainings/${t.id}/edit`}>
                    <Button variant="outline" className="!py-1.5 !px-4 !text-xs">Editar</Button>
                  </Link>
                </div>
              </div>

              {/* Exercise list */}
              {expanded === t.id && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(74,52,42,0.08)' }}>
                  <div className="space-y-2">
                    {t.exercises.map((e, i) => (
                      <div key={e.id} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.55)' }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'var(--color-camel)' }}>{i + 1}</span>
                        <span className="flex-1 text-sm font-medium">{e.name}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>{e.reps}</span>
                        <span className="text-xs" style={{ color: 'rgba(74,52,42,0.4)' }}>descanso: {e.rest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
