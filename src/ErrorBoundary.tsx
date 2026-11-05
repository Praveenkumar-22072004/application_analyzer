import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#f87171' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: '#22d3ee',
              color: '#020617',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 16,
            }}
          >
            Reload application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
