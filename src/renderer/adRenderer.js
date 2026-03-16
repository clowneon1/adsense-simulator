import { chooseAdSize } from "../engine/adSizeEngine.js";
import { renderAdClick } from "../utils/renderAdClick.js";
import { parseAdConfig } from "../utils/parseAdConfig.js";

function getExplicitSize(slot) {
  const width = parseInt(slot.style.width);
  const height = parseInt(slot.style.height);

  if (width && height) {
    return { width, height };
  }

  return null;
}

export function renderAd(slot, config) {
  const explicit = getExplicitSize(slot);

  let width;
  let height;

  if (explicit) {
    width = explicit.width;
    height = explicit.height;
  } else if (config.format === "auto") {
    const containerWidth = slot.parentElement.offsetWidth;

    const config = parseAdConfig(slot);

    const size = chooseAdSize(containerWidth, config);

    const width = size.width;
    const height = size.height;

    slot.style.width = width + "px";
    slot.style.height = height + "px";
  } else {
    width = 300;
    height = 250;
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

  slot.addEventListener("click", () => {
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

    const win = window.open("", "_blank");

    win.document.open();
    win.document.write(html);
    win.document.close();
  });
}
