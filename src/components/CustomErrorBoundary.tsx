import React, { Component, ErrorInfo, ReactNode } from 'react';
import { globalErrorHandler } from '../utils/errorHandler';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class CustomErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  // Use static method to update state when an error occurs
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error };
  }

  // Use componentDidCatch to log the error information
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Pass the error and stack trace (from errorInfo) to our handler
    globalErrorHandler(error, errorInfo.componentStack || 'No component stack available');
  }

  // Function to reset the error state (passed to fallback)
  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    // If an error occurred, render the fallback UI
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    // Otherwise, render the children components
    return this.props.children;
  }
}

export default CustomErrorBoundary; 