import React, { Suspense, lazy, Component } from "react";
import Hero3D from "./Hero3D";

const Spline = lazy(() => import("@splinetool/react-spline"));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn(
      "Spline 3D Scene Error, falling back to Three.js Hero3D:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return <Hero3D />;
    }
    return this.props.children;
  }
}

export default function SplineScene({
  scene = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  className = "w-full h-full",
}) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#FFA916]/30 border-t-[#FFA916] animate-spin" />
            <span className="text-xs font-mono text-slate-400 animate-pulse">
              Loading 3D Scene...
            </span>
          </div>
        }
      >
        <div className="w-full h-full relative overflow-hidden rounded-2xl">
          <Spline scene={scene} className={className} />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
