import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import OperationsSidebar from "./OperationsSidebar";
import { media } from "../data";
import { filterPersistedShipments, readStoredTrackingShipments, saveStoredTrackingShipments } from "../utils/trackingStore";

const initialShipments = [
  {
    id: "SD-752049247",
    customer: "Right Direction Retail",
    origin: "Kolkata Dispatch Hub",
    destination: "Watson Distribution Yard",
    status: "On Route",
    eta: "08:30 AM",
    driver: "M. Lewis",
    truckLabel: "Truck 12",
    truckType: "Heavy Truck",
    progress: 59,
    capacityUsed: 59,
    distance: "89 km",
    etaWindow: "8h 51m",
    lastCheckpoint: "Sector 5 Scan Gate",
    cargo: "Mixed consumer stock",
    incidents: 1,
    photos: [media.fleetOne, media.fleetTwo, media.fleetThree, media.fleetFour],
    route: [
      [22.5726, 88.3639],
      [22.5783, 88.3711],
      [22.5839, 88.3792],
      [22.5904, 88.3922],
      [22.5968, 88.4054],
      [22.6042, 88.4198],
    ],
    documentation: ["Invoice uploaded", "Driver license validated", "Insurance cleared"],
    company: { name: "Right Direction Retail", contact: "ops@rightdirection.ai", account: "Enterprise Plus" },
    billing: { mode: "Contract billing", invoice: "INV-24051", amount: "$18,400" },
    metrics: { packages: 126, exceptions: 2, temperature: "18 C", fuel: "74%" },
  },
  {
    id: "AL-119384307",
    customer: "Apollo Labs",
    origin: "Bidhannagar Pharma Bay",
    destination: "North Diagnostic Center",
    status: "At Hub",
    eta: "10:10 AM",
    driver: "S. Carter",
    truckLabel: "Van 04",
    truckType: "Urban Van",
    progress: 34,
    capacityUsed: 42,
    distance: "42 km",
    etaWindow: "4h 15m",
    lastCheckpoint: "Beliaghata Dock",
    cargo: "Medical shipments",
    incidents: 0,
    photos: [media.fleetThree, media.fleetOne, media.fleetFour, media.fleetTwo],
    route: [
      [22.5726, 88.3639],
      [22.5689, 88.359],
      [22.5636, 88.352],
      [22.558, 88.3445],
      [22.5531, 88.338],
    ],
    documentation: ["Cold-chain checklist ready", "Client signature pending", "Dock slot confirmed"],
    company: { name: "Apollo Labs", contact: "dispatch@apollolabs.com", account: "Priority medical" },
    billing: { mode: "Milestone billing", invoice: "INV-24062", amount: "$12,250" },
    metrics: { packages: 84, exceptions: 0, temperature: "16 C", fuel: "82%" },
  },
  {
    id: "XB-954383162",
    customer: "Mercury Commerce",
    origin: "Port Intake Gate",
    destination: "Lakeview Crossdock",
    status: "Delayed",
    eta: "11:35 AM",
    driver: "D. Green",
    truckLabel: "Truck 08",
    truckType: "Box Truck",
    progress: 21,
    capacityUsed: 48,
    distance: "112 km",
    etaWindow: "11h 20m",
    lastCheckpoint: "Rain corridor south",
    cargo: "Apparel cartons",
    incidents: 3,
    photos: [media.fleetTwo, media.fleetThree, media.fleetOne, media.fleetFour],
    route: [
      [22.5726, 88.3639],
      [22.565, 88.3701],
      [22.5561, 88.378],
      [22.5495, 88.3864],
      [22.544, 88.394],
    ],
    documentation: ["Delay note submitted", "Weather alert attached", "Support escalation open"],
    company: { name: "Mercury Commerce", contact: "routing@mercurycommerce.com", account: "Growth" },
    billing: { mode: "Per shipment", invoice: "INV-24070", amount: "$9,860" },
    metrics: { packages: 203, exceptions: 5, temperature: "22 C", fuel: "63%" },
  },
  {
    id: "SD-752841347",
    customer: "Delta Supply Chain",
    origin: "Central Freight Park",
    destination: "Aurora Warehouse 5",
    status: "On Route",
    eta: "01:05 PM",
    driver: "J. Hall",
    truckLabel: "Truck 19",
    truckType: "Long Haul",
    progress: 67,
    capacityUsed: 76,
    distance: "156 km",
    etaWindow: "6h 40m",
    lastCheckpoint: "Bridge toll corridor",
    cargo: "Electronics and white goods",
    incidents: 1,
    photos: [media.fleetFour, media.fleetTwo, media.fleetThree, media.fleetOne],
    route: [
      [22.5726, 88.3639],
      [22.5818, 88.3692],
      [22.5895, 88.3771],
      [22.6012, 88.3886],
      [22.6153, 88.4012],
      [22.6281, 88.4154],
    ],
    documentation: ["Container seal verified", "Fuel stop recorded", "Warehouse prep initiated"],
    company: { name: "Delta Supply Chain", contact: "fleet@deltasupply.io", account: "National lane" },
    billing: { mode: "Monthly settlement", invoice: "INV-24074", amount: "$22,110" },
    metrics: { packages: 164, exceptions: 1, temperature: "20 C", fuel: "71%" },
  },
  {
    id: "AL-198143203",
    customer: "Zenith Grocery",
    origin: "Fresh Chain Dock",
    destination: "Midtown Market Cluster",
    status: "Delivered",
    eta: "Completed",
    driver: "A. Price",
    truckLabel: "Reefer 02",
    truckType: "Cold Van",
    progress: 100,
    capacityUsed: 37,
    distance: "61 km",
    etaWindow: "Completed",
    lastCheckpoint: "Proof of delivery uploaded",
    cargo: "Cold chain food crates",
    incidents: 0,
    photos: [media.fleetThree, media.fleetFour, media.fleetOne, media.fleetTwo],
    route: [
      [22.5726, 88.3639],
      [22.5756, 88.3562],
      [22.5774, 88.3495],
      [22.5791, 88.3418],
      [22.5807, 88.334],
    ],
    documentation: ["POD uploaded", "Client sign-off complete", "Invoice released"],
    company: { name: "Zenith Grocery", contact: "receiving@zenithgrocery.com", account: "Cold chain" },
    billing: { mode: "Delivered billing", invoice: "INV-24045", amount: "$7,540" },
    metrics: { packages: 58, exceptions: 0, temperature: "4 C", fuel: "55%" },
  },
  {
    id: "SD-428122207",
    customer: "Vertex Hardware",
    origin: "Howrah Industrial Zone",
    destination: "Dock East Bulk Yard",
    status: "On Route",
    eta: "03:20 PM",
    driver: "L. Turner",
    truckLabel: "Truck 24",
    truckType: "Heavy Carrier",
    progress: 53,
    capacityUsed: 68,
    distance: "133 km",
    etaWindow: "7h 05m",
    lastCheckpoint: "Canal road merge",
    cargo: "Industrial fittings",
    incidents: 2,
    photos: [media.fleetOne, media.fleetFour, media.fleetTwo, media.fleetThree],
    route: [
      [22.5726, 88.3639],
      [22.5799, 88.3582],
      [22.586, 88.352],
      [22.5911, 88.3468],
      [22.5974, 88.3407],
      [22.6033, 88.3353],
    ],
    documentation: ["Manifest synced", "Bulk loading approved", "Dock request queued"],
    company: { name: "Vertex Hardware", contact: "dispatch@vertexhardware.co", account: "Industrial contract" },
    billing: { mode: "Net 30", invoice: "INV-24080", amount: "$19,680" },
    metrics: { packages: 142, exceptions: 2, temperature: "21 C", fuel: "66%" },
  },
];

