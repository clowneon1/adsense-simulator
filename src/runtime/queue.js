import { scanSlots } from "./slotScanner.js";

let queueInitialized = false;
let draining = false;

export function initQueue() {
  if (queueInitialized) return;
  queueInitialized = true;

  window.adsbygoogle = window.adsbygoogle || [];

  const queue = window.adsbygoogle;

  const originalPush = queue.push.bind(queue);

  queue.push = function (...args) {
    const result = originalPush(...args);

    scheduleDrain();

    return result;
  };

  // process any pushes that happened before simulator loaded
  scheduleDrain();
}

function scheduleDrain() {
  if (draining) return;

  draining = true;

  queueMicrotask(drainQueue);
}

function drainQueue() {
  draining = false;

  scanSlots();
}
