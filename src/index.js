// src/index.js
import NotificationPortal from "./components/NotificationPortal";
import {
  NotificationProvider,
  useNotification,
  NotificationAPI,
} from "./context/NotificationContext";
import "./index.css";

// Export components
export { NotificationPortal, NotificationProvider, useNotification };

// Export global API functions
export const showNotification = NotificationAPI.showNotification;
export const showError = NotificationAPI.showError;
export const showSuccess = NotificationAPI.showSuccess;
export const showInfo = NotificationAPI.showInfo;
export const showWarning = NotificationAPI.showWarning;
export const clearAllNotifications = NotificationAPI.clearAllNotifications;
export const toggleMute = NotificationAPI.toggleMute;
