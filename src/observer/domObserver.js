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
        // Watch for attribute changes on existing .adsbygoogle nodes.
        // Frameworks often insert the element first, then set data-ad-client
        // and data-ad-slot later during hydration — this catches that pattern.
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

    observerInstance.observe(document.body, {
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

  if (document.body) {
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
