import { scanSlots } from "./slotScanner.js";
import { teardownDomObserver, startDomObserver } from "../observer/domObserver.js";
import { resetQueue, initQueue } from "./queue.js";

let currentUrl = location.href;
let stopWatcher = null;

function reinitRuntime() {
  // Tear down all stateful singletons so they can re-initialise cleanly
  teardownDomObserver();
  resetQueue();

  // Reset all slot render state and clear visual content
  resetSlots();

  // Re-init the full runtime — exactly what happens on a fresh page load
  startDomObserver();
  initQueue();
  scanSlots();
}

export function startUrlWatcher() {
  if (stopWatcher) return;

  function onUrlChange() {
    const next = location.href;

    if (next === currentUrl) return;

    currentUrl = next;

    reinitRuntime();
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
    delete slot.dataset.adsenseSimulated;
    delete slot.__adsense_seen_at__;
    delete slot.__adsense_retry_count__;

    // Clear visual content so reused/preserved DOM nodes re-render cleanly
    slot.innerHTML = "";
    slot.style.cssText = "";
  });
}
