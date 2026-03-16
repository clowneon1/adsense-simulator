import { scanSlots } from "../runtime/slotScanner.js";

export function initDomObserver() {
  const observer = new MutationObserver(() => {
    scanSlots();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
