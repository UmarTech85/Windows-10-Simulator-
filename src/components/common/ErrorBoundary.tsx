import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCw, AlertTriangle, Monitor } from 'lucide-react';

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
    console.error('Windows 10 Simulator Error Boundary Caught:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('win10_virtual_fs_v1');
      localStorage.removeItem('win10_edge_bookmarks');
      localStorage.removeItem('win10_edge_history');
      localStorage.removeItem('win10_edge_downloads');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleSoftRecover = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#0078d7] text-white flex flex-col items-center justify-center p-6 font-sans select-none">
          <div className="max-w-xl w-full bg-black/40 backdrop-blur-xl border border-white/20 p-8 rounded-lg shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 text-cyan-300">
              <Monitor size={36} />
            </div>

            <h1 className="text-2xl font-semibold mb-2">Windows 10 Simulator Recovery</h1>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Windows encountered an unexpected condition and paused to protect system state. You can restore your desktop session immediately with one click.
            </p>

            {this.state.error && (
              <div className="w-full bg-black/50 p-3 rounded text-left text-xs font-mono text-amber-300/90 mb-6 overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={this.handleSoftRecover}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCw size={14} />
                <span>Resume Windows 10 Session</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Reset System & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
