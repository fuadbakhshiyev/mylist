import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// One toast at a time: a new toast replaces the current one. The timer pauses while hovered or focused.
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const remainingRef = useRef(0);
  const startedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback((ms) => {
    clearTimer();
    remainingRef.current = ms;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setToast(null);
    }, ms);
  }, [clearTimer]);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const showToast = useCallback(({ message, actionLabel, onAction, duration = 5000 }) => {
    setToast({ id: Date.now(), message, actionLabel, onAction });
    startTimer(duration);
  }, [startTimer]);

  const pause = () => {
    if (!timerRef.current) return;
    clearTimer();
    remainingRef.current -= Date.now() - startedAtRef.current;
  };

  const resume = () => {
    if (toast && !timerRef.current) startTimer(Math.max(remainingRef.current, 1500));
  };

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className="toast"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocus={pause}
            onBlur={resume}
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.onAction?.();
                  dismiss();
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
};
