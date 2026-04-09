import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import Nav from './Nav';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { user, signout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignout = () => {
    signout(() => router.push('/login'));
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 py-3 px-4 md:py-4 md:px-6',
          'bg-background/90 backdrop-blur-md border-b border-border/50',
          'shadow-[var(--header-shadow)]'
        )}
      >
        <div className="flex items-center justify-between max-w-[1000px] mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" aria-hidden />
            <span className="text-lg md:text-xl font-bold font-heading tracking-tight">
              Bia Personal
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Nav />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-secondary">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-secondary-foreground">{user.name}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignout}
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
            >
              Sair
            </Button>

            {/* Hamburguer mobile */}
            <button
              className={cn(
                'md:hidden flex flex-col gap-1.5 w-9 h-9 items-center justify-center rounded-xl transition-all',
                open ? 'bg-secondary' : 'bg-transparent'
              )}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
            >
              <span className="block h-0.5 w-5 rounded-full bg-foreground transition-all"
                style={{ transform: open ? 'translateY(8px) rotate(45deg)' : 'none' }} />
              <span className="block h-0.5 w-5 rounded-full bg-foreground transition-all"
                style={{ opacity: open ? 0 : 1 }} />
              <span className="block h-0.5 w-5 rounded-full bg-foreground transition-all"
                style={{ transform: open ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" style={{ top: '57px' }}>
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 right-0 w-72 h-full px-4 py-6 overflow-y-auto bg-background/95 backdrop-blur-xl shadow-xl">
            {user && (
              <div className="flex items-center gap-3 mb-5 px-3 py-3 rounded-xl bg-secondary">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.role === 'trainer' ? 'Trainer' : 'Aluna'}
                  </div>
                </div>
              </div>
            )}

            <Nav vertical onNavigate={() => setOpen(false)} />

            <Separator className="my-4" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setOpen(false); handleSignout(); }}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              Sair
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
