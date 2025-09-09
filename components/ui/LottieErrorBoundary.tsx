'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  theme?: 'light' | 'dark';
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class LottieErrorBoundary extends Component<Props, State> {
  private animationTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Lottie Error Boundary caught an error:', error, errorInfo);
    
    // Clear any animation timeouts to prevent infinite loops
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  componentDidMount() {
    // Set a timeout to catch infinite loops
    this.animationTimeout = setTimeout(() => {
      if (!this.state.hasError) {
        console.warn('Animation timeout reached, showing fallback');
        this.setState({ hasError: true });
      }
    }, 10000); // 10 second timeout
  }

  componentWillUnmount() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div />;
    }

    return this.props.children;
  }
}