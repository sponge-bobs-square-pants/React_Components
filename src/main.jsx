import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { NotificationProvider, NotificationPortal } from "./index.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationProvider
      position="top-center"
      width="350px"
      cardHeight="80px"
      cardSpacing={90}
      stackOffset={3}
      zIndex={9999}
      duration={5000} // 5 seconds before notifications disappear
      headerText="Notifications" // Custom header text
      actionButton="Clear" // "Collapse", "Clear", or "Mute"
      customColors={{
        error: "rgb(9, 9, 9)", // Brighter red
        success: "rgb(34, 197, 94)", // Brighter green
        warning: "rgb(250, 204, 21)", // Brighter yellow
        info: "rgb(79, 70, 229)", // Indigo
      }}
    >
      <App />
      <NotificationPortal />
    </NotificationProvider>
  </StrictMode>
);
