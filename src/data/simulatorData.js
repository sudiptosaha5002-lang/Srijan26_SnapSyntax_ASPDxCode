export const truckCatalog = [
  {
    id: "neo-hauler",
    name: "Neo Hauler XR",
    modelPath: "/models/truck-quad.glb",
    accent: "#57b7ff",
    summary: "Balanced long-haul truck with stable fuel behavior and agile cornering.",
    baseSpeedKph: 76,
    cargoCapacity: 24,
    recommendedFor: "Regional electronics and premium retail lanes",
    defaultColor: "#4f7cff",
    performance: {
      speedBoost: 0.04,
      fuelBias: 0.02,
    },
  },
  {
    id: "storm-runner",
    name: "Storm Runner GT",
    modelPath: "/models/truck-triangle.glb",
    accent: "#9f7bff",
    summary: "Fast-response truck designed for high-priority deliveries and cinematic sprints.",
    baseSpeedKph: 89,
    cargoCapacity: 18,
    recommendedFor: "Time-critical pharmaceutical and express freight",
    defaultColor: "#6f3cff",
    performance: {
      speedBoost: 0.12,
      fuelBias: 0.08,
    },
  },
  {
    id: "cargo-titan",
    name: "Cargo Titan HX",
    modelPath: "/models/truck-daf.glb",
    accent: "#57ffd6",
    summary: "Heavy logistics rig with superb fuel efficiency and stability under payload stress.",
    baseSpeedKph: 68,
    cargoCapacity: 38,
    recommendedFor: "Industrial freight, warehouse-to-port routes, high-mass cargo",
    defaultColor: "#16a085",
    performance: {
      speedBoost: -0.03,
      fuelBias: -0.05,
    },
  },
];

export const deliveryMissions = [
  {
    id: "aurora-port",
    label: "Aurora Port Delivery",
    cargo: "Medical electronics",
    destination: "Aurora Port Warehouse",
    loadMass: 12,
    reward: "$18,400",
    routeGeo: [
      [22.5726, 88.3639],
      [22.585, 88.3775],
      [22.601, 88.408],
      [22.628, 88.433],
      [22.646, 88.462],
    ],
    alternateGeo: [
      [22.5726, 88.3639],
      [22.579, 88.352],
      [22.598, 88.361],
      [22.621, 88.398],
      [22.646, 88.462],
    ],
    route3D: [
      [-18, 0, 10],
      [-10, 0, 12],
      [-4, 0, 8],
      [5, 0, 1],
      [12, 0, -6],
      [18, 0, -14],
      [24, 0, -20],
    ],
    alternate3D: [
      [-18, 0, 10],
      [-14, 0, 4],
      [-8, 0, -2],
      [0, 0, -1],
      [10, 0, -10],
      [18, 0, -16],
      [24, 0, -20],
    ],
  },
  {
    id: "neon-valley",
    label: "Neon Valley Express",
    cargo: "Luxury retail cargo",
    destination: "Neon Valley Distribution Hub",
    loadMass: 8,
    reward: "$12,900",
    routeGeo: [
      [22.5726, 88.3639],
      [22.561, 88.341],
      [22.548, 88.322],
      [22.536, 88.294],
      [22.523, 88.271],
    ],
    alternateGeo: [
      [22.5726, 88.3639],
      [22.567, 88.351],
      [22.555, 88.336],
      [22.54, 88.309],
      [22.523, 88.271],
    ],
    route3D: [
      [-20, 0, -10],
      [-12, 0, -8],
      [-4, 0, -6],
      [4, 0, -4],
      [12, 0, -8],
      [20, 0, -12],
      [28, 0, -18],
    ],
    alternate3D: [
      [-20, 0, -10],
      [-14, 0, -12],
      [-7, 0, -14],
      [2, 0, -9],
      [10, 0, -12],
      [18, 0, -15],
      [28, 0, -18],
    ],
  },
];

export const cameraModes = [
  { id: "follow", label: "Follow Cam" },
  { id: "top", label: "Top View" },
  { id: "free", label: "Free Orbit" },
  { id: "cinematic", label: "Cinematic" },
];

export const speedOptions = [1, 2, 5];

export const weatherModes = ["clear", "rain", "fog"];

export const timeModes = [
  { id: 0.18, label: "Dawn" },
  { id: 0.42, label: "Day" },
  { id: 0.74, label: "Dusk" },
  { id: 0.92, label: "Night" },
];




