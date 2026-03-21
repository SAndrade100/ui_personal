import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { Button } from '../components/Button';

export default function Login() {
  const { signin, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(user.role === 'trainer' ? '/trainer' : '/student');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    signin(email, password, (err) => {
      setLoading(false);
      if (err) {
        setError('Email ou senha incorretos.');
        return;
      }
    });
  };

  return (
    <main className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div
        className="hidden md:flex flex-col justify-between w-5/12 p-12"
        style={{ background: 'linear-gradient(150deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Bia Personal</span>
          </div>
          <div className="text-white/50 text-xs mt-1 ml-5">Training Studio</div>
        </div>

        <div>
          <blockquote
            className="text-2xl leading-snug text-white/90 italic"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            &ldquo;Cada treino é um passo mais perto de quem você quer ser.&rdquo;
          </blockquote>
          <div className="mt-4 flex gap-3">
            {['Full Body', 'HIIT', 'Funcional', 'Força'].map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full text-white/70"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >{t}</span>
            ))}
          </div>
        </div>

        <div className="text-white/30 text-xs">© 2026 Bia Personal</div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--color-linen)' }}
      >
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-10 justify-center">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Bia Personal</span>
          </div>

          <h1 className="text-4xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Entrar</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(74,52,42,0.5)' }}>Bem-vinda de volta!</p>

          <label className="block mb-4">
            <span className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: 'rgba(74,52,42,0.6)' }}>EMAIL</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="field"
              aria-label="Email"
            />
          </label>

          <label className="block mb-6">
            <span className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: 'rgba(74,52,42,0.6)' }}>SENHA</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field"
              aria-label="Senha"
            />
          </label>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>

          {error && (
            <p className="text-center text-xs mt-3" style={{ color: '#c0392b' }}>{error}</p>
          )}

          <p className="text-center text-xs mt-4" style={{ color: 'rgba(74,52,42,0.4)' }}>
            Trainer: <span style={{ color: 'var(--color-camel)' }}>ana@trainer.com</span> / trainer123<br />
            Aluno: <span style={{ color: 'var(--color-camel)' }}>bia@example.com</span> / student123
          </p>
        </form>
      </div>
    </main>
  );
}
