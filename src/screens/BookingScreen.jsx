import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAuth } from "../context/AuthContext";
import "./BookingScreen.css";

const STEPS = ["Location", "Unit Details", "Date & Time", "Contact Details"];

const CITIES = [
  "Manila", "Quezon City", "Cebu City", "Davao City", "Caloocan",
  "Zamboanga City", "Taguig", "Antipolo", "Pasig", "Cagayan de Oro",
  "Parañaque", "Makati", "Bacolod", "General Santos", "Iloilo City",
  "Angeles City", "Dasmariñas", "Mandaluyong", "Valenzuela", "Baguio City",
  "San Fernando", "Lapu-Lapu City", "Muntinlupa", "Rizal", "Tarlac",
];

const PROPERTY_TYPES = [
  "Residential - Apartment",
  "Residential - House",
  "Commercial - Office",
  "Commercial - Shop",
];

const BRANDS = [
  "Samsung", "LG", "Whirlpool", "Godrej", "Haier",
  "Bosch", "IFB", "Daikin", "Voltas", "Other",
];

const TIME_SLOTS = [
  "Morning (8AM – 12PM)",
  "Afternoon (12PM – 4PM)",
  "Evening (4PM – 8PM)",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);
const TODAY = new Date().toISOString().split("T")[0];

function BookingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const service = location.state?.service;
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb";
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const [currentStep, setCurrentStep] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paidFor, setPaidFor] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [formData, setFormData] = useState({
    city: "",
    propertyType: "",
    brand: "",
    model: "",
    yearOfPurchase: "",
    issueDescription: "",
    preferredDate: "",
    timeSlot: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  if (!service) {
    return (
      <main className="booking-screen">
        <div className="booking-error">
          <p>Service not found.</p>
          <button className="bk-back-btn" onClick={() => navigate("/")}>
            Back to Services
          </button>
        </div>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.city) newErrors.city = "Please select a city";
      if (!formData.propertyType) newErrors.propertyType = "Please select a property type";
    } else if (currentStep === 1) {
      if (!formData.brand) newErrors.brand = "Please select a brand";
      if (!formData.issueDescription) newErrors.issueDescription = "Please describe the issue";
    } else if (currentStep === 2) {
      if (!formData.preferredDate) newErrors.preferredDate = "Please select a date";
      if (!formData.timeSlot) newErrors.timeSlot = "Please select a time slot";
    } else if (currentStep === 3) {
      if (!formData.fullName) newErrors.fullName = "Please enter your name";
      if (!formData.phone) newErrors.phone = "Please enter your phone number";
      else if (!/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, "")))
        newErrors.phone = "Enter a valid 10-digit phone number";
      if (!formData.address) newErrors.address = "Please enter your address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Show payment modal instead of alerting
      setShowPaymentModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else navigate(-1);
  };

  const getAccessToken = () => {
    return (
      localStorage.getItem("access") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  const createOrderRecord = async (paypalTransactionId, paypalDetails) => {
    const booking = {
      bookingId: `BK_${Date.now()}`,
      paypalOrderDescription: service.service_name,
      amount: Number(service.price),
      currency: "USD",
      merchantId: "MERCHANT_PLATFORM",
      sellerMerchantId: service.merchant_id || "SELLER_PENDING",
      sellerName: service.name_of_the_expert,
      serviceId: service.id,
      serviceName: service.service_name,
      servicePrice: Number(service.price),
      serviceExpert: service.name_of_the_expert,
      customerName: formData.fullName || user?.name || user?.username || "",
      customerEmail: formData.email || user?.email || "",
      customerPhone: formData.phone,
      customerAddress: formData.address,
      location: formData.city,
      propertyType: formData.propertyType,
      brand: formData.brand,
      model: formData.model,
      issueDescription: formData.issueDescription,
      preferredDate: formData.preferredDate,
      timeSlot: formData.timeSlot,
      paymentStatus: "completed",
      transactionId: paypalTransactionId,
      invoiceNumber: paypalDetails?.purchase_units?.[0]?.invoice_id || `INV_${Date.now()}`,
      bookingDate: new Date().toISOString(),
    };

    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    transactions.push(booking);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    try {
      await fetch(`${apiBaseUrl}/api/v1/orders/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          service: service.id,
          paypal_transaction_id: paypalTransactionId,
          price_paid: Number(service.price),
        }),
      });
    } catch (error) {
      console.error("Order API write failed, kept local record.", error);
    }
  };

  const handleApprove = async (data, actions) => {
    try {
      setIsProcessingPayment(true);
      setPaypalError("");
      const details = await actions.order.capture();
      const paypalTransactionId = details?.id || data?.orderID || `TXN_${Date.now()}`;

      await createOrderRecord(paypalTransactionId, details);

      setPaidFor(true);
      alert(`Payment successful! Transaction ID: ${paypalTransactionId}`);
      setShowPaymentModal(false);
      navigate("/");
    } catch (error) {
      setPaypalError("Payment capture failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const createPaypalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: service.service_name,
          amount: {
            currency_code: "USD",
            value: Number(service.price).toFixed(2),
          },
        },
      ],
    });
  };

  const handlePaypalError = () => {
    setPaypalError("PayPal could not be initialized. Check your client ID and try again.");
    setIsProcessingPayment(false);
  };

  return (
    <main className="booking-screen">
      {/* ── Stepper ── */}
      <div className="bk-stepper">
        {STEPS.map((label, index) => (
          <div
            key={index}
            className={`bk-step ${index === currentStep ? "bk-step--active" : ""} ${index < currentStep ? "bk-step--done" : ""}`}
          >
            <span className="bk-step-num">Step {index + 1} of {STEPS.length}</span>
            <span className="bk-step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="bk-body">
        {/* Form */}
        <section className="bk-form-section">
          {/* Step 1 – Location */}
          {currentStep === 0 && (
            <div className="bk-step-content">
              <h2 className="bk-step-title">
                Where is the {service.service_name.toLowerCase()} located?
              </h2>
              <div className="bk-row">
                <div className="bk-group">
                  <label className="bk-label">Service City</label>
                  <div className="bk-select-wrap">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`bk-select ${errors.city ? "bk-input--error" : ""}`}
                    >
                      <option value="">Select your city</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {errors.city && <span className="bk-error">{errors.city}</span>}
                </div>
                <div className="bk-group">
                  <label className="bk-label">Property Type</label>
                  <div className="bk-select-wrap">
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className={`bk-select ${errors.propertyType ? "bk-input--error" : ""}`}
                    >
                      <option value="">Select your property type</option>
                      {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  {errors.propertyType && <span className="bk-error">{errors.propertyType}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Unit Details */}
          {currentStep === 1 && (
            <div className="bk-step-content">
              <h2 className="bk-step-title">
                Tell us about your {service.service_name.toLowerCase()}
              </h2>
              <div className="bk-row">
                <div className="bk-group">
                  <label className="bk-label">Brand</label>
                  <div className="bk-select-wrap">
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className={`bk-select ${errors.brand ? "bk-input--error" : ""}`}
                    >
                      <option value="">Select brand</option>
                      {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {errors.brand && <span className="bk-error">{errors.brand}</span>}
                </div>
                <div className="bk-group">
                  <label className="bk-label">Model <span className="bk-optional">(optional)</span></label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Enter model number"
                    className="bk-input"
                  />
                </div>
              </div>
              <div className="bk-row">
                <div className="bk-group">
                  <label className="bk-label">Year of Purchase <span className="bk-optional">(optional)</span></label>
                  <div className="bk-select-wrap">
                    <select
                      name="yearOfPurchase"
                      value={formData.yearOfPurchase}
                      onChange={handleChange}
                      className="bk-select"
                    >
                      <option value="">Select year</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="bk-group bk-group--full">
                <label className="bk-label">Describe the Issue</label>
                <textarea
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  placeholder="Briefly describe the problem..."
                  rows={4}
                  className={`bk-textarea ${errors.issueDescription ? "bk-input--error" : ""}`}
                />
                {errors.issueDescription && <span className="bk-error">{errors.issueDescription}</span>}
              </div>
            </div>
          )}

          {/* Step 3 – Date & Time */}
          {currentStep === 2 && (
            <div className="bk-step-content">
              <h2 className="bk-step-title">When would you like the service?</h2>
              <div className="bk-row">
                <div className="bk-group">
                  <label className="bk-label">Preferred Date</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={TODAY}
                    className={`bk-input ${errors.preferredDate ? "bk-input--error" : ""}`}
                  />
                  {errors.preferredDate && <span className="bk-error">{errors.preferredDate}</span>}
                </div>
                <div className="bk-group">
                  <label className="bk-label">Preferred Time Slot</label>
                  <div className="bk-select-wrap">
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className={`bk-select ${errors.timeSlot ? "bk-input--error" : ""}`}
                    >
                      <option value="">Select a time slot</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {errors.timeSlot && <span className="bk-error">{errors.timeSlot}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 – Contact Details */}
          {currentStep === 3 && (
            <div className="bk-step-content">
              <h2 className="bk-step-title">Your contact details</h2>
              <div className="bk-row">
                <div className="bk-group">
                  <label className="bk-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`bk-input ${errors.fullName ? "bk-input--error" : ""}`}
                  />
                  {errors.fullName && <span className="bk-error">{errors.fullName}</span>}
                </div>
                <div className="bk-group">
                  <label className="bk-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit phone number"
                    className={`bk-input ${errors.phone ? "bk-input--error" : ""}`}
                  />
                  {errors.phone && <span className="bk-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="bk-row">
                <div className="bk-group">
                  <label className="bk-label">Email <span className="bk-optional">(optional)</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="bk-input"
                  />
                </div>
                <div className="bk-group">
                  <label className="bk-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your service address"
                    className={`bk-input ${errors.address ? "bk-input--error" : ""}`}
                  />
                  {errors.address && <span className="bk-error">{errors.address}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="bk-actions">
            <button className="bk-back-btn" onClick={handleBack}>Back</button>
            <button className="bk-next-btn" onClick={handleNext}>
              {currentStep === STEPS.length - 1 ? "Confirm Booking" : "Next"}
            </button>
          </div>
        </section>

        {/* Request Summary */}
        <aside className="bk-summary">
          <h3 className="bk-summary-title">Request Summary</h3>
          <div className="bk-summary-card">
            <div className="bk-summary-item">
              <span className="bk-summary-label">Appliance</span>
              <span className="bk-summary-value">{service.service_name}</span>
            </div>
            {formData.city && (
              <div className="bk-summary-item">
                <span className="bk-summary-label">City</span>
                <span className="bk-summary-value">{formData.city}</span>
              </div>
            )}
            {formData.propertyType && (
              <div className="bk-summary-item">
                <span className="bk-summary-label">Property</span>
                <span className="bk-summary-value">{formData.propertyType}</span>
              </div>
            )}
            {formData.brand && (
              <div className="bk-summary-item">
                <span className="bk-summary-label">Brand</span>
                <span className="bk-summary-value">{formData.brand}</span>
              </div>
            )}
            {formData.preferredDate && (
              <div className="bk-summary-item">
                <span className="bk-summary-label">Date</span>
                <span className="bk-summary-value">{formData.preferredDate}</span>
              </div>
            )}
            {formData.timeSlot && (
              <div className="bk-summary-item">
                <span className="bk-summary-label">Time</span>
                <span className="bk-summary-value">{formData.timeSlot}</span>
              </div>
            )}
            <div className="bk-summary-item bk-summary-item--price">
              <span className="bk-summary-label">Price</span>
              <span className="bk-summary-value bk-summary-price">${service.price}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="bk-modal-overlay">
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bk-modal-header">
              <h2>Complete Payment</h2>
              <button
                className="bk-modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="bk-modal-body">
              <div className="bk-payment-info">
                <p className="bk-payment-label">Service</p>
                <p className="bk-payment-value">{service.service_name}</p>
              </div>

              <div className="bk-payment-info">
                <p className="bk-payment-label">Amount</p>
                <p className="bk-payment-value bk-payment-amount">${service.price}</p>
              </div>

              <div className="bk-payment-info">
                <p className="bk-payment-label">Service Expert</p>
                <p className="bk-payment-value">{service.name_of_the_expert}</p>
              </div>

              <div className="bk-payment-warning">
                <span className="bk-warning-icon">ℹ</span>
                <span>
                  This payment will be sent directly to the service expert's PayPal
                  account. Your platform account will track this transaction for
                  monitoring purposes.
                </span>
              </div>

              <div className="bk-payment-method">
                <div className="bk-method-card bk-method-paypal">
                  <span className="bk-method-icon">PayPal</span>
                  <span className="bk-method-desc">Pay securely with PayPal</span>
                </div>
              </div>

              <div className="bk-paypal-container">
                <PayPalScriptProvider
                  options={{
                    "client-id": paypalClientId,
                    currency: "USD",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={createPaypalOrder}
                    onApprove={handleApprove}
                    onError={handlePaypalError}
                    forceReRender={[service.price, service.service_name, paidFor]}
                    disabled={isProcessingPayment}
                  />
                </PayPalScriptProvider>
                {paypalError && <p className="bk-paypal-error">{paypalError}</p>}
              </div>

              <p className="bk-payment-disclaimer">
                By proceeding, you agree to pay via PayPal. A confirmation email will
                be sent to {formData.email || "your email"}.
              </p>
            </div>
            <div className="bk-modal-actions">
              <button
                className="bk-modal-btn bk-modal-btn--cancel"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default BookingScreen;
