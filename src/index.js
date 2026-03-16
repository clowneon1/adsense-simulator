import { initQueue } from "./runtime/queue.js";
import { initDomObserver } from "./observer/domObserver.js";
import { scanSlots } from "./runtime/slotScanner.js";

(function startSimulator() {
  if (typeof window === "undefined") return;

  console.log("adsense-simulator initialized");

  initQueue();
  initDomObserver();

  // initial scan
  setTimeout(() => {
    scanSlots();
  }, 0);
})();
