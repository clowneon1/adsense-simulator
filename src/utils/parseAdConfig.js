export function parseAdConfig(slot) {
  const format = slot.dataset.adFormat || "fixed";
  const layout = slot.dataset.adLayout || null;
  const fullWidthResponsive = slot.dataset.fullWidthResponsive === "true";

  return {
    format,
    layout,
    fullWidthResponsive,
  };
}
