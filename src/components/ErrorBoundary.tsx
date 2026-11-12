import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-center">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Terjadi Kendala Tampilan
            </h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Aplikasi mengalami kesalahan sementara saat memuat data. Silakan tekan tombol di bawah untuk memuat ulang aplikasi secara normal.
            </p>
            {this.state.error && (
              <div className="mb-5 p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600 text-left overflow-x-auto max-h-28 border border-slate-200">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Aplikasi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
