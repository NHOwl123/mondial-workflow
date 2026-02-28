// ─── LoginPage.jsx ────────────────────────────────────────────────────────────
import { useState } from "react";
import { login } from "./auth";

const TEAL      = "#1a7f8e";
const TEAL_DARK = "#145f6b";

export default function LoginPage({ users, onLogin }) {
  const [mode, setMode]         = useState("login");   // "login" | "forgot"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    const result = await login(email, password, users);
    setLoading(false);
    if (result.ok) {
      onLogin(result.user);
    } else {
      setError(result.error);
    }
  }

  const inp = {
    width: "100%", boxSizing: "border-box",
    border: "1px solid #ced4da", borderRadius: 8,
    padding: "11px 14px", fontSize: 14,
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f5460 0%, #1a7f8e 50%, #145f6b 100%)",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      {/* Card */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "40px 44px",
        width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: TEAL,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14, boxShadow: `0 4px 14px ${TEAL}55`,
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 26 }}>M</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1a2535", letterSpacing: -0.5 }}>Mondial</div>
          <div style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>Project & Finance Platform</div>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#495057", display: "block", marginBottom: 6 }}>Email address</label>
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@mondialsoftware.com" autoComplete="email" autoFocus
                  style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#495057", display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter your password" autoComplete="current-password"
                    style={{ ...inp, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6c757d", padding: 0 }}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  background: loading ? "#adb5bd" : TEAL, color: "#fff",
                  border: "none", borderRadius: 8, padding: "12px",
                  fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 4, transition: "background 0.15s",
                  boxShadow: loading ? "none" : `0 4px 12px ${TEAL}55`,
                }}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Forgot password */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button onClick={() => { setMode("forgot"); setError(""); }}
                style={{ background: "none", border: "none", color: TEAL, fontSize: 13, cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>
                Forgot your password?
              </button>
            </div>

            {/* Google Auth placeholder */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e9ecef" }}>
              <button disabled
                style={{
                  width: "100%", background: "#f8f9fa", color: "#adb5bd",
                  border: "1px solid #dee2e6", borderRadius: 8, padding: "11px",
                  fontSize: 13, fontWeight: 600, cursor: "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#adb5bd" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                </svg>
                Sign in with Google (coming soon)
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === "forgot" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
            <h3 style={{ margin: "0 0 12px", fontSize: 17, color: "#1a2535", fontWeight: 700 }}>Reset your password</h3>
            <p style={{ fontSize: 14, color: "#6c757d", lineHeight: 1.6, margin: "0 0 24px" }}>
              Password resets are managed by your administrator.<br />
              Please contact:<br />
              <a href="mailto:mark.richardson@mondialsoftware.com"
                style={{ color: TEAL, fontWeight: 600 }}>
                mark.richardson@mondialsoftware.com
              </a>
            </p>
            <button onClick={() => setMode("login")}
              style={{
                background: TEAL, color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              ← Back to sign in
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 20, fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        © {new Date().getFullYear()} Mondial Software. All rights reserved.
      </div>
    </div>
  );
}
