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

const initialState = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
  services: {
    items: [],
    loading: false,
    error: null,
  },
  orders: {
    items: [],
    loading: false,
    error: null,
  },
  subscriptions: {
    items: [],
    loading: false,
    error: null,
  },
  ui: {
    loading: false,
    error: null,
  },
};

export default function rootReducer(state = initialState, action) {
  switch (action.type) {
    // Auth Reducers
    case SET_USER:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: true,
        },
      };

    case LOGOUT_USER:
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
        },
      };

    case SET_AUTH:
      return {
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: action.payload,
        },
      };

    // Service Reducers
    case ADD_SERVICE:
      return {
        ...state,
        services: {
          ...state.services,
          items: [...state.services.items, action.payload],
        },
      };

    case UPDATE_SERVICE:
      return {
        ...state,
        services: {
          ...state.services,
          items: state.services.items.map((service) =>
            service.id === action.payload.serviceId
              ? { ...service, ...action.payload.updates }
              : service
          ),
        },
      };

    case DELETE_SERVICE:
      return {
        ...state,
        services: {
          ...state.services,
          items: state.services.items.filter((s) => s.id !== action.payload),
        },
      };

    case SET_SERVICES:
      return {
        ...state,
        services: {
          ...state.services,
          items: action.payload,
        },
      };

    // Order Reducers
    case ADD_ORDER:
      return {
        ...state,
        orders: {
          ...state.orders,
          items: [...state.orders.items, action.payload],
        },
      };

    case UPDATE_ORDER:
      return {
        ...state,
        orders: {
          ...state.orders,
          items: state.orders.items.map((order) =>
            order.id === action.payload.orderId
              ? { ...order, ...action.payload.updates }
              : order
          ),
        },
      };

    case SET_ORDERS:
      return {
        ...state,
        orders: {
          ...state.orders,
          items: action.payload,
        },
      };

    // Subscription Reducers
    case ADD_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: {
          ...state.subscriptions,
          items: [...state.subscriptions.items, action.payload],
        },
      };

    case SET_SUBSCRIPTIONS:
      return {
        ...state,
        subscriptions: {
          ...state.subscriptions,
          items: action.payload,
        },
      };

    case UPDATE_SUBSCRIPTION_STATUS:
      return {
        ...state,
        subscriptions: {
          ...state.subscriptions,
          items: state.subscriptions.items.map((sub) =>
            sub.id === action.payload.subscriptionId
              ? { ...sub, status: action.payload.status }
              : sub
          ),
        },
      };

    // UI Reducers
    case SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };

    case SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      };

    case CLEAR_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: null,
        },
      };

    default:
      return state;
  }
}
