import { useState, useEffect } from "react";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";

type Session = { username: string; isOwner: boolean } | null;

const SESSION_KEY = "ffglory_session";

function getSession(): Session {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export default function App() {
  const [session, setSession] = useState<Session>(getSession);

  function handleLogin(username: string, isOwner: boolean) {
    const s = { username, isOwner };
    setSession(s);
    saveSession(s);
  }

  function handleLogout() {
    setSession(null);
    saveSession(null);
  }

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  if (session.isOwner) {
    return <OwnerDashboard onLogout={handleLogout} />;
  }

  return <UserDashboard username={session.username} onLogout={handleLogout} />;
}
