import { Component } from 'react';
import type { ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Receives `reset` so the fallback can attach it to a retry action. */
  fallback: (reset: () => void) => ReactNode;
  /** Changing this value clears a failure automatically, e.g. when a dialog reopens. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/** Catches render errors in a subtree so a broken panel cannot blank the whole dialog. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  reset = () => {
    this.setState({ failed: false });
  };

  render() {
    if (this.state.failed) return this.props.fallback(this.reset);
    return this.props.children;
  }
}
