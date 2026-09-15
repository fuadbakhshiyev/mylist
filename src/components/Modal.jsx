import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ onClose, labelledBy, maxWidth = 800, children }) => {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Close on Escape, lock page scroll, and return focus to the trigger when closed
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Render into <body> so animated (transformed) page wrappers and the sticky navbar can't clip or cover the popup
  return createPortal(
    <div className="modal-overlay" onClick={() => onCloseRef.current()}>
      <div
        ref={panelRef}
        className="modal-panel animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={() => onCloseRef.current()} aria-label="Close">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
