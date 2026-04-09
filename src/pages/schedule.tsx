import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { Button } from '../components/Button';
import { apiFetch } from '../lib/api';
import { useRequireAuth } from '../lib/auth';
import { Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';

type Session = { id: string; trainingId: string; date: string; time: string; title: string; done: boolean };

// ─── helpers ─────────────────────────────────────────────────────────────────
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const categoryEmoji: Record<string, string> = {};




export default function Schedule() {
  useRequireAuth('student');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string | null>(null); // ISO date

  // Load sessions for current month view (+ next month for overflow)
  useEffect(() => {
    const m = `${year}-${String(month + 1).padStart(2, '0')}`;
    const m2 = month === 11
      ? `${year + 1}-01`
      : `${year}-${String(month + 2).padStart(2, '0')}`;
    Promise.all([
      apiFetch<Session[]>(`/api/schedule?month=${m}`),
      apiFetch<Session[]>(`/api/schedule?month=${m2}`),
    ])
      .then(([a, b]) => setSessions([...a, ...b]))
      .catch(() => setSessions([]));
  }, [year, month]);

  const toggle = (id: string) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  // Build calendar grid
  const totalDays = daysInMonth(year, month);
  const startDay = firstWeekday(year, month);
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const sessionsByDate: Record<string, Session[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
    sessionsByDate[s.date].push(s);
  });

  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedSessions = selected ? (sessionsByDate[selected] ?? []) : [];

  // upcoming list (future + today, not done)
  const upcoming = sessions
    .filter((s) => s.date >= todayISO && !s.done)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            PLANEJAMENTO
          </p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Agenda
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Organize seus treinos e nunca perca uma sessão.
          </p>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

          {/* ── Calendar ── */}
          <div className="lg:col-span-2 rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:bg-[rgba(74,52,42,0.1)]"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:bg-[rgba(74,52,42,0.1)]"
                aria-label="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'rgba(74,52,42,0.5)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const iso = toISO(year, month, day);
                const daySessions = sessionsByDate[iso] ?? [];
                const isToday = iso === todayISO;
                const isSelected = iso === selected;
                const hasDone = daySessions.some((s) => s.done);
                const hasPending = daySessions.some((s) => !s.done);

                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(isSelected ? null : iso)}
                    className="relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl min-h-[52px] transition-all"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))'
                        : isToday
                          ? 'rgba(232,108,44,0.15)'
                          : 'transparent',
                      border: isToday && !isSelected ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
                    }}
                  >
                    <span
                      className="text-sm font-semibold leading-none"
                      style={{ color: isSelected ? 'white' : isToday ? 'var(--color-accent)' : 'var(--color-espresso)' }}
                    >
                      {day}
                    </span>
                    {/* dot indicators */}
                    {daySessions.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {hasPending && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : 'var(--color-accent)' }} />
                        )}
                        {hasDone && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.5)' : 'var(--color-camel)' }} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(74,52,42,0.1)' }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(74,52,42,0.6)' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                Agendado
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(74,52,42,0.6)' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-camel)' }} />
                Concluído
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(74,52,42,0.6)' }}>
                <span
                  className="w-4 h-4 rounded-md border flex items-center justify-center text-[9px] font-bold"
                  style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                >
                  H
                </span>
                Hoje
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Selected day detail */}
            {selected && (
              <div
                className="rounded-card p-5"
                style={{
                  background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))',
                  boxShadow: 'var(--card-shadow-dark)',
                }}
              >
                <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                    .format(new Date(selected + 'T12:00:00'))
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </p>
                {selectedSessions.length === 0 ? (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Nenhum treino neste dia.</p>
                ) : (
                  <ul className="space-y-3">
                    {selectedSessions.map((s) => (
                      <li key={s.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-semibold ${s.done ? 'line-through opacity-50' : 'text-white'}`}
                          >
                            {s.title}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>⏰ {s.time}</div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {!s.done && (
                            <Link href={`/trainings/${s.trainingId}/run`}>
                              <Button variant="accent" className="text-xs !px-2.5 !py-1">
                                <svg width="7" height="9" viewBox="0 0 10 12" fill="currentColor" aria-hidden><path d="M0 0l10 6-10 6z"/></svg>
                              </Button>
                            </Link>
                          )}
                          <button
                            onClick={() => toggle(s.id)}
                            className="w-7 h-7 rounded-full text-xs flex items-center justify-center"
                            style={{ background: s.done ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)', color: 'white' }}
                            aria-label={s.done ? 'Desmarcar' : 'Concluir'}
                          >
                            {s.done ? '↩' : '✓'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Upcoming */}
            <div className="rounded-card p-5" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
              <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>
                PRÓXIMAS SESSÕES
              </p>
              {upcoming.length === 0 ? (
                <p className="text-sm" style={{ color: 'rgba(74,52,42,0.5)' }}>Nenhuma sessão futura.</p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((s) => {
                    const d = new Date(s.date + 'T12:00:00');
                    return (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => { setYear(d.getFullYear()); setMonth(d.getMonth()); setSelected(s.date); }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex-shrink-0 flex flex-col items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.65)' }}
                        >
                          <span className="text-xs font-bold leading-none" style={{ color: 'var(--color-espresso)' }}>
                            {d.getDate()}
                          </span>
                          <span className="text-[9px] leading-none" style={{ color: 'var(--color-camel)' }}>
                            {MONTHS[d.getMonth()].slice(0, 3)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{s.title}</div>
                          <div className="text-xs" style={{ color: 'rgba(74,52,42,0.55)' }}>{s.time}</div>
                        </div>
                        <span className="text-base" aria-hidden>
                          <Dumbbell size={18} style={{ color: 'var(--color-camel)' }} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

