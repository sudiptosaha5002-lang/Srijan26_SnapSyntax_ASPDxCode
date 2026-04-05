import { motion } from "framer-motion";

function buildRecommendation({ truck, mission, weather, event, efficiency }) {
  if (event?.type === "roadblock") {
    return `Switching ${truck.name} to the alternate corridor keeps ${mission.label} stable despite the roadblock.`;
  }
  if (weather === "rain") {
    return `${truck.name} remains the safest choice for ${mission.cargo} because its grip profile is better under rain slowdown conditions.`;
  }
  if (efficiency > 86) {
    return `${truck.name} is currently the optimal truck for ${mission.destination}, with excellent energy efficiency and timing confidence.`;
  }
  return `For ${mission.label}, the AI suggests a smoother throttle profile and tighter route discipline to recover efficiency before final delivery.`;
}

export default function AIRecommendationPanel({ selectedTruck, selectedMission, simulationState, activeEvent, analytics }) {
  const recommendation = buildRecommendation({
    truck: selectedTruck,
    mission: selectedMission,
    weather: simulationState.weather,
    event: activeEvent,
    efficiency: analytics.efficiency,
  });

  return (
    <motion.section
      className="sim-card recommendation-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <div className="sim-card-header">
        <div>
          <span className="sim-kicker">AI Recommendation</span>
          <h3>Strategic Guidance</h3>
        </div>
        <span className="telemetry-pill">AI Live</span>
      </div>

      <p className="recommendation-copy">{recommendation}</p>

      <div className="recommendation-grid">
        <article>
          <span>Best Truck</span>
          <strong>{selectedTruck.name}</strong>
        </article>
        <article>
          <span>Best Route</span>
          <strong>{simulationState.routeVariant === "alternate" ? "Adaptive Alternate" : "Primary High-Speed"}</strong>
        </article>
        <article>
          <span>Payload Match</span>
          <strong>{selectedMission.loadMass}t / {selectedTruck.cargoCapacity}t</strong>
        </article>
      </div>
    </motion.section>
  );
}
