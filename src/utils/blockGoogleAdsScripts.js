export function blockGoogleAdsScripts() {
  const isAdsense = (src) => src && src.includes("adsbygoogle.js");

  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;
  const originalSetAttribute = Element.prototype.setAttribute;

  Node.prototype.appendChild = function (node) {
    if (node.tagName === "SCRIPT" && isAdsense(node.src)) {
      console.info("adsense-simulator: blocked Google AdSense script");
      return node;
    }

    return originalAppendChild.call(this, node);
  };

  Node.prototype.insertBefore = function (node, ref) {
    if (node.tagName === "SCRIPT" && isAdsense(node.src)) {
      console.info("adsense-simulator: blocked Google AdSense script");
      return node;
    }

    return originalInsertBefore.call(this, node, ref);
  };

  Element.prototype.setAttribute = function (name, value) {
    if (this.tagName === "SCRIPT" && name === "src" && isAdsense(value)) {
      console.info("adsense-simulator: blocked Google AdSense script");
      return;
    }

    return originalSetAttribute.call(this, name, value);
  };
}
