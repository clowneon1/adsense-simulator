import { initQueue } from "./runtime/queue.js";
import { scanSlots } from "./runtime/slotScanner.js";
import { startDomObserver } from "./observer/domObserver.js";
import { startUrlWatcher } from "./runtime/urlWatcher.js";
import { logSimulatorStart } from "./utils/logger.js";
import { blockGoogleAdsScripts } from "./utils/blockGoogleAdsScripts.js";

function startRuntime() {
  startDomObserver();
  startUrlWatcher();
  scanSlots();
}

function getScriptParams() {
  const script = document.currentScript;

  if (!script) return {};

  const url = new URL(script.src);

  const params = {};

  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

export function init() {
  const params = getScriptParams();
  logSimulatorStart(params);

  if (params.removeGoogleAds === "true") {
    blockGoogleAdsScripts();
  }
  initQueue();

  startRuntime();
}

init();
