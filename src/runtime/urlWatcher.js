import { scanSlots } from "./slotScanner.js";

let currentUrl = location.href;
let stopWatcher = null;
let pendingTimers = [];

function clearPendingTimers() {
  for (const id of pendingTimers) {
    clearTimeout(id);
  }
  pendingTimers = [];
}

function scheduleRouteRescan() {
  // Immediate scan — catches slots already in DOM at navigation time
  scanSlots();

  // Two rAF passes — catches slots added in the first paint after route change
  requestAnimationFrame(() => {
    scanSlots();

    requestAnimationFrame(() => {
      scanSlots();
    });
  });

  // Timed passes — catches async-hydrated or lazily-inserted slots
  // (common on home/root pages that restore cached DOM then patch in content)
  pendingTimers.push(setTimeout(scanSlots, 100));
  pendingTimers.push(setTimeout(scanSlots, 300));
  pendingTimers.push(setTimeout(scanSlots, 600));
}

export function startUrlWatcher() {
  if (stopWatcher) return;

  function onUrlChange() {
    const next = location.href;

    if (next === currentUrl) return;

    currentUrl = next;

    // Cancel any in-flight rescans from a previous navigation
    clearPendingTimers();

    resetSlots();
    scheduleRouteRescan();
  }

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    originalPushState(...args);
    onUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState(...args);
    onUrlChange();
  };

  // Handle back/forward browser navigation
  window.addEventListener("popstate", onUrlChange);

  stopWatcher = function () {
    clearPendingTimers();
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", onUrlChange);
    stopWatcher = null;
  };
}

export function stopUrlWatcher() {
  if (stopWatcher) stopWatcher();
}

function resetSlots() {
  document.querySelectorAll(".adsbygoogle").forEach((slot) => {
    // Clear render state so slots re-render after navigation
    delete slot.dataset.adsenseSimulated;
    delete slot.__adsense_seen_at__;
    delete slot.__adsense_retry_count__;

    // Clear visual content so reused/preserved DOM nodes don't stay half-rendered
    slot.innerHTML = "";
    slot.style.cssText = "";
  });
}
