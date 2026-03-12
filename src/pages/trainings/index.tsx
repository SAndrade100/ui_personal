import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

type Training = { id: string; title: string; duration: number; level: string };

const levelColor: Record<string, string> = {
  Beginner: 'rgba(255,255,255,0.15)',
  Intermediate: 'rgba(232,108,44,0.3)',
  Advanced: 'rgba(200,60,30,0.35)',
};

export default function Trainings() {
  const [list, setList] = useState<Training[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/trainings?q=' + encodeURIComponent(q))
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]));
  }, [q]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>BIBLIOTECA</p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Meus Treinos</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Encontre e inicie seu próximo desafio.</p>

          {/* Search inside hero */}
          <div className="mt-6 relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar treino..."
              aria-label="Buscar treinos"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-full outline-none"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
              }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="app-container py-8">
        {list.length === 0 && (
          <p className="text-center text-sm" style={{ color: 'rgba(74,52,42,0.5)' }}>Nenhum treino encontrado.</p>
        )}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {list.map((t) => (
            <Link
              key={t.id}
              href={`/trainings/${t.id}`}
              className="group block rounded-card overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)',
                boxShadow: 'var(--card-shadow-dark)',
                color: 'white',
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
                      style={{ background: levelColor[t.level] || levelColor.Beginner }}
                    >
                      {t.level}
                    </span>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.title}</h3>
                    <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.duration} min</p>
                  </div>
                  <span
                    className="text-2xl mt-1 group-hover:scale-110 transition-transform"
                    aria-hidden
                  >🏋️</span>
                </div>
              </div>
              <div
                className="px-6 py-3 text-xs font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.7)' }}
              >
                Ver detalhes <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
