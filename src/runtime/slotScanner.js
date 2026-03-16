import { validateAdConfig } from "../utils/validator.js";
import { renderAd } from "../renderer/adRenderer.js";
import { logError } from "../utils/errors.js";

export function scanSlots() {
  const slots = document.querySelectorAll(".adsbygoogle");

  slots.forEach((slot) => {
    try {
      if (slot.__adsense_simulated__) return;

      const config = validateAdConfig(slot);

      renderAd(slot, config);

      slot.__adsense_simulated__ = true;
    } catch (err) {
      logError(err);
    }
  });
}
