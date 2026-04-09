import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      <div className="hidden md:flex flex-col justify-between w-5/12 p-12 bg-hero">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-white text-xl font-bold font-heading">Bia Personal</span>
          </div>
          <div className="text-white/50 text-xs mt-1 ml-5">Training Studio</div>
        </div>

        <div>
          <blockquote className="text-2xl leading-snug text-white/90 italic font-heading">
            &ldquo;Cada treino é um passo mais perto de quem você quer ser.&rdquo;
          </blockquote>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Full Body', 'HIIT', 'Funcional', 'Força'].map((t) => (
              <Badge key={t} variant="outline" className="border-white/20 text-white/70 bg-white/10">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-white/30 text-xs">© 2026 Bia Personal</div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-10 justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xl font-bold font-heading">Bia Personal</span>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-4xl">Entrar</CardTitle>
              <CardDescription className="text-base">Bem-vinda de volta!</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando…' : 'Entrar'}
                </Button>

                {error && (
                  <p className="text-center text-xs text-destructive">{error}</p>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  Trainer: <span className="text-primary">ana@trainer.com</span> / trainer123<br />
                  Aluno: <span className="text-primary">bia@example.com</span> / student123
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

