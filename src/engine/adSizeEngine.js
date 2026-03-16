import { STANDARD_AD_SIZES } from "./adSizes.js";

function chooseFluidAd(containerWidth) {
  return {
    width: containerWidth,
    height: Math.round(containerWidth * 0.25),
  };
}

function chooseClosestStandard(containerWidth) {
  const candidates = STANDARD_AD_SIZES.filter(
    (size) => size.width <= containerWidth,
  ).sort((a, b) => b.width - a.width);

  if (candidates.length === 0) {
    return { width: 320, height: 50 };
  }

  return candidates[0];
}

function chooseResponsiveBreakpoint(containerWidth) {
  if (containerWidth < 400) {
    return { width: 320, height: 50 };
  }

  if (containerWidth < 600) {
    return { width: 300, height: 250 };
  }

  if (containerWidth < 900) {
    return { width: 728, height: 90 };
  }

  if (containerWidth < 1100) {
    return { width: 970, height: 90 };
  }

  return { width: 970, height: 250 };
}

function chooseLayoutAd(containerWidth, layout) {
  if (layout === "in-article") {
    return {
      width: containerWidth,
      height: Math.round(containerWidth * 0.35),
    };
  }

  if (layout === "in-feed") {
    return {
      width: containerWidth,
      height: Math.round(containerWidth * 0.3),
    };
  }

  return chooseResponsiveBreakpoint(containerWidth);
}

export function chooseAdSize(containerWidth, config = {}) {
  const format = config.format || "fixed";
  const layout = config.layout || null;
  const fullWidth = config.fullWidthResponsive || false;

  if (layout) {
    return chooseLayoutAd(containerWidth, layout);
  }

  if (format === "auto") {
    if (fullWidth) {
      return chooseFluidAd(containerWidth);
    }

    return chooseResponsiveBreakpoint(containerWidth);
  }

  return chooseClosestStandard(containerWidth);
}
