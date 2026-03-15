import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { apiFetch } from '../../lib/api';

type Message = { id: string; from: 'trainer' | 'student'; text: string; time: string };
type Student = { id: string; name: string; avatar: string };

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yes = new Date(today); yes.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yes.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const STUDENTS: Student[] = [
  { id: 'u1', name: 'Beatriz Souza', avatar: 'B' },
  { id: 'u2', name: 'Camila Torres', avatar: 'C' },
  { id: 'u3', name: 'Rodrigo Lima',  avatar: 'R' },
  { id: 'u4', name: 'Larissa Mendes', avatar: 'L' },
];

export default function TrainerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student>(STUDENTS[0]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<Message[]>(`/api/chat?studentId=${activeStudent.id}`)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [activeStudent.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const optimistic: Message = {
      id: 'tmp' + Date.now(),
      from: 'trainer',
      text,
      time: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    apiFetch<Message>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ studentId: activeStudent.id, text }),
    })
      .then(saved => setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...saved, from: saved.from as 'trainer' | 'student' } : m)))
      .catch(() => {});
  }

  // Group messages by date
  const groups: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const d = m.time.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else groups.push({ date: d, msgs: [m] });
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-8 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>Chat</h1>
        </div>
      </div>

      <div className="app-container py-6">
        <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[480px]">

          {/* Student list */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
            {STUDENTS.map(s => (
              <button key={s.id}
                onClick={() => setActiveStudent(s)}
                className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all w-full"
                style={{
                  background: activeStudent.id === s.id ? 'var(--color-accent)' : 'var(--color-khaki)',
                  color: activeStudent.id === s.id ? 'white' : 'var(--color-espresso)',
                }}>
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: activeStudent.id === s.id ? 'rgba(255,255,255,0.2)' : 'var(--color-cocoa)', color: 'white' }}>
                  {s.avatar}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(74,52,42,0.1)' }}>
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'var(--color-cocoa)' }}>{activeStudent.avatar}</span>
              <div>
                <div className="font-bold text-sm">{activeStudent.name}</div>
                <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>
                  <Link href={`/trainer/students/${activeStudent.id}`}
                    className="hover:underline" style={{ color: 'var(--color-camel)' }}>
                    Ver perfil →
                  </Link>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {groups.map(({ date, msgs }) => (
                <div key={date}>
                  <div className="text-center mb-3">
                    <span className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(74,52,42,0.08)', color: 'rgba(74,52,42,0.5)' }}>
                      {fmtDateLabel(date)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {msgs.map(m => {
                      const isTrainer = m.from === 'trainer';
                      return (
                        <div key={m.id} className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-xs lg:max-w-sm">
                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                              style={{
                                background: isTrainer ? 'var(--color-accent)' : 'rgba(255,255,255,0.85)',
                                color: isTrainer ? 'white' : 'var(--color-espresso)',
                                borderRadius: isTrainer ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                boxShadow: '0 2px 8px rgba(74,52,42,0.08)',
                              }}>
                              {m.text}
                            </div>
                            <div className={`text-xs mt-1 ${isTrainer ? 'text-right' : 'text-left'}`}
                              style={{ color: 'rgba(74,52,42,0.35)' }}>
                              {fmtTime(m.time)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(74,52,42,0.1)' }}>
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2">
                <input
                  className="field flex-1"
                  placeholder={`Mensagem para ${activeStudent.name.split(' ')[0]}…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all"
                  style={{ background: input.trim() ? 'var(--color-accent)' : 'var(--color-camel)', opacity: input.trim() ? 1 : 0.5 }}
                  disabled={!input.trim()}>
                  Enviar
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
