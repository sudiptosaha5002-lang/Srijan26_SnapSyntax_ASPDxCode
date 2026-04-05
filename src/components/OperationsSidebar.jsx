import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const navItems = [
  { label: "Dashboard", path: "/ops/dashboard" },
  { label: "Orders", path: "/ops/orders" },
  { label: "Payments", path: "/ops/payments" },
  { label: "Tracking", path: "/tracking" },
  { label: "Requests", path: "/ops/requests" },
  { label: "Analysis", path: "/ops/analysis" },
  { label: "Settings", path: "/ops/settings" },
];

export default function OperationsSidebar({ theme, onToggleTheme }) {
  const location = useLocation();

  return (
    <aside className="ops-sidebar glass-panel">
      <div className="ops-sidebar-brand">
        <BrandLogo compact />
        <div className="ops-sidebar-brand-copy">
          <strong>Truck Logistics</strong>
          <span>Operations Suite</span>
        </div>
      </div>

      <nav className="ops-sidebar-nav">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} className={`ops-nav-item ${active ? "ops-nav-item-active" : ""}`} to={item.path}>
              <span className="ops-nav-dot" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ops-sidebar-footer">
        <button type="button" className="secondary-action ops-sidebar-button" onClick={onToggleTheme}>
          {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
        </button>
        <Link className="ghost-link ops-sidebar-button" to="/">Home</Link>
        <Link className="ghost-link ops-sidebar-button" to="/dashboard">Open Simulator</Link>
      </div>
    </aside>
  );
}






