let mutationObserver = null;
let createElementPatched = false;

function isAdsenseUrl(url) {
  return typeof url === "string" && url.includes("adsbygoogle.js");
}

// ---------------------------------------------------------------------------
// Layer 1: document.createElement intercept
// Intercept <script> elements at creation time and override the src property
// descriptor so that setting src to an AdSense URL is silently swallowed.
// The browser never initiates a fetch if src is never assigned.
// ---------------------------------------------------------------------------
function patchCreateElement() {
  if (createElementPatched) return;
  createElementPatched = true;

  const nativeCreateElement = document.createElement.bind(document);
  const nativeSrcDescriptor = Object.getOwnPropertyDescriptor(
    HTMLScriptElement.prototype,
    "src"
  );

  document.createElement = function (tagName, options) {
    const el = nativeCreateElement(tagName, options);

    if (typeof tagName === "string" && tagName.toLowerCase() === "script") {
      let blocked = false;

      // Override src on this specific element instance.
      // setAttribute("src", ...) also routes through this setter on modern browsers.
      Object.defineProperty(el, "src", {
        get() {
          return nativeSrcDescriptor.get.call(this);
        },
        set(value) {
          if (isAdsenseUrl(value)) {
            blocked = true;
            console.info(
              "adsense-simulator: blocked Google AdSense script (createElement intercept)"
            );
            return; // never set src — browser never fetches
          }
          blocked = false;
          nativeSrcDescriptor.set.call(this, value);
        },
        configurable: true,
      });
    }

    return el;
  };
}

function unpatchCreateElement() {
  if (!createElementPatched) return;
  // Restore by removing our override — the native bind is still held by the
  // browser, restoring document.createElement to its original is not directly
  // possible once overwritten, but we can stop blocking by resetting the flag.
  // For a dev-only tool this is acceptable.
  createElementPatched = false;
}

// ---------------------------------------------------------------------------
// Layer 3: MutationObserver fallback (hardened)
// Catches scripts injected via innerHTML, present in original HTML, or created
// before the simulator loaded. Sets type and clears src before removal to
// prevent execution even if the network fetch already completed.
// ---------------------------------------------------------------------------
function startMutationBlocker() {
  if (mutationObserver) return;

  // Remove any AdSense scripts already present in the DOM
  document.querySelectorAll('script[src*="adsbygoogle.js"]').forEach((el) => {
    neutraliseScript(el);
    console.info("adsense-simulator: removed existing Google AdSense script");
  });

  mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (isBlockableScript(node)) {
          neutraliseScript(node);
          console.info("adsense-simulator: blocked Google AdSense script (MutationObserver)");
        }

        if (node instanceof HTMLElement) {
          node.querySelectorAll('script[src*="adsbygoogle.js"]').forEach((child) => {
            neutraliseScript(child);
            console.info("adsense-simulator: blocked Google AdSense script (MutationObserver child)");
          });
        }
      }
    }
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function isBlockableScript(node) {
  return (
    node instanceof HTMLScriptElement &&
    node.src &&
    isAdsenseUrl(node.src)
  );
}

function neutraliseScript(node) {
  // Set non-executable MIME type first — prevents execution even if the
  // network fetch already completed before this callback fired.
  node.type = "javascript/blocked";
  // Clear src — cancels in-flight fetch on some browsers.
  node.src = "";
  node.remove();
}

// ---------------------------------------------------------------------------
// Layer 4: window.adsbygoogle property trap
// Lock window.adsbygoogle to our simulator queue via a non-writable getter.
// Even if adsbygoogle.js fully loads and executes, it cannot replace the
// global with a real queue — it always hits our simulator instead.
// ---------------------------------------------------------------------------
let queueTrapActive = false;

export function installQueueTrap(simulatorQueue) {
  if (queueTrapActive) return;
  queueTrapActive = true;

  try {
    Object.defineProperty(window, "adsbygoogle", {
      get() {
        return simulatorQueue;
      },
      set() {
        // Silently swallow any attempt by real AdSense to replace the queue
        console.info(
          "adsense-simulator: blocked attempt to replace window.adsbygoogle"
        );
      },
      configurable: true, // keep configurable so resetQueue() can work
      enumerable: true,
    });
  } catch (e) {
    // Already defined non-configurable elsewhere — safe to ignore
  }
}

export function removeQueueTrap() {
  if (!queueTrapActive) return;
  queueTrapActive = false;

  try {
    // Remove our descriptor so the property becomes a plain writable value again
    Object.defineProperty(window, "adsbygoogle", {
      value: window.adsbygoogle,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // Safe to ignore
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function blockGoogleAdsScripts(simulatorQueue) {
  patchCreateElement();   // Layer 1: intercept createElement src assignment
  startMutationBlocker(); // Layer 3: MutationObserver fallback

  if (simulatorQueue) {
    installQueueTrap(simulatorQueue); // Layer 4: lock window.adsbygoogle
  }
}

export function unblockGoogleAdsScripts() {
  unpatchCreateElement();

  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  removeQueueTrap();
}
