import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">Oops! Algo deu errado.</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Nossa equipe foi notificada sobre o problema. Por favor, tente recarregar a página. Se o erro persistir, entre em contato com o suporte.
            </p>
            <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
            
            {import.meta.env.DEV && (
              <details className="mt-8 p-4 bg-muted rounded-lg text-left text-sm overflow-auto">
                <summary className="cursor-pointer font-semibold">Detalhes do Erro (Desenvolvimento)</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;