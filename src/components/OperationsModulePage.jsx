import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import OperationsSidebar from "./OperationsSidebar";
import { readStoredTrackingShipments } from "../utils/trackingStore";

const moduleContent = {
  dashboard: {
    kicker: "Command Overview",
    title: "Fleet operations dashboard",
    body: "Monitor shipment health, route pressure, delayed loads, and high-priority actions from one executive control page.",
    stats: [
      { label: "Active fleet", value: "124" },
      { label: "Urgent actions", value: "08" },
      { label: "On-time score", value: "96.8%" },
      { label: "Driver check-ins", value: "312" },
    ],
    cards: [
      { title: "Live dispatch board", text: "See truck readiness, route state, and client-sensitive priorities in one panel." },
      { title: "Escalation watch", text: "Delayed or exception-prone shipments are grouped for faster supervisor action." },
      { title: "Capacity planning", text: "Quickly compare truck utilization and route demand before assigning new work." },
    ],
    listTitle: "Suggested actions",
    list: ["Review 3 delayed lanes before noon", "Approve 2 route changes pending in requests", "Confirm 5 warehouse dock slots", "Escalate one payment hold on premium contract"],
  },
  orders: {
    kicker: "Order Control",
    title: "Order intake and shipment preparation",
    body: "Review incoming logistics orders, validate dispatch details, and hand confirmed work directly into tracking operations.",
    stats: [
      { label: "New orders", value: "42" },
      { label: "Ready to dispatch", value: "19" },
      { label: "Awaiting docs", value: "07" },
      { label: "Average prep", value: "34m" },
    ],
    cards: [
      { title: "Order queue", text: "New client orders are staged here before entering active freight operations." },
      { title: "Manifest checks", text: "Packaging, destination, and carrier constraints can be reviewed from this screen." },
      { title: "Dispatch handoff", text: "Approved orders move into tracking with route-aware defaults for the operations team." },
    ],
    listTitle: "Current workflow",
    list: ["Validate cargo dimensions", "Assign preferred truck class", "Confirm warehouse pickup slot", "Push approved jobs into tracking"],
  },
  payments: {
    kicker: "Billing Monitor",
    title: "Payments and contract settlement",
    body: "Track invoice readiness, outstanding balances, client contract types, and release milestones tied to shipment progress.",
    stats: [
      { label: "Open invoices", value: "31" },
      { label: "Paid today", value: "$42.8k" },
      { label: "Pending release", value: "11" },
      { label: "At-risk accounts", value: "03" },
    ],
    cards: [
      { title: "Invoice health", text: "Shipment-linked invoices remain visible until proof of delivery and billing checks are complete." },
      { title: "Contract billing", text: "Enterprise clients can be monitored by milestone, delivered, or monthly settlement mode." },
      { title: "Payment holds", text: "Highlight missing POD, account issues, or manual approvals blocking collections." },
    ],
    listTitle: "Billing tools",
    list: ["Release proof-based invoice", "Flag late-paying customer", "Review contract discount policy", "Export settlement summary"],
  },
  requests: {
    kicker: "Action Queue",
    title: "Route requests and customer changes",
    body: "Handle reroutes, dock changes, destination edits, and support escalations without losing visibility into the shipment.",
    stats: [
      { label: "Open requests", value: "17" },
      { label: "Reroutes", value: "06" },
      { label: "Address edits", value: "04" },
      { label: "Priority tickets", value: "03" },
    ],
    cards: [
      { title: "Route changes", text: "Route change requests connect directly with live tracking so operators see impact immediately." },
      { title: "Client asks", text: "Operations can process support changes without losing shipment-level context." },
      { title: "Approval chain", text: "Use this page to triage what can be accepted instantly and what needs supervisor sign-off." },
    ],
    listTitle: "Most common requests",
    list: ["Reroute due to road event", "Change destination dock", "Reschedule unloading window", "Attach updated invoice instruction"],
  },
  analysis: {
    kicker: "Operations Intelligence",
    title: "Performance analysis and operational insights",
    body: "Review delivery efficiency, capacity usage, route reliability, and exception patterns to improve fleet performance.",
    stats: [
      { label: "Efficiency", value: "97%" },
      { label: "Avg delay", value: "12m" },
      { label: "Fuel trend", value: "-4.2%" },
      { label: "Exception ratio", value: "1.9%" },
    ],
    cards: [
      { title: "Lane performance", text: "Compare corridors by reliability, traffic load, and delay concentration." },
      { title: "Truck utilization", text: "See which vehicle classes are underused or overbooked across the week." },
      { title: "Exception analysis", text: "Break down delay causes across weather, compliance, support, and warehouse throughput." },
    ],
    listTitle: "Insight opportunities",
    list: ["Reduce low-efficiency route overlap", "Increase long-haul truck allocation", "Escalate weather-prone delivery corridor", "Lower exception volume for contract medical loads"],
  },
  settings: {
    kicker: "Platform Settings",
    title: "Workspace settings and team preferences",
    body: "Configure workspace behavior, alerts, branding, route defaults, and operator preferences for the logistics suite.",
    stats: [
      { label: "Operators", value: "28" },
      { label: "Alert rules", value: "14" },
      { label: "Saved templates", value: "09" },
      { label: "Theme mode", value: "Live" },
    ],
    cards: [
      { title: "Workspace defaults", text: "Set route thresholds, risk policies, and map behavior for all operations users." },
      { title: "Notifications", text: "Control alerting for delays, payment holds, route changes, and proof upload events." },
      { title: "Brand and access", text: "Update client-facing branding and operator permissions without leaving the suite." },
    ],
    listTitle: "Common settings",
    list: ["Switch workspace theme", "Update alert thresholds", "Adjust default route strategy", "Review operator permissions"],
  },
};

