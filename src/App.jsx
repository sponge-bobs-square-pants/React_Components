import React from "react";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showNotification,
} from "./index";

function App() {
  // Function to test all notification types
  const testNotifications = () => {
    showNotification("success", "hey there", {
      width: "700px",
      duration: 14000,
    });
    showSuccess("This is a success message!");

    setTimeout(() => {
      showError("Something went wrong!", {
        title: "Error Occurred",
        duration: 8000,
      });
    }, 1000);

    setTimeout(() => {
      showWarning("This is a warning");
    }, 2000);

    setTimeout(() => {
      showInfo("Here's some information");
    }, 3000);
  };

  return (
    <div>
      <h1>Notification Test</h1>
      <p>Click the button below to test all notification types:</p>

      <button
        onClick={testNotifications}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4F46E5",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Test All Notifications
      </button>
    </div>
  );
}

export default App;
