// src/context/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react";

// Default configuration
const defaultConfig = {
  duration: 5000, // Default duration for notifications (5 seconds)
  position: "top-center", // top-center, top-right, top-left, bottom-right, bottom-left, bottom-center
  width: "350px",
  cardHeight: "70px", // Card height (previously this was maxHeight)
  cardSpacing: 84, // Spacing between expanded cards
  stackOffset: 8, // Offset for stacked cards
  defaultColors: {
    error: "rgb(220, 38, 38)", // Red
    success: "rgb(22, 163, 74)", // Green
    warning: "rgb(234, 179, 8)", // Yellow
    info: "rgb(94, 35, 157)", // Purple
  },
  customColors: {}, // For overriding colors
  zIndex: 50,
};

// Initial state
const initialState = {
  notifications: [],
  config: defaultConfig,
  nextId: 1, // Track ID counter in the state
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "ADD_NOTIFICATION": {
      // Generate a unique deduplication key based on message content and timestamp
      const dedupKey = `${action.payload.message}-${
        action.payload.type
      }-${Date.now()}`;

      // Check if we've recently added a very similar notification (within last 500ms)
      const isDuplicate = state.notifications.some((notif) => {
        const timeDiff = Date.now() - notif.timestamp;
        const isSameContent =
          notif.message === action.payload.message &&
          notif.type === action.payload.type;
        // Consider it a duplicate if it's the same content and added within the last 500ms
        return isSameContent && timeDiff < 500;
      });

      // Skip adding duplicate notifications
      if (isDuplicate) {
        console.log(
          `Skipping duplicate notification: "${action.payload.message}"`
        );
        return state;
      }

      const id = state.nextId; // Use ID from state
      const notification = {
        id,
        title: action.payload.title || "Notification",
        message: action.payload.message,
        type: action.payload.type || "info", // info, success, error, warning
        autoRemove: action.payload.autoRemove !== false,
        duration: action.payload.duration || state.config.duration,
        timestamp: Date.now(),
        dedupKey, // Store the deduplication key
        // Additional customizable properties
        icon: action.payload.icon || null,
        priority: action.payload.priority || "normal", // low, normal, high
        actionLabel: action.payload.actionLabel || null,
        actionCallback: action.payload.actionCallback || null,
        // Per-notification configuration overrides
        width: action.payload.width || null,
        cardHeight: action.payload.cardHeight || null,
      };

      console.log(`Adding notification #${id} with dedupKey: ${dedupKey}`);

      // Add notification to the array and increment the ID counter
      return {
        ...state,
        notifications: [...state.notifications, notification],
        nextId: state.nextId + 1, // Increment in state
      };
    }
    case "REMOVE_NOTIFICATION": {
      const idToRemove = action.payload;
      console.log(`Removing notification #${idToRemove}`);

      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== idToRemove
      );

      console.log(
        `Current notifications: ${state.notifications.length}, After removal: ${updatedNotifications.length}`
      );

      return {
        ...state,
        notifications: updatedNotifications,
      };
    }
    case "CLEAR_ALL_NOTIFICATIONS": {
      return {
        ...state,
        notifications: [],
      };
    }
    case "UPDATE_CONFIG": {
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        },
      };
    }
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext(null);

