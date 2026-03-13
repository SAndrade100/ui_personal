import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const links = [
  { href: '/student',     label: 'Home',       exact: true  },
  { href: '/trainings',  label: 'Treinos',    exact: false },
  { href: '/schedule',   label: 'Agenda',     exact: true  },
  { href: '/nutrition',  label: 'Nutrição',   exact: false },
  { href: '/progress',   label: 'Progresso',  exact: true  },
  { href: '/assessment', label: 'Avaliação',  exact: true  },
  { href: '/chat',       label: 'Chat',       exact: true  },
  { href: '/anamnesis',  label: 'Anamnese',   exact: true  },
  { href: '/profile',    label: 'Perfil',     exact: true  },
];

type Props = { vertical?: boolean; onNavigate?: () => void };

export const Nav: React.FC<Props> = ({ vertical = false, onNavigate }) => {
  const { pathname } = useRouter();

  return (
    <nav className={vertical ? 'flex flex-col gap-1' : 'flex gap-1'}>
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`font-medium px-3 rounded-full transition-all ${
              vertical ? 'text-base py-2.5' : 'text-sm py-1.5'
            } ${
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

