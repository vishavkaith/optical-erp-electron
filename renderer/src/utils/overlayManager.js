// renderer/src/utils/overlayManager.js
// Simple stack-style overlay manager to track open overlays (modals/sidebars)
// Ensures body class and overflow are only set when there is at least one overlay

const EVENT_NAME = 'overlay:change';
let count = 0;

function updateBody() {
  try {
    if (count > 0) {
      document.body.classList.add('overlay-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('overlay-open');
      document.body.style.overflow = '';
    }
  } catch (e) {}
  // dispatch a DOM event so pages/components can react
  try {
    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count } }));
  } catch (e) {}
}

export function openOverlay() {
  count += 1;
  updateBody();
}

export function closeOverlay() {
  count = Math.max(0, count - 1);
  updateBody();
}

export function getOverlayCount() {
  return count;
}

export const OVERLAY_EVENT = EVENT_NAME;

export default {
  openOverlay,
  closeOverlay,
  getOverlayCount,
  OVERLAY_EVENT,
};
