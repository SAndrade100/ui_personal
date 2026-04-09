import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../components/Header';
import { Button } from '../../../components/Button';
import { apiFetch } from '../../../lib/api';
import { Trophy, Check } from 'lucide-react';

type Exercise = { id: string; name: string; reps: string; description?: string; videoUrl?: string };
type Training = { id: string; title: string; duration: number; exercises: Exercise[] };

export default function TrainingRun() {
  const router = useRouter();
  const { id } = router.query;
  const [t, setT] = useState<Training | null>(null);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Training>('/api/trainings/' + id)
      .then(setT)
      .catch(() => null);
  }, [id]);

  if (!t) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-linen)' }}>
      <span className="text-sm" style={{ color: 'rgba(74,52,42,0.5)' }}>Carregando treino...</span>
    </div>
  );

  const isLast = current === t.exercises.length - 1;
  const prev = () => { setCurrent((c) => Math.max(c - 1, 0)); setDone(false); };
  const next = () => {
    if (isLast) {
      setDone(true);
      // Mark today's schedule session for this training as done
      const todayMonth = new Date().toISOString().slice(0, 7);
      const todayDate = new Date().toISOString().slice(0, 10);
      apiFetch<{ id: string; trainingId: string; date: string; done: boolean }[]>(`/api/schedule?month=${todayMonth}`)
        .then((sessions) => {
          const session = sessions.find(
            (s) => String(s.trainingId) === String(id) && String(s.date).slice(0, 10) === todayDate && !s.done,
          );
          if (session) {
            apiFetch(`/api/schedule/${session.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ done: true }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    } else {
      setCurrent((c) => c + 1);
    }
  };
  const progress = Math.round(((current + (done ? 1 : 0)) / t.exercises.length) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'var(--color-khaki)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
        />
      </div>

      <div className="flex-1 flex flex-col" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>

        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/trainings/${id}`} className="text-xs" style={{ color: 'rgba(74,52,42,0.5)' }}>← {t.title}</Link>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'rgba(74,52,42,0.5)' }}>
            {done ? t.exercises.length : current + 1} / {t.exercises.length}
          </span>
        </div>

        {done ? (
          /* Completion screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
              style={{ background: 'linear-gradient(135deg, var(--color-camel), var(--color-accent))' }}>
              <Trophy size={40} color="white" />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Treino concluído!</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(74,52,42,0.6)' }}>Excelente trabalho, Beatriz. Continue assim!</p>
            <Link href="/student">
              <Button variant="accent">Voltar para Home</Button>
            </Link>
          </div>
        ) : (
          /* Exercise card */
          <div className="flex-1 flex flex-col">
            <div
              className="flex-1 rounded-card p-8 flex flex-col justify-between mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)',
                boxShadow: 'var(--card-shadow-dark)',
                minHeight: '260px',
              }}
            >
              <div>
                <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  EXERCÍCIO {current + 1} DE {t.exercises.length}
                </p>
                <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t.exercises[current].name}
                </h2>
                {t.exercises[current].description && (
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {t.exercises[current].description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
                  style={{ background: 'var(--color-accent)', color: 'white' }}
                >
                  {t.exercises[current].reps}
                </span>
                {t.exercises[current].videoUrl && (
                  <a
                    href={t.exercises[current].videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    ▶ Ver vídeo
                  </a>
                )}
              </div>
            </div>

            {/* Exercise list mini */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {t.exercises.map((e, idx) => (
                <div
                  key={e.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: idx === current
                      ? 'var(--color-cocoa)'
                      : idx < current
                        ? 'var(--color-camel)'
                        : 'var(--color-khaki)',
                    color: idx <= current ? 'white' : 'var(--color-espresso)',
                  }}
                >
                  {idx < current && <Check size={10} className="inline mr-0.5" />}{e.name}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={prev} className={current === 0 ? 'opacity-40 pointer-events-none' : ''}>
                ← Anterior
              </Button>
              <Button variant="accent" fullWidth onClick={next}>
                {isLast ? 'Finalizar treino' : 'Próximo exercício →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
