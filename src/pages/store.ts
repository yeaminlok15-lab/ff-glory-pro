export interface User {
  username: string;
  password: string;
  basicCredits: number;
  premiumCredits: number;
  transactions: Transaction[];
  joinedAt: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  creditType: 'basic' | 'premium';
  description: string;
  date: string;
}

export interface Settings {
  upiId: string;
  qrImageBase64: string;
  announcementText: string;
}

const OWNER_USERNAME = 'Ajay_Kumar';
const OWNER_PASSWORD = 'Ajay.26';

const DEFAULT_SETTINGS: Settings = {
  upiId: 'ajay@upi',
  qrImageBase64: '',
  announcementText: 'Welcome to FFGlory! Top up your credits to get started.',
};

function getUsers(): Record<string, User> {
  try {
    const raw = localStorage.getItem('ffglory_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, User>) {
  localStorage.setItem('ffglory_users', JSON.stringify(users));
}

function getSettings(): Settings {
  try {
    const raw = localStorage.getItem('ffglory_settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem('ffglory_settings', JSON.stringify(settings));
}

export function isOwner(username: string): boolean {
  return username === OWNER_USERNAME;
}

export function login(username: string, password: string): { success: boolean; isOwner: boolean; error?: string } {
  if (username === OWNER_USERNAME && password === OWNER_PASSWORD) {
    return { success: true, isOwner: true };
  }
  const users = getUsers();
  const user = users[username.toLowerCase()];
  if (!user) return { success: false, isOwner: false, error: 'Username not found' };
  if (user.password !== password) return { success: false, isOwner: false, error: 'Incorrect password' };
  return { success: true, isOwner: false };
}

export function register(username: string, password: string): { success: boolean; error?: string } {
  if (username.toLowerCase() === OWNER_USERNAME.toLowerCase()) {
    return { success: false, error: 'Username not available' };
  }
  const users = getUsers();
  const key = username.toLowerCase();
  if (users[key]) return { success: false, error: 'Username already taken' };
  users[key] = {
    username,
    password,
    basicCredits: 0,
    premiumCredits: 0,
    transactions: [],
    joinedAt: new Date().toISOString(),
  };
  saveUsers(users);
  return { success: true };
}

export function getUser(username: string): User | null {
  const users = getUsers();
  return users[username.toLowerCase()] || null;
}

export function getAllUsers(): User[] {
  const users = getUsers();
  return Object.values(users);
}

export function addCredits(targetUsername: string, basicDelta: number, premiumDelta: number, description: string): boolean {
  const users = getUsers();
  const key = targetUsername.toLowerCase();
  if (!users[key]) return false;
  users[key].basicCredits = Math.max(0, users[key].basicCredits + basicDelta);
  users[key].premiumCredits = Math.max(0, users[key].premiumCredits + premiumDelta);
  const tx: Transaction = {
    id: Math.random().toString(36).slice(2),
    type: basicDelta + premiumDelta > 0 ? 'credit' : 'debit',
    amount: Math.abs(basicDelta + premiumDelta),
    creditType: premiumDelta !== 0 ? 'premium' : 'basic',
    description,
    date: new Date().toISOString(),
  };
  users[key].transactions.unshift(tx);
  saveUsers(users);
  return true;
}

export { getSettings, saveSettings };
export const OWNER = { username: OWNER_USERNAME };
