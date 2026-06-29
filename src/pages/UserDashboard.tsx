import { useState, useEffect } from "react";
import { getUser, getSettings, addCredits, User } from "../store";

interface Props {
  username: string;
  onLogout: () => void;
}

type Tab = "dashboard" | "transactions" | "payment" | "account";

interface GuildData {
  GuildName?: string;
  GuildId?: number;
  GuildLevel?: number;
  GuildRegion?: string;
  GuildSlogan?: string;
  CurrentMembers?: number;
  MaxMembers?: number;
  FrameName?: string;
  AutoApprovalStatus?: string;
  MinBrRank?: string;
  MinCsRank?: string;
  MinLevelReq?: number;
  TotalActivityPoints?: number;
  WeeklyActivityPoints?: number;
  AvatarName?: string;
  GuildLeader?: {
    Name?: string;
    Uid?: string;
    Level?: number;
    BrPoints?: number;
    BrRank?: string;
    CsRank?: string;
    CsStars?: number;
    Likes?: number;
  };
  TagsDisplay?: {
    Activity?: string;
    PlayStyle?: string;
    SocialStyle?: string;
    Type?: string;
  };
}

const REGIONS = [
  { code: "IND", label: "🇮🇳 India" },
  { code: "BD", label: "🇧🇩 Bangladesh" },
  { code: "SG", label: "🇸🇬 Singapore" },
  { code: "MENA", label: "🌍 Middle East" },
  { code: "US", label: "🇺🇸 North America" },
  { code: "SAC", label: "🌎 South America" },
  { code: "EU", label: "🇪🇺 Europe" },
  { code: "RU", label: "🇷🇺 Russia" },
  { code: "ID", label: "🇮🇩 Indonesia" },
  { code: "TH", label: "🇹🇭 Thailand" },
  { code: "VN", label: "🇻🇳 Vietnam" },
  { code: "TW", label: "🇹🇼 Taiwan" },
  { code: "MY", label: "🇲🇾 Malaysia" },
  { code: "PK", label: "🇵🇰 Pakistan" },
  { code: "BR", label: "🇧🇷 Brazil" },
];

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default function UserDashboard({ username, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const settings = getSettings();

  // Guild state
  const [guildId, setGuildId] = useState("");
  const [region, setRegion] = useState("IND");
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [guildLoading, setGuildLoading] = useState(false);
  const [guildError, setGuildError] = useState("");
  const [gloryStarted, setGloryStarted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function refresh() {
    setUser(getUser(username));
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [username]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchGuild() {
    if (!guildId.trim()) {
      setGuildError("Guild ID enter karo");
      return;
    }
    setGuildLoading(true);
    setGuildError("");
    setGuildData(null);
    setGloryStarted(false);
    try {
      const url = `/api/guild?guild_id=${encodeURIComponent(guildId.trim())}&region=${encodeURIComponent(region)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || json.status === "error") {
        throw new Error(json.message || `Server error ${res.status}`);
      }
      setGuildData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Guild info fetch nahi ho saka";
      setGuildError(msg);
    } finally {
      setGuildLoading(false);
    }
  }

  function handleStartGlory() {
    if (!user || !guildData) return;
    const totalCredits = user.basicCredits + user.premiumCredits;
    if (totalCredits < 1) {
      showToast("Insufficient credits", "error");
      return;
    }
    const useBasic = user.basicCredits >= 1;
    addCredits(
      username,
      useBasic ? -1 : 0,
      useBasic ? 0 : -1,
      `Glory started for guild: ${guildData.GuildName || guildId}`
    );
    setGloryStarted(true);
    showToast("Glory started! ⚡");
    refresh();
  }

  const totalCredits = (user?.basicCredits ?? 0) + (user?.premiumCredits ?? 0);
  const hasCredits = totalCredits >= 1;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Navbar */}
      <nav className="ng-nav">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src="/lion.jpg" alt="AGGlory" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="heading" style={{ fontSize: 17, fontWeight: 700 }}>AGGlory</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <button className="ng-btn-outline" onClick={onLogout} style={{ fontSize: 12, padding: "6px 14px" }}>Logout</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <span className="badge badge-gold">{user.username} (user)</span>
          <span className="badge badge-blue">🔵 Basic: <strong style={{ marginLeft: 2 }}>{user.basicCredits}</strong></span>
          <span className="badge badge-amber">⭐ Premium: <strong style={{ marginLeft: 2 }}>{user.premiumCredits}</strong></span>
        </div>
      </nav>

      <div style={{ flex: 1, paddingBottom: 72 }}>
        <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto", width: "100%" }}>

          {/* ══════════ DASHBOARD TAB ══════════ */}
          {tab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Announcement */}
              {settings.announcementText && (
                <div style={{ padding: "12px 16px", background: "rgba(212,196,168,0.08)", border: "1px solid rgba(212,196,168,0.2)", borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: "var(--gold3)" }}>📢 {settings.announcementText}</p>
                </div>
              )}

              {/* Credit cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="stat-card" style={{ background: "linear-gradient(135deg,rgba(59,130,246,.15),rgba(59,130,246,.05))", border: "1px solid rgba(59,130,246,.25)" }}>
                  <p style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>🔵 Basic Credits</p>
                  <p className="heading" style={{ fontSize: 32, fontWeight: 800 }}>{user.basicCredits}</p>
                  <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>Available</p>
                </div>
                <div className="stat-card" style={{ background: "linear-gradient(135deg,rgba(245,158,11,.15),rgba(245,158,11,.05))", border: "1px solid rgba(245,158,11,.25)" }}>
                  <p style={{ fontSize: 11, color: "var(--amber)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>⭐ Premium Credits</p>
                  <p className="heading" style={{ fontSize: 32, fontWeight: 800 }}>{user.premiumCredits}</p>
                  <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>Available</p>
                </div>
              </div>

              {/* ───── GUILD INFO / START GLORY SECTION ───── */}
              <div className="ng-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,rgba(212,196,168,0.3),rgba(212,196,168,0.1))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>🏰</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--gold3)" }}>Guild Info</h3>
                    <p style={{ fontSize: 11, color: "var(--text-subtle)" }}>Guild ID aur Region select karo</p>
                  </div>
                </div>

                {/* Region + Guild ID */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">ACCOUNTS REGION</label>
                    <select
                      className="ng-input"
                      value={region}
                      onChange={e => { setRegion(e.target.value); setGuildData(null); setGloryStarted(false); setGuildError(""); }}
                      style={{ cursor: "pointer" }}
                    >
                      {REGIONS.map(r => (
                        <option key={r.code} value={r.code} style={{ background: "#1A1A1A" }}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GUILD ID</label>
                    <input
                      className="ng-input"
                      placeholder="e.g. 3047009425"
                      value={guildId}
                      onChange={e => { setGuildId(e.target.value); setGuildData(null); setGloryStarted(false); setGuildError(""); }}
                      onKeyDown={e => { if (e.key === "Enter") fetchGuild(); }}
                    />
                  </div>

                  {/* Start Glory Button */}
                  <button
                    className="ng-btn-primary"
                    onClick={fetchGuild}
                    disabled={guildLoading}
                    style={{ width: "100%", padding: "14px", fontSize: 15 }}
                  >
                    {guildLoading ? (
                      <span>Fetching info...</span>
                    ) : (
                      <><span style={{ fontSize: 18 }}>⚡</span> Start Glory</>
                    )}
                  </button>
                </div>

                {/* Error */}
                {guildError && (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "var(--red)", fontSize: 13 }}>
                    ❌ {guildError}
                  </div>
                )}
              </div>

              {/* Guild Result */}
              {guildData && (
                <>
                  {/* Guild Header */}
                  <div style={{ background: "linear-gradient(135deg,rgba(212,196,168,0.12),rgba(212,196,168,0.04))", border: "1px solid rgba(212,196,168,0.25)", borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: "linear-gradient(135deg,#D4C4A8,#C9B896)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 26 }}>🦁</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 className="heading" style={{ fontSize: 18, fontWeight: 800, color: "var(--gold3)", wordBreak: "break-word" }}>{guildData.GuildName}</h2>
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          {guildData.GuildLevel != null && <span className="badge badge-gold">Level {guildData.GuildLevel}</span>}
                          {guildData.GuildRegion && <span className="badge badge-teal">{guildData.GuildRegion}</span>}
                          {guildData.CurrentMembers != null && <span className="badge badge-blue">{guildData.CurrentMembers}/{guildData.MaxMembers} Members</span>}
                          {guildData.AutoApprovalStatus === "ON" && <span className="badge badge-green">Auto Join ON</span>}
                        </div>
                      </div>
                    </div>

                    {guildData.GuildSlogan && (
                      <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 10, marginBottom: 12 }}>
                        <p style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 3 }}>Guild Slogan</p>
                        <p style={{ fontSize: 13, color: "var(--text)", fontStyle: "italic" }}>"{guildData.GuildSlogan}"</p>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {guildData.TotalActivityPoints != null && (
                        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "12px 14px" }}>
                          <p style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Activity</p>
                          <p className="heading" style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", marginTop: 4 }}>{formatNum(guildData.TotalActivityPoints)}</p>
                        </div>
                      )}
                      {guildData.WeeklyActivityPoints != null && (
                        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "12px 14px" }}>
                          <p style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Weekly Activity</p>
                          <p className="heading" style={{ fontSize: 20, fontWeight: 700, color: "var(--blue)", marginTop: 4 }}>{formatNum(guildData.WeeklyActivityPoints)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Leader Info */}
                  {guildData.GuildLeader && (
                    <div className="ng-card" style={{ padding: 16 }}>
                      <p style={{ fontSize: 11, color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>👑 Guild Leader</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,rgba(245,158,11,.3),rgba(245,158,11,.1))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 22 }}>👑</span>
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--gold3)" }}>{guildData.GuildLeader.Name || "—"}</p>
                          <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>
                            {guildData.GuildLeader.Uid ? `UID: ${guildData.GuildLeader.Uid}` : ""}
                            {guildData.GuildLeader.Level != null ? ` · Level ${guildData.GuildLeader.Level}` : ""}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {[
                          { label: "BR Rank", value: guildData.GuildLeader.BrRank },
                          { label: "CS Rank", value: guildData.GuildLeader.CsRank },
                          { label: "CS Stars", value: guildData.GuildLeader.CsStars != null ? String(guildData.GuildLeader.CsStars) : undefined },
                          { label: "BR Points", value: guildData.GuildLeader.BrPoints != null ? formatNum(guildData.GuildLeader.BrPoints) : undefined },
                          { label: "Likes", value: guildData.GuildLeader.Likes != null ? formatNum(guildData.GuildLeader.Likes) : undefined },
                        ].filter(i => i.value != null).map(item => (
                          <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                            <p style={{ fontSize: 10, color: "var(--text-subtle)", marginBottom: 4 }}>{item.label}</p>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guild Details */}
                  <div className="ng-card" style={{ padding: 16 }}>
                    <p style={{ fontSize: 11, color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>📋 Guild Details</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {[
                        { label: "Guild ID", value: guildData.GuildId != null ? String(guildData.GuildId) : null },
                        { label: "Frame", value: guildData.FrameName || null },
                        { label: "Avatar", value: guildData.AvatarName || null },
                        { label: "Auto Approval", value: guildData.AutoApprovalStatus || null },
                        { label: "Min Level Req.", value: guildData.MinLevelReq != null ? String(guildData.MinLevelReq) : null },
                        { label: "Min BR Rank", value: guildData.MinBrRank || "Default" },
                        { label: "Min CS Rank", value: guildData.MinCsRank || "Default" },
                      ].filter(i => i.value != null).map(item => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {guildData.TagsDisplay && Object.values(guildData.TagsDisplay).some(Boolean) && (
                    <div className="ng-card" style={{ padding: 16 }}>
                      <p style={{ fontSize: 11, color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>🏷️ Guild Tags</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {guildData.TagsDisplay.Activity && <span className="badge badge-green">{guildData.TagsDisplay.Activity}</span>}
                        {guildData.TagsDisplay.PlayStyle && <span className="badge badge-blue">{guildData.TagsDisplay.PlayStyle}</span>}
                        {guildData.TagsDisplay.SocialStyle && <span className="badge badge-purple">{guildData.TagsDisplay.SocialStyle}</span>}
                        {guildData.TagsDisplay.Type && <span className="badge badge-amber">{guildData.TagsDisplay.Type}</span>}
                      </div>
                    </div>
                  )}

                  {/* ── CREDIT / GLORY ACTION ── */}
                  <div className="ng-card" style={{ padding: 20 }}>
                    {gloryStarted ? (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>Glory Started!</p>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                          {guildData.GuildName || "Guild"} ka glory process shuru ho gaya
                        </p>
                      </div>
                    ) : hasCredits ? (
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                          Credits: <strong style={{ color: "var(--blue)" }}>{user.basicCredits} basic</strong> + <strong style={{ color: "var(--amber)" }}>{user.premiumCredits} premium</strong>
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 16 }}>1 credit use hoga</p>
                        <button
                          onClick={handleStartGlory}
                          style={{
                            width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
                            background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff",
                            fontSize: 16, fontWeight: 700, fontFamily: "Outfit, sans-serif",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            boxShadow: "0 8px 30px rgba(16,185,129,0.35)"
                          }}
                        >
                          <span style={{ fontSize: 22 }}>⚡</span> Start Glory
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: "100%", padding: "16px", borderRadius: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                          <span style={{ fontSize: 18 }}>⚡</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--green)" }}>
                            Insufficient Credits (Need 1, Have {totalCredits})
                          </span>
                        </div>
                        <button className="ng-btn-outline" style={{ fontSize: 13 }} onClick={() => setTab("payment")}>
                          Buy Credits →
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Recent Activity */}
              <div className="ng-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Activity</h3>
                  {user.transactions.length > 0 && (
                    <button className="ng-btn-outline" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setTab("transactions")}>View All</button>
                  )}
                </div>
                {user.transactions.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-subtle)", textAlign: "center", padding: "20px 0" }}>No transactions yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {user.transactions.slice(0, 4).map(tx => (
                      <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <p style={{ fontSize: 13 }}>{tx.description}</p>
                          <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>{formatDate(tx.date)}</p>
                        </div>
                        <span className={`badge ${tx.type === "credit" ? "badge-green" : "badge-red"}`}>
                          {tx.type === "credit" ? "+" : "-"}{tx.amount} {tx.creditType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ TRANSACTIONS TAB ══════════ */}
          {tab === "transactions" && (
            <div className="ng-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>All Transactions</h3>
              {user.transactions.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>No transactions yet</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="ng-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.transactions.map(tx => (
                        <tr key={tx.id}>
                          <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(tx.date)}</td>
                          <td>{tx.description}</td>
                          <td><span className={`badge ${tx.creditType === "premium" ? "badge-amber" : "badge-blue"}`}>{tx.creditType}</span></td>
                          <td>
                            <span style={{ color: tx.type === "credit" ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                              {tx.type === "credit" ? "+" : "-"}{tx.amount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════ PAYMENT TAB ══════════ */}
          {tab === "payment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="ng-card" style={{ padding: 16, background: "linear-gradient(135deg,rgba(212,196,168,0.1),rgba(212,196,168,0.03))", border: "1px solid rgba(212,196,168,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#D4C4A8,#C9B896)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 20 }}>💰</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--gold3)" }}>Buy Credits</p>
                    <p style={{ fontSize: 11, color: "var(--text-subtle)" }}>Admin se contact karo top-up ke liye</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--blue)", marginBottom: 4 }}>🔵 Basic</p>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>₹50</p>
                  </div>
                  <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--amber)", marginBottom: 4 }}>⭐ Premium</p>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>₹150</p>
                  </div>
                </div>
              </div>

              <div className="ng-card" style={{ padding: 24, textAlign: "center" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Payment Details</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Scan QR ya UPI se payment karo</p>
                {settings.qrImageBase64 ? (
                  <img src={settings.qrImageBase64} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 12, border: "2px solid var(--border)", margin: "0 auto 20px", display: "block", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 200, height: 200, borderRadius: 12, border: "2px dashed var(--border)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>QR not set yet</p>
                  </div>
                )}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 20px", display: "inline-block" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>UPI ID</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold3)", fontFamily: "monospace" }}>{settings.upiId}</p>
                </div>
                <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: "var(--amber)" }}>Payment ke baad admin se contact karo credits add karne ke liye</p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ ACCOUNT TAB ══════════ */}
          {tab === "account" && (
            <div className="ng-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Account Details</h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { label: "Username", value: user.username },
                  { label: "Basic Credits", value: String(user.basicCredits), color: "var(--blue)" },
                  { label: "Premium Credits", value: String(user.premiumCredits), color: "var(--amber)" },
                  { label: "Joined", value: formatDate(user.joinedAt) },
                  { label: "Total Transactions", value: String(user.transactions.length) },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: (item as { color?: string }).color || "var(--text)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={onLogout} className="ng-btn-danger" style={{ width: "100%", marginTop: 20, padding: "12px" }}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar — 4 tabs (no separate guild tab) */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "rgba(5,5,8,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "6px 4px" }}>
        {([
          { id: "dashboard", label: "Home", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { id: "transactions", label: "Transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { id: "payment", label: "Payment", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
          { id: "account", label: "Account", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        ] as const).map(item => (
          <button key={item.id} className={`mob-tab ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span style={{ fontSize: 9 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
