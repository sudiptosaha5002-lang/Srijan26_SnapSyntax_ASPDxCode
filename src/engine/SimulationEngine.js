const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpVector3(from, to, alpha) {
  return [
    lerp(from[0], to[0], alpha),
    lerp(from[1], to[1], alpha),
    lerp(from[2], to[2], alpha),
  ];
}

export function calculateRouteDistance(route) {
  let total = 0;
  for (let index = 1; index < route.length; index += 1) {
    const [ax, ay, az] = route[index - 1];
    const [bx, by, bz] = route[index];
    total += Math.hypot(bx - ax, by - ay, bz - az);
  }
  return total;
}

export function getRoutePosition(route, progress) {
  if (!route.length) {
    return { point: [0, 0, 0], heading: 0 };
  }

  const safeProgress = clamp(progress, 0, 1);
  const scaled = safeProgress * (route.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(index + 1, route.length - 1);
  const localT = scaled - index;
  const point = lerpVector3(route[index], route[nextIndex], localT);
  const [cx, , cz] = route[index];
  const [nx, , nz] = route[nextIndex];
  const heading = Math.atan2(nz - cz, nx - cx);

  return { point, heading };
}

export function deriveAnalytics({ progress, routeDistance, speedKph, fuelLevel, cargoMass }) {
  const covered = routeDistance * progress;
  const remaining = routeDistance - covered;
  const etaHours = remaining / Math.max(speedKph, 1);
  const efficiency = clamp(100 - (cargoMass / 28 + (100 - fuelLevel) * 0.35), 56, 97);

  return {
    coveredKm: covered,
    remainingKm: remaining,
    etaHours,
    fuelUsage: 100 - fuelLevel,
    efficiency,
  };
}

export function tickSimulation({
  delta,
  state,
  selectedTruck,
  routeDistance,
  activeEvent,
}) {
  if (!state.isRunning || state.isPaused) {
    return state;
  }

  const weatherFactor =
    state.weather === "rain" ? 0.72 : state.weather === "fog" ? 0.84 : 1;
  const eventFactor = activeEvent?.speedFactor ?? 1;
  const performanceFactor = 1 + selectedTruck.performance.speedBoost;
  const speedKph =
    selectedTruck.baseSpeedKph *
    state.speedMultiplier *
    weatherFactor *
    eventFactor *
    performanceFactor;

  const scenePaceMultiplier = 14;
  const distancePerSecond = (speedKph / 3600) * scenePaceMultiplier;
  const progressStep = distancePerSecond / Math.max(routeDistance, 1);
  const nextProgress = clamp(state.progress + progressStep * delta, 0, 1);

  const fuelDrain =
    delta *
    (0.16 + state.speedMultiplier * 0.08 + selectedTruck.performance.fuelBias);
  const nextFuel = clamp(state.fuelLevel - fuelDrain, 0, 100);
  const nextTimeOfDay = (state.timeOfDay + delta * 0.003 * state.speedMultiplier) % 1;

  return {
    ...state,
    progress: nextProgress,
    fuelLevel: nextFuel,
    timeOfDay: nextTimeOfDay,
    speedKph,
    completed: nextProgress >= 1,
  };
}

export function createInitialSimulationState() {
  return {
    isRunning: false,
    isPaused: false,
    progress: 0,
    fuelLevel: 100,
    timeOfDay: 0.18,
    speedMultiplier: 1,
    weather: "clear",
    cameraMode: "follow",
    speedKph: 0,
    completed: false,
    routeVariant: "primary",
  };
}