const filters = ["All", "On Route", "At Hub", "Delayed", "Delivered"];
const sourceFilters = ["All Records", "Bookings", "Operations"];
const detailTabs = ["Shipping Info", "Route", "Documentation", "Company", "Billing"];
function mergeShipments(baseShipments, storedShipments) {
  const merged = new Map();

  baseShipments.forEach((shipment) => {
    if (shipment?.id) merged.set(shipment.id, { ...shipment, source: shipment.source ?? "demo" });
  });

  storedShipments.forEach((shipment) => {
    if (shipment?.id) merged.set(shipment.id, shipment);
  });

  return Array.from(merged.values());
}

function createAlternateRoute(route) {
  return route.map(([lat, lng], index) => [lat + (index % 2 === 0 ? 0.0024 : -0.0016), lng + 0.0048]);
}

function ShipmentTile({ item, active, onSelect }) {
  return (
    <motion.button
      type="button"
      className={`ops-shipment-tile ${active ? "ops-shipment-tile-active" : ""}`}
      onClick={() => onSelect(item.id)}
      whileHover={{ y: -3 }}
    >
      <div className="ops-shipment-head">
        <strong>{item.id}</strong>
        <span className={`ops-status ops-status-${item.status.toLowerCase().replace(/\s+/g, "-")}`}>{item.status}</span>
      </div>
      <img src={media.truckImage} alt={item.truckType} className="ops-shipment-vehicle" />
      <div className="ops-shipment-meta">
        <span>{item.customer}</span>
        <span>{item.truckLabel}</span>
      </div>
      <div className="ops-mini-list">
        <div><span>Progress</span><strong>{item.progress}%</strong></div>
        <div><span>ETA</span><strong>{item.eta}</strong></div>
      </div>
    </motion.button>
  );
}

