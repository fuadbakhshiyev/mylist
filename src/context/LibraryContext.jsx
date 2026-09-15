import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

// Per-user lists stored in this browser: each list maps an id (title id, actor name or hero name) to the time it was added.
export const LISTS = ['watched', 'watchlist', 'favorites', 'likedActors', 'likedHeroes'];

const EMPTY_LIBRARY = Object.fromEntries(LISTS.map(list => [list, {}]));
const storageKey = (userId) => `mcu-tracker:library:${userId}`;

const PROMPT_REASONS = {
  watched: 'Log in to keep track of what you have watched.',
  watchlist: 'Log in to save titles to your watchlist.',
  favorites: 'Log in to save your favorite titles.',
  likedActors: 'Log in to save your favorite actors.',
  likedHeroes: 'Log in to save your favorite heroes.',
};

const loadLibrary = (userId) => {
  if (!userId) return EMPTY_LIBRARY;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(LISTS.map(list => [list, parsed[list] || {}]));
  } catch {
    return EMPTY_LIBRARY;
  }
};

const LibraryContext = createContext(null);

export const LibraryProvider = ({ children }) => {
  const { user, openAuth } = useAuth();
  const userId = user?.id || null;
  // The lists are stored together with their owner, so one account's lists can never be saved under another account
  const [state, setState] = useState(() => ({ ownerId: userId, library: loadLibrary(userId) }));

  // Account changed: load that account's lists during render (no stale render in between)
  if (state.ownerId !== userId) {
    setState({ ownerId: userId, library: loadLibrary(userId) });
  }

  const library = state.ownerId === userId ? state.library : EMPTY_LIBRARY;

  // Persist changes for the logged-in owner only
  useEffect(() => {
    if (!state.ownerId) return;
    try {
      localStorage.setItem(storageKey(state.ownerId), JSON.stringify(state.library));
    } catch {
      // Storage unavailable; lists last until reload
    }
  }, [state]);

  const updateLibrary = useCallback((updater) => {
    setState(prev => (prev.ownerId ? { ...prev, library: updater(prev.library) } : prev));
  }, []);

  const has = useCallback((list, id) => Boolean(library[list]?.[id]), [library]);

  // Result: { applied, added, removedFromWatchlist }. applied is false when the user was asked to log in instead.
  const toggle = useCallback((list, id) => {
    if (!userId) {
      openAuth('login', PROMPT_REASONS[list]);
      return { applied: false, added: false, removedFromWatchlist: false };
    }
    const wasOn = Boolean(library[list]?.[id]);
    // Watching a title takes it off the watchlist
    const removedFromWatchlist = list === 'watched' && !wasOn && Boolean(library.watchlist[id]);

    updateLibrary(prev => {
      const next = { ...prev, [list]: { ...prev[list] } };
      if (wasOn) delete next[list][id];
      else next[list][id] = Date.now();
      if (removedFromWatchlist) {
        next.watchlist = { ...prev.watchlist };
        delete next.watchlist[id];
      }
      return next;
    });
    return { applied: true, added: !wasOn, removedFromWatchlist };
  }, [userId, openAuth, library, updateLibrary]);

  // Put an item in or out of a list directly (used by Undo)
  const setInList = useCallback((list, id, on) => {
    if (!userId) return false;
    updateLibrary(prev => {
      const current = { ...prev[list] };
      if (on) current[id] = current[id] || Date.now();
      else delete current[id];
      return { ...prev, [list]: current };
    });
    return true;
  }, [userId, updateLibrary]);

  // Ids in a list, most recently added first
  const items = useCallback((list) => (
    Object.entries(library[list] || {}).sort((a, b) => b[1] - a[1]).map(([id]) => id)
  ), [library]);

  const addedAt = useCallback((list, id) => library[list]?.[id] || null, [library]);

  const watchedIds = useMemo(() => new Set(Object.keys(library.watched)), [library]);
  const counts = useMemo(() => Object.fromEntries(LISTS.map(list => [list, Object.keys(library[list]).length])), [library]);

  const value = useMemo(
    () => ({ library, has, toggle, setInList, items, addedAt, watchedIds, counts }),
    [library, has, toggle, setInList, items, addedAt, watchedIds, counts]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
};
