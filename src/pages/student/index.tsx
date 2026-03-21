import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { useRequireAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import Link from 'next/link';
import { Button } from '../../components/Button';

type Session = { id: string; trainingId: string; date: string; time: string; title: string; done: boolean };
type Summary = { totalWorkouts: number; totalHours: number; weightLost: number; streak: number };

export default function StudentHome() {
  const { user, ready } = useRequireAuth('student');
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 7);
    apiFetch<Session[]>(`/api/schedule?month=${todayISO}`)
      .then((sessions) => {
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = sessions
          .filter((s) => s.date >= today && !s.done)
          .sort((a, b) => a.date.localeCompare(b.date));
        if (upcoming.length > 0) setNextSession(upcoming[0]);
      })
      .catch(() => null);
    apiFetch<{ summary: Summary }>('/api/progress')
      .then((d) => setSummary(d.summary))
      .catch(() => null);
  }, []);

  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* ── Hero banner ── */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {todayFormatted.toUpperCase()}
          </p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Bem-vinda, {user?.name || 'Beatriz'}!
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Pronta para mais um treino incrível?
          </p>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="app-container py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

          {/* Next session — dark card */}
          <Card variant="dark">
            <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
              PRÓXIMO TREINO
            </p>
            {nextSession ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {nextSession.title}
                </h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(nextSession.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} &bull; {nextSession.time}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href={`/trainings/${nextSession.trainingId}`}>
                    <Button variant="outline-white">Ver detalhes</Button>
                  </Link>
                  <Link href={`/trainings/${nextSession.trainingId}/run`}>
                    <Button variant="accent">
                      <svg width="12" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden><path d="M0 0l10 6-10 6z"/></svg>
                      Iniciar treino
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Nenhum treino agendado.</p>
            )}
          </Card>

          {/* Summary — light card */}
          <Card>
            <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>
              RESUMO DA SEMANA
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)' }}>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>Treinos</div>
                <div className="text-3xl font-bold mt-0.5">{summary?.totalWorkouts ?? '—'}</div>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)' }}>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>Tempo total</div>
                <div className="text-3xl font-bold mt-0.5">{summary?.totalHours ?? '—'}h</div>
              </div>
              <div className="col-span-2 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)' }}>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>Sequência atual</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold">{summary?.streak ?? '—'}</span>
                  <span className="text-sm" style={{ color: 'var(--color-camel)' }}>dias seguidos 🔥</span>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
