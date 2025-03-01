import * as React from 'react';
import { View, Text, Pressable } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Custom error boundary component to catch and handle errors gracefully
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Filter out the color scheme error
      if (this.state.error && 
          this.state.error.message && 
          this.state.error.message.includes('Cannot manually set color scheme')) {
        // Just render children if it's the color scheme error
        return this.props.children;
      }
      
      // Fallback UI for other errors
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#e11d48' }}>
            Something went wrong
          </Text>
          <Text style={{ marginBottom: 20, textAlign: 'center', color: '#64748b' }}>
            {this.state.error?.message || 'An unknown error occurred'}
          </Text>
          <Pressable
            style={{ 
              backgroundColor: '#3b82f6', 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              borderRadius: 4 
            }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
