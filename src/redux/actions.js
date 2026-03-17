import {
  SET_USER,
  LOGOUT_USER,
  SET_AUTH,
  ADD_SERVICE,
  UPDATE_SERVICE,
  DELETE_SERVICE,
  SET_SERVICES,
  ADD_ORDER,
  UPDATE_ORDER,
  SET_ORDERS,
  ADD_SUBSCRIPTION,
  SET_SUBSCRIPTIONS,
  UPDATE_SUBSCRIPTION_STATUS,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
} from "./constants.js";

// Auth Actions
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const logoutUser = () => ({
  type: LOGOUT_USER,
});

export const setAuth = (isAuthenticated) => ({
  type: SET_AUTH,
  payload: isAuthenticated,
});

// Service Actions
export const addService = (service) => ({
  type: ADD_SERVICE,
  payload: service,
});

export const updateService = (serviceId, updates) => ({
  type: UPDATE_SERVICE,
  payload: { serviceId, updates },
});

export const deleteService = (serviceId) => ({
  type: DELETE_SERVICE,
  payload: serviceId,
});

export const setServices = (services) => ({
  type: SET_SERVICES,
  payload: services,
});

// Order Actions
export const addOrder = (order) => ({
  type: ADD_ORDER,
  payload: order,
});

export const updateOrder = (orderId, updates) => ({
  type: UPDATE_ORDER,
  payload: { orderId, updates },
});

export const setOrders = (orders) => ({
  type: SET_ORDERS,
  payload: orders,
});

// Subscription Actions
export const addSubscription = (subscription) => ({
  type: ADD_SUBSCRIPTION,
  payload: subscription,
});

export const setSubscriptions = (subscriptions) => ({
  type: SET_SUBSCRIPTIONS,
  payload: subscriptions,
});

export const updateSubscriptionStatus = (subscriptionId, status) => ({
  type: UPDATE_SUBSCRIPTION_STATUS,
  payload: { subscriptionId, status },
});

// UI Actions
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const clearError = () => ({
  type: CLEAR_ERROR,
});
