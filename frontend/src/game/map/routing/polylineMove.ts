export function haversineM(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Returns a [lat,lng] point at distance distM along coords.
export function pointAlongPolyline(
  coords: [number, number][],
  distM: number
): [number, number] {
  if (!coords.length) return [0, 0];
  if (coords.length === 1) return coords[0];
  if (distM <= 0) return coords[0];

  let remaining = distM;

  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i];
    const b = coords[i + 1];
    const seg = haversineM(a, b);

    if (remaining <= seg) {
      const t = seg === 0 ? 0 : remaining / seg;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= seg;
  }

  return coords[coords.length - 1];
}
