import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import Nav from './Nav';

export const Header: React.FC = () => {
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50 py-3 px-4 md:py-4 md:px-6"
        style={{
          background: 'rgba(245,241,234,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: 'var(--header-shadow)',
        }}
      >
        <div className="flex items-center justify-between" style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              aria-hidden
            />
            <span className="text-lg md:text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Bia Personal
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Nav />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop: avatar + sair */}
            {user && (
              <div
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{ background: 'var(--color-khaki)' }}
              >
                <span
                  className="inline-block w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--color-cocoa)' }}
                >
                  {user.name[0]}
                </span>
                <span className="font-medium">{user.name}</span>
              </div>
            )}
            <button
              onClick={() => signout()}
              className="hidden md:block text-xs font-medium px-3 py-1.5 rounded-full border border-transparent hover:border-camel text-[rgba(74,52,42,0.6)] hover:text-espresso"
            >
              Sair
            </button>

            {/* Mobile: hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 w-9 h-9 items-center justify-center rounded-xl transition-all"
              style={{ background: open ? 'var(--color-khaki)' : 'transparent' }}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
            >
              <span
                className="block h-0.5 w-5 rounded-full transition-all"
                style={{
                  background: 'var(--color-espresso)',
                  transform: open ? 'translateY(8px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all"
                style={{
                  background: 'var(--color-espresso)',
                  opacity: open ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all"
                style={{
                  background: 'var(--color-espresso)',
                  transform: open ? 'translateY(-8px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ top: '57px' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(46,29,22,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div
            className="absolute top-0 right-0 w-72 h-full px-4 py-6 overflow-y-auto"
            style={{
              background: 'rgba(245,241,234,0.97)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '-4px 0 24px rgba(20,10,5,0.15)',
            }}
          >
            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 mb-6 px-3 py-4 rounded-2xl"
                style={{ background: 'var(--color-khaki)' }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--color-cocoa)' }}
                >
                  {user.name[0]}
                </span>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--color-espresso)' }}>{user.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(74,52,42,0.5)' }}>Aluna</div>
                </div>
              </div>
            )}

            <Nav vertical onNavigate={() => setOpen(false)} />

            <div style={{ borderTop: '1px solid rgba(74,52,42,0.1)' }} className="mt-4 pt-4">
              <button
                onClick={() => { setOpen(false); signout(); }}
                className="w-full text-left text-sm font-medium px-3 py-2.5 rounded-full transition-all hover:bg-[rgba(178,150,125,0.12)]"
                style={{ color: 'rgba(74,52,42,0.6)' }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

