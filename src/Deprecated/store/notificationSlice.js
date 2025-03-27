// // src/features/notifications/notificationSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   notifications: [],
//   config: {
//     defaultDuration: 10000, // Default duration for notifications (10 seconds)
//     maxNotifications: 5, // Maximum number of notifications to show at once
//   },
// };

// let nextNotificationId = 1;

// const notificationSlice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {
//     addNotification: (state, action) => {
//       const id = nextNotificationId++;
//       const notification = {
//         id,
//         title: action.payload.title || "Notification",
//         message: action.payload.message,
//         type: action.payload.type || "info", // info, success, error, warning
//         autoRemove: action.payload.autoRemove !== false,
//         duration: action.payload.duration || state.config.defaultDuration,
//         timestamp: Date.now(),
//         // Additional customizable properties
//         icon: action.payload.icon || null,
//         priority: action.payload.priority || "normal", // low, normal, high
//         actionLabel: action.payload.actionLabel || null,
//         actionCallback: action.payload.actionCallback || null,
//       };

//       // Add notification to the beginning of the array (newest first)
//       state.notifications.push(notification);

//       // Limit the number of notifications if needed
//       if (state.notifications.length > state.config.maxNotifications) {
//         // Remove oldest notifications that exceed the limit
//         state.notifications = state.notifications.slice(
//           -state.config.maxNotifications
//         );
//       }
//     },
//     removeNotification: (state, action) => {
//       const index = state.notifications.findIndex(
//         (notification) => notification.id === action.payload
//       );
//       if (index !== -1) {
//         state.notifications.splice(index, 1);
//       }
//     },
//     clearAllNotifications: (state) => {
//       state.notifications = [];
//     },
//     updateConfig: (state, action) => {
//       state.config = {
//         ...state.config,
//         ...action.payload,
//       };
//     },
//   },
// });

// export const {
//   addNotification,
//   removeNotification,
//   clearAllNotifications,
//   updateConfig,
// } = notificationSlice.actions;

// // Single unified function to show notifications of any type
// export const showNotification = (type, message, options = {}) => {
//   // Default titles based on notification type
//   const defaultTitles = {
//     error: "Error",
//     success: "Success",
//     info: "Info",
//     warning: "Warning",
//   };

//   return addNotification({
//     message,
//     type,
//     title: options.title || defaultTitles[type] || "Notification",
//     ...options,
//   });
// };

// // For backward compatibility - these functions can still be used
// export const showError = (message, options = {}) =>
//   showNotification("error", message, options);

// export const showSuccess = (message, options = {}) =>
//   showNotification("success", message, options);

// export const showInfo = (message, options = {}) =>
//   showNotification("info", message, options);

// export const showWarning = (message, options = {}) =>
//   showNotification("warning", message, options);

// // Middleware to auto-remove notifications after their duration
// export const notificationMiddleware = (store) => (next) => (action) => {
//   const result = next(action);

//   if (action.type === notificationSlice.actions.addNotification.type) {
//     const notification = store
//       .getState()
//       .Notifications.notifications.slice(-1)[0];
//     if (notification && notification.autoRemove) {
//       setTimeout(() => {
//         store.dispatch(removeNotification(notification.id));
//       }, notification.duration);
//     }
//   }

//   return result;
// };

// export default notificationSlice.reducer;
