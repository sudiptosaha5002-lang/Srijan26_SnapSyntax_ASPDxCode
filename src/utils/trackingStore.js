export const TRACKING_STORAGE_KEY = "trucklogistic-tracking-shipments";
export const USER_SHIPMENT_SOURCES = ["booking", "manual"];

export function defaultRouteFromDistance(distance = 60) {
  const span = Math.max(0.012, Math.min(0.038, Number(distance || 60) / 4200));
  return [
    [22.5726, 88.3639],
    [22.5764, 88.3691],
    [22.5813, 88.3762],
    [22.5877, 88.3846],
    [22.5941, 88.3942],
    [22.6016, 88.3639 + span],
  ];
}

export function inferEtaWindow(distance = 0) {
  const hours = Math.max(2, Math.round(Number(distance || 0) / 22));
  const minutes = Math.max(0, Math.min(55, Math.round((((Number(distance || 0) % 22) / 22) * 60) / 5) * 5));
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function createShipmentFromBooking({
  bookingId,
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  contactName,
  phone,
  distance,
  products,
  chosenTruck,
  total,
  priority,
  insurance,
  totalWeight,
  totalVolume,
  media,
}) {
  const packageCount = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const firstProduct = products[0]?.name || "General cargo";
  const route = defaultRouteFromDistance(distance);
  const capacityUsed = Math.max(18, Math.min(94, Math.round((Number(totalVolume || 0) / Math.max(chosenTruck.capacity, 1)) * 100)));
  const progress = 6;
  const etaWindow = inferEtaWindow(distance);

  return {
    id: bookingId,
    customer: contactName,
    origin: pickup,
    destination: dropoff,
    status: "At Hub",
    eta: `${pickupDate} ${pickupTime}`,
    driver: "Dispatch assignment pending",
    truckLabel: `${chosenTruck.name} booking`,
    truckType: chosenTruck.name,
    progress,
    capacityUsed,
    distance: `${distance} km`,
    etaWindow,
    lastCheckpoint: "Booking confirmed from customer portal",
    cargo: packageCount > 1 ? `${firstProduct} + ${packageCount - 1} items` : firstProduct,
    incidents: 0,
    photos: [media.fleetOne, media.fleetTwo, media.fleetThree, media.fleetFour],
    route,
    documentation: [
      `Booking confirmed for ${pickupDate} at ${pickupTime}`,
      insurance ? "Cargo insurance enabled" : "Standard protection enabled",
      priority ? "Priority dispatch requested" : "Standard dispatch queue active",
    ],
    company: {
      name: contactName,
      contact: phone,
      account: "Customer booking portal",
    },
    billing: {
      mode: "Prepaid booking",
      invoice: bookingId,
      amount: `$${Number(total || 0).toFixed(0)}`,
    },
    metrics: {
      packages: packageCount,
      exceptions: 0,
      temperature: "Ambient",
      fuel: "Pending dispatch",
    },
    source: "booking",
    createdAt: new Date().toISOString(),
    bookingMeta: {
      totalWeight,
      totalVolume,
      priority,
      insurance,
      pickupDate,
      pickupTime,
    },
  };
}

export function readStoredTrackingShipments() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TRACKING_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredTrackingShipments(shipments) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(shipments));
}

export function upsertStoredTrackingShipment(shipment) {
  const current = readStoredTrackingShipments();
  const next = [shipment, ...current.filter((item) => item.id !== shipment.id)];
  saveStoredTrackingShipments(next);
  return next;
}

export function filterPersistedShipments(shipments) {
  return shipments.filter((item) => USER_SHIPMENT_SOURCES.includes(item?.source));
}
