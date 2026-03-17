import { initQueue } from "./runtime/queue.js";
import { scanSlots } from "./runtime/slotScanner.js";
import { startDomObserver } from "./observer/domObserver.js";

let runtimeStarted = false;

function startRuntime() {
  if (runtimeStarted) return;
  runtimeStarted = true;

  startDomObserver();
  scanSlots();
}

export function init() {
  // Queue must initialize immediately to capture push calls
  initQueue();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startRuntime, { once: true });
  } else {
    startRuntime();
  }
}

init();
