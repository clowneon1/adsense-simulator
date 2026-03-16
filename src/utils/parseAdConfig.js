export function parseAdConfig(slot, config = {}) {
  const format = slot.dataset.adFormat ?? config.format ?? "fixed";

  const layout = slot.dataset.adLayout ?? config.layout ?? null;

  const fullWidthResponsive =
    slot.dataset.fullWidthResponsive !== undefined
      ? slot.dataset.fullWidthResponsive === "true"
      : (config.fullWidthResponsive ?? false);

  return {
    ...config,
    format,
    layout,
    fullWidthResponsive,
  };
}
