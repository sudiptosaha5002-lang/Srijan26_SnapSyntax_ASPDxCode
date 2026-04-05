import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cargoSuggestions, fleetOptions, media } from "../data";
import { createShipmentFromBooking, upsertStoredTrackingShipment } from "../utils/trackingStore";
import SiteNav from "./SiteNav";

function createProductFromSuggestion(suggestion) {
  return {
    id: `${suggestion.id}-${Math.random().toString(36).slice(2, 8)}`,
    name: suggestion.name,
    quantity: suggestion.quantity,
    weight: suggestion.weight,
    volume: suggestion.volume,
  };
}

function createBlankProduct() {
  return {
    id: `item-${Math.random().toString(36).slice(2, 8)}`,
    name: "Product item",
    quantity: 1,
    weight: 20,
    volume: 3,
  };
}

function recommendationFromLoad(totalWeight, totalVolume) {
  if (totalWeight > 180 || totalVolume > 90) return "heavy";
  if (totalWeight > 70 || totalVolume > 35) return "medium";
  return "van";
}

function estimatePrice(distance, totalWeight, truckId, insurance) {
  const base = truckId === "heavy" ? 85 : truckId === "medium" ? 54 : 28;
  const distanceFee = distance * (truckId === "heavy" ? 1.85 : truckId === "medium" ? 1.25 : 0.9);
  const loadFee = totalWeight * 0.35;
  const insuranceFee = insurance ? Math.max(18, totalWeight * 0.1) : 0;
  const subtotal = base + distanceFee + loadFee + insuranceFee;
  const serviceFee = subtotal * 0.08;
  return {
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  };
}

