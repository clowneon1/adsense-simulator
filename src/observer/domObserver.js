import { scanSlots } from "../runtime/slotScanner.js";

let observerInstance = null;
let observerStarted = false;
let scheduled = false;

function scheduleScan() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    scanSlots();
  });
}

export function startDomObserver() {
  if (observerStarted) return;

  const start = () => {
    if (observerStarted) return;
    observerStarted = true;

    observerInstance = new MutationObserver((mutations) => {
      let adDetected = false;

      for (const mutation of mutations) {
        // Attribute changes on existing .adsbygoogle nodes —
        // frameworks insert the shell element first, then set
        // data-ad-client/data-ad-slot during hydration.
        if (mutation.type === "attributes") {
          if (
            mutation.target instanceof HTMLElement &&
            mutation.target.classList.contains("adsbygoogle") &&
            mutation.target.dataset.adsenseSimulated !== "true"
          ) {
            adDetected = true;
            break;
          }
          continue;
        }

        if (mutation.type !== "childList") continue;

        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (
            node.classList?.contains("adsbygoogle") ||
            node.querySelector?.(".adsbygoogle")
          ) {
            adDetected = true;
            break;
          }
        }

        if (adDetected) break;
      }

      if (!adDetected) return;
      scheduleScan();
    });

    // Observe documentElement (<html>), NOT document.body.
    // Some SPA frameworks (Next.js App Router, Nuxt, etc.) replace
    // document.body entirely on route changes. Observing a replaced body
    // leaves the MutationObserver watching a detached stale node, making
    // it blind to all new slot insertions. documentElement is NEVER
    // replaced by any framework and survives all DOM mutations.
    observerInstance.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "data-ad-client",
        "data-ad-slot",
        "data-ad-format",
        "data-ad-layout",
        "data-full-width-responsive",
        "style",
      ],
    });
  };

  // documentElement is always available, but keep the DOMContentLoaded
  // fallback for edge cases where the script runs extremely early.
  if (document.documentElement) {
    start();
  } else {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  }
}

export function teardownDomObserver() {
  if (observerInstance) {
    observerInstance.disconnect();
    observerInstance = null;
  }
  observerStarted = false;
  scheduled = false;
}
