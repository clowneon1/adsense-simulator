let observer = null;

function isAdsenseScript(node) {
  return (
    node instanceof HTMLScriptElement &&
    node.src &&
    node.src.includes("adsbygoogle.js")
  );
}

export function blockGoogleAdsScripts() {
  if (observer) return;

  // Block already-present AdSense script tags
  document.querySelectorAll('script[src*="adsbygoogle.js"]').forEach((el) => {
    el.remove();
    console.info("adsense-simulator: removed existing Google AdSense script");
  });

  // Use MutationObserver to intercept dynamically injected AdSense scripts
  // This avoids fragile global prototype monkey-patching
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (isAdsenseScript(node)) {
          node.remove();
          console.info("adsense-simulator: blocked Google AdSense script");
        }

        // Also check child nodes in case a container was inserted
        if (node instanceof HTMLElement) {
          node
            .querySelectorAll('script[src*="adsbygoogle.js"]')
            .forEach((child) => {
              child.remove();
              console.info("adsense-simulator: blocked Google AdSense script");
            });
        }
      }
    }
  });

  const target = document.documentElement || document.body;

  observer.observe(target, {
    childList: true,
    subtree: true,
  });
}

export function unblockGoogleAdsScripts() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
