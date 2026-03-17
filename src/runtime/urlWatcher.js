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
  // pushState/replaceState: framework mounts content synchronously right
  // after navigation — full immediate reinit is safe.
  clearPendingTimers();
  teardown();
  startDomObserver();
  initQueue();
  scanSlots();
}

function reinitDeferred() {
  // popstate (browser back/forward): fires BEFORE framework restores DOM.
  // We must:
  //   1. Teardown immediately — reset all singleton guards
  //   2. startDomObserver immediately — ready to catch mutations during restore
  //   3. initQueue immediately — CRITICAL: new ad scripts call
  //      window.adsbygoogle.push() during DOM restore, before any rAF fires.
  //      If the push hook isn't live yet those calls are silently lost.
  //   4. Defer scanSlots — slots aren't in DOM yet, scan after framework mounts
  clearPendingTimers();
  teardown();
  startDomObserver();
  initQueue(); // must be synchronous — push() hook must be live immediately

  // Deferred scans — cover async DOM restoration windows
  requestAnimationFrame(() => {
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
    reinitImmediate();
  };

  history.replaceState = function (...args) {
    originalReplaceState(...args);
    const next = location.href;
    if (next === currentUrl) return;
    currentUrl = next;
    reinitImmediate();
  };

  function onPopState() {
    const next = location.href;
    if (next === currentUrl) return;
    currentUrl = next;
    reinitDeferred();
  }

  window.addEventListener("popstate", onPopState);

  stopWatcher = function () {
    clearPendingTimers();
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", onPopState);
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
