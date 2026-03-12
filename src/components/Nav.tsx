import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const links = [
  { href: '/student', label: 'Home', exact: true },
  { href: '/trainings', label: 'Treinos', exact: false },
  { href: '/schedule', label: 'Agenda', exact: true },
];

export const Nav: React.FC = () => {
  const { pathname } = useRouter();

  return (
    <nav className="flex gap-1">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
              active
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-espresso hover:bg-[rgba(178,150,125,0.12)]'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Nav;
