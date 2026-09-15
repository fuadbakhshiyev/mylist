import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Device-local accounts: users and sessions live only in this browser's localStorage.
// This is not a secure backend. Swap the storage functions for a real service (e.g. Supabase) later;
// the context API used by the UI stays the same.
const USERS_KEY = 'mcu-tracker:users';
const SESSION_KEY = 'mcu-tracker:session';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the session then lasts until reload
  }
};

const toHex = (buffer) => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => Uint8Array.from(hex.match(/../g).map(h => parseInt(h, 16)));

async function hashPassword(password, saltHex) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256);
  return { salt: toHex(salt), hash: toHex(bits) };
}

export class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const toPublicUser = ({ passwordHash, passwordSalt, ...user }) => user;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const sessionId = readJSON(SESSION_KEY, null);
    const found = readJSON(USERS_KEY, []).find(u => u.id === sessionId);
    return found ? toPublicUser(found) : null;
  });
  // Login prompt requested by actions that need an account: { mode: 'login' | 'signup', reason }
  const [authPrompt, setAuthPrompt] = useState(null);

  // Keep tabs in sync when the user logs in or out elsewhere
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== SESSION_KEY && e.key !== USERS_KEY) return;
      const sessionId = readJSON(SESSION_KEY, null);
      const found = readJSON(USERS_KEY, []).find(u => u.id === sessionId);
      setUser(found ? toPublicUser(found) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) throw new AuthError('NAME_REQUIRED', 'Enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new AuthError('EMAIL_INVALID', 'Enter a valid email address.');
    if ((password || '').length < 8) throw new AuthError('PASSWORD_SHORT', 'Password must be at least 8 characters.');

    const users = readJSON(USERS_KEY, []);
    if (users.some(u => u.email === cleanEmail)) {
      throw new AuthError('EMAIL_TAKEN', 'An account with this email already exists. Log in instead.');
    }

    const { salt, hash } = await hashPassword(password);
    const newUser = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      bio: '',
      createdAt: new Date().toISOString(),
      passwordSalt: salt,
      passwordHash: hash,
    };
    writeJSON(USERS_KEY, [...users, newUser]);
    writeJSON(SESSION_KEY, newUser.id);
    setUser(toPublicUser(newUser));
    setAuthPrompt(null);
    return toPublicUser(newUser);
  }, []);

  const logIn = useCallback(async ({ email, password }) => {
    const found = readJSON(USERS_KEY, []).find(u => u.email === normalizeEmail(email));
    // Same message for unknown email and wrong password, so accounts can't be probed
    const invalid = new AuthError('INVALID_CREDENTIALS', 'Email or password is incorrect.');
    if (!found) throw invalid;
    const { hash } = await hashPassword(password || '', found.passwordSalt);
    if (hash !== found.passwordHash) throw invalid;

    writeJSON(SESSION_KEY, found.id);
    setUser(toPublicUser(found));
    setAuthPrompt(null);
    return toPublicUser(found);
  }, []);

  const logOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore unavailable storage
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch) => {
    if (!user) return null;
    const { id, email, createdAt, passwordHash, passwordSalt, ...allowed } = patch || {};
    const users = readJSON(USERS_KEY, []);
    const next = users.map(u => (u.id === user.id ? { ...u, ...allowed } : u));
    writeJSON(USERS_KEY, next);
    const updated = next.find(u => u.id === user.id);
    setUser(updated ? toPublicUser(updated) : user);
    return updated ? toPublicUser(updated) : user;
  }, [user]);

  const openAuth = useCallback((mode = 'login', reason = null) => setAuthPrompt({ mode, reason }), []);
  const closeAuth = useCallback(() => setAuthPrompt(null), []);

  const value = useMemo(() => ({
    user,
    isLoggedIn: Boolean(user),
    signUp,
    logIn,
    logOut,
    updateProfile,
    authPrompt,
    openAuth,
    closeAuth,
  }), [user, signUp, logIn, logOut, updateProfile, authPrompt, openAuth, closeAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
