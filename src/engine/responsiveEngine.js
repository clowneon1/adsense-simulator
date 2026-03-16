export function chooseAdSize(containerWidth) {
  if (containerWidth < 400) {
    return { width: 320, height: 50 };
  }

  if (containerWidth < 700) {
    return { width: 468, height: 60 };
  }

  if (containerWidth < 1000) {
    return { width: 728, height: 90 };
  }

  return { width: 970, height: 250 };
}
