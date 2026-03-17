import { initQueue } from "./runtime/queue.js";
import { scanSlots } from "./runtime/slotScanner.js";
import { startDomObserver } from "./observer/domObserver.js";
import { startUrlWatcher } from "./runtime/urlWatcher.js";
import { logSimulatorStart } from "./utils/logger.js";
import { blockGoogleAdsScripts, installQueueTrap } from "./utils/blockGoogleAdsScripts.js";

function startRuntime() {
  startDomObserver();
  startUrlWatcher();
  scanSlots();
}

function getScriptParams() {
  const script = document.currentScript;

  if (!script) return {};

  const params = {};

  // Read query string params first (works for local/non-CDN usage)
  try {
    const url = new URL(script.src);
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (_) {
    // src may be empty or relative in some environments — safe to ignore
  }

  // Read data-* attributes and merge over query params.
  // CDNs (jsDelivr, unpkg) strip query strings before serving files,
  // so data attributes are the only reliable config channel for CDN users.
  // Data attributes take precedence over query string on conflict.
  //
  // Mapping: data-remove-google-ads="true" → params.removeGoogleAds = "true"
  for (const attr of script.attributes) {
    if (attr.name.startsWith("data-")) {
      const key = attr.name
        .slice(5)
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      params[key] = attr.value;
    }
  }

  return params;
}

export function init() {
  const params = getScriptParams();
  logSimulatorStart(params);

  const shouldBlock = params.removeGoogleAds === "true";

  if (shouldBlock) {
    // Layers 1 + 3: intercept createElement and start MutationObserver blocker.
    // These run before initQueue() so any AdSense scripts injected during
    // queue init are already caught.
    blockGoogleAdsScripts();
  }

  // Set up window.adsbygoogle queue
  initQueue();

  if (shouldBlock) {
    // Layer 4: now that initQueue() has created window.adsbygoogle,
    // install the property trap around it so real AdSense cannot replace it.
    installQueueTrap(window.adsbygoogle);
  }

  startRuntime();
}

init();
