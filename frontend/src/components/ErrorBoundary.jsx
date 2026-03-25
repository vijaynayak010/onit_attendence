import React from 'react';
import { LayoutDashboard, RefreshCcw } from 'lucide-react';
import Card from './Card';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center py-12">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCcw size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <div className="space-y-3">
              <Button onClick={this.handleReload} className="w-full" icon={RefreshCcw}>
                Reload Application
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full" 
                icon={LayoutDashboard}
              >
                Back to Dashboard
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left p-4 bg-gray-100 rounded-xl overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600">{this.state.error?.toString()}</p>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
