import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { openOverlay, closeOverlay } from '../utils/overlayManager';

export default function Modal({ children, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // debug mount
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[Modal] mounted');
    }

    // Focus trap - keep focus inside modal (deferred + retry to avoid timing races)
    const focusFirst = () => {
      try {
        const first = modalRef.current?.querySelector(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        // blur whatever currently has focus so the modal can take focus
        try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (e) {}
        if (first && typeof first.focus === 'function') {
          first.focus();
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    // Try immediately and then retry a few times in case of race conditions
    let t = null;
    let attempts = 0;
    const tryFocus = () => {
      attempts += 1;
      const ok = focusFirst();
      if (ok || attempts >= 6) {
        clearInterval(t);
      }
    };
    // first immediate attempt
    tryFocus();
    // schedule retries every 50ms up to ~6 times
    if (attempts < 6) t = setInterval(tryFocus, 50);

  // register overlay in manager (handles nested overlays)
  openOverlay();

    return () => {
      // debug unmount
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[Modal] unmounted');
      }
      // clear any interval used for retrying focus
      if (t) clearInterval(t);
      // release overlay via manager
      closeOverlay();
    };
  }, []);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Ensure we have a modal root to portal into
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  return createPortal(
    (
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]"
        onClick={handleBackdropClick}
      >
        <div 
          ref={modalRef}
          className="bg-white rounded-xl shadow-xl w-[90%] max-w-2xl relative p-6 animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl font-bold"
          >
            ×
          </button>
          <div className="overflow-y-auto max-h-[80vh]">{children}</div>
        </div>
      </div>
    ),
    modalRoot
  );
}
