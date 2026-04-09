import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { Button } from '../../components/Button';
import { apiFetch } from '../../lib/api';
import {
  Calendar, Dumbbell, CheckCircle2, Circle, Trash2, Plus,
  ChevronLeft, ChevronRight, Repeat, ClipboardList, Clock, User as UserIcon
} from 'lucide-react';

type Session = { id: string; userId: string; trainingId: string; date: string; time: string; title: string; done: boolean };
type Student = { id: string; name: string; avatar: string };
type TrainingSheet = { id: number; title: string; days: { trainingId: number; weekdays: number[]; training: { title: string } }[] };

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
/** Find the Monday of the week containing a given date */
function getMonday(dateStr: string) {
  const d = new Date(dateStr + 'T12:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function TrainerSchedule() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sheets, setSheets] = useState<TrainingSheet[]>([]);
  const [trainings, setTrainings] = useState<{ id: string; title: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [newSession, setNewSession] = useState({ studentId: '', trainingId: '', date: '', time: '07:00', title: '' });
  const [weeklyForm, setWeeklyForm] = useState({ studentId: '', trainingSheetId: '', weekStart: '', recurrenceWeeks: 1, time: '07:00' });

  // Load students, trainings and sheets once
  useEffect(() => {
    apiFetch<Student[]>('/api/trainer/students')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setStudents(list);
        if (list.length > 0) {
          setNewSession(n => ({ ...n, studentId: String(list[0].id) }));
          setWeeklyForm(n => ({ ...n, studentId: String(list[0].id) }));
        }
      }).catch(() => {});
    apiFetch<{ id: string; title: string }[]>('/api/trainings')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTrainings(list);
        if (list.length > 0) setNewSession(n => ({ ...n, trainingId: String(list[0].id), title: list[0].title }));
      }).catch(() => {});
    apiFetch<TrainingSheet[]>('/api/training-sheets')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSheets(list);
        if (list.length > 0) setWeeklyForm(n => ({ ...n, trainingSheetId: String(list[0].id) }));
      }).catch(() => {});
  }, []);

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
    apiFetch(`/api/schedule/${id}`, { method: 'PATCH', body: JSON.stringify({ done: next }) }).catch(() => {});
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    apiFetch(`/api/schedule/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const addSession = () => {
    if (!newSession.date || !newSession.title) return;
    apiFetch<Session>('/api/schedule', { method: 'POST', body: JSON.stringify(newSession) })
      .then((created) => { setSessions((prev) => [...prev, created]); setShowAdd(false); })
      .catch((err: Error) => alert('Erro ao salvar sessão: ' + (err?.message ?? 'erro desconhecido')));
  };

  const addWeekly = () => {
    if (!weeklyForm.weekStart || !weeklyForm.trainingSheetId || !weeklyForm.studentId) return;
    apiFetch<{ sessions: Session[] }>('/api/schedule/weekly', { method: 'POST', body: JSON.stringify(weeklyForm) })
      .then((result) => {
        setSessions((prev) => [...prev, ...result.sessions]);
        setShowWeekly(false);
      })
      .catch((err: Error) => alert('Erro ao agendar ficha semanal: ' + (err?.message ?? 'erro desconhecido')));
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
            <div className="flex gap-2">
              <Button variant="outline-white" onClick={() => setShowWeekly(true)}>
                <Repeat size={16} /> Agendar ficha semanal
              </Button>
              <Button variant="outline-white" onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Sessão avulsa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Calendar */}
          <div className="md:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(74,52,42,0.08)]">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {MONTHS[month]} {year}
                </span>
                <button onClick={nextMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(74,52,42,0.08)]">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'rgba(74,52,42,0.45)' }}>{d}</div>
                ))}
              </div>

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
                        background: isSelected ? 'var(--color-accent)' : isToday ? 'rgba(232,108,44,0.12)' : daySessions.length > 0 ? 'rgba(178,150,125,0.15)' : 'transparent',
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
                    const student = students.find(st => String(st.id) === String(s.userId));
                    return (
                      <Card key={s.id} className={s.done ? 'opacity-60' : ''}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(178,150,125,0.15)' }}>
                            <Dumbbell size={18} style={{ color: 'var(--color-camel)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-sm" style={{ textDecoration: s.done ? 'line-through' : 'none' }}>
                              {s.title}
                            </span>
                            <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'rgba(74,52,42,0.5)' }}>
                              <Clock size={12} /> {s.time} · <UserIcon size={12} /> {student?.name ?? 'Aluno'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => toggle(s.id)}
                            className="text-xs px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1"
                            style={{
                              background: s.done ? 'rgba(34,197,94,0.12)' : 'rgba(178,150,125,0.2)',
                              color: s.done ? '#22c55e' : 'var(--color-camel)',
                            }}>
                            {s.done ? <><CheckCircle2 size={14} /> Realizado</> : <><Circle size={14} /> Marcar feito</>}
                          </button>
                          <button onClick={() => removeSession(s.id)}
                            className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                            style={{ background: 'rgba(232,108,44,0.08)', color: 'var(--color-accent)' }}>
                            <Trash2 size={14} /> Remover
                          </button>
                        </div>
                      </Card>
                    );
                  })
                )}
                <Button variant="ghost" fullWidth onClick={() => { setNewSession(n => ({ ...n, date: selected })); setShowAdd(true); }}>
                  <Plus size={16} /> Sessão neste dia
                </Button>
              </>
            ) : (
              <div className="rounded-card p-6 text-center" style={{ background: 'var(--color-khaki)' }}>
                <Calendar size={32} className="mx-auto mb-2" style={{ color: 'rgba(74,52,42,0.25)' }} />
                <p className="text-sm font-medium">Selecione um dia</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(74,52,42,0.5)' }}>
                  Clique em uma data para ver as sessões agendadas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly sheet scheduling modal ── */}
      {showWeekly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(46,29,22,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-card p-6" style={{ background: 'var(--color-linen)' }}>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Agendar Ficha Semanal
            </h3>
            <p className="text-xs mb-5" style={{ color: 'rgba(74,52,42,0.5)' }}>
              Selecione uma ficha e o início da semana. As sessões serão criadas automaticamente.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Aluno</label>
                <select className="field" value={weeklyForm.studentId}
                  onChange={e => setWeeklyForm(n => ({ ...n, studentId: e.target.value }))}>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Ficha semanal</label>
                <select className="field" value={weeklyForm.trainingSheetId}
                  onChange={e => setWeeklyForm(n => ({ ...n, trainingSheetId: e.target.value }))}>
                  {sheets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                {sheets.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
                    Nenhuma ficha criada. <Link href="/trainer/sheets/new/edit" className="underline">Criar ficha</Link>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Início da semana (segunda)</label>
                  <input type="date" className="field" value={weeklyForm.weekStart}
                    onChange={e => {
                      const monday = getMonday(e.target.value);
                      setWeeklyForm(n => ({ ...n, weekStart: monday }));
                    }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Horário padrão</label>
                  <input type="time" className="field" value={weeklyForm.time}
                    onChange={e => setWeeklyForm(n => ({ ...n, time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>
                  Repetir por quantas semanas?
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={12} value={weeklyForm.recurrenceWeeks}
                    onChange={e => setWeeklyForm(n => ({ ...n, recurrenceWeeks: +e.target.value }))}
                    className="flex-1" />
                  <span className="text-sm font-bold w-16 text-center" style={{ color: 'var(--color-accent)' }}>
                    {weeklyForm.recurrenceWeeks} semana{weeklyForm.recurrenceWeeks > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" fullWidth onClick={() => setShowWeekly(false)}>Cancelar</Button>
              <Button variant="accent" fullWidth onClick={addWeekly}>
                <Repeat size={16} /> Agendar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Single session modal (kept for one-off sessions) ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(46,29,22,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-card p-6" style={{ background: 'var(--color-linen)' }}>
            <h3 className="text-xl font-bold mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
              Agendar sessão avulsa
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
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Treino</label>
                <select className="field" value={newSession.trainingId}
                  onChange={e => {
                    const tr = trainings.find(t => String(t.id) === e.target.value);
                    setNewSession(n => ({ ...n, trainingId: e.target.value, title: tr?.title ?? n.title }));
                  }}>
                  {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
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
