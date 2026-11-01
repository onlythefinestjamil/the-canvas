import type { AuthUser, Plan } from '../types';

const AUTH_KEY = 'canvas.auth.v1';
const USERS_KEY = 'canvas.users.v1';

interface StoredUser extends AuthUser {
  passwordHash: string;
}

/** Lightweight non-crypto hash — demo only; real auth lives on a backend. */
function hash(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  }
  return `h${h}`;
}

export function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as AuthUser;
    return u;
  } catch {
    return null;
  }
}

export function saveUser(u: AuthUser | null): void {
  try {
    if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

function readUsers(): Record<string, StoredUser> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredUser>): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}

export function signUp(email: string, password: string): AuthUser {
  email = email.trim().toLowerCase();
  if (!email || !password) throw new Error('Email and password are required.');
  const users = readUsers();
  if (users[email]) throw new Error('An account with that email already exists.');
  const user: StoredUser = {
    email,
    passwordHash: hash(password),
    plan: 'free',
    billingStart: Date.now(),
  };
  users[email] = user;
  writeUsers(users);
  const { passwordHash, ...pub } = user;
  void passwordHash;
  saveUser(pub);
  return pub;
}

export function logIn(email: string, password: string): AuthUser {
  email = email.trim().toLowerCase();
  const users = readUsers();
  const u = users[email];
  if (!u || u.passwordHash !== hash(password)) throw new Error('Invalid email or password.');
  const { passwordHash, ...pub } = u;
  void passwordHash;
  saveUser(pub);
  return pub;
}

export function logOut(): void {
  saveUser(null);
}

export function upgradePlan(plan: Plan): AuthUser | null {
  const u = loadUser();
  if (!u) return null;
  const updated = { ...u, plan, billingStart: Date.now() };
  saveUser(updated);
  return updated;
}
