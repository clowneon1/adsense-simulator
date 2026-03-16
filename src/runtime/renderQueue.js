const queue = new Set();
let scheduled = false;

export function queueSlotRender(slot, renderer, config) {
  queue.add({ slot, renderer, config });

  if (!scheduled) {
    scheduled = true;

    requestAnimationFrame(flushQueue);
  }
}

function flushQueue() {
  scheduled = false;

  for (const item of queue) {
    const { slot, renderer, config } = item;

    renderer(slot, config);
  }

  queue.clear();
}