function CapacityVisual({ value }) {
  return (
    <div className="ops-capacity-stage">
      <img src={media.truckImage} alt="Truck capacity visualization" className="ops-capacity-truck" />
      <div className="ops-capacity-meter">
        <div className="ops-capacity-meter-bar">
          <motion.div className="ops-capacity-meter-fill" animate={{ width: `${value}%` }} transition={{ duration: 0.45 }} />
        </div>
        <strong>{value}%</strong>
        <span>Current Truck Capacity</span>
      </div>
    </div>
  );
}

function RouteMap({ shipment, useAlternate }) {
  const route = useAlternate ? createAlternateRoute(shipment.route) : shipment.route;
  const center = route[Math.floor(route.length / 2)];
  const truckPosition = route[Math.max(0, Math.floor((route.length - 1) * shipment.progress / 100))];

  return (
    <div className="ops-map-shell">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="leaflet-host ops-leaflet-host">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={route} pathOptions={{ color: "#5f7cff", weight: 5 }} />
        {useAlternate ? <Polyline positions={shipment.route} pathOptions={{ color: "#7cffbe", weight: 3, dashArray: "6 8", opacity: 0.55 }} /> : null}
        <CircleMarker center={route[0]} radius={8} pathOptions={{ color: "#7cffbe", fillColor: "#7cffbe", fillOpacity: 1 }} />
        <CircleMarker center={route.at(-1)} radius={8} pathOptions={{ color: "#ff9a62", fillColor: "#ff9a62", fillOpacity: 1 }} />
        <CircleMarker center={truckPosition} radius={10} pathOptions={{ color: "#f7fbff", fillColor: "#4eb7ff", fillOpacity: 1 }} />
      </MapContainer>
    </div>
  );
}

