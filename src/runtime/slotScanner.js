import { validateAdConfig } from "../utils/validator.js";
import { renderAd } from "../renderer/adRenderer.js";
import { logError } from "../utils/errors.js";

const BROKEN_SLOT_TIMEOUT = 2000;
const MAX_RETRIES = 5;

export function scanSlots() {
  const slots = document.querySelectorAll(".adsbygoogle");

  let retryNeeded = false;

  for (const slot of slots) {
    try {
      if (slot.dataset.adsenseSimulated === "true") continue;

      const client = slot.getAttribute("data-ad-client");
      const slotId = slot.getAttribute("data-ad-slot");

      if (!slot.__adsense_seen_at__) {
        slot.__adsense_seen_at__ = Date.now();
        slot.__adsense_retry_count__ = 0;
      }

      if (!client || !slotId) {
        const elapsed = Date.now() - slot.__adsense_seen_at__;
        const retries = slot.__adsense_retry_count__ || 0;

        if (elapsed > BROKEN_SLOT_TIMEOUT || retries >= MAX_RETRIES) {
          let message = "adsense-simulator: ";

          if (!client && !slotId) {
            message += "data-ad-client and data-ad-slot are required";
          } else if (!client) {
            message += "data-ad-client is required";
          } else {
            message += "data-ad-slot is required";
          }

          logError(new Error(message));

          // Mark as simulated so we stop retrying this broken slot
          slot.dataset.adsenseSimulated = "true";
        } else {
          slot.__adsense_retry_count__ = retries + 1;
          retryNeeded = true;
        }

        continue;
      }

      const config = validateAdConfig(slot);

      renderAd(slot, config);
    } catch (err) {
      logError(err);
    }
  }

  if (retryNeeded) {
    setTimeout(scanSlots, 500);
  }
}
