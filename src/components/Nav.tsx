import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useAuth } from '../lib/auth';
import { cn } from '@/lib/utils';

const studentLinks = [
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

const trainerLinks = [
  { href: '/trainer',          label: 'Dashboard', exact: true  },
  { href: '/trainer/students', label: 'Alunos',    exact: false },
  { href: '/trainer/trainings',label: 'Treinos',   exact: false },
  { href: '/trainer/sheets',   label: 'Fichas',    exact: false },
  { href: '/trainer/schedule', label: 'Agenda',    exact: true  },
  { href: '/trainer/chat',     label: 'Chat',      exact: true  },
];

type Props = { vertical?: boolean; onNavigate?: () => void };

export const Nav: React.FC<Props> = ({ vertical = false, onNavigate }) => {
  const { pathname } = useRouter();
  const { user } = useAuth();
  const links = user?.role === 'trainer' ? trainerLinks : studentLinks;

  return (
    <nav className={vertical ? 'flex flex-col gap-1' : 'flex gap-1'}>
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'font-medium px-3 rounded-full transition-all duration-150',
              vertical ? 'text-base py-2.5' : 'text-sm py-1.5',
              active
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-foreground/70 hover:text-foreground hover:bg-primary/10'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Nav;


