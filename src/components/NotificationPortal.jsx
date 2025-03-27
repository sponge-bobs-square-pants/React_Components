// src/components/NotificationPortal.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import NotificationCardStack from "./NotificationCardStack";
import {
  useNotification,
  NotificationAPI,
} from "../context/NotificationContext";

const NotificationPortal = () => {
  const notificationContext = useNotification();

  // Connect the context to the global API when the component mounts
  useEffect(() => {
    NotificationAPI.setContextValue(notificationContext);
  }, [notificationContext]);

  // Create a portal that renders outside of your app's DOM hierarchy
  return ReactDOM.createPortal(<NotificationCardStack />, document.body);
};

export default NotificationPortal;
