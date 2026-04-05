import { Suspense, startTransition, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { activateEvent, maybeCreateEvent, resolveEvent } from "../engine/EventEngine";
import { calculateRouteDistance, createInitialSimulationState, deriveAnalytics, tickSimulation } from "../engine/SimulationEngine";
import { cameraModes, deliveryMissions, speedOptions, timeModes, truckCatalog, weatherModes } from "../data/simulatorData";
import useAdaptiveQuality from "../hooks/useAdaptiveQuality";
import GarageScene from "../scenes/GarageScene";
import SimulationScene from "../scenes/SimulationScene";
import ControlPanel from "./ControlPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import AIRecommendationPanel from "./AIRecommendationPanel";
import MapRoutePanel from "./MapRoutePanel";
import SiteNav from "./SiteNav";

function SceneLoader({ label }) {
  return (
    <Html center>
      <div className="scene-inline-status scene-loader-badge">Loading {label}...</div>
    </Html>
  );
}

export default function SimulatorDashboard({ theme, onToggleTheme }) {
  const qualityProfile = useAdaptiveQuality();
  const [selectedTruckId, setSelectedTruckId] = useState(truckCatalog[0].id);
  const [selectedMissionId, setSelectedMissionId] = useState(deliveryMissions[0].id);
  const [simulationState, setSimulationState] = useState(createInitialSimulationState);
  const [activeEvent, setActiveEvent] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [garageReady, setGarageReady] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);
  const [runtimeNotice, setRuntimeNotice] = useState("3D simulator booting. Wait for the ready state before judging visibility.");
  const [customization, setCustomization] = useState({
    color: truckCatalog[0].defaultColor,
    logoUrl: null,
    speedBoost: truckCatalog[0].performance.speedBoost,
    fuelBias: truckCatalog[0].performance.fuelBias,
  });

  const selectedTruck = useMemo(() => {
    const truck = truckCatalog.find((item) => item.id === selectedTruckId) ?? truckCatalog[0];
    const optimizedModelPath = truck.id === "cargo-titan" && qualityProfile.tier !== "high"
      ? "/models/truck-quad.glb"
      : truck.modelPath;
    return {
      ...truck,
      modelPath: optimizedModelPath,
      performance: {
        speedBoost: customization.speedBoost,
        fuelBias: customization.fuelBias,
      },
    };
  }, [customization.fuelBias, customization.speedBoost, qualityProfile.tier, selectedTruckId]);

  const selectedMission = useMemo(
    () => deliveryMissions.find((mission) => mission.id === selectedMissionId) ?? deliveryMissions[0],
    [selectedMissionId],
  );

  const activeRoute3D = simulationState.routeVariant === "alternate" ? selectedMission.alternate3D : selectedMission.route3D;
  const activeRouteGeo = simulationState.routeVariant === "alternate" ? selectedMission.alternateGeo : selectedMission.routeGeo;
  const routeDistance = useMemo(() => calculateRouteDistance(activeRoute3D), [activeRoute3D]);

  const analytics = useMemo(
    () =>
      deriveAnalytics({
        progress: simulationState.progress,
        routeDistance,
        speedKph: simulationState.speedKph,
        fuelLevel: simulationState.fuelLevel,
        cargoMass: selectedMission.loadMass,
      }),
    [routeDistance, selectedMission.loadMass, simulationState.fuelLevel, simulationState.progress, simulationState.speedKph],
  );

  const truckGeoPosition = useMemo(() => {
    if (!activeRouteGeo.length) return [0, 0];
    const scaled = simulationState.progress * (activeRouteGeo.length - 1);
    const index = Math.floor(scaled);
    const nextIndex = Math.min(index + 1, activeRouteGeo.length - 1);
    const localT = scaled - index;
    const [latA, lngA] = activeRouteGeo[index];
    const [latB, lngB] = activeRouteGeo[nextIndex];
    return [latA + (latB - latA) * localT, lngA + (lngB - lngA) * localT];
  }, [activeRouteGeo, simulationState.progress]);

  useEffect(() => {
    let frameId;
    let last = performance.now();

    const loop = (now) => {
      const delta = (now - last) / 1000;
      last = now;
      setElapsed((current) => current + delta);
      setSimulationState((current) =>
        tickSimulation({
          delta,
          state: current,
          selectedTruck,
          routeDistance,
          activeEvent,
        }),
      );
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [activeEvent, routeDistance, selectedTruck]);

  useEffect(() => {
    if (!simulationState.completed) return;
    setActiveEvent(null);
    setSimulationState((current) => ({ ...current, isRunning: false, isPaused: false }));
    setRuntimeNotice("3D simulation completed. Truck reached destination.");
    console.info("3D simulation completed successfully.");
  }, [simulationState.completed]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSimulationState((current) => {
        if (!current.isRunning || current.completed) return current;

        if (activeEvent && performance.now() > activeEvent.endsAt) {
          setActiveEvent(null);
          return resolveEvent(activeEvent, current);
        }

        if (!activeEvent) {
          const nextEvent = maybeCreateEvent({
            elapsed,
            activeEvent,
            progress: current.progress,
            fuelLevel: current.fuelLevel,
            weather: current.weather,
          });

          if (nextEvent) {
            const activated = activateEvent(nextEvent, current);
            setActiveEvent(activated.runtimeEvent);
            return activated.state;
          }
        }

        return current;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeEvent, elapsed]);

  function handleTruckModelReady(modelPath) {
    setGarageReady(true);
    setRuntimeNotice(`3D truck model loaded: ${modelPath.split("/").at(-1)}.`);
    console.info(`3D garage model ready: ${modelPath}`);
  }

  function handleSimulationModelReady(modelPath) {
    setSimulationReady(true);
    console.info(`3D simulation model ready: ${modelPath}`);
  }

  function handleStart() {
    startTransition(() => {
      setSimulationState((current) => ({ ...current, isRunning: true, isPaused: false, completed: false }));
    });
    const startedMessage = simulationReady
      ? "3D simulation started. Check console: 3D simulation is running."
      : "3D simulation start requested. Model is still loading; watch the loader badge and console.";
    setRuntimeNotice(startedMessage);
    console.info(simulationReady ? "3D simulation started successfully." : "3D simulation start requested while model is still loading.");
  }

  function handlePauseToggle() {
    setSimulationState((current) => ({ ...current, isPaused: !current.isPaused, isRunning: true }));
    setRuntimeNotice(simulationState.isPaused ? "3D simulation resumed." : "3D simulation paused.");
  }

  function handleReset() {
    setActiveEvent(null);
    setElapsed(0);
    setSimulationState({
      ...createInitialSimulationState(),
      weather: simulationState.weather,
      cameraMode: simulationState.cameraMode,
      timeOfDay: simulationState.timeOfDay,
    });
    setSimulationReady(false);
    setRuntimeNotice("3D simulation reset. Waiting for the scene to become ready again.");
    console.info("3D simulation reset.");
  }

  function handleTruckChange(nextTruckId) {
    const truck = truckCatalog.find((item) => item.id === nextTruckId) ?? truckCatalog[0];
    startTransition(() => {
      setSelectedTruckId(nextTruckId);
      setCustomization((current) => ({
        ...current,
        color: truck.defaultColor,
        speedBoost: truck.performance.speedBoost,
        fuelBias: truck.performance.fuelBias,
      }));
    });
    setGarageReady(false);
    setSimulationReady(false);
    setRuntimeNotice(`Switching 3D truck to ${truck.name}. Loading the new model now.`);
    console.info(`Switching active 3D truck to ${truck.name}.`);
  }

  function handleCustomizationChange(key, value) {
    setCustomization((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="simulator-page">
      <section className="sim-hero sim-hero-premium">
        <div className="sim-hero-copy">
          <span className="sim-kicker">Dispatch Theater</span>
          <h1>Truck Logistics Simulator</h1>
          <p>
            Orchestrate fleet movement with a cinematic logistics control room, live route visibility, and mission-grade dispatch storytelling.
          </p>
        </div>
        <div className="hero-tags sim-hero-actions">
          <Link className="secondary-action" to="/">Home</Link>
          <Link className="ghost-link" to="/tracking">Open Logistic Desk</Link>
        </div>
      </section>

      <section className="mission-strip simulator-mission-strip">
        <div>
          <span>Mission mode</span>
          <strong>{selectedMission.name}</strong>
        </div>
        <div>
          <span>Fleet class</span>
          <strong>{selectedTruck.name}</strong>
        </div>
        <div>
          <span>Rendering tier</span>
          <strong>{qualityProfile.label}</strong>
        </div>
      </section>

      <div className="event-banner simulator-runtime-banner">
        <span className="sim-kicker">Live Dispatch Feed</span>
        <p>{runtimeNotice}</p>
      </div>

      <section className="simulator-layout">
        <div className="scene-column">
          <motion.article className="scene-shell garage-shell" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="sim-card-header">
              <div>
                <span className="sim-kicker">Garage Module</span>
                <h3>Vehicle Showroom</h3>
              </div>
              <span className="telemetry-pill">{garageReady ? "3D ready" : "Loading 3D"}</span>
            </div>
            <Canvas shadows={qualityProfile.shadows} dpr={qualityProfile.dpr} gl={{ antialias: qualityProfile.antialias }}>
              <Suspense fallback={<SceneLoader label="garage truck" />}>
                <GarageScene
                  trucks={truckCatalog}
                  selectedTruckId={selectedTruckId}
                  customization={customization}
                  quality={qualityProfile}
                  onModelReady={handleTruckModelReady}
                />
              </Suspense>
            </Canvas>
            <div className="scene-inline-status">3D garage active. Drag to rotate, scroll to zoom, and wait for the ready badge if the model takes time to appear.</div>
          </motion.article>

          <motion.article className="scene-shell simulation-shell" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <div className="sim-card-header">
              <div>
                <span className="sim-kicker">Simulation Module</span>
                <h3>Live Freight Route</h3>
              </div>
              <span className="telemetry-pill">{simulationReady ? "3D ready" : "Loading 3D"}</span>
            </div>
            <Canvas shadows={qualityProfile.shadows} dpr={qualityProfile.dpr} gl={{ antialias: qualityProfile.antialias }}>
              <Suspense fallback={<SceneLoader label="simulation scene" />}>
                <SimulationScene
                  selectedTruck={selectedTruck}
                  activeRoute={activeRoute3D}
                  progress={simulationState.progress}
                  cameraMode={simulationState.cameraMode}
                  weather={simulationState.weather}
                  timeOfDay={simulationState.timeOfDay}
                  customization={customization}
                  activeEvent={activeEvent}
                  quality={qualityProfile}
                  onModelReady={handleSimulationModelReady}
                />
              </Suspense>
            </Canvas>
            <div className="scene-inline-status scene-inline-status-strong">
              {simulationState.isRunning
                ? simulationState.isPaused
                  ? "Simulation paused. Press Pause again to resume movement."
                  : simulationReady
                    ? "3D simulation live. If the truck is hard to see, check the console for the ready message."
                    : "3D simulation started, but the model is still loading. Wait for the ready badge."
                : "Truck ready for dispatch. Press Start to launch the route."}
            </div>
          </motion.article>
        </div>

        <div className="panel-column">
          <ControlPanel
            trucks={truckCatalog}
            missions={deliveryMissions}
            selectedTruck={selectedTruck}
            selectedMission={selectedMission}
            cameraModes={cameraModes}
            speedOptions={speedOptions}
            weatherModes={weatherModes}
            timeModes={timeModes}
            customization={customization}
            simulationState={simulationState}
            onTruckChange={handleTruckChange}
            onMissionChange={setSelectedMissionId}
            onCustomizationChange={handleCustomizationChange}
            onStart={handleStart}
            onPauseToggle={handlePauseToggle}
            onReset={handleReset}
            onCameraChange={(value) => setSimulationState((current) => ({ ...current, cameraMode: value }))}
            onSpeedChange={(value) => setSimulationState((current) => ({ ...current, speedMultiplier: value }))}
            onWeatherChange={(value) => setSimulationState((current) => ({ ...current, weather: value }))}
            onTimeChange={(value) => setSimulationState((current) => ({ ...current, timeOfDay: value }))}
            qualityProfile={qualityProfile}
          />

          <AnalyticsPanel analytics={analytics} selectedMission={selectedMission} simulationState={simulationState} activeEvent={activeEvent} />
          <AIRecommendationPanel selectedTruck={selectedTruck} selectedMission={selectedMission} simulationState={simulationState} activeEvent={activeEvent} analytics={analytics} />
          <MapRoutePanel route={selectedMission.routeGeo} alternateRoute={selectedMission.alternateGeo} truckPosition={truckGeoPosition} useAlternate={simulationState.routeVariant === "alternate"} />
        </div>
      </section>
    </div>
  );
}






