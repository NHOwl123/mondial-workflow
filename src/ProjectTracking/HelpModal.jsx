import { useEffect } from "react";

// ── ? trigger button ─────────────────────────────────────────────────────────
export function HelpButton({ onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      title="Help"
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: "1.5px solid #94a3b8",
        background: "transparent",
        color: "#64748b",
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "border-color 0.15s, color 0.15s",
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#6366f1";
        e.currentTarget.style.color = "#6366f1";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#94a3b8";
        e.currentTarget.style.color = "#64748b";
      }}
    >
      ?
    </button>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export default function HelpModal({ content, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!content) return null;

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Panel — stop clicks bubbling to backdrop */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#eef2ff",
                color: "#6366f1",
                fontSize: 14,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ?
            </span>
            <span style={{ fontWeight: 600, fontSize: 16, color: "#1e293b" }}>
              {content.title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: 20,
              lineHeight: 1,
              padding: "0 2px",
              flexShrink: 0,
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {content.sections.map((s, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#6366f1",
                  marginBottom: 6,
                }}
              >
                {s.heading}
              </div>
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}