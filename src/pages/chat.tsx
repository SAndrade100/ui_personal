import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { apiFetch } from '../lib/api';
import { useRequireAuth } from '../lib/auth';
import { useSocket } from '../lib/socket';

type Msg = { id: string; from: 'trainer' | 'student'; text: string; time: string };

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Chat() {
  useRequireAuth('student');
  const [msgs, setMsgs]   = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef         = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((msg: Msg) => {
    setMsgs((prev) => {
      // Avoid duplicates (optimistic + server)
      if (prev.some((m) => m.id === msg.id)) return prev;
      // Replace optimistic message if text matches
      const optimisticIdx = prev.findIndex((m) => String(m.id).startsWith('local-') && m.text === msg.text);
      if (optimisticIdx >= 0) {
        const next = [...prev];
        next[optimisticIdx] = msg;
        return next;
      }
      return [...prev, msg];
    });
  }, []);

  const { sendMessage } = useSocket(handleNewMessage);

  useEffect(() => {
    apiFetch<Msg[]>('/api/chat')
      .then((d) => setMsgs(d))
      .catch(() => null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const newMsg: Msg = {
      id:   `local-${Date.now()}`,
      from: 'student',
      text,
      time: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, newMsg]);
    setDraft('');

    sendMessage({ text });
  };

  // Group by day
  const groups: { day: string; messages: Msg[] }[] = [];
  msgs.forEach((m) => {
    const day = m.time.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.messages.push(m);
    else groups.push({ day, messages: [m] });
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-camel), var(--color-accent))' }}
          >
            A
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
              MENSAGENS
            </p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Ana Paula Souza
            </h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Personal Trainer • Online</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ maxWidth: '720px', width: '100%', margin: '0 auto' }}>
        {groups.map((g) => (
          <div key={g.day}>
            {/* Day label */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(74,52,42,0.1)' }} />
              <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                style={{ background: 'var(--color-khaki)', color: 'rgba(74,52,42,0.5)' }}>
                {fmtDay(g.day)}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(74,52,42,0.1)' }} />
            </div>

            {g.messages.map((m) => {
              const isMe = m.from === 'student';
              return (
                <div key={m.id} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {/* Trainer avatar */}
                  {!isMe && (
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mr-2 mt-auto"
                      style={{ background: 'linear-gradient(135deg, var(--color-camel), var(--color-cocoa))' }}
                    >
                      A
                    </div>
                  )}
                  <div style={{ maxWidth: '72%' }}>
                    <div
                      className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                      style={{
                        background: isMe
                          ? 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))'
                          : 'var(--color-khaki)',
                        color:      isMe ? 'white' : 'var(--color-espresso)',
                        borderBottomRightRadius: isMe ? '4px' : undefined,
                        borderBottomLeftRadius:  !isMe ? '4px' : undefined,
                        boxShadow: 'var(--card-shadow)',
                      }}
                    >
                      {m.text}
                    </div>
                    <div className={`text-[10px] mt-1 ${isMe ? 'text-right' : 'text-left'}`}
                      style={{ color: 'rgba(74,52,42,0.35)' }}>
                      {fmtTime(m.time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="sticky bottom-0 px-4 py-3"
        style={{
          background: 'rgba(245,241,234,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(74,52,42,0.08)',
        }}
      >
        <div className="flex items-center gap-3" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Mensagem…"
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
            style={{
              background: 'var(--color-khaki)',
              color: 'var(--color-espresso)',
              border: '1.5px solid transparent',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-camel)')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = 'transparent')}
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--color-accent)' }}
            aria-label="Enviar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
