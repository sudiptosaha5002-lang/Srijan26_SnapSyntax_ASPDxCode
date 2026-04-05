const eventCatalog = [
  {
    type: "roadblock",
    title: "Roadblock detected",
    description: "Traffic AI found a blocked freight corridor. Switching to the alternate route.",
    duration: 12,
    speedFactor: 0.82,
    mutate(state) {
      return { ...state, routeVariant: "alternate" };
    },
    resolve(state) {
      return { ...state, routeVariant: "primary" };
    },
  },
  {
    type: "fuel-low",
    title: "Fuel low pit stop",
    description: "The truck enters a smart refuel stop before continuing the mission.",
    duration: 8,
    speedFactor: 0,
    mutate(state) {
      return { ...state, isPaused: true };
    },
    resolve(state) {
      return { ...state, isPaused: false, fuelLevel: 92 };
    },
  },
  {
    type: "rain",
    title: "Heavy rain front",
    description: "Weather intensity increases. Adaptive cruise slows the truck for safer routing.",
    duration: 14,
    speedFactor: 0.58,
    mutate(state) {
      return { ...state, weather: "rain" };
    },
    resolve(state) {
      return { ...state, weather: "clear" };
    },
  },
  {
    type: "breakdown",
    title: "Suspension check",
    description: "A mechanical anomaly was detected. Repair drones pause the convoy briefly.",
    duration: 10,
    speedFactor: 0,
    mutate(state) {
      return { ...state, isPaused: true };
    },
    resolve(state) {
      return { ...state, isPaused: false };
    },
  },
];

export function maybeCreateEvent({
  elapsed,
  activeEvent,
  progress,
  fuelLevel,
  weather,
}) {
  if (activeEvent || progress <= 0.02 || progress >= 0.96) {
    return null;
  }

  if (fuelLevel < 28) {
    return eventCatalog.find((event) => event.type === "fuel-low");
  }

  if (elapsed % 18 > 1) {
    return null;
  }

  const roll = Math.random();
  if (roll < 0.2 && weather !== "rain") {
    return eventCatalog.find((event) => event.type === "rain");
  }
  if (roll < 0.38) {
    return eventCatalog.find((event) => event.type === "roadblock");
  }
  if (roll < 0.48) {
    return eventCatalog.find((event) => event.type === "breakdown");
  }

  return null;
}

export function activateEvent(event, state) {
  if (!event) {
    return { state, runtimeEvent: null };
  }

  return {
    state: event.mutate(state),
    runtimeEvent: {
      ...event,
      startedAt: performance.now(),
      endsAt: performance.now() + event.duration * 1000,
    },
  };
}

export function resolveEvent(runtimeEvent, state) {
  if (!runtimeEvent) {
    return state;
  }

  return runtimeEvent.resolve(state);
}
