import { validateAdConfig } from "../utils/validator.js";
import { renderAd } from "../renderer/adRenderer.js";
import { logError } from "../utils/errors.js";
import { queueSlotRender } from "./renderQueue.js";

export function scanSlots() {
  const slots = document.querySelectorAll(".adsbygoogle");

  for (const slot of slots) {
    try {
      if (slot.dataset.adsenseSimulated === "true") continue;

      const config = validateAdConfig(slot);

      queueSlotRender(slot, renderAd, config);

      slot.dataset.adsenseSimulated = "true";
    } catch (err) {
      logError(err);
    }
  }
}
