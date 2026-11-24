import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Alvio ErrorBoundary caught an error:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: '' });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="min-h-[60vh] bg-[#050812] text-slate-200 flex flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-slate-400 max-w-md text-sm">
            This view ran into an unexpected error. Your saved learning progress is safe.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Reload page
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Go to Dashboard
            </a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
