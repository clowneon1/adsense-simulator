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

function resetSlots() {
  document.querySelectorAll(".adsbygoogle").forEach((slot) => {
    // Restore original inline style so re-renders use correct dimensions.
    // adRenderer stores the original style before overwriting it.
    if (slot.__adsense_original_style__ !== undefined) {
      slot.setAttribute("style", slot.__adsense_original_style__);
      delete slot.__adsense_original_style__;
    }

    delete slot.dataset.adsenseSimulated;
    delete slot.__adsense_seen_at__;
    delete slot.__adsense_retry_count__;

    // Clear rendered content so the slot visually resets
    slot.innerHTML = "";
  });
}

function teardown() {
  teardownDomObserver();
  resetQueue();
  resetSlots();
}

function reinitImmediate() {
  // pushState/replaceState: app controls navigation, framework mounts
  // content synchronously right after — full immediate reinit is safe.
  clearPendingTimers();
  teardown();
  startDomObserver();
  initQueue();
  scanSlots();
}

function reinitDeferred() {
  // popstate / bfcache restore: browser fires event BEFORE framework
  // has restored the page DOM. Strategy:
  //   1. Teardown immediately — reset all singleton guards
  //   2. startDomObserver immediately — watching documentElement so
  //      it survives any body replacement the framework does
  //   3. initQueue immediately — push() hook must be live before
  //      any ad scripts fire during DOM restoration
  //   4. Defer scanSlots — slots not in DOM yet, scan after framework mounts
  clearPendingTimers();
  teardown();
  startDomObserver(); // observes documentElement — survives body replacement
  initQueue();        // push hook live immediately — never miss a .push() call

  // Deferred scans: safety net for slots not triggered via queue drain
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

function onPopState() {
  const next = location.href;
  if (next === currentUrl) return;
  currentUrl = next;
  reinitDeferred();
}

function onPageShow(event) {
  // bfcache restore: browser restores frozen page state.
  // popstate may NOT fire in this case — pageshow with persisted=true
  // is the only reliable signal for back-forward cache restoration.
  if (event.persisted) {
    currentUrl = location.href;
    reinitDeferred();
  }
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

  window.addEventListener("popstate", onPopState);
  window.addEventListener("pageshow", onPageShow);

  stopWatcher = function () {
    clearPendingTimers();
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("pageshow", onPageShow);
    stopWatcher = null;
  };
}

export function stopUrlWatcher() {
  if (stopWatcher) stopUrlWatcher();
}
