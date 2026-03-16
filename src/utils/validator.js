import { throwError } from "./errors.js";

export function validateAdConfig(el) {
  const client = el.getAttribute("data-ad-client");
  const slot = el.getAttribute("data-ad-slot");
  const format = el.getAttribute("data-ad-format") || "fixed";

  if (!client) {
    throwError("Missing required attribute: data-ad-client");
  }

  if (!client.startsWith("ca-pub-")) {
    throwError("Invalid data-ad-client format", { value: client });
  }

  if (!slot) {
    throwError("Missing required attribute: data-ad-slot");
  }

  if (!/^[0-9]+$/.test(slot)) {
    throwError("Invalid data-ad-slot", { value: slot });
  }

  return {
    client,
    slot,
    format,
  };
}
