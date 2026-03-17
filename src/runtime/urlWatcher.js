import { scanSlots } from "./slotScanner.js";

let currentUrl = location.href;
let stopWatcher = null;

export function startUrlWatcher() {
  if (stopWatcher) return;

  function onUrlChange() {
    const next = location.href;

    if (next !== currentUrl) {
      currentUrl = next;
      resetSlots();
      scanSlots();
    }
  }

  // Intercept SPA navigation via history API
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
  });
}
