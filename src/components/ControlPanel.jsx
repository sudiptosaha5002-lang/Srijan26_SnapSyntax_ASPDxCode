import { motion } from "framer-motion";

export default function ControlPanel({
  trucks,
  missions,
  selectedTruck,
  selectedMission,
  cameraModes,
  speedOptions,
  weatherModes,
  timeModes,
  customization,
  simulationState,
  onTruckChange,
  onMissionChange,
  onCustomizationChange,
  onStart,
  onPauseToggle,
  onReset,
  onCameraChange,
  onSpeedChange,
  onWeatherChange,
  onTimeChange,
  qualityProfile,
}) {
  return (
    <motion.section
      className="sim-card control-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="sim-card-header">
        <div>
          <span className="sim-kicker">Mission Console</span>
          <h3>Launch Control</h3>
        </div>
        <div className="panel-status-stack">
          <span className={`status-badge ${simulationState.isRunning ? "status-live" : ""}`}>
            {simulationState.isRunning ? (simulationState.isPaused ? "Paused" : "Live") : "Standby"}
          </span>
          <span className="telemetry-pill">{qualityProfile.label} quality</span>
        </div>
      </div>

      <label className="field">
        <span>Truck Selection</span>
        <select value={selectedTruck.id} onChange={(event) => onTruckChange(event.target.value)}>
          {trucks.map((truck) => (
            <option key={truck.id} value={truck.id}>{truck.name}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Delivery Assignment</span>
        <select value={selectedMission.id} onChange={(event) => onMissionChange(event.target.value)}>
          {missions.map((mission) => (
            <option key={mission.id} value={mission.id}>{mission.label}</option>
          ))}
        </select>
      </label>

      <div className="button-row">
        <button className="neo-button primary" type="button" onClick={onStart}>Start</button>
        <button className="neo-button" type="button" onClick={onPauseToggle}>{simulationState.isPaused ? "Resume" : "Pause"}</button>
        <button className="neo-button" type="button" onClick={onReset}>Reset</button>
      </div>

      <div className="control-group">
        <span>Simulation Speed</span>
        <div className="chip-row">
          {speedOptions.map((value) => (
            <button key={value} className={`chip ${simulationState.speedMultiplier === value ? "chip-active" : ""}`} type="button" onClick={() => onSpeedChange(value)}>
              {value}x
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span>Camera Mode</span>
        <div className="chip-row">
          {cameraModes.map((mode) => (
            <button key={mode.id} className={`chip ${simulationState.cameraMode === mode.id ? "chip-active" : ""}`} type="button" onClick={() => onCameraChange(mode.id)}>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span>Weather</span>
        <div className="chip-row">
          {weatherModes.map((mode) => (
            <button key={mode} className={`chip ${simulationState.weather === mode ? "chip-active" : ""}`} type="button" onClick={() => onWeatherChange(mode)}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span>Time of Day</span>
        <div className="chip-row">
          {timeModes.map((mode) => (
            <button key={mode.label} className={`chip ${Math.abs(simulationState.timeOfDay - mode.id) < 0.02 ? "chip-active" : ""}`} type="button" onClick={() => onTimeChange(mode.id)}>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-grid">
        <label className="field">
          <span>Truck Color</span>
          <input type="color" value={customization.color} onChange={(event) => onCustomizationChange("color", event.target.value)} />
        </label>

        <label className="field">
          <span>Speed Boost</span>
          <input type="range" min="-0.1" max="0.25" step="0.01" value={customization.speedBoost} onChange={(event) => onCustomizationChange("speedBoost", Number(event.target.value))} />
        </label>

        <label className="field">
          <span>Fuel Bias</span>
          <input type="range" min="-0.1" max="0.15" step="0.01" value={customization.fuelBias} onChange={(event) => onCustomizationChange("fuelBias", Number(event.target.value))} />
        </label>

        <label className="field">
          <span>Upload Logo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => onCustomizationChange("logoUrl", reader.result);
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </div>
    </motion.section>
  );
}
