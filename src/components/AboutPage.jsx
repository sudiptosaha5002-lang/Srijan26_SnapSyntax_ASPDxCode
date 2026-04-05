import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import SiteNav from "./SiteNav";

const pillars = [
  {
    title: "Unified Freight Flow",
    body: "Truck Logistics combines booking, shipment tracking, operations visibility, and simulator workflows in one client-ready product.",
  },
  {
    title: "Operational Clarity",
    body: "Dispatchers, operators, and customers can move between booking, route status, and shipment history without losing context.",
  },
  {
    title: "Performance-Aware Experience",
    body: "The platform adapts simulation quality and model loading so stronger devices get richer visuals and weaker devices stay usable.",
  },
];

const crewMembers = [
  {
    name: "Sayan Banik",
    role: "Developer",
    image: "/team-member-1.png",
    cardClass: "crew-member-one",
    imageShift: "-34px",
    imageScale: 0.84,
  },
  {
    name: "Sudipto Saha",
    role: "Developer",
    image: "/team-member-2.png",
    cardClass: "crew-member-two",
    imageShift: "-10px",
    imageScale: 0.8,
  },
  {
    name: "Subham Malakar",
    role: "Researcher And Developer",
    image: "/team-member-3.png",
    cardClass: "crew-member-three",
    imageShift: "-24px",
    imageScale: 0.84,
  },
  {
    name: "Aritra Roy",
    role: "Developer",
    image: "/team-member-4.png",
    cardClass: "crew-member-four",
    imageShift: "-18px",
    imageScale: 0.86,
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const riseVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function CrewCard({ member, index }) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateXBase = useTransform(pointerY, [-0.5, 0.5], [10, -10]);
  const rotateYBase = useTransform(pointerX, [-0.5, 0.5], [-12, 12]);
  const glareX = useTransform(pointerX, [-0.5, 0.5], ["22%", "78%"]);
  const glareY = useTransform(pointerY, [-0.5, 0.5], ["18%", "80%"]);
  const rotateX = useSpring(rotateXBase, { stiffness: 180, damping: 18, mass: 0.6 });
  const rotateY = useSpring(rotateYBase, { stiffness: 180, damping: 18, mass: 0.6 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(x);
    pointerY.set(y);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.article
      className={`crew-card crew-card-real ${member.cardClass}`}
      variants={riseVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, "--member-shift": member.imageShift, "--member-scale": member.imageScale }}
      whileHover={{ y: -12, scale: 1.02 }}
    >
      <div className="crew-card-art crew-card-art-real" aria-hidden="true">
        <div className="crew-card-backdrop" />
        <motion.div className="crew-card-glare" style={{ left: glareX, top: glareY }} />
        <img src={member.image} alt="" className="crew-card-image crew-card-image-real" />
        <span className="crew-card-index">0{index + 1}</span>
      </div>
      <div className="crew-card-copy">
        <span className="sim-kicker">ASPDxCode</span>
        <h3>{member.name}</h3>
        <strong>{member.role}</strong>
      </div>
    </motion.article>
  );
}

export default function AboutPage({ theme, onToggleTheme }) {
  return (
    <motion.div className="page-shell info-page-shell about-page-shell" initial="hidden" animate="show" variants={containerVariants}>
      <div className="about-page-orb about-page-orb-a" />
      <div className="about-page-orb about-page-orb-b" />

      <motion.div variants={riseVariants}>
        <SiteNav theme={theme} onToggleTheme={onToggleTheme} ctaLabel="Book Truck" ctaTo="/booking" />
      </motion.div>

      <section className="info-page-grid">
        <motion.article className="glass-panel info-page-hero about-hero-panel" variants={riseVariants}>
          <span className="sim-kicker">About Truck Logistics</span>
          <h1>Built for freight booking, dispatch visibility, and immersive route simulation.</h1>
          <p>
            Truck Logistics is structured as one logistics product. Customers can create bookings,
            teams can operate from a live control desk, and stakeholders can review route progress
            through a visual simulator module.
          </p>
          <div className="about-hero-ribbon">
            <span>Booking engine</span>
            <span>Operations desk</span>
            <span>Simulation layer</span>
          </div>
        </motion.article>

        <motion.section className="info-card-grid" variants={containerVariants}>
          {pillars.map((pillar) => (
            <motion.article
              key={pillar.title}
              className="sim-card info-card about-info-card"
              variants={riseVariants}
              whileHover={{ y: -6 }}
            >
              <span className="sim-kicker">Platform</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </motion.article>
          ))}
        </motion.section>

        <motion.section className="glass-panel crew-showcase" variants={riseVariants}>
          <div className="crew-showcase-head">
            <div>
              <span className="sim-kicker">Meet Our Crew</span>
              <h2>ASPDxCode is the team powering this logistics experience.</h2>
            </div>
          </div>

          <motion.div className="crew-showcase-grid crew-showcase-grid-four" variants={containerVariants}>
            {crewMembers.map((member, index) => (
              <CrewCard key={member.name} member={member} index={index} />
            ))}
          </motion.div>
        </motion.section>
      </section>
    </motion.div>
  );
}
