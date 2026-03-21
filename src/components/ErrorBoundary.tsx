import React from 'react';

type Props = { children: React.ReactNode };

export default class ErrorBoundary extends React.Component<Props, { error: Error | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // Could send to logging service
    // console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-linen)' }}>
          <div className="rounded-card p-6 text-center" style={{ background: 'white', color: 'var(--color-espresso)' }}>
            <h2 className="text-xl font-bold mb-2">Ocorreu um erro</h2>
            <p className="text-sm mb-4">Uma exceção ocorreu no cliente. Abra o console para mais detalhes.</p>
            <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{String(this.state.error?.message)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