function ModuleCard({ title, text }) {
  return (
    <article className="sim-card ops-module-card">
      <span className="sim-kicker">Module</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}

function HistoryCard({ item }) {
  return (
    <article className="sim-card ops-module-card ops-history-module-card">
      <span className="sim-kicker">{item.source === "booking" ? "Booking" : "Order"}</span>
      <strong>{item.id}</strong>
      <p>{item.origin} to {item.destination}</p>
      <div className="ops-mini-list">
        <div><span>Status</span><strong>{item.status}</strong></div>
        <div><span>Truck</span><strong>{item.truckType}</strong></div>
      </div>
    </article>
  );
}

export default function OperationsModulePage({ section, theme, onToggleTheme }) {
  const content = moduleContent[section];
  const historyRecords = useMemo(() => readStoredTrackingShipments(), []);

  return (
    <div className="ops-page-shell">
      <OperationsSidebar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="ops-main-grid">
        <section className="ops-board-panel glass-panel ops-module-hero">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="sim-kicker">{content.kicker}</span>
            <h1>{content.title}</h1>
            <p>{content.body}</p>
          </motion.div>

          <div className="ops-summary-row">
            {content.stats.map((stat) => (
              <article key={stat.label} className="stat-chip">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>

          <div className="ops-module-card-grid">
            {content.cards.map((card) => (
              <ModuleCard key={card.title} title={card.title} text={card.text} />
            ))}
          </div>
        </section>

        <section className="ops-detail-panel glass-panel">
          <div className="ops-detail-head">
            <div className="ops-title-block">
              <span className="sim-kicker">User Help</span>
              <h2>{content.listTitle}</h2>
            </div>
            <Link className="primary-action" to="/tracking">Open Tracking</Link>
          </div>

          <div className="ops-list-panel">
            {content.list.map((item) => (
              <div key={item} className="ops-list-row">{item}</div>
            ))}
          </div>

          {section === "orders" ? (
            <div className="ops-module-history-block">
              <div className="ops-section-head">
                <h3>Booking and order history</h3>
                <span>{historyRecords.length} records</span>
              </div>
              {historyRecords.length ? (
                <div className="ops-module-card-grid">
                  {historyRecords.map((item) => <HistoryCard key={item.id} item={item} />)}
                </div>
              ) : (
                <div className="ops-empty-history">Confirmed bookings will appear here automatically.</div>
              )}
            </div>
          ) : null}

          <div className="ops-module-actions">
            <Link className="secondary-action" to="/">Back Home</Link>
            <Link className="ghost-link" to="/dashboard">Open Simulator</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
