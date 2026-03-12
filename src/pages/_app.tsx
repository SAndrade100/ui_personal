import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  // start MSW in dev only
  if (process.env.NODE_ENV === 'development') {
    import('../mocks/browser').then(({ worker }) => {
      worker.start();
    });
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
