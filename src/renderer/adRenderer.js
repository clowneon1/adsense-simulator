import { chooseAdSize } from "../engine/adSizeEngine.js";
import { renderAdClick } from "../utils/renderAdClick.js";
import { parseAdConfig } from "../utils/parseAdConfig.js";

function getExplicitSize(slot) {
  const width = parseInt(slot.style.width);
  const height = parseInt(slot.style.height);

  if (!isNaN(width) && !isNaN(height)) {
    return { width, height };
  }

  return null;
}

export function renderAd(slot, cfg) {
  const config = parseAdConfig(slot, cfg);
  const explicit = getExplicitSize(slot);

  let width = 300;
  let height = 250;

  if (explicit) {
    width = explicit.width;
    height = explicit.height;
  } else {
    const containerWidth = slot.parentElement.offsetWidth;

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

  slot.innerHTML = `
    <div style="padding:10px;width:100%">
    
      <div style="font-size:11px;color:#94a3b8">
        adsense-simulator
      </div>

      <div style="margin-top:6px;font-size:12px">

        <div><b>client:</b> ${config.client}</div>
        <div><b>slot:</b> ${config.slot}</div>
        <div><b>size:</b> ${width}x${height}</div>
        <div><b>format:</b> ${config.format}</div>

      </div>

    </div>
  `;

  slot.onclick = () => {
    const adData = {
      slot: config.slot,
      client: config.client,
      size: width + "x" + height,
      format: config.format,
      containerWidth: slot.parentElement.offsetWidth,
      page: window.location.pathname,
      timestamp: new Date().toLocaleString(),
    };
    const html = renderAdClick(adData);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };
}
