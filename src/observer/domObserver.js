import { scanSlots } from "../runtime/slotScanner.js";

let observerStarted = false;
let scheduled = false;

export function startDomObserver() {
  if (observerStarted) return;

  const start = () => {
    if (observerStarted) return;
    observerStarted = true;

    const observer = new MutationObserver((mutations) => {
      let adDetected = false;

      for (const mutation of mutations) {
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

      if (!scheduled) {
        scheduled = true;

        requestAnimationFrame(() => {
          scheduled = false;
          scanSlots();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  if (document.body) {
    start();
  } else {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  }
}
