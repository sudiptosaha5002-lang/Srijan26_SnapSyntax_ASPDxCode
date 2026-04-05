import { motion } from "framer-motion";

function Metric({ label, value, unit, progress, accent }) {
  return (
    <motion.article
      className="metric-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span>{label}</span>
      <strong>
        {value}
        {unit ? <small>{unit}</small> : null}
      </strong>
      <div className="metric-bar">
        <motion.div
          className="metric-fill"
          animate={{ width: `${progress}%`, background: accent }}
          transition={{ duration: 0.45 }}
        />
      </div>
    </motion.article>
  );
}

export default function AnalyticsPanel({ analytics, selectedMission, simulationState, activeEvent }) {
  const etaMinutes = Math.max(Math.round(analytics.etaHours * 60), 0);
  return (
    <motion.section
      className="sim-card analytics-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 }}
    >
      <div className="sim-card-header">
        <div>
          <span className="sim-kicker">Live Analytics</span>
          <h3>Mission Telemetry</h3>
        </div>
        <span className="telemetry-pill">{selectedMission.reward}</span>
      </div>

      <div className="metrics-grid">
        <Metric label="Distance Covered" value={analytics.coveredKm.toFixed(1)} unit=" km" progress={simulationState.progress * 100} accent="linear-gradient(90deg, #2fe7ff, #5f7cff)" />
        <Metric label="Time Remaining" value={etaMinutes} unit=" min" progress={Math.max(10, 100 - simulationState.progress * 100)} accent="linear-gradient(90deg, #9a6bff, #5f7cff)" />
        <Metric label="Fuel Usage" value={analytics.fuelUsage.toFixed(0)} unit=" %" progress={analytics.fuelUsage} accent="linear-gradient(90deg, #ff9a5f, #ff5fa2)" />
        <Metric label="Efficiency" value={analytics.efficiency.toFixed(0)} unit=" %" progress={analytics.efficiency} accent="linear-gradient(90deg, #4fffbe, #2fe7ff)" />
      </div>

      <div className="mission-strip">
        <div>
          <span>Destination</span>
          <strong>{selectedMission.destination}</strong>
        </div>
        <div>
          <span>Cargo</span>
          <strong>{selectedMission.cargo}</strong>
        </div>
        <div>
          <span>State</span>
          <strong>{simulationState.completed ? "Delivered" : simulationState.isPaused ? "Paused" : "In Transit"}</strong>
        </div>
      </div>

      <motion.div
        className={`event-banner ${activeEvent ? "event-banner-active" : ""}`}
        animate={{ opacity: activeEvent ? 1 : 0.55 }}
      >
        <span>Dynamic Event</span>
        <strong>{activeEvent ? activeEvent.title : "No critical event in the corridor"}</strong>
        <p>{activeEvent ? activeEvent.description : "Route AI is monitoring weather, fuel, and road conditions."}</p>
      </motion.div>
    </motion.section>
  );
}
