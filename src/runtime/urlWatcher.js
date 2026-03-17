import { scanSlots } from "./slotScanner.js";
import { teardownDomObserver, startDomObserver } from "../observer/domObserver.js";
import { resetQueue, initQueue } from "./queue.js";

let currentUrl = location.href;
let stopWatcher = null;
let pendingTimers = [];

function clearPendingTimers() {
  for (const id of pendingTimers) clearTimeout(id);
  pendingTimers = [];
}

function teardown() {
  teardownDomObserver();
  resetQueue();
  resetSlots();
}

function reinitImmediate() {
  // Used for pushState/replaceState: framework mounts content synchronously
  // right after navigation so an immediate full reinit is safe.
  teardown();
  startDomObserver();
  initQueue();
  scanSlots();
}

function reinitDeferred() {
  // Used for popstate (browser back/forward): popstate fires BEFORE the
  // framework has restored the page DOM. Teardown and observer start
  // immediately so we are ready to catch mutations, but the actual scan
  // and queue init are deferred to give the framework time to mount slots.
  clearPendingTimers();
  teardown();

  // Observer up immediately — catches any slot inserted during restoration
  startDomObserver();

  // Deferred scans across multiple windows to catch async DOM restoration
  requestAnimationFrame(() => {
    initQueue();
    scanSlots();

    requestAnimationFrame(() => {
      scanSlots();
    });
  });

  pendingTimers.push(setTimeout(scanSlots, 100));
  pendingTimers.push(setTimeout(scanSlots, 300));
  pendingTimers.push(setTimeout(scanSlots, 600));
}

export function startUrlWatcher() {
  if (stopWatcher) return;

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    originalPushState(...args);
    const next = location.href;
    if (next === currentUrl) return;
    currentUrl = next;
    clearPendingTimers();
    reinitImmediate();
  };

  history.replaceState = function (...args) {
    originalReplaceState(...args);
    const next = location.href;
    if (next === currentUrl) return;
    currentUrl = next;
    clearPendingTimers();
    reinitImmediate();
  };

  // popstate = browser back/forward: DOM restoration is async, use deferred path
  window.addEventListener("popstate", () => {
    const next = location.href;
    if (next === currentUrl) return;
    currentUrl = next;
    reinitDeferred();
  });

  stopWatcher = function () {
    clearPendingTimers();
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", reinitDeferred);
    stopWatcher = null;
  };
}

export function stopUrlWatcher() {
  if (stopWatcher) stopWatcher();
}

function resetSlots() {
  document.querySelectorAll(".adsbygoogle").forEach((slot) => {
    delete slot.dataset.adsenseSimulated;
    delete slot.__adsense_seen_at__;
    delete slot.__adsense_retry_count__;
    slot.innerHTML = "";
    slot.style.cssText = "";
  });
}
