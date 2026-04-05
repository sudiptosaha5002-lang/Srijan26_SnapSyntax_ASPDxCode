import { motion } from "framer-motion";
import SiteNav from "./SiteNav";

const contactCards = [
  { title: "Client Support", value: "support@trucklogistics.ai", note: "Shipment issues, dashboard access, and booking support." },
  { title: "Operations Desk", value: "+91 90000 44556", note: "Route escalations, dispatch updates, and logistics desk support." },
  { title: "Business Inquiries", value: "sales@trucklogistics.ai", note: "Partnerships, onboarding, and enterprise deployment." },
];

export default function ContactPage({ theme, onToggleTheme }) {
  return (
    <div className="page-shell info-page-shell">
      <SiteNav theme={theme} onToggleTheme={onToggleTheme} ctaLabel="Open Logistic Desk" ctaTo="/tracking" />

      <section className="info-page-grid">
        <motion.article className="glass-panel info-page-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <span className="sim-kicker">Contact</span>
          <h1>Reach the Truck Logistics team through the same premium workflow as the product.</h1>
          <p>
            Use the logistics desk for live shipment status, or contact the team directly for support,
            onboarding, route escalations, and client operations help.
          </p>
        </motion.article>

        <motion.section className="info-card-grid" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          {contactCards.map((card) => (
            <article key={card.title} className="sim-card info-card">
              <span className="sim-kicker">Contact Channel</span>
              <h3>{card.title}</h3>
              <strong>{card.value}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </motion.section>
      </section>
    </div>
  );
}
