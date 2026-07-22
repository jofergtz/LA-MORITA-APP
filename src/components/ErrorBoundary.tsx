import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
    } catch (e) {
      console.error('Error resetting cache:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center border border-slate-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Ocurrió un inconveniente al cargar La Morita
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Se detectó un cambio en la versión de la aplicación o en la caché del navegador.
            </p>
            <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-500 text-left font-mono mb-6 overflow-x-auto max-h-24">
              {this.state.error?.toString() || 'Error desconocido'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md transition-all text-sm"
            >
              Reiniciar app y borrar caché
            </button>
          </div>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}
