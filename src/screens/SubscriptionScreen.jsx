import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SubscriptionScreen.css";

function SubscriptionScreen() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);

  // Load user's current subscription
  useEffect(() => {
    if (user?.email) {
      const subscriptions =
        JSON.parse(localStorage.getItem("subscriptions")) || [];
      const userSub = subscriptions.find((sub) => sub.userEmail === user?.email);
      setUserSubscription(userSub);
    }
  }, [user?.email]);

  const SUBSCRIPTION_TIERS = {
    STARTER: {
      id: "starter",
      name: "Starter",
      price: 9.99,
      description: "Perfect for getting started",
      features: [
        "Access to 5 services per month",
        "Email support",
        "Basic booking features",
        "Service history tracking",
      ],
    },
    PROFESSIONAL: {
      id: "professional",
      name: "Professional",
      price: 24.99,
      description: "Best for regular users",
      features: [
        "Access to 20 services per month",
        "Priority email support",
        "Advanced booking features",
        "Detailed analytics",
        "Preferred pricing on services",
      ],
    },
    ENTERPRISE: {
      id: "enterprise",
      name: "Enterprise",
      price: 99.99,
      description: "For power users",
      features: [
        "Unlimited services per month",
        "24/7 priority phone support",
        "All advanced features",
        "Custom analytics dashboard",
        "Dedicated account manager",
        "Exclusive offers & discounts",
      ],
    },
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handlePayment = (planId) => {
    if (!window.confirm(`Subscribe to ${planId}? You will be charged $${SUBSCRIPTION_TIERS[planId.toUpperCase()].price}/month`)) {
      return;
    }

    // Save subscription to localStorage
    const subscriptions =
      JSON.parse(localStorage.getItem("subscriptions")) || [];

    // Remove old subscription if exists
    const updatedSubscriptions = subscriptions.filter(
      (sub) => sub.userEmail !== user?.email
    );

    const newSubscription = {
      id: Date.now(),
      userEmail: user?.email,
      userName: user?.name,
      planId: planId,
      planName:
        SUBSCRIPTION_TIERS[planId.toUpperCase()].name,
      price: SUBSCRIPTION_TIERS[planId.toUpperCase()].price,
      subscriptionDate: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      paypalTransactionId: `TXN-${Date.now()}`, // Simulated PayPal transaction
    };

    updatedSubscriptions.push(newSubscription);
    localStorage.setItem("subscriptions", JSON.stringify(updatedSubscriptions));

    setUserSubscription(newSubscription);
    setShowPayment(false);
    setSelectedPlan(null);

    // Show success message
    alert("Subscription successful! Welcome to the " + newSubscription.planName + " plan.");
  };

  const handleCancelSubscription = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You can resubscribe anytime."
      )
    ) {
      const subscriptions =
        JSON.parse(localStorage.getItem("subscriptions")) || [];
      const updatedSubscriptions = subscriptions.map((sub) =>
        sub.userEmail === user?.email
          ? { ...sub, status: "cancelled" }
          : sub
      );
      localStorage.setItem("subscriptions", JSON.stringify(updatedSubscriptions));
      setUserSubscription(null);
      alert("Subscription cancelled.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="subscription-screen">
      <div className="subscription-container">
        {/* Header */}
        <div className="subscription-header">
          <h1>Choose Your Plan</h1>
          <p className="subscription-subtitle">
            Unlock premium features and get priority support
          </p>
        </div>

        {/* Current Subscription Info */}
        {userSubscription && userSubscription.status === "active" && (
          <div className="current-subscription">
            <div className="subscription-info">
              <h3>Current Plan: {userSubscription.planName}</h3>
              <p>
                Subscribed since{" "}
                {new Date(userSubscription.subscriptionDate).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
              <p className="renewal-info">
                Renews on{" "}
                {new Date(userSubscription.renewalDate).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
            </div>
            <button
              className="btn-cancel-subscription"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="plans-grid">
          {Object.values(SUBSCRIPTION_TIERS).map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${
                plan.id === "professional" ? "featured" : ""
              } ${
                userSubscription?.planId === plan.id &&
                userSubscription?.status === "active"
                  ? "active"
                  : ""
              }`}
            >
              {plan.id === "professional" && (
                <div className="featured-badge">Most Popular</div>
              )}

              {userSubscription?.planId === plan.id &&
                userSubscription?.status === "active" && (
                  <div className="active-badge">Current Plan</div>
                )}

              <h2>{plan.name}</h2>
              <p className="plan-description">{plan.description}</p>

              <div className="price-section">
                <span className="currency">$</span>
                <span className="amount">{plan.price.toFixed(2)}</span>
                <span className="period">/month</span>
              </div>

              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`btn-subscribe-plan ${
                  userSubscription?.planId === plan.id &&
                  userSubscription?.status === "active"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  if (
                    userSubscription?.planId === plan.id &&
                    userSubscription?.status === "active"
                  ) {
                    alert("You are already subscribed to this plan.");
                  } else {
                    handlePayment(plan.id.toUpperCase());
                  }
                }}
              >
                {userSubscription?.planId === plan.id &&
                userSubscription?.status === "active"
                  ? "Current Plan"
                  : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I change my plan?</h4>
              <p>
                Yes! You can upgrade or downgrade your plan anytime. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="faq-item">
              <h4>Is there a free trial?</h4>
              <p>
                We don't offer a free trial, but you can cancel anytime within
                the first 30 days for a full refund.
              </p>
            </div>

            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>
                We accept all major credit cards and PayPal for secure payments.
              </p>
            </div>

            <div className="faq-item">
              <h4>Do you offer refunds?</h4>
              <p>
                If you cancel within 30 days of your subscription, you'll
                receive a full refund. No questions asked!
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <h2>Why Subscribe?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Unlock Premium Features</h3>
              <p>
                Access exclusive services and advanced booking capabilities
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3>Priority Support</h3>
              <p>Get faster response times from our dedicated support team</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Save More</h3>
              <p>Enjoy exclusive discounts on all services and premium pricing</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>Track your bookings and spending with detailed insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionScreen;
