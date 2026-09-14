(function () {
  "use strict";

  var heroEl = document.querySelector(".hero--map");
  var mapEl = document.getElementById("hero-map");
  if (!heroEl || !mapEl || !window.L) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  var HARARE = [-17.8292, 31.0522];

  var map = L.map(mapEl, {
    center: HARARE,
    zoom: 14,
    minZoom: 12,
    maxZoom: 16,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    tap: false,
    fadeAnimation: false,
    attributionControl: true
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  var markerIcon = L.divIcon({
    className: "map-marker",
    html:
      '<span class="map-marker__pulse"></span>' +
      '<span class="map-marker__pin">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">' +
      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>' +
      '<circle cx="12" cy="10" r="3"></circle>' +
      "</svg>" +
      "</span>",
    iconSize: [38, 54],
    iconAnchor: [19, 54]
  });

  var marker = L.marker(map.getCenter(), { icon: markerIcon, interactive: false, keyboard: false }).addTo(map);

  var trailLayer = L.layerGroup().addTo(map);
  var trailPoints = [];
  var MAX_TRAIL = 16;

  function renderTrail() {
    trailLayer.clearLayers();
    trailPoints.forEach(function (latlng, i) {
      var t = (i + 1) / trailPoints.length;
      L.circleMarker(latlng, {
        radius: 2 + t * 2,
        weight: 0,
        fillColor: "#22d3ae",
        fillOpacity: t * 0.45,
        interactive: false
      }).addTo(trailLayer);
    });
  }

  var centerPt = map.latLngToContainerPoint(map.getCenter());
  var target = L.point(centerPt.x, centerPt.y);
  var current = L.point(centerPt.x, centerPt.y);
  var lastTrailStamp = 0;
  var rafId = null;

  function onPointerMove(clientX, clientY) {
    var rect = mapEl.getBoundingClientRect();
    target = L.point(clientX - rect.left, clientY - rect.top);
  }

  heroEl.addEventListener("mousemove", function (e) {
    if (prefersReducedMotion || isCoarsePointer) return;
    onPointerMove(e.clientX, e.clientY);
  });

  heroEl.addEventListener(
    "touchmove",
    function (e) {
      if (prefersReducedMotion || !e.touches || !e.touches.length) return;
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  var driftAngle = 0;

  function autonomousDrift() {
    driftAngle += 0.012;
    var base = map.latLngToContainerPoint(HARARE);
    target = L.point(base.x + Math.cos(driftAngle) * 70, base.y + Math.sin(driftAngle * 1.3) * 46);
  }

  function animate(timestamp) {
    if (isCoarsePointer) autonomousDrift();

    current.x += (target.x - current.x) * 0.06;
    current.y += (target.y - current.y) * 0.06;

    var latlng = map.containerPointToLatLng([current.x, current.y]);
    marker.setLatLng(latlng);

    if (timestamp - lastTrailStamp > 140) {
      lastTrailStamp = timestamp;
      trailPoints.push(latlng);
      if (trailPoints.length > MAX_TRAIL) trailPoints.shift();
      renderTrail();
    }

    rafId = window.requestAnimationFrame(animate);
  }

  if (prefersReducedMotion) {
    marker.setLatLng(map.getCenter());
  } else {
    rafId = window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", function () {
    map.invalidateSize();
  });

  window.addEventListener("beforeunload", function () {
    if (rafId) window.cancelAnimationFrame(rafId);
  });
})();
