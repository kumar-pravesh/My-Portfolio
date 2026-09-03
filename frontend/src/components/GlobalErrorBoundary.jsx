import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#122240] text-slate-100 flex flex-col items-center justify-center px-[5%] text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-6 text-3xl font-bold">
            !
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Please try refreshing the page
            or navigating back home.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#f5a623] text-[#122240] font-bold text-sm uppercase tracking-wider shadow-md hover:bg-white transition-all"
            >
              Refresh Page
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-2.5 rounded-full bg-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
