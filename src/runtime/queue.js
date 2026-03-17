import { scanSlots } from "./slotScanner.js";

let queueInitialized = false;
let draining = false;
let originalPush = null;

export function initQueue() {
  if (queueInitialized) return;
  queueInitialized = true;

  window.adsbygoogle = window.adsbygoogle || [];

  const queue = window.adsbygoogle;

  originalPush = queue.push.bind(queue);

  queue.push = function (...args) {
    const result = originalPush(...args);

    scheduleDrain();

    return result;
  };

  scheduleDrain();
}

export function resetQueue() {
  // Restore the original push so initQueue() can safely re-wrap it
  if (window.adsbygoogle && originalPush) {
    window.adsbygoogle.push = originalPush;
  }
  queueInitialized = false;
  draining = false;
  originalPush = null;
}

function scheduleDrain() {
  if (draining) return;

  draining = true;

  queueMicrotask(drainQueue);
}

function drainQueue() {
  draining = false;

  requestAnimationFrame(() => {
    scanSlots();
  });
}
