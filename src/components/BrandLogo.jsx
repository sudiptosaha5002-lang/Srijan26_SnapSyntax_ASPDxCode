export default function BrandLogo({ className = "", animated = false, compact = false }) {
  return (
    <span className={`brand-logo ${animated ? "brand-logo-animated" : ""} ${compact ? "brand-logo-compact" : ""} ${className}`.trim()} aria-hidden="true">
      <span className="brand-logo-backdrop" />
      <img src="/truck-logistics-logo.png" alt="Truck Logistics" className="brand-logo-image" />
    </span>
  );
}

