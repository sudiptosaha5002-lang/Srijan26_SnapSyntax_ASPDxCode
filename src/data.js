const asset = (path) => new URL(`../assets/${path}`, import.meta.url).href;

export const media = {
  heroVideo: asset("homepage.mp4"),
  operationsVideo: asset("4291727-uhd_3840_2160_25fps.mp4"),
  sustainabilityVideo: asset("4292902-uhd_3840_2160_25fps.mp4"),
  routeVideo: asset("map/8829615-uhd_2160_3840_30fps.mp4"),
  routePoster: asset("map/pexels-geojango-maps-50965933-7663519.jpg"),
  truckImage: asset("hero_truck.png"),
  mapBackdrop: asset("map_backdrop.png"),
  fleetOne: asset("pexels-esmihel-12418932.jpg"),
  fleetTwo: asset("pexels-esmihel-12418935.jpg"),
  fleetThree: asset("pexels-feliart-6940962.jpg"),
  fleetFour: asset("pexels-canmiless-5860937.jpg"),
  loginVideo: asset("pov 1st.mp4"),
};

export const services = [
  {
    title: "Smart Freight Planning",
    body: "Plan multi-stop shipments with live capacity hints, lower emissions, and route-aware scheduling.",
  },
  {
    title: "Fleet Visibility",
    body: "Track truck readiness, utilization, and dispatch confidence from one soft-control dashboard.",
  },
  {
    title: "Predictive Delivery",
    body: "Get ETA signals, risk flags, and recommendation cards before delays turn into support issues.",
  },
  {
    title: "Warehouse Sync",
    body: "Coordinate packaging, loading, and handoff timing with lightweight workflow cards.",
  },
];

export const landingStats = [
  { label: "On-time dispatch", value: "98.2%" },
  { label: "Active fleet", value: "124 trucks" },
  { label: "Daily route scans", value: "18k+" },
  { label: "Avg. cost reduction", value: "14%" },
];

export const cargoSuggestions = [
  { id: 1, name: "Electronics crate", weight: 80, quantity: 6, volume: 28.8 },
  { id: 2, name: "Retail pallet", weight: 42, quantity: 10, volume: 16.5 },
];

export const fleetOptions = [
  { id: "van", name: "Small Van", capacity: 42, tone: "Compact urban drops" },
  { id: "medium", name: "Medium Truck", capacity: 120, tone: "Best price-to-load ratio" },
  { id: "heavy", name: "Heavy Transport", capacity: 240, tone: "High-volume cargo lanes" },
];

export const routeStops = [
  { time: "09:10", title: "Dispatch verified", detail: "Warehouse 7, Kolkata hub" },
  { time: "11:35", title: "Regional checkpoint", detail: "Signal quality stable, no reroute" },
  { time: "14:05", title: "Fuel and rest window", detail: "Driver compliance confirmed" },
  { time: "16:40", title: "Dock prep initiated", detail: "Client unloading bay reserved" },
];

export const couriers = [
  { name: "DHL Express Saver", eta: "1-2 days", rating: "4.8", price: "$124" },
  { name: "FedEx Freight", eta: "3-5 days", rating: "4.5", price: "$89" },
  { name: "City Transporters", eta: "Same day", rating: "4.1", price: "$145" },
];

export const shipments = {
  TL789456123: {
    shipmentId: "TL789456123",
    customer: "Nova Retail Group",
    orderDate: "April 4, 2026",
    deliveryDate: "April 8, 2026",
    weight: "245 kg",
    dimensions: "120cm x 80cm x 60cm",
    driverName: "John Mitchell",
    driverVehicle: "Truck #45 - Mercedes Actros",
    driverPhone: "+1 (555) 987-6543",
    distanceTraveled: "1250 km",
    remainingDistance: "650 km",
    eta: "04:20 PM",
    status: "In Transit",
    progress: 65,
    routeNote: "Weather clear across the eastern corridor.",
  },
  TL456789012: {
    shipmentId: "TL456789012",
    customer: "Urban Foods Co.",
    orderDate: "April 1, 2026",
    deliveryDate: "April 3, 2026",
    weight: "180 kg",
    dimensions: "100cm x 60cm x 50cm",
    driverName: "Sarah Johnson",
    driverVehicle: "Truck #22 - Volvo FH16",
    driverPhone: "+1 (555) 456-7890",
    distanceTraveled: "1900 km",
    remainingDistance: "0 km",
    eta: "Delivered",
    status: "Delivered",
    progress: 100,
    routeNote: "Completed with no incidents and a 12-minute early arrival.",
  },
  TL123654789: {
    shipmentId: "TL123654789",
    customer: "Metro Supply Chain",
    orderDate: "April 3, 2026",
    deliveryDate: "April 7, 2026",
    weight: "320 kg",
    dimensions: "140cm x 90cm x 80cm",
    driverName: "Michael Chen",
    driverVehicle: "Truck #67 - MAN TGX",
    driverPhone: "+1 (555) 234-5678",
    distanceTraveled: "800 km",
    remainingDistance: "500 km",
    eta: "06:45 PM",
    status: "In Transit",
    progress: 62,
    routeNote: "Traffic density is elevated near the last regional handoff.",
  },
};

export const faqs = [
  {
    question: "How often is tracking refreshed?",
    answer: "The demo simulates status changes every few seconds and keeps the shipment profile live in-memory.",
  },
  {
    question: "Can I change the delivery address?",
    answer: "Yes. The platform is designed to surface address-change workflows before the final dispatch lock.",
  },
  {
    question: "Is every shipment insured?",
    answer: "Every load includes baseline protection, with premium coverage tiers available for sensitive cargo.",
  },
];