function PhotoStrip({ photos, onUpload }) {
  const inputRef = useRef(null);

  return (
    <div className="ops-photo-grid">
      {photos.map((photo, index) => (
        <div key={`${photo}-${index}`} className="ops-photo-card">
          <img src={photo} alt={`Cargo report ${index + 1}`} />
          <span>Report {index + 1}</span>
        </div>
      ))}
      <button type="button" className="ops-upload-card" onClick={() => inputRef.current?.click()}>Upload Proof</button>
      <input
        ref={inputRef}
        className="ops-hidden-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onUpload(reader.result);
          reader.readAsDataURL(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="ops-modal-backdrop" onClick={onClose}>
      <div className="ops-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ops-modal-head">
          <div>
            <span className="sim-kicker">Tracking Workflow</span>
            <h3>{title}</h3>
          </div>
          <button type="button" className="secondary-action" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ShipmentForm({ initialValue, onSubmit, submitLabel }) {
  const [form, setForm] = useState(initialValue);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="ops-form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <label className="field"><span>Tracking ID</span><input value={form.id} onChange={(event) => update("id", event.target.value.toUpperCase())} /></label>
      <label className="field"><span>Customer</span><input value={form.customer} onChange={(event) => update("customer", event.target.value)} /></label>
      <label className="field"><span>Origin</span><input value={form.origin} onChange={(event) => update("origin", event.target.value)} /></label>
      <label className="field"><span>Destination</span><input value={form.destination} onChange={(event) => update("destination", event.target.value)} /></label>
      <label className="field"><span>Status</span><select value={form.status} onChange={(event) => update("status", event.target.value)}>{filters.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label className="field"><span>ETA</span><input value={form.eta} onChange={(event) => update("eta", event.target.value)} /></label>
      <label className="field"><span>Driver</span><input value={form.driver} onChange={(event) => update("driver", event.target.value)} /></label>
      <label className="field"><span>Truck Label</span><input value={form.truckLabel} onChange={(event) => update("truckLabel", event.target.value)} /></label>
      <label className="field"><span>Truck Type</span><input value={form.truckType} onChange={(event) => update("truckType", event.target.value)} /></label>
      <label className="field"><span>Cargo</span><input value={form.cargo} onChange={(event) => update("cargo", event.target.value)} /></label>
      <label className="field"><span>Progress</span><input type="range" min="0" max="100" value={form.progress} onChange={(event) => update("progress", Number(event.target.value))} /></label>
      <label className="field"><span>Capacity Used</span><input type="range" min="0" max="100" value={form.capacityUsed} onChange={(event) => update("capacityUsed", Number(event.target.value))} /></label>
      <div className="ops-form-actions">
        <button type="submit" className="primary-action">{submitLabel}</button>
      </div>
    </form>
  );
}

function getNewShipmentTemplate() {
  return {
    id: `TL-${Math.floor(100000000 + Math.random() * 900000000)}`,
    customer: "New Client",
    origin: "Dispatch Origin",
    destination: "Delivery Destination",
    status: "At Hub",
    eta: "05:45 PM",
    driver: "New Driver",
    truckLabel: "Truck 30",
    truckType: "Medium Truck",
    progress: 18,
    capacityUsed: 45,
    distance: "74 km",
    etaWindow: "5h 10m",
    lastCheckpoint: "Task created from control board",
    cargo: "General cargo",
    incidents: 0,
    photos: [media.fleetOne, media.fleetTwo],
    route: [
      [22.5726, 88.3639],
      [22.576, 88.3685],
      [22.5824, 88.377],
      [22.5897, 88.3881],
      [22.598, 88.4002],
    ],
    documentation: ["Task created", "Awaiting manifest upload", "Awaiting dock confirmation"],
    company: { name: "New Client", contact: "ops@newclient.com", account: "Standard" },
    billing: { mode: "Pending", invoice: "Draft", amount: "$0" },
    metrics: { packages: 24, exceptions: 0, temperature: "20 C", fuel: "88%" },
    source: "manual",
    createdAt: new Date().toISOString(),
  };
}

export default function TrackingDashboard({ theme, onToggleTheme }) {
  const [shipments, setShipments] = useState(() => mergeShipments(initialShipments, readStoredTrackingShipments()));
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSourceFilter, setActiveSourceFilter] = useState("All Records");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(() => mergeShipments(initialShipments, readStoredTrackingShipments())[0]?.id ?? initialShipments[0].id);
  const [activeTab, setActiveTab] = useState("Shipping Info");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [useAlternateRoute, setUseAlternateRoute] = useState(false);
  const [toast, setToast] = useState("");

  const visibleShipments = useMemo(() => {
    const safeQuery = query.trim().toLowerCase();
    return shipments.filter((item) => {
      const matchesFilter = activeFilter === "All" || item.status === activeFilter;
      const matchesSource = activeSourceFilter === "All Records"
        || (activeSourceFilter === "Bookings" && item.source === "booking")
        || (activeSourceFilter === "Operations" && item.source !== "booking");
      const matchesQuery = !safeQuery || [item.id, item.customer, item.destination, item.origin, item.truckType].some((value) => value.toLowerCase().includes(safeQuery));
      return matchesFilter && matchesSource && matchesQuery;
    });
  }, [activeFilter, activeSourceFilter, query, shipments]);

  const selectedShipment = visibleShipments.find((item) => item.id === selectedId) ?? shipments.find((item) => item.id === selectedId) ?? shipments[0];
  const deliveredCount = shipments.filter((item) => item.status === "Delivered").length;
  const liveCount = shipments.filter((item) => item.status === "On Route").length;
  const bookingCount = shipments.filter((item) => item.source === "booking").length;
  const operationsCount = shipments.filter((item) => item.source !== "booking").length;
  const historyShipments = shipments.filter((item) => item.source !== "demo");

  useEffect(() => {
    saveStoredTrackingShipments(filterPersistedShipments(shipments));
  }, [shipments]);

  function showMessage(message) {
    setToast(message);
    window.clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = window.setTimeout(() => setToast(""), 2400);
  }

  function updateShipment(updatedShipment) {
    setShipments((current) => current.map((item) => (item.id === updatedShipment.id ? { ...item, ...updatedShipment } : item)));
  }

  function renderTabContent() {
    if (!selectedShipment) return null;

    if (activeTab === "Route") {
      return (
        <div className="ops-tab-panel">
          <div className="ops-tab-grid">
            <article className="ops-mini-card sim-card"><span className="sim-kicker">Checkpoint</span><strong>{selectedShipment.lastCheckpoint}</strong><p>Route is synced with current route selection.</p></article>
            <article className="ops-mini-card sim-card"><span className="sim-kicker">ETA Window</span><strong>{selectedShipment.etaWindow}</strong><p>{useAlternateRoute ? "Alternate route is active." : "Primary route is active."}</p></article>
          </div>
        </div>
      );
    }

    if (activeTab === "Documentation") {
      return (
        <div className="ops-tab-panel ops-list-panel">
          {selectedShipment.documentation.map((item) => <div key={item} className="ops-list-row">{item}</div>)}
        </div>
      );
    }

    if (activeTab === "Company") {
      return (
        <div className="ops-tab-panel ops-tab-grid">
          <article className="ops-mini-card sim-card"><span className="sim-kicker">Company</span><strong>{selectedShipment.company.name}</strong><p>{selectedShipment.company.account}</p></article>
          <article className="ops-mini-card sim-card"><span className="sim-kicker">Contact</span><strong>{selectedShipment.company.contact}</strong><p>Account contact for this shipment.</p></article>
        </div>
      );
    }

    if (activeTab === "Billing") {
      return (
        <div className="ops-tab-panel ops-tab-grid">
          <article className="ops-mini-card sim-card"><span className="sim-kicker">Billing Mode</span><strong>{selectedShipment.billing.mode}</strong><p>{selectedShipment.billing.invoice}</p></article>
          <article className="ops-mini-card sim-card"><span className="sim-kicker">Amount</span><strong>{selectedShipment.billing.amount}</strong><p>Ready for customer review.</p></article>
        </div>
      );
    }

    return (
      <div className="ops-tab-panel ops-tab-grid">
        <article className="ops-mini-card sim-card"><span className="sim-kicker">Origin</span><strong>{selectedShipment.origin}</strong><p>Dispatch point for this shipment.</p></article>
        <article className="ops-mini-card sim-card"><span className="sim-kicker">Destination</span><strong>{selectedShipment.destination}</strong><p>Final handoff destination.</p></article>
      </div>
    );
  }

  if (!selectedShipment) return null;

  return (
    <>
      <div className="ops-page-shell">
        <OperationsSidebar theme={theme} onToggleTheme={onToggleTheme} />

        <main className="ops-main-grid">
          <section className="ops-board-panel glass-panel">
            <div className="ops-board-head">
              <div className="ops-title-block">
                <span className="sim-kicker">Tracking</span>
                <h1>Shipment command board</h1>
              </div>
              <div className="ops-board-actions">
                <input className="ops-search" type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tracking ID, customer, destination" />
                <button type="button" className="secondary-action" onClick={() => setShowFilterModal(true)}>Edit filters</button>
                <button type="button" className="primary-action" onClick={() => setShowTaskModal(true)}>New tracking task</button>
              </div>
            </div>

            <div className="ops-filter-row">
              {filters.map((filter) => (
                <button key={filter} type="button" className={`chip ${activeFilter === filter ? "chip-active" : ""}`} onClick={() => setActiveFilter(filter)}>
                  {filter}
                </button>
              ))}
            </div>

            <div className="ops-filter-row ops-record-filter-row">
              {sourceFilters.map((filter) => (
                <button key={filter} type="button" className={`chip ${activeSourceFilter === filter ? "chip-active" : ""}`} onClick={() => setActiveSourceFilter(filter)}>
                  {filter}
                </button>
              ))}
            </div>

            <div className="ops-summary-row">
              <article className="stat-chip"><strong>{shipments.length}</strong><span>Total loads</span></article>
              <article className="stat-chip"><strong>{liveCount}</strong><span>Live routes</span></article>
              <article className="stat-chip"><strong>{deliveredCount}</strong><span>Delivered</span></article>
              <article className="stat-chip"><strong>{bookingCount}</strong><span>Bookings</span></article>
              <article className="stat-chip"><strong>{operationsCount}</strong><span>Operations</span></article>
              <article className="stat-chip"><strong>96.8%</strong><span>Success score</span></article>
            </div>

            <div className="ops-tile-grid">
              {visibleShipments.map((item) => (
                <ShipmentTile key={item.id} item={item} active={selectedShipment.id === item.id} onSelect={(id) => { setSelectedId(id); setActiveTab("Shipping Info"); }} />
              ))}
            </div>
          </section>

          <section className="ops-detail-panel glass-panel">
            <div className="ops-detail-head">
              <div className="ops-title-block">
                <span className="sim-kicker">Tracking Detail</span>
                <h2>{selectedShipment.id}</h2>
              </div>
              <div className="ops-detail-actions">
                <span className={`status-badge ${selectedShipment.status === "On Route" ? "status-live" : ""}`}>{selectedShipment.status}</span>
                <button type="button" className="secondary-action" onClick={() => setShowEditModal(true)}>Edit form</button>
              </div>
            </div>

            <div className="ops-tab-row">
              {detailTabs.map((tab) => (
                <button key={tab} type="button" className={`ops-tab ${activeTab === tab ? "ops-tab-active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>

            {renderTabContent()}

            <section className="ops-detail-section">
              <div className="ops-section-head">
                <h3>Current Truck Capacity</h3>
                <span>{selectedShipment.distance}</span>
              </div>
              <CapacityVisual value={selectedShipment.capacityUsed} />
            </section>

            <section className="ops-detail-section">
              <div className="ops-section-head">
                <h3>Route</h3>
                <div className="ops-route-meta">
                  <span>{selectedShipment.etaWindow}</span>
                  <button
                    type="button"
                    className="telemetry-pill"
                    onClick={() => {
                      setUseAlternateRoute((current) => !current);
                      showMessage(useAlternateRoute ? "Primary route restored" : "Alternate route activated");
                    }}
                  >
                    {useAlternateRoute ? "Use Primary" : "Change Route"}
                  </button>
                </div>
              </div>
              <RouteMap shipment={selectedShipment} useAlternate={useAlternateRoute} />
            </section>

            <section className="ops-detail-section">
              <div className="ops-section-head">
                <h3>Cargo Photo Reports</h3>
                <span>Recent uploads</span>
              </div>
              <PhotoStrip
                photos={selectedShipment.photos}
                onUpload={(photoUrl) => {
                  updateShipment({ ...selectedShipment, photos: [photoUrl, ...selectedShipment.photos].slice(0, 5), lastCheckpoint: "Cargo proof uploaded from dashboard" });
                  showMessage("Cargo proof uploaded");
                }}
              />
            </section>

            <section className="ops-detail-section ops-request-grid">
              <article className="sim-card ops-mini-card">
                <span className="sim-kicker">Route Requests</span>
                <strong>{useAlternateRoute ? "Alternate route active" : "Reroute advisory pending"}</strong>
                <p>{selectedShipment.lastCheckpoint}</p>
              </article>
              <article className="sim-card ops-mini-card">
                <span className="sim-kicker">Cargo</span>
                <strong>{selectedShipment.cargo}</strong>
                <p>{selectedShipment.metrics.packages} packages in active manifest.</p>
              </article>
            </section>
          </section>

          <section className="ops-analytics-panel glass-panel">
            <div className="ops-detail-head">
              <div className="ops-title-block">
                <span className="sim-kicker">Operations Intelligence</span>
                <h2>Live shipment snapshot</h2>
              </div>
              <Link className="secondary-action" to="/">Back Home</Link>
            </div>

            <div className="ops-kpi-grid">
              <article className="metric-card"><span>Driver</span><strong>{selectedShipment.driver}</strong></article>
              <article className="metric-card"><span>Vehicle</span><strong>{selectedShipment.truckType}</strong></article>
              <article className="metric-card"><span>Fuel</span><strong>{selectedShipment.metrics.fuel}</strong></article>
              <article className="metric-card"><span>Temperature</span><strong>{selectedShipment.metrics.temperature}</strong></article>
            </div>

            <div className="ops-insight-list">
              <article className="ops-insight-card">
                <span className="sim-kicker">Checkpoint</span>
                <strong>{selectedShipment.lastCheckpoint}</strong>
                <p>Last scanned node on the route network.</p>
              </article>
              <article className="ops-insight-card">
                <span className="sim-kicker">Exceptions</span>
                <strong>{selectedShipment.metrics.exceptions}</strong>
                <p>Operational alerts currently attached to this shipment.</p>
              </article>
              <article className="ops-insight-card">
                <span className="sim-kicker">Capacity Load</span>
                <strong>{selectedShipment.capacityUsed}%</strong>
                <p>Truck volume allocation versus planned route load.</p>
              </article>
            </div>

            <section className="ops-detail-section ops-history-section">
              <div className="ops-section-head">
                <h3>Booking and order history</h3>
                <span>{historyShipments.length} records</span>
              </div>
              {historyShipments.length ? (
                <div className="ops-history-grid">
                  {historyShipments.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`ops-history-card ${selectedShipment.id === item.id ? "ops-history-card-active" : ""}`}
                      onClick={() => {
                        setSelectedId(item.id);
                        setActiveTab("Shipping Info");
                      }}
                    >
                      <div className="ops-history-card-head">
                        <strong>{item.id}</strong>
                        <span className={`ops-status ops-status-${item.status.toLowerCase().replace(/\s+/g, "-")}`}>{item.status}</span>
                      </div>
                      <span>{item.origin} to {item.destination}</span>
                      <div className="ops-mini-list">
                        <div><span>Truck</span><strong>{item.truckType}</strong></div>
                        <div><span>Source</span><strong>{item.source === "booking" ? "Booking" : "Order"}</strong></div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="ops-empty-history">New bookings and created orders will appear here automatically.</div>
              )}
            </section>
          </section>
        </main>
      </div>

      {showFilterModal ? (
        <Modal title="Adjust filters" onClose={() => setShowFilterModal(false)}>
          <div className="ops-modal-body">
            <div className="ops-filter-row">
              {filters.map((filter) => (
                <button key={filter} type="button" className={`chip ${activeFilter === filter ? "chip-active" : ""}`} onClick={() => setActiveFilter(filter)}>{filter}</button>
              ))}
            </div>
            <label className="field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type customer, route, or truck type" /></label>
            <div className="ops-form-actions"><button type="button" className="primary-action" onClick={() => { setShowFilterModal(false); showMessage("Filters updated"); }}>Apply filters</button></div>
          </div>
        </Modal>
      ) : null}

      {showTaskModal ? (
        <Modal title="Create tracking task" onClose={() => setShowTaskModal(false)}>
          <ShipmentForm
            initialValue={getNewShipmentTemplate()}
            submitLabel="Create task"
            onSubmit={(form) => {
              const created = {
                ...getNewShipmentTemplate(),
                ...form,
                company: { name: form.customer, contact: "ops@clientmail.com", account: "Standard" },
                billing: { mode: "Pending", invoice: "Draft", amount: "$0" },
              };
              setShipments((current) => [created, ...current]);
              setSelectedId(created.id);
              setShowTaskModal(false);
              showMessage(`Tracking task ${created.id} created`);
            }}
          />
        </Modal>
      ) : null}

      {showEditModal ? (
        <Modal title="Edit shipment form" onClose={() => setShowEditModal(false)}>
          <ShipmentForm
            initialValue={selectedShipment}
            submitLabel="Save changes"
            onSubmit={(form) => {
              const updated = {
                ...selectedShipment,
                ...form,
                company: { ...selectedShipment.company, name: form.customer },
              };
              updateShipment(updated);
              setSelectedId(updated.id);
              setShowEditModal(false);
              showMessage(`Shipment ${updated.id} updated`);
            }}
          />
        </Modal>
      ) : null}

      {toast ? <div className="ops-toast">{toast}</div> : null}
    </>
  );
}







