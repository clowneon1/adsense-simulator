import { scanSlots } from "./slotScanner.js";

export function initQueue() {
  window.adsbygoogle = window.adsbygoogle || [];

  const queue = window.adsbygoogle;
  const originalPush = queue.push.bind(queue);

  queue.push = function (...args) {
    const result = originalPush(...args);

    setTimeout(() => {
      scanSlots();
    }, 0);

    return result;
  };
}
