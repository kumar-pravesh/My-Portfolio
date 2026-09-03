import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          fontSize: "7rem",
          fontWeight: 800,
          lineHeight: 1,
          background: "linear-gradient(135deg, var(--primary), #22d3ee)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem",
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          maxWidth: 420,
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}
      >
        The page you're looking for doesn't exist or has been moved. Check the
        URL or head back to the dashboard.
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/admin")}>
          <Home size={16} /> Dashboard
        </button>
      </div>
    </div>
  );
}
