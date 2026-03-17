export function logSimulatorStart(params) {
  console.info(
    "adsense-simulator: started",
    Object.keys(params).length ? params : "(no params)",
  );
}