export default function BookingPage({ theme, onToggleTheme }) {
  const [pickup, setPickup] = useState("Kolkata Dispatch Hub");
  const [dropoff, setDropoff] = useState("Aurora Port Warehouse");
  const [distance, setDistance] = useState(126);
  const [pickupDate, setPickupDate] = useState("2026-04-06");
  const [pickupTime, setPickupTime] = useState("10:30");
  const [contactName, setContactName] = useState("Rahul Sharma");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [products, setProducts] = useState(cargoSuggestions.map(createProductFromSuggestion));
  const [selectedTruck, setSelectedTruck] = useState("medium");
  const [insurance, setInsurance] = useState(true);
  const [priority, setPriority] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const totals = useMemo(() => {
    const totalWeight = products.reduce((sum, item) => sum + Number(item.weight) * Number(item.quantity), 0);
    const totalVolume = products.reduce((sum, item) => sum + Number(item.volume) * Number(item.quantity), 0);
    return { totalWeight, totalVolume };
  }, [products]);

  const recommendedTruckId = useMemo(
    () => recommendationFromLoad(totals.totalWeight, totals.totalVolume),
    [totals.totalVolume, totals.totalWeight],
  );

  const pricing = useMemo(
    () => estimatePrice(distance, totals.totalWeight, selectedTruck, insurance),
    [distance, insurance, selectedTruck, totals.totalWeight],
  );

  const recommendedTruck = fleetOptions.find((item) => item.id === recommendedTruckId) ?? fleetOptions[1];

  function updateProduct(productId, key, value) {
    setProducts((current) => current.map((item) => (item.id === productId ? { ...item, [key]: value } : item)));
  }

  function removeProduct(productId) {
    setProducts((current) => current.filter((item) => item.id !== productId));
  }

  function handleBook(event) {
    event.preventDefault();
    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const chosenTruck = fleetOptions.find((item) => item.id === selectedTruck) ?? fleetOptions[1];
    const total = pricing.total + (priority ? 42 : 0);

    const confirmedBooking = {
      bookingId,
      pickup,
      dropoff,
      pickupDate,
      pickupTime,
      chosenTruck: chosenTruck.name,
      total,
      contactName,
    };

    const shipment = createShipmentFromBooking({
      bookingId,
      pickup,
      dropoff,
      pickupDate,
      pickupTime,
      contactName,
      phone,
      distance,
      products,
      chosenTruck,
      total,
      priority,
      insurance,
      totalWeight: totals.totalWeight,
      totalVolume: totals.totalVolume,
      media,
    });

    upsertStoredTrackingShipment(shipment);
    setBookingResult(confirmedBooking);
  }

  const finalTotal = pricing.total + (priority ? 42 : 0);

  return (
    <div className="page-shell booking-page-shell booking-page-premium">
      <div className="booking-backdrop-orb booking-backdrop-orb-a" />
      <div className="booking-backdrop-orb booking-backdrop-orb-b" />

      <SiteNav theme={theme} onToggleTheme={onToggleTheme} ctaLabel="Open Simulator" ctaTo="/dashboard" />

      <section className="booking-hero-premium">
        <motion.article className="glass-panel booking-hero-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
          <span className="sim-kicker">Truck Booking Platform</span>
          <h1>Freight booking with the ease of cab booking.</h1>
          <p>
            Build a shipment, add products, get the best-fit truck instantly, and confirm a logistics booking with a premium real-time quote flow.
          </p>

          <div className="booking-hero-feature-row">
            <div className="booking-hero-feature">
              <strong>Live Quote</strong>
              <span>Distance, cargo, and dispatch options update instantly.</span>
            </div>
            <div className="booking-hero-feature">
              <strong>Truck Match</strong>
              <span>Automatic recommendation based on weight and cargo volume.</span>
            </div>
            <div className="booking-hero-feature">
              <strong>Booking Confirmation</strong>
              <span>Receive a booking ID and move straight into tracking.</span>
            </div>
          </div>

          <div className="booking-process-strip">
            <div><span>01</span><strong>Add route</strong></div>
            <div><span>02</span><strong>Load products</strong></div>
            <div><span>03</span><strong>Choose truck</strong></div>
            <div><span>04</span><strong>Confirm booking</strong></div>
          </div>
        </motion.article>

        <motion.article className="glass-panel booking-hero-stage" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className="booking-hero-stage-grid" />
          <motion.div className="booking-floating-card booking-floating-card-top" animate={{ y: [0, -8, 0] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}>
            <strong>{recommendedTruck.name}</strong>
            <span>Recommended for {totals.totalWeight.toFixed(0)} kg / {totals.totalVolume.toFixed(1)} m3</span>
          </motion.div>
          <motion.div className="booking-floating-card booking-floating-card-side" animate={{ y: [0, 10, 0] }} transition={{ duration: 6.1, repeat: Infinity, ease: "easeInOut" }}>
            <strong>${finalTotal.toFixed(0)}</strong>
            <span>Estimated booking total</span>
          </motion.div>
          <motion.img src={media.truckImage} alt="Truck booking visual" className="booking-hero-truck-premium" animate={{ y: [0, -10, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }} />
          <div className="booking-hero-glow" />
        </motion.article>
      </section>

      <section className="booking-main-layout">
        <motion.form className="glass-panel booking-form-premium" onSubmit={handleBook} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="booking-section-card">
            <div className="booking-section-head">
              <div>
                <span className="sim-kicker">Step 1</span>
                <h3>Route and contact</h3>
              </div>
              <span className="telemetry-pill">Live booking</span>
            </div>

            <div className="booking-grid booking-grid-premium">
              <label className="field"><span>Pickup Location</span><input value={pickup} onChange={(event) => setPickup(event.target.value)} /></label>
              <label className="field"><span>Drop Location</span><input value={dropoff} onChange={(event) => setDropoff(event.target.value)} /></label>
              <label className="field"><span>Distance (km)</span><input type="number" min="1" value={distance} onChange={(event) => setDistance(Number(event.target.value))} /></label>
              <label className="field"><span>Pickup Date</span><input type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} /></label>
              <label className="field"><span>Pickup Time</span><input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} /></label>
              <label className="field"><span>Contact Name</span><input value={contactName} onChange={(event) => setContactName(event.target.value)} /></label>
              <label className="field booking-field-full"><span>Phone Number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
            </div>
          </div>

          <div className="booking-section-card">
            <div className="booking-section-head">
              <div>
                <span className="sim-kicker">Step 2</span>
                <h3>Products</h3>
              </div>
              <button type="button" className="secondary-action" onClick={() => setProducts((current) => [...current, createBlankProduct()])}>Add Product</button>
            </div>

            <div className="booking-product-list booking-product-list-premium">
              {products.map((product, index) => (
                <motion.div key={product.id} className="booking-product-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="booking-product-card-head">
                    <strong>Item {index + 1}</strong>
                    <button type="button" className="ghost-link booking-remove" onClick={() => removeProduct(product.id)}>Remove</button>
                  </div>
                  <div className="booking-product-card-grid">
                    <label className="field"><span>Product</span><input value={product.name} onChange={(event) => updateProduct(product.id, "name", event.target.value)} /></label>
                    <label className="field"><span>Qty</span><input type="number" min="1" value={product.quantity} onChange={(event) => updateProduct(product.id, "quantity", Number(event.target.value))} /></label>
                    <label className="field"><span>Weight / unit (kg)</span><input type="number" min="1" value={product.weight} onChange={(event) => updateProduct(product.id, "weight", Number(event.target.value))} /></label>
                    <label className="field"><span>Volume / unit (m3)</span><input type="number" min="0.1" step="0.1" value={product.volume} onChange={(event) => updateProduct(product.id, "volume", Number(event.target.value))} /></label>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="booking-section-card">
            <div className="booking-section-head">
              <div>
                <span className="sim-kicker">Step 3</span>
                <h3>Truck category</h3>
              </div>
              <span className="booking-recommend-pill">Recommended: {recommendedTruck.name}</span>
            </div>

            <div className="booking-truck-grid booking-truck-grid-premium">
              {fleetOptions.map((option) => {
                const active = selectedTruck === option.id;
                const recommended = recommendedTruckId === option.id;
                return (
                  <label key={option.id} className={`booking-truck-choice ${active ? "booking-truck-choice-active" : ""} ${recommended ? "booking-truck-choice-recommended" : ""}`}>
                    <input
                      className="booking-truck-radio"
                      type="radio"
                      name="truck-size"
                      value={option.id}
                      checked={active}
                      onChange={() => setSelectedTruck(option.id)}
                    />
                    <span className="booking-truck-choice-shell">
                      <span className="booking-truck-topline">
                        <strong>{option.name}</strong>
                        {recommended ? <em>AI Match</em> : null}
                      </span>
                      <span>{option.tone}</span>
                      <small>Capacity: {option.capacity} units</small>
                      <span className="booking-truck-cta">Tap to select</span>
                    </span>
                  </label>
                );
              })}
            </div>

          <div className="booking-toggle-row booking-toggle-row-premium">
              <label className="booking-toggle booking-toggle-premium"><input type="checkbox" checked={insurance} onChange={(event) => setInsurance(event.target.checked)} /> <span>Add cargo insurance</span></label>
              <label className="booking-toggle booking-toggle-premium"><input type="checkbox" checked={priority} onChange={(event) => setPriority(event.target.checked)} /> <span>Priority dispatch</span></label>
            </div>
          </div>

          <div className="booking-actions booking-actions-premium">
            <button className="primary-action booking-submit" type="submit">Confirm Truck Booking</button>
            <Link className="secondary-action" to="/tracking">Track Existing Shipment</Link>
          </div>
        </motion.form>

        <motion.aside className="glass-panel booking-summary-premium" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="booking-summary-stick">
            <div className="booking-summary-headline">
              <span className="sim-kicker">Quote Engine</span>
              <h3>Booking summary</h3>
              <p>Everything updates live as the user configures the freight booking.</p>
            </div>

            <div className="booking-summary-metrics">
              <div className="booking-metric-card">
                <span>Total cargo weight</span>
                <strong>{totals.totalWeight.toFixed(0)} kg</strong>
              </div>
              <div className="booking-metric-card">
                <span>Total cargo volume</span>
                <strong>{totals.totalVolume.toFixed(1)} m3</strong>
              </div>
              <div className="booking-metric-card booking-metric-card-highlight">
                <span>Recommended truck</span>
                <strong>{recommendedTruck.name}</strong>
              </div>
            </div>

            <div className="booking-price-card booking-price-card-premium">
              <div><span>Base + route</span><strong>${pricing.subtotal.toFixed(0)}</strong></div>
              <div><span>Service fee</span><strong>${pricing.serviceFee.toFixed(0)}</strong></div>
              <div><span>Priority dispatch</span><strong>{priority ? "$42" : "$0"}</strong></div>
              <div className="booking-total-row"><span>Total payable</span><strong>${finalTotal.toFixed(0)}</strong></div>
            </div>

            <div className="booking-route-glance">
              <div className="booking-route-chip"><span>Pickup</span><strong>{pickup}</strong></div>
              <div className="booking-route-chip"><span>Drop</span><strong>{dropoff}</strong></div>
              <div className="booking-route-chip"><span>Schedule</span><strong>{pickupDate} at {pickupTime}</strong></div>
            </div>

            {bookingResult ? (
              <motion.div className="booking-confirmation booking-confirmation-premium" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <span className="sim-kicker">Booking Confirmed</span>
                <strong>{bookingResult.bookingId}</strong>
                <p>{bookingResult.contactName}, your truck has been reserved and is ready to move into dispatch tracking.</p>
                <div className="booking-confirm-grid">
                  <div><span>Assigned Truck</span><strong>{bookingResult.chosenTruck}</strong></div>
                  <div><span>Payable</span><strong>${bookingResult.total.toFixed(0)}</strong></div>
                </div>
                <Link className="primary-action" to="/tracking">Open Tracking Desk</Link>
              </motion.div>
            ) : null}
          </div>
        </motion.aside>
      </section>
    </div>
  );
}


