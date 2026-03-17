import { chooseAdSize } from "../engine/adSizeEngine.js";
import { renderAdClick } from "../utils/renderAdClick.js";
import { parseAdConfig } from "../utils/parseAdConfig.js";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getExplicitSize(slot) {
  const width = parseInt(slot.style.width);
  const height = parseInt(slot.style.height);

  if (!isNaN(width) && !isNaN(height)) {
    return { width, height };
  }

  return null;
}

export function renderAd(slot, cfg) {
  // Single consolidated render guard — replaces the old dual-flag pattern
  if (slot.dataset.adsenseSimulated === "true") {
    return;
  }

  slot.dataset.adsenseSimulated = "true";

  const config = parseAdConfig(slot, cfg);
  const explicit = getExplicitSize(slot);

  let width = 300;
  let height = 250;

  if (explicit) {
    width = explicit.width;
    height = explicit.height;
  } else {
    // Guard against detached slots (parentElement can be null)
    const parent = slot.parentElement;
    const containerWidth = parent ? parent.offsetWidth : 300;

    const size = chooseAdSize(containerWidth, config);

    width = size.width;
    height = size.height;
  }

  slot.style.display = "flex";
  slot.style.alignItems = "center";
  slot.style.justifyContent = "center";
  slot.style.background = "#0f172a";
  slot.style.color = "#e2e8f0";
  slot.style.border = "1px dashed #999";
  slot.style.fontFamily = "monospace";

  slot.style.width = width + "px";
  slot.style.height = height + "px";

  // Escape all config values to prevent XSS via innerHTML injection
  const safeClient = escapeHtml(config.client);
  const safeSlot = escapeHtml(config.slot);
  const safeFormat = escapeHtml(config.format);
  const safeSize = escapeHtml(width + "x" + height);

  slot.innerHTML = `
    <div style="padding:10px;width:100%">
    
      <div style="font-size:11px;color:#94a3b8">
        adsense-simulator
      </div>

      <div style="margin-top:6px;font-size:12px">

        <div><b>client:</b> ${safeClient}</div>
        <div><b>slot:</b> ${safeSlot}</div>
        <div><b>size:</b> ${safeSize}</div>
        <div><b>format:</b> ${safeFormat}</div>

      </div>

    </div>
  `;

  slot.onclick = () => {
    const adData = {
      slot: config.slot,
      client: config.client,
      size: width + "x" + height,
      format: config.format,
      containerWidth: slot.parentElement ? slot.parentElement.offsetWidth : "unknown",
      page: window.location.pathname,
      timestamp: new Date().toLocaleString(),
    };
    const html = renderAdClick(adData);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };
}
