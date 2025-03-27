# ios-notification-stack

An elegant, iOS-style notification system for React applications with zero Redux dependency. This package provides beautifully animated, stackable notifications with customizable positions, colors, and behaviors.

## Installation

```bash
npm install ios-notification-stack
# or
yarn add ios-notification-stack
```

## Features

- 📱 iOS-inspired notification design and animations
- 🔄 Simple context-based state management (no Redux required)
- 📍 Flexible positioning (top/bottom, left/center/right)
- 🎨 Customizable colors, sizes, and spacing
- 📚 Four notification types: success, error, warning, and info
- 📏 Configurable stacking behavior and card dimensions
- 🚀 Global API for adding notifications from anywhere
- ⚡ Per-notification configuration for fine-grained control

## Usage

### 1. Set up the NotificationProvider in your root component

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  NotificationProvider,
  NotificationPortal,
} from "ios-notification-stack";

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
      customColors={{
        error: "rgb(9, 9, 9)", // Dark black
        success: "rgb(34, 197, 94)", // Bright green
        warning: "rgb(250, 204, 21)", // Bright yellow
        info: "rgb(79, 70, 229)", // Indigo
      }}
    >
      <App />
      <NotificationPortal />
    </NotificationProvider>
  </StrictMode>
);
```

### 2. Show notifications from anywhere in your app

```javascript
import React from "react";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showNotification,
} from "ios-notification-stack";
import "ios-notification-stack/dist/style.css";

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
```

## API Reference

### NotificationProvider Props

| Prop           | Type   | Default        | Description                                                                                                                           |
| -------------- | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `position`     | string | `"top-center"` | Position of notifications. Options: `"top-center"`, `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"bottom-center"` |
| `width`        | string | `"350px"`      | Default width of notification cards                                                                                                   |
| `cardHeight`   | string | `"80px"`       | Default height of each notification card                                                                                              |
| `cardSpacing`  | number | `90`           | Spacing between expanded cards (in pixels)                                                                                            |
| `stackOffset`  | number | `3`            | Offset for stacked cards (in pixels)                                                                                                  |
| `zIndex`       | number | `9999`         | z-index for the notification container                                                                                                |
| `duration`     | number | `5000`         | Default duration for notifications (in milliseconds)                                                                                  |
| `customColors` | object | `{}`           | Custom colors for different notification types                                                                                        |

### Notification Options

| Option           | Type     | Default               | Description                                            |
| ---------------- | -------- | --------------------- | ------------------------------------------------------ |
| `title`          | string   | Type-specific default | Title of the notification                              |
| `duration`       | number   | From provider config  | How long to display the notification (in milliseconds) |
| `autoRemove`     | boolean  | `true`                | Whether the notification should auto-remove            |
| `width`          | string   | From provider config  | Width of this specific notification                    |
| `cardHeight`     | string   | From provider config  | Height of this specific notification                   |
| `icon`           | element  | `null`                | Custom icon for the notification                       |
| `priority`       | string   | `"normal"`            | Priority level: `"low"`, `"normal"`, or `"high"`       |
| `actionLabel`    | string   | `null`                | Text for action button                                 |
| `actionCallback` | function | `null`                | Callback for action button                             |

### Global Functions

| Function                | Parameters                 | Description                                       |
| ----------------------- | -------------------------- | ------------------------------------------------- |
| `showNotification`      | `(type, message, options)` | Generic function to show any type of notification |
| `showSuccess`           | `(message, options)`       | Show a success notification                       |
| `showError`             | `(message, options)`       | Show an error notification                        |
| `showWarning`           | `(message, options)`       | Show a warning notification                       |
| `showInfo`              | `(message, options)`       | Show an information notification                  |
| `clearAllNotifications` | `()`                       | Remove all notifications                          |

### Hook API

For components that need more control, you can use the provided hook:

```javascript
import { useNotification } from "ios-notification-stack";

function MyComponent() {
  const { showSuccess, showError, removeNotification, clearAllNotifications } =
    useNotification();

  // Now use these functions directly
}
```

## Migrating from Redux-based Version

If you're upgrading from the Redux-based version of this library:

1. Remove Redux store configuration for notifications
2. Add `NotificationProvider` to your root component
3. Replace `store.dispatch(showSuccess(...))` calls with direct `showSuccess(...)` calls

The UI and customization options remain the same, but the implementation is now much simpler!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Your Name - [@polo15s](https://github.com/sponge-bobs-square-pants)
