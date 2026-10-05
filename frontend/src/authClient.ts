// Auth client replacing Supabase with native PostgreSQL + JWT backend

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  auth_provider?: string;
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'receipt_guard_token';
const USER_KEY = 'receipt_guard_user';

type AuthListener = (session: AuthSession | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(session: AuthSession | null) {
  listeners.forEach((listener) => {
    try {
      listener(session);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async getSession(): Promise<{ data: { session: AuthSession | null } }> {
    const token = this.getToken();
    const user = this.getUser();
    if (!token || !user) {
      return { data: { session: null } };
    }
    return {
      data: {
        session: {
          access_token: token,
          user,
        },
      },
    };
  },

  setSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notifyListeners({ access_token: token, user });
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notifyListeners(null);
  },

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    const listener: AuthListener = (session) => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    };
    listeners.add(listener);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners.delete(listener);
          },
        },
      },
    };
  },

  async register(email: string, password: string, fullName?: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed');
    }
    this.setSession(data.access_token, data.user);
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    this.setSession(data.access_token, data.user);
    return data;
  },

  async loginWithGoogle(credential: string) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Google sign-in failed');
    }
    this.setSession(data.access_token, data.user);
    return data;
  },

  async getMe() {
    const token = this.getToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        this.clearSession();
      }
      return null;
    }
    const data = await res.json();
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async getCredits(): Promise<number> {
    const token = this.getToken();
    if (!token) return 0;
    try {
      const res = await fetch(`${API_BASE}/user/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.credits_balance ?? 0;
    } catch {
      return 0;
    }
  },

  async signOut() {
    this.clearSession();
  },
};
