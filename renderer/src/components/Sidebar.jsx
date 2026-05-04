import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { openOverlay, closeOverlay } from '../utils/overlayManager';

export default function Sidebar({ children, onClose, width = '420px' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    openOverlay();
    return () => {
      closeOverlay();
    };
  }, []);

  // ensure modal root
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  return createPortal(
    <div className="fixed inset-0 flex" style={{ zIndex: 9999 }}>
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* sidebar */}
      <aside
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        className="relative bg-white shadow-xl overflow-auto"
        style={{ width: width, marginLeft: 'auto', transition: 'transform 240ms ease-in-out' }}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
          <div className="mt-4">{children}</div>
        </div>
      </aside>
    </div>,
    modalRoot
  );
}
