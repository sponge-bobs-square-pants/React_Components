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
  headerText: "Notifications", // Text to display in the header
  actionButton: "Collapse", // Default action button: Collapse, Clear, or Mute
  isMuted: false, // Mute state
  unreadCount: 0, // Counter for unseen notifications while muted
};

const initialState = {
  notifications: [],
  config: defaultConfig,
  nextId: 1,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "ADD_NOTIFICATION": {
      const dedupKey = `${action.payload.message}-${
        action.payload.type
      }-${Date.now()}`;
      const isDuplicate = state.notifications.some((notif) => {
        const timeDiff = Date.now() - notif.timestamp;
        const isSameContent =
          notif.message === action.payload.message &&
          notif.type === action.payload.type;
        return isSameContent && timeDiff < 500;
      });
      if (isDuplicate) {
        return state;
      }

      const id = state.nextId;
      const notification = {
        id,
        title: action.payload.title || "Notification",
        message: action.payload.message,
        type: action.payload.type || "info", // info, success, error, warning
        autoRemove: action.payload.autoRemove !== false,
        duration: action.payload.duration || state.config.duration,
        timestamp: Date.now(),
        dedupKey,
        icon: action.payload.icon || null,
        priority: action.payload.priority || "normal",
        actionCallback: action.payload.actionCallback || null,
        width: action.payload.width || null,
        cardHeight: action.payload.cardHeight || null,
      };
      if (state.config.isMuted) {
        return {
          ...state,
          notifications: [...state.notifications, notification],
          nextId: state.nextId + 1,
          config: {
            ...state.config,
            unreadCount: state.config.unreadCount + 1,
          },
        };
      }
      return {
        ...state,
        notifications: [...state.notifications, notification],
        nextId: state.nextId + 1,
      };
    }
    case "REMOVE_NOTIFICATION": {
      const idToRemove = action.payload;
      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== idToRemove
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
    case "TOGGLE_MUTE": {
      const newMutedState = !state.config.isMuted;
      return {
        ...state,
        config: {
          ...state.config,
          isMuted: newMutedState,
          unreadCount: newMutedState ? state.config.unreadCount : 0,
        },
      };
    }
    default:
      return state;
  }
};

const NotificationContext = createContext(null);
export const NotificationProvider = ({
  children,
  headerText,
  actionButton,
  ...configProps
}) => {
  const notificationTimers = useRef(new Map());
  const dispatchLockRef = useRef(false);

  const combinedConfig = {
    ...defaultConfig,
    ...configProps,
    headerText: headerText || defaultConfig.headerText,
    actionButton: actionButton || defaultConfig.actionButton,
  };

  const [state, dispatch] = useReducer(notificationReducer, {
    ...initialState,
    config: combinedConfig,
  });
  useEffect(() => {
    return () => {
      notificationTimers.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
    };
  }, []);
  useEffect(() => {
    const savedMuteState = localStorage.getItem("notifications-muted");
    if (savedMuteState === "true") {
      dispatch({
        type: "UPDATE_CONFIG",
        payload: { isMuted: true },
      });
    }
  }, []);

  const enhancedDispatch = useCallback(
    (action) => {
      if (action.type === "ADD_NOTIFICATION") {
        if (dispatchLockRef.current) {
          return;
        }
        dispatchLockRef.current = true;
        setTimeout(() => {
          dispatchLockRef.current = false;
        }, 50);
      }
      dispatch(action);
      if (action.type === "ADD_NOTIFICATION") {
        const notificationId = state.nextId;

        if (action.payload.autoRemove !== false) {
          const duration = action.payload.duration || state.config.duration;
          if (notificationTimers.current.has(notificationId)) {
            clearTimeout(notificationTimers.current.get(notificationId));
          }
          const timerId = setTimeout(() => {
            dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });
            notificationTimers.current.delete(notificationId);
          }, duration);
          notificationTimers.current.set(notificationId, timerId);
        }
      } else if (action.type === "REMOVE_NOTIFICATION") {
        const idToRemove = action.payload;
        if (notificationTimers.current.has(idToRemove)) {
          clearTimeout(notificationTimers.current.get(idToRemove));
          notificationTimers.current.delete(idToRemove);
        }
      } else if (action.type === "CLEAR_ALL_NOTIFICATIONS") {
        notificationTimers.current.forEach((timerId) => {
          clearTimeout(timerId);
        });
        notificationTimers.current.clear();
      }
    },
    [state.nextId, state.config.duration]
  );
  const toggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE_MUTE" });
    const newMuteState = !state.config.isMuted;
    localStorage.setItem("notifications-muted", newMuteState.toString());
  }, [state.config.isMuted]);
  const showNotification = useCallback(
    (type, message, options = {}) => {
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
  const enhancedNotifications = state.notifications.map((notification) => {
    return {
      ...notification,
      config: {
        ...state.config,
        width: notification.width || state.config.width,
        cardHeight: notification.cardHeight || state.config.cardHeight,
      },
    };
  });
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
    toggleMute,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
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

  const toggleMute = () => {
    const context = getContextValue();
    if (context) {
      context.toggleMute();
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
    toggleMute,
  };
})();
