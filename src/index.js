import { initQueue } from "./runtime/queue.js";
import { scanSlots } from "./runtime/slotScanner.js";
import { startDomObserver } from "./observer/domObserver.js";

function init() {
  initQueue();

  scanSlots();

  startDomObserver();
}

init();
