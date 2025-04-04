# ios-notification-stack

An elegant, iOS-style notification system for React applications with zero Redux dependency. This package provides beautifully animated, stackable notifications with customizable positions, colors, and behaviors.

## Demo

### Mute Notifications Demo

![Mute Notifications Demo](https://res.cloudinary.com/dfovdz88b/image/upload/v1743755163/dnd/farig3cjvgeamiknofj7.gif)

### Clear Notifications Demo

![Clear Notifications Demo](https://res.cloudinary.com/dfovdz88b/image/upload/v1743755014/dnd/p0tbdur45x2ntf0bypt3.gif)

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
- 🔕 Notification muting with unread counter
- 🗂️ Customizable header text for expanded notifications
- 🔄 Multiple action button options (Collapse, Clear, Mute)
- 💾 Persistent mute state across sessions
- 🔍 Smart duplicate notification detection
- 🎭 Smooth spring animations and opacity effects

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
import "ios-notification-stack/dist/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationProvider
      position="bottom-center"
      width="350px"
      cardHeight="80px"
      cardSpacing={90}
      stackOffset={3}
      zIndex={9999}
      duration={5000} // 5 seconds before notifications disappear
      headerText="System Notifications" // Custom header text
      actionButton="Mute" // "Collapse", "Clear", or "Mute"
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
    showError("Something went wrong", {
      title: "Error Title",
      duration: 10000,
    });

    setTimeout(() => {
      showSuccess("Everything is good", {
        title: "Good Job",
        duration: 8000,
      });
    }, 1000);

    setTimeout(() => {
      showInfo("Here's some important information", {
        title: "Info Alert",
        duration: 8000,
      });
    }, 1500);

    setTimeout(() => {
      showWarning("Please be careful with this action", {
        title: "Warning",
        duration: 8000,
      });
    }, 2000);

    setTimeout(() => {
      showNotification("error", "Custom notification with extended duration", {
        title: "Custom Notification",
        duration: 14000,
        width: "700px", // Override default width
      });
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

| Prop           | Type   | Default           | Description                                                                                                                           |
| -------------- | ------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `position`     | string | `"top-center"`    | Position of notifications. Options: `"top-center"`, `"top-right"`, `"top-left"`, `"bottom-right"`, `"bottom-left"`, `"bottom-center"` |
| `width`        | string | `"350px"`         | Default width of notification cards                                                                                                   |
| `cardHeight`   | string | `"80px"`          | Default height of each notification card                                                                                              |
| `cardSpacing`  | number | `90`              | Spacing between expanded cards (in pixels)                                                                                            |
| `stackOffset`  | number | `3`               | Offset for stacked cards (in pixels)                                                                                                  |
| `zIndex`       | number | `9999`            | z-index for the notification container                                                                                                |
| `duration`     | number | `5000`            | Default duration for notifications (in milliseconds)                                                                                  |
| `customColors` | object | `{}`              | Custom colors for different notification types                                                                                        |
| `headerText`   | string | `"Notifications"` | Text to display in the expanded notification header                                                                                   |
| `actionButton` | string | `"Collapse"`      | Default action button: `"Collapse"`, `"Clear"`, or `"Mute"`                                                                           |

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
| `toggleMute`            | `()`                       | Toggle between muted and unmuted states           |

### Hook API

For components that need more control, you can use the provided hook:

```javascript
import { useNotification } from "ios-notification-stack";

function MyComponent() {
  const {
    showSuccess,
    showError,
    removeNotification,
    clearAllNotifications,
    toggleMute,
    config,
  } = useNotification();

  // Check if notifications are muted
  const isMuted = config.isMuted;

  // Get unread count
  const unreadCount = config.unreadCount;

  // Now use these functions directly
  const handleSuccess = () => {
    showSuccess("Operation completed successfully!");
  };

  const toggleNotificationMute = () => {
    toggleMute();
  };
}
```

## Advanced Features

### Notification Muting

The package includes support for muting notifications. When muted, notifications are still tracked but not displayed, with an unread counter shown instead:

```javascript
// To toggle mute state programmatically:
import { toggleMute } from "ios-notification-stack";

function MuteButton() {
  return <button onClick={toggleMute}>Toggle Notifications</button>;
}
```

### Persistent Mute State

The mute state is automatically persisted in localStorage, so it will be maintained across page refreshes.

### Duplicate Detection

The system automatically detects and ignores duplicate notifications sent within a very short time (500ms), preventing notification spam when events trigger multiple times.

### Expanded View Controls

When notifications are expanded, users can:

- View all current notifications in a stack
- See a customizable header text
- Use a configurable action button (Collapse, Clear, or Mute)

## Styling

The notification stack uses a minimal set of styles that can be easily customized. The default styling provides:

- Smooth spring animations using Framer Motion
- iOS-style card layout with rounded corners
- Stackable cards with shadow and opacity effects
- Text truncation for longer messages

You can customize the appearance by overriding the card styles or providing custom colors through the `customColors` prop.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

PARTH CHAWLA - [@polo15s](https://github.com/sponge-bobs-square-pants)
