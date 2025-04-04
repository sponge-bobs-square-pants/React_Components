import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import NotificationCardStack from "./NotificationCardStack";
import {
  useNotification,
  NotificationAPI,
} from "../context/NotificationContext";

const NotificationPortal = () => {
  const notificationContext = useNotification();
  useEffect(() => {
    NotificationAPI.setContextValue(notificationContext);
  }, [notificationContext]);

  return ReactDOM.createPortal(<NotificationCardStack />, document.body);
};

export default NotificationPortal;
