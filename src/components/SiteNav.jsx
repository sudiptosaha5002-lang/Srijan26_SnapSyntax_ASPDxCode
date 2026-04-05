import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Booking", to: "/booking" },
  { label: "Logistic", to: "/tracking" },
  { label: "Simulator", to: "/dashboard" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function SiteNav({ theme, onToggleTheme, ctaLabel = "Open Simulator", ctaTo = "/dashboard" }) {
  const location = useLocation();

  return (
    <header className="site-nav">
      <Link className="site-brand" to="/">
        <BrandLogo compact />
        <div>
          <strong>Truck Logistics</strong>
          <span>Truck booking, logistics desk, and simulator</span>
        </div>
      </Link>

      <div className="site-nav-links">
        {navItems.map((item) => (
          <Link
            key={item.to}
            className={`site-nav-link ${location.pathname === item.to ? "site-nav-link-active" : ""}`}
            to={item.to}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="nav-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
        <Link className="primary-action" to={ctaTo}>{ctaLabel}</Link>
      </div>
    </header>
  );
}
