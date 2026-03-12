import React, { useState } from 'react';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { useAuth } from '../../lib/auth';
import Link from 'next/link';
import { Button } from '../../components/Button';

export default function StudentHome() {
  const { user } = useAuth();
  const [nextSession] = useState({ id: 't1', date: '2026-03-15', title: 'Full Body Beginner' });

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
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {nextSession.title}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Dom, 15 de Março de 2026 &bull; 09:00
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href={`/trainings/${nextSession.id}`}>
                <Button variant="outline-white">Ver detalhes</Button>
              </Link>
              <Link href={`/trainings/${nextSession.id}/run`}>
                <Button variant="accent">
                  <svg width="12" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden><path d="M0 0l10 6-10 6z"/></svg>
                  Iniciar treino
                </Button>
              </Link>
            </div>
          </Card>

          {/* Summary — light card */}
          <Card>
            <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>
              RESUMO DA SEMANA
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)' }}>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>Treinos</div>
                <div className="text-3xl font-bold mt-0.5">3</div>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)' }}>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>Tempo total</div>
                <div className="text-3xl font-bold mt-0.5">1h 25m</div>
              </div>
              <div className="col-span-2 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)' }}>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>Sequência atual</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold">5</span>
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
