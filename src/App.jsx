import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { media } from "./data";
import BrandLogo from "./components/BrandLogo";
import SiteNav from "./components/SiteNav";
import ThemeToggle from "./components/ThemeToggle";

const SimulatorDashboard = lazy(() => import("./components/SimulatorDashboard"));
const TrackingDashboard = lazy(() => import("./components/TrackingDashboard"));
const OperationsModulePage = lazy(() => import("./components/OperationsModulePage"));
const BookingPage = lazy(() => import("./components/BookingPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function BrandLoader({ title, body, meta = ["Syncing dispatch", "Preparing route desk", "Launching control layer"] }) {
  return (
    <div className="route-loader brand-loader-screen">
      <div className="route-loader-card brand-loader-card">
        <div className="brand-loader-mark" aria-hidden="true">
          <div className="brand-loader-ring brand-loader-ring-a" />
          <div className="brand-loader-ring brand-loader-ring-b" />
          <BrandLogo className="brand-loader-logo" animated />
          <div className="brand-loader-pulse" />
        </div>
        <span className="sim-kicker">Truck Logistics</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="brand-loader-status-row">
          {meta.map((item) => (
            <span key={item} className="brand-loader-chip">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteScene({ children }) {
  return (
    <motion.div
      className="route-scene"
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LandingPage({ theme, onToggleTheme }) {
  return (
    <motion.div className="page-shell" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <SiteNav theme={theme} onToggleTheme={onToggleTheme} />
      </motion.div>

      <motion.section className="landing-hero-grid" variants={staggerContainer}>
        <motion.article className="glass-panel hero-copy-panel" variants={fadeUp}>
          <span className="sim-kicker">Logistics platform</span>
          <h1>Book a truck, manage the shipment, and track delivery in one platform.</h1>
          <p>
            The website now works as a truck logistics booking system first, with live tracking,
            operations pages, and the simulator module available as premium add-ons.
          </p>
          <div className="hero-cta-row">
            <Link className="primary-action" to="/booking">Book A Truck</Link>
            <Link className="secondary-action" to="/tracking">Open Logistic Desk</Link>
          </div>
          <div className="hero-stat-row">
            <motion.article className="stat-chip" variants={fadeUp}><strong>Truck Booking</strong><span>Product-based freight booking</span></motion.article>
            <motion.article className="stat-chip" variants={fadeUp}><strong>Logistic Desk</strong><span>Shipment search, bookings, and dispatch flow</span></motion.article>
            <motion.article className="stat-chip" variants={fadeUp}><strong>Simulator</strong><span>Visual route replay module</span></motion.article>
          </div>
        </motion.article>

        <motion.article className="glass-panel hero-media-panel" variants={fadeUp}>
          <video autoPlay muted loop playsInline className="hero-video">
            <source src={media.heroVideo} type="video/mp4" />
          </video>
          <div className="hero-overlay-copy">
            <span>Booking + Operations Layer</span>
            <strong>Booking, logistics, telemetry, simulator</strong>
          </div>
        </motion.article>
      </motion.section>
    </motion.div>
  );
}

function LoginPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-shell">
      <video autoPlay muted loop playsInline className="auth-background-video">
        <source src={media.loginVideo} type="video/mp4" />
      </video>
      <div className="auth-backdrop" />
      <motion.form
        className="glass-panel auth-card"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={(event) => {
          event.preventDefault();
          navigate("/tracking");
        }}
      >
        <div className="auth-topbar">
          <span className="sim-kicker">Crew Console</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
        </div>
        <h1>Authenticate the fleet operator.</h1>
        <label className="field">
          <span>Email / Tracking ID</span>
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="crew@trucklogistic.ai" />
        </label>
        <label className="field">
          <span>Secure Key</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your console key" />
        </label>
        <div className="hero-cta-row">
          <button className="primary-action" type="submit">Open Logistic Desk</button>
          <button className="secondary-action" type="button" onClick={() => navigate("/dashboard")}>Open Simulator Demo</button>
        </div>
      </motion.form>
    </div>
  );
}

function AnimatedRoutes({ theme, onToggleTheme }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RouteScene><LandingPage theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/login" element={<RouteScene><LoginPage theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/booking" element={<RouteScene><BookingPage theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/about" element={<RouteScene><AboutPage theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/contact" element={<RouteScene><ContactPage theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/dashboard" element={<RouteScene><SimulatorDashboard theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/tracking" element={<RouteScene><TrackingDashboard theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/ops/dashboard" element={<RouteScene><OperationsModulePage section="dashboard" theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/ops/orders" element={<RouteScene><OperationsModulePage section="orders" theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/ops/payments" element={<RouteScene><OperationsModulePage section="payments" theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/ops/requests" element={<RouteScene><OperationsModulePage section="requests" theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/ops/analysis" element={<RouteScene><OperationsModulePage section="analysis" theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="/ops/settings" element={<RouteScene><OperationsModulePage section="settings" theme={theme} onToggleTheme={onToggleTheme} /></RouteScene>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem("trucklogistic-theme") ?? "dark");

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("trucklogistic-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <Suspense
      fallback={
        <BrandLoader
          title="Opening logistics transaction layer"
          body="Preparing the booking engine, logistics desk, simulator, and client operations interface."
          meta={["Booking engine", "Logistics desk", "Simulator control"]}
        />
      }
    >
      <AnimatedRoutes theme={theme} onToggleTheme={toggleTheme} />
    </Suspense>
  );
}

