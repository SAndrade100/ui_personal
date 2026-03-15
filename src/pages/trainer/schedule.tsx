import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { Button } from '../../components/Button';
import { apiFetch } from '../../lib/api';

type Session = { id: string; trainingId: string; date: string; time: string; title: string; done: boolean };
type Student = { id: string; name: string; avatar: string };

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const categoryEmoji: Record<string, string> = {
  'Full Body': '🏋️', HIIT: '🔥', Força: '💪', Pernas: '🦵', Funcional: '⚡',
};
function trainingEmoji(title: string) {
  for (const [k, v] of Object.entries(categoryEmoji))
    if (title.includes(k)) return v;
  return '🏃';
}

export default function TrainerSchedule() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students] = useState<Student[]>([
    { id: 'u1', name: 'Beatriz Souza', avatar: 'B' },
    { id: 'u2', name: 'Camila Torres', avatar: 'C' },
    { id: 'u3', name: 'Rodrigo Lima', avatar: 'R' },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newSession, setNewSession] = useState({ studentId: 'u1', trainingId: 't1', date: '', time: '07:00', title: '' });

  useEffect(() => {
    const m = `${year}-${String(month + 1).padStart(2, '0')}`;
    const m2 = month === 11 ? `${year + 1}-01` : `${year}-${String(month + 2).padStart(2, '0')}`;
    Promise.all([
      apiFetch<Session[]>(`/api/schedule?month=${m}`),
      apiFetch<Session[]>(`/api/schedule?month=${m2}`),
    ]).then(([a, b]) => setSessions([...a, ...b])).catch(() => setSessions([]));
  }, [year, month]);

  const toggle = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const next = !session.done;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, done: next } : s));
    apiFetch(`/api/schedule/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: next }),
    }).catch(() => {});
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    apiFetch(`/api/schedule/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const addSession = () => {
    if (!newSession.date || !newSession.title) return;
    apiFetch<Session>('/api/schedule', {
      method: 'POST',
      body: JSON.stringify(newSession),
    })
      .then(created => setSessions(prev => [...prev, created]))
      .catch(() => setSessions(prev => [...prev, {
        id: 's' + Math.random().toString(36).slice(2, 6),
        trainingId: newSession.trainingId,
        date: newSession.date,
        time: newSession.time,
        title: newSession.title,
        done: false,
      }]));
    setShowAdd(false);
    setNewSession({ studentId: 'u1', trainingId: 't1', date: '', time: '07:00', title: '' });
  };

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelected(null); };

  const totalDays = daysInMonth(year, month);
  const startDay = firstWeekday(year, month);
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const sessionsByDate: Record<string, Session[]> = {};
  sessions.forEach(s => { if (!sessionsByDate[s.date]) sessionsByDate[s.date] = []; sessionsByDate[s.date].push(s); });

  const selectedSessions = selected ? (sessionsByDate[selected] ?? []) : [];
  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Agenda Consolidada
            </h1>
            <Button variant="outline-white" onClick={() => setShowAdd(true)}>+ Agendar sessão</Button>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Calendar */}
          <div className="md:col-span-2">
            <Card>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(74,52,42,0.08)]">‹</button>
                <span className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {MONTHS[month]} {year}
                </span>
                <button onClick={nextMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(74,52,42,0.08)]">›</button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'rgba(74,52,42,0.45)' }}>{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (!day) return <div key={idx} />;
                  const iso = toISO(year, month, day);
                  const daySessions = sessionsByDate[iso] ?? [];
                  const isToday = iso === todayISO;
                  const isSelected = iso === selected;
                  const hasDone = daySessions.some(s => s.done);
                  const hasPending = daySessions.some(s => !s.done);

                  return (
                    <button key={idx} onClick={() => setSelected(iso === selected ? null : iso)}
                      className="relative flex flex-col items-center py-1.5 rounded-xl transition-all"
                      style={{
                        background: isSelected
                          ? 'var(--color-accent)'
                          : isToday
                            ? 'rgba(232,108,44,0.12)'
                            : daySessions.length > 0
                              ? 'rgba(178,150,125,0.15)'
                              : 'transparent',
                        color: isSelected ? 'white' : 'var(--color-espresso)',
                      }}>
                      <span className="text-sm font-medium">{day}</span>
                      {daySessions.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasDone && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />}
                          {hasPending && <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-camel)' }} />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4 pt-4 text-xs" style={{ borderTop: '1px solid rgba(74,52,42,0.08)', color: 'rgba(74,52,42,0.5)' }}>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} /> Realizado</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-camel)' }} /> Agendado</span>
              </div>
            </Card>
          </div>

          {/* Sessions panel */}
          <div className="space-y-3">
            {selected ? (
              <>
                <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>
                  {new Date(selected + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                </p>
                {selectedSessions.length === 0 ? (
                  <div className="text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Nenhuma sessão neste dia.</div>
                ) : (
                  selectedSessions.map(s => {
                    const student = students.find(st => st.id === 'u1');
                    return (
                      <Card key={s.id} className={s.done ? 'opacity-60' : ''}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{trainingEmoji(s.title)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm" style={{ textDecoration: s.done ? 'line-through' : 'none' }}>
                                {s.title}
                              </span>
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>
                              {s.time} · {student?.name ?? 'Aluno'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => toggle(s.id)}
                            className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                            style={{
                              background: s.done ? 'rgba(34,197,94,0.12)' : 'rgba(178,150,125,0.2)',
                              color: s.done ? '#22c55e' : 'var(--color-camel)',
                            }}>
                            {s.done ? '✓ Realizado' : 'Marcar feito'}
                          </button>
                          <button onClick={() => removeSession(s.id)}
                            className="text-xs px-3 py-1 rounded-full"
                            style={{ background: 'rgba(232,108,44,0.08)', color: 'var(--color-accent)' }}>
                            Remover
                          </button>
                        </div>
                      </Card>
                    );
                  })
                )}
                <Button variant="ghost" fullWidth onClick={() => { setNewSession(n => ({ ...n, date: selected })); setShowAdd(true); }}>
                  + Sessão neste dia
                </Button>
              </>
            ) : (
              <div className="rounded-card p-6 text-center" style={{ background: 'var(--color-khaki)' }}>
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm font-medium">Selecione um dia</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(74,52,42,0.5)' }}>
                  Clique em uma data para ver as sessões agendadas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add session modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(46,29,22,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-card p-6" style={{ background: 'var(--color-linen)' }}>
            <h3 className="text-xl font-bold mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
              Agendar sessão
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Aluno</label>
                <select className="field" value={newSession.studentId}
                  onChange={e => setNewSession(n => ({ ...n, studentId: e.target.value }))}>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Título do treino</label>
                <input className="field" value={newSession.title}
                  onChange={e => setNewSession(n => ({ ...n, title: e.target.value }))}
                  placeholder="ex: Full Body Beginner" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Data</label>
                  <input type="date" className="field" value={newSession.date}
                    onChange={e => setNewSession(n => ({ ...n, date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Horário</label>
                  <input type="time" className="field" value={newSession.time}
                    onChange={e => setNewSession(n => ({ ...n, time: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" fullWidth onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button variant="accent" fullWidth onClick={addSession}>Agendar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
