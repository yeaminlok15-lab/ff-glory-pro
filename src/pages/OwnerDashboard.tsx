import { useState, useEffect, useRef } from "react";
import { getAllUsers, addCredits, getSettings, saveSettings, User, Settings } from "../store";

interface Props {
  onLogout: () => void;
}

type Tab = "users" | "payment" | "announce";

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

export default function OwnerDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [modal, setModal] = useState<{ user: User } | null>(null);
  const [basicAdd, setBasicAdd] = useState("");
  const [premiumAdd, setPremiumAdd] = useState("");
  const [desc, setDesc] = useState("Admin credit top-up");
  const [search, setSearch] = useState("");
  const [newUpi, setNewUpi] = useState(settings.upiId);
  const [newAnnounce, setNewAnnounce] = useState(settings.announcementText);
  const [savingSettings, setSavingSettings] = useState(false);
  const qrFileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function refresh() { setUsers(getAllUsers()); }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  function openModal(user: User) {
    setModal({ user });
    setBasicAdd(""); setPremiumAdd(""); setDesc("Admin credit top-up");
  }

  function handleAddCredits() {
    if (!modal) return;
    const basic = parseInt(basicAdd) || 0;
    const premium = parseInt(premiumAdd) || 0;
    if (basic === 0 && premium === 0) return showToast("Enter at least one credit amount", "error");
    const ok = addCredits(modal.user.username, basic, premium, desc || "Admin credit top-up");
    if (ok) { showToast(`Credits added to ${modal.user.username}!`); setModal(null); refresh(); }
    else showToast("Failed to add credits", "error");
  }

  function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const updated = { ...settings, qrImageBase64: base64 };
      setSettings(updated); saveSettings(updated); showToast("QR code updated!");
    };
    reader.readAsDataURL(file);
  }

  function handleSavePayment() {
    setSavingSettings(true);
    setTimeout(() => {
      const updated = { ...settings, upiId: newUpi };
      setSettings(updated); saveSettings(updated); setSavingSettings(false); showToast("Payment settings saved!");
    }, 400);
  }

  function handleSaveAnnounce() {
    const updated = { ...settings, announcementText: newAnnounce };
    setSettings(updated); saveSettings(updated); showToast("Announcement updated!");
  }

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  const totalBasic = users.reduce((s, u) => s + u.basicCredits, 0);
  const totalPremium = users.reduce((s, u) => s + u.premiumCredits, 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Navbar */}
      <nav className="ng-nav">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src="/lion.jpg" alt="AGGlory" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="heading" style={{ fontSize: 17, fontWeight: 700 }}>AGGlory</span>
            <span className="badge badge-gold" style={{ fontSize: 10 }}>OWNER</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Ajay_Kumar</span>
            <button className="ng-btn-outline" onClick={onLogout} style={{ fontSize: 12, padding: "6px 14px" }}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Stats Bar */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Users:</span>
            <span className="badge badge-purple">{users.length}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Basic:</span>
            <span className="badge badge-blue">{totalBasic}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Premium:</span>
            <span className="badge badge-amber">{totalPremium}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px", maxWidth: 900, margin: "0 auto", width: "100%", paddingBottom: 72 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 5, border: "1px solid var(--border)" }}>
          {([
            { id: "users", label: "👥 Users & Credits" },
            { id: "payment", label: "💳 Payment Settings" },
            { id: "announce", label: "📢 Announcement" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "9px 6px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
                background: tab === t.id ? "linear-gradient(135deg, #F5E6D3, #D4C4A8)" : "transparent",
                color: tab === t.id ? "#0E0E0E" : "var(--text-muted)",
                transition: "all 0.2s", whiteSpace: "nowrap"
              }}>{t.label}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="ng-input" placeholder="🔍  Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            {filteredUsers.length === 0 ? (
              <div className="ng-card" style={{ padding: 32, textAlign: "center" }}>
                <p style={{ color: "var(--text-subtle)", fontSize: 13 }}>{users.length === 0 ? "No users registered yet" : "No users found"}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredUsers.map(u => (
                  <div key={u.username} className="ng-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(212,196,168,0.3), rgba(212,196,168,0.1))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--gold3)" }}>{u.username[0].toUpperCase()}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{u.username}</p>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                          <span className="badge badge-blue" style={{ fontSize: 10 }}>🔵 {u.basicCredits} basic</span>
                          <span className="badge badge-amber" style={{ fontSize: 10 }}>⭐ {u.premiumCredits} premium</span>
                          <span className="badge badge-purple" style={{ fontSize: 10 }}>{u.transactions.length} txns</span>
                        </div>
                      </div>
                    </div>
                    <button className="ng-btn-success" onClick={() => openModal(u)} style={{ flexShrink: 0 }}>+ Add Credits</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT TAB */}
        {tab === "payment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="ng-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>QR Code</h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                {settings.qrImageBase64 ? (
                  <img src={settings.qrImageBase64} alt="QR" style={{ width: 200, height: 200, borderRadius: 12, border: "2px solid var(--border)", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 200, height: 200, borderRadius: 12, border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>No QR uploaded</p>
                  </div>
                )}
                <input ref={qrFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQrUpload} />
                <button className="ng-btn-outline" onClick={() => qrFileRef.current?.click()}>
                  {settings.qrImageBase64 ? "Change QR Image" : "Upload QR Image"}
                </button>
                {settings.qrImageBase64 && (
                  <button className="ng-btn-danger" onClick={() => {
                    const updated = { ...settings, qrImageBase64: "" };
                    setSettings(updated); saveSettings(updated); showToast("QR removed");
                  }}>Remove QR</button>
                )}
              </div>
            </div>
            <div className="ng-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>UPI ID</h3>
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="ng-input" placeholder="yourname@upi" value={newUpi} onChange={e => setNewUpi(e.target.value)} style={{ flex: 1 }} />
                  <button className="ng-btn-primary" onClick={handleSavePayment} disabled={savingSettings} style={{ flexShrink: 0 }}>
                    {savingSettings ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(212,196,168,0.08)", borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Current: <strong style={{ color: "var(--gold3)" }}>{settings.upiId}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENT TAB */}
        {tab === "announce" && (
          <div className="ng-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Announcement Banner</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>This message appears on all user dashboards</p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Message Text</label>
              <textarea className="ng-input" rows={4} placeholder="Enter announcement text..." value={newAnnounce}
                onChange={e => setNewAnnounce(e.target.value)} style={{ resize: "vertical", minHeight: 100 }} />
            </div>
            {newAnnounce && (
              <div style={{ padding: "12px 16px", background: "rgba(212,196,168,0.08)", border: "1px solid rgba(212,196,168,0.2)", borderRadius: 10, marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Preview:</p>
                <p style={{ fontSize: 13, color: "var(--gold3)" }}>📢 {newAnnounce}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ng-btn-primary" onClick={handleSaveAnnounce} style={{ flex: 1 }}>Save Announcement</button>
              {settings.announcementText && (
                <button className="ng-btn-danger" onClick={() => {
                  setNewAnnounce("");
                  const updated = { ...settings, announcementText: "" };
                  setSettings(updated); saveSettings(updated); showToast("Announcement cleared");
                }}>Clear</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Credits Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add Credits</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: "12px 16px", background: "rgba(212,196,168,0.08)", border: "1px solid rgba(212,196,168,0.15)", borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gold3)" }}>@{modal.user.username}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <span className="badge badge-blue" style={{ fontSize: 10 }}>Basic: {modal.user.basicCredits}</span>
                <span className="badge badge-amber" style={{ fontSize: 10 }}>Premium: {modal.user.premiumCredits}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">🔵 Basic Credits (negative to remove)</label>
                <input className="ng-input" type="number" placeholder="e.g. 100" value={basicAdd} onChange={e => setBasicAdd(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">⭐ Premium Credits (negative to remove)</label>
                <input className="ng-input" type="number" placeholder="e.g. 50" value={premiumAdd} onChange={e => setPremiumAdd(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="ng-input" placeholder="Reason / description" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="ng-btn-outline" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="ng-btn-primary" onClick={handleAddCredits} style={{ flex: 2 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "rgba(5,5,8,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "6px 8px" }}>
        {([
          { id: "users", label: "Users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          { id: "payment", label: "Payment", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
          { id: "announce", label: "Announce", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
        ] as const).map(item => (
          <button key={item.id} className={`mob-tab ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
