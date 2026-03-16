export class SimulatorError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "AdsenseSimulatorError";
    this.meta = meta;
  }
}

export function logError(err) {
  if (err instanceof SimulatorError) {
    console.error("[adsense-simulator]", err.message, err.meta);
    return;
  }

  console.error("[adsense-simulator]", err);
}

export function throwError(message, meta = {}) {
  throw new SimulatorError(message, meta);
}