// Provider component
export const NotificationProvider = ({ children, ...configProps }) => {
  // Keep track of notification timers
  const notificationTimers = useRef(new Map());
  const dispatchLockRef = useRef(false); // Add lock reference

  const [state, dispatch] = useReducer(notificationReducer, {
    ...initialState,
    config: { ...defaultConfig, ...configProps },
  });

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any remaining timers
      notificationTimers.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
    };
  }, []);

  // Enhanced dispatch with idempotent timer handling
  const enhancedDispatch = useCallback(
    (action) => {
      // For ADD_NOTIFICATION, use a lock to prevent multiple rapid calls
      if (action.type === "ADD_NOTIFICATION") {
        if (dispatchLockRef.current) {
          // We're in a lock period, skip this action
          console.log(`Skipping action due to dispatch lock`);
          return;
        }

        // Set lock for a short period (50ms)
        dispatchLockRef.current = true;
        setTimeout(() => {
          dispatchLockRef.current = false;
        }, 50);
      }

      // Process the action
      dispatch(action);

      // Set up auto-removal only if it's an add notification action
      if (action.type === "ADD_NOTIFICATION") {
        const notificationId = state.nextId;

        if (action.payload.autoRemove !== false) {
          const duration = action.payload.duration || state.config.duration;

          // Clear any existing timer for this ID (should not happen, but just in case)
          if (notificationTimers.current.has(notificationId)) {
            clearTimeout(notificationTimers.current.get(notificationId));
          }

          console.log(
            `Setting timeout to remove notification #${notificationId} after ${duration}ms`
          );

          // Set the new timer
          const timerId = setTimeout(() => {
            console.log(
              `Timeout fired: removing notification #${notificationId}`
            );
            dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });
            // Remove the timer reference
            notificationTimers.current.delete(notificationId);
          }, duration);

          // Store the timer ID
          notificationTimers.current.set(notificationId, timerId);
        }
      }
      // Handle removal by clearing associated timer
      else if (action.type === "REMOVE_NOTIFICATION") {
        const idToRemove = action.payload;
        if (notificationTimers.current.has(idToRemove)) {
          clearTimeout(notificationTimers.current.get(idToRemove));
          notificationTimers.current.delete(idToRemove);
        }
      }
      // Handle clearing all notifications
      else if (action.type === "CLEAR_ALL_NOTIFICATIONS") {
        // Clear all timers
        notificationTimers.current.forEach((timerId) => {
          clearTimeout(timerId);
        });
        notificationTimers.current.clear();
      }
    },
    [state.nextId, state.config.duration]
  );

  // Notification action creators
  const showNotification = useCallback(
    (type, message, options = {}) => {
      // Default titles based on notification type
      const defaultTitles = {
        error: "Error",
        success: "Success",
        info: "Info",
        warning: "Warning",
      };

      enhancedDispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          message,
          type,
          title: options.title || defaultTitles[type] || "Notification",
          ...options,
        },
      });
    },
    [enhancedDispatch]
  );

  const showError = useCallback(
    (message, options = {}) => showNotification("error", message, options),
    [showNotification]
  );

  const showSuccess = useCallback(
    (message, options = {}) => showNotification("success", message, options),
    [showNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => showNotification("info", message, options),
    [showNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => showNotification("warning", message, options),
    [showNotification]
  );

  const removeNotification = useCallback(
    (id) => {
      enhancedDispatch({ type: "REMOVE_NOTIFICATION", payload: id });
    },
    [enhancedDispatch]
  );

  const clearAllNotifications = useCallback(() => {
    enhancedDispatch({ type: "CLEAR_ALL_NOTIFICATIONS" });
  }, [enhancedDispatch]);

  const updateConfig = useCallback(
    (config) => {
      enhancedDispatch({ type: "UPDATE_CONFIG", payload: config });
    },
    [enhancedDispatch]
  );

  // Enhanced notification object for the components
  const enhancedNotifications = state.notifications.map((notification) => {
    // Allow per-notification config overrides
    return {
      ...notification,
      config: {
        ...state.config,
        width: notification.width || state.config.width,
        cardHeight: notification.cardHeight || state.config.cardHeight,
      },
    };
  });

  // Create value object with state and actions
  const value = {
    notifications: enhancedNotifications,
    config: state.config,
    showNotification,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    removeNotification,
    clearAllNotifications,
    updateConfig,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Global notification API
export const NotificationAPI = (() => {
  let notificationContextValue = null;

  const setContextValue = (contextValue) => {
    notificationContextValue = contextValue;
  };

  const getContextValue = () => {
    if (!notificationContextValue) {
      console.warn(
        "Notification context not initialized yet. Make sure NotificationProvider is rendered."
      );
      return null;
    }
    return notificationContextValue;
  };

  // Global functions
  const showNotification = (type, message, options = {}) => {
    const context = getContextValue();
    if (context) {
      context.showNotification(type, message, options);
    }
  };

  const showError = (message, options = {}) => {
    const context = getContextValue();
    if (context) {
      context.showError(message, options);
    }
  };

  const showSuccess = (message, options = {}) => {
    const context = getContextValue();
    if (context) {
      context.showSuccess(message, options);
    }
  };

  const showInfo = (message, options = {}) => {
    const context = getContextValue();
    if (context) {
      context.showInfo(message, options);
    }
  };

  const showWarning = (message, options = {}) => {
    const context = getContextValue();
    if (context) {
      context.showWarning(message, options);
    }
  };

  const clearAllNotifications = () => {
    const context = getContextValue();
    if (context) {
      context.clearAllNotifications();
    }
  };

  return {
    setContextValue,
    showNotification,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    clearAllNotifications,
  };
})();
