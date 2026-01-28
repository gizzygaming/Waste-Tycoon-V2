import polyline from "@mapbox/polyline";

export async function getOSRMRoute(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=polyline&steps=false`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const r = data?.routes?.[0];
  if (!r) return null;

  const coords = polyline.decode(r.geometry).map(([lat, lng]) => [lat, lng]);
  return { coords, distanceM: r.distance, durationS: r.duration };
}
