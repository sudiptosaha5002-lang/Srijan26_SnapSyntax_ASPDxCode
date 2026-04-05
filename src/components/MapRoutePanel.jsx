import { motion } from "framer-motion";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";

export default function MapRoutePanel({ route, truckPosition, alternateRoute, useAlternate }) {
  const center = route[0];

  return (
    <motion.section
      className="sim-card map-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16 }}
    >
      <div className="sim-card-header">
        <div>
          <span className="sim-kicker">Map Sync</span>
          <h3>Route Mirror</h3>
        </div>
        <span className="telemetry-pill">{useAlternate ? "Rerouted" : "Primary"}</span>
      </div>

      <div className="map-frame">
        <MapContainer center={center} zoom={12} scrollWheelZoom className="leaflet-host">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={route} pathOptions={{ color: "#36d7ff", weight: 5 }} />
          <Polyline positions={alternateRoute} pathOptions={{ color: "#9f7bff", weight: 3, dashArray: "8 10", opacity: 0.55 }} />
          <CircleMarker center={route[0]} radius={8} pathOptions={{ color: "#7cffbe", fillColor: "#7cffbe", fillOpacity: 0.9 }} />
          <CircleMarker center={route.at(-1)} radius={8} pathOptions={{ color: "#ff8c67", fillColor: "#ff8c67", fillOpacity: 0.9 }} />
          <CircleMarker center={truckPosition} radius={10} pathOptions={{ color: "#f0f8ff", fillColor: "#57b7ff", fillOpacity: 1 }} />
        </MapContainer>
      </div>
    </motion.section>
  );
}
