import React from 'react';
import { useAuth } from '../lib/auth';
import Nav from './Nav';

export const Header: React.FC = () => {
  const { user, signout } = useAuth();
  return (
    <header
      className="sticky top-0 z-50 py-4 px-6"
      style={{
        background: 'rgba(245,241,234,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: 'var(--header-shadow)',
      }}
    >
      <div className="flex items-center justify-between" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              aria-hidden
            />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Bia Personal
            </span>
          </div>
          <Nav />
        </div>

        {/* User area */}
        <div className="flex items-center gap-3">
          {user && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
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
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-transparent hover:border-camel text-[rgba(74,52,42,0.6)] hover:text-espresso"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
