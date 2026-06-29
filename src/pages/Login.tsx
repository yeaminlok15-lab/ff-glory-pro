import { useState } from "react";
import { login, register } from "../store";

interface Props {
  onLogin: (username: string, ownerMode: boolean) => void;
}

export default function Login({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    setTimeout(() => {
      const result = login(username.trim(), password);
      if (result.success) {
        onLogin(username.trim(), result.isOwner);
      } else {
        setError(result.error || "Invalid credentials");
      }
      setLoading(false);
    }, 400);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!username.trim()) return setError("Username is required");
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return setError("Only letters, numbers, underscore allowed");
    if (username.trim().length < 3) return setError("Username must be at least 3 characters");
    if (password.length < 3) return setError("Password must be at least 3 characters");
    if (password !== confirmPass) return setError("Passwords do not match");
    setLoading(true);
    setTimeout(() => {
      const result = register(username.trim(), password);
      if (result.success) {
        setSuccess("Account created! You can now sign in.");
        setTab("login");
        setPassword(""); setConfirmPass("");
      } else {
        setError(result.error || "Registration failed");
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div className="ng-card" style={{ padding: "32px 28px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16, margin: "0 auto",
                background: "linear-gradient(135deg, #D4C4A8, #C9B896)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden"
              }}>
                <img src="/lion.jpg" alt="AGGlory" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            <h2 className="heading" style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Welcome Back</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sign in to <span style={{ color: "var(--gold3)", fontWeight: 600 }}>AGGlory</span> panel</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 5, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24, gap: 4 }}>
            {(["login", "signup"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif",
                  background: tab === t ? "linear-gradient(135deg, #F5E6D3, #D4C4A8)" : "transparent",
                  color: tab === t ? "#0E0E0E" : "var(--text-muted)",
                  transition: "all 0.2s"
                }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="ng-input" placeholder="Enter your username" value={username}
                  onChange={e => setUsername(e.target.value)} required autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="ng-input" type="password" placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <button type="submit" className="ng-btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}>✓ Open Registration</p>
                <p style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", marginTop: 2 }}>No invitation code required</p>
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="ng-input" placeholder="Choose a username" value={username}
                  onChange={e => setUsername(e.target.value)} required minLength={3} />
                <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>Letters, numbers, underscore only</span>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="ng-input" type="password" placeholder="Create a password" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="ng-input" type="password" placeholder="Confirm your password" value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)} required />
              </div>
              <button type="submit" className="ng-btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "var(--red)", fontSize: 13, textAlign: "center" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, color: "var(--green)", fontSize: 13, textAlign: "center" }}>
              {success}
            </div>
          )}

          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-subtle)", marginBottom: 12 }}>Need help? Contact Admin</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="https://wa.me/6282326562316" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", color: "#25D366", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
              WhatsApp
            </a>
            <a href="https://t.me/agajayofficial" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: "rgba(0,136,204,0.08)", border: "1px solid rgba(0,136,204,0.2)", color: "#0088cc", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
