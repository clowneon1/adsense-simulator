import { scanSlots } from "./slotScanner.js";

let currentUrl = location.href;

export function startUrlWatcher() {
  setInterval(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;

      resetSlots();

      scanSlots();
    }
  }, 300);
}

function resetSlots() {
  document.querySelectorAll(".adsbygoogle").forEach((slot) => {
    delete slot.dataset.adsenseSimulated;
    delete slot.__adsense_seen_at__;
  });
}
