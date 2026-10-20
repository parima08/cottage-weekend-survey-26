(() => {
  const el = document.querySelector("#map");
  const routes = window.CW26_ROUTES;
  if (!el || !routes || !window.L) return;

  const START = [37.3382, -121.8863];
  const ends = { auburn: routes.auburn[routes.auburn.length - 1], paicines: routes.paicines[routes.paicines.length - 1] };
  const colors = { auburn: "#a14f2a", paicines: "#3f7a4a" };
  const isTouch = L.Browser.touch || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  const map = L.map(el, { scrollWheelZoom: false, dragging: !isTouch, touchZoom: !isTouch, tap: false, zoomSnap: 0.25, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const label = (name, side) => L.divIcon({ className: `map-label ${side}`, html: `<span>${name}</span>`, iconSize: null });
  ["auburn", "paicines"].forEach((key) => {
    L.polyline(routes[key], { color: colors[key], weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(map);
    L.circleMarker(ends[key], { radius: 8, color: "#fff", weight: 3, fillColor: colors[key], fillOpacity: 1 }).addTo(map);
    L.marker(ends[key], { icon: key === "auburn" ? label("Auburn", "above") : label("Paicines", "below"), interactive: false, keyboard: false }).addTo(map);
  });
  L.circleMarker(START, { radius: 8, color: "#fff", weight: 3, fillColor: "#2f251b", fillOpacity: 1 }).addTo(map);
  L.marker(START, { icon: label("San Jose", "left"), interactive: false, keyboard: false }).addTo(map);

  const fit = () => map.fitBounds(L.latLngBounds([START, ends.auburn, ends.paicines]), { paddingTopLeft: [40, 40], paddingBottomRight: [40, 56], maxZoom: 9 });
  fit();
  window.addEventListener("resize", () => { map.invalidateSize(); fit(); });
})();
