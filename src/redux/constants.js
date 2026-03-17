// Auth Actions
export const SET_USER = "SET_USER";
export const LOGOUT_USER = "LOGOUT_USER";
export const SET_AUTH = "SET_AUTH";

// Services Actions
export const ADD_SERVICE = "ADD_SERVICE";
export const UPDATE_SERVICE = "UPDATE_SERVICE";
export const DELETE_SERVICE = "DELETE_SERVICE";
export const SET_SERVICES = "SET_SERVICES";

// Orders Actions
export const ADD_ORDER = "ADD_ORDER";
export const UPDATE_ORDER = "UPDATE_ORDER";
export const SET_ORDERS = "SET_ORDERS";

// Subscriptions Actions
export const ADD_SUBSCRIPTION = "ADD_SUBSCRIPTION";
export const SET_SUBSCRIPTIONS = "SET_SUBSCRIPTIONS";
export const UPDATE_SUBSCRIPTION_STATUS = "UPDATE_SUBSCRIPTION_STATUS";

// UI Actions
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const CLEAR_ERROR = "CLEAR_ERROR";

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  STARTER: {
    id: "starter",
    name: "Starter",
    price: 9.99,
    description: "Perfect for trying out",
    features: ["5 Services", "Basic Support", "Monthly Billing"],
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    price: 24.99,
    description: "Best for professionals",
    features: ["20 Services", "Priority Support", "Monthly Billing"],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: 99.99,
    description: "For large operations",
    features: ["Unlimited Services", "24/7 Support", "Monthly Billing"],
  },
};
