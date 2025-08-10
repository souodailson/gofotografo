// src/components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    console.error("UI crash capturado:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-6 text-sm">Algo deu errado ao renderizar este conteúdo.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
