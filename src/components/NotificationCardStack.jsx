// src/components/NotificationCardStack.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";

const NotificationCardStack = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { notifications, removeNotification, clearAllNotifications, config } =
    useNotification();

  // No notifications, no rendering
  if (notifications.length === 0) return null;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate final position for expanded card - evenly spaced down
  const getFinalY = (index) => {
    return index * config.cardSpacing; // Each card is positioned with margin between cards
  };

  // Calculate card opacity in stacked state based on position
  const getStackedOpacity = (index) => {
    // Card is fully visible at the top, and progressively more transparent as it goes down the stack
    return Math.max(1 - index * 0.2, 0.5);
  };

  // Get background color based on notification type and position
  const getCardBackground = (type, index) => {
    // Get color based on type, check customColors first, then default to defaultColors
    let baseColor =
      config.customColors[type] ||
      config.defaultColors[type] ||
      config.defaultColors.info;

    // In expanded state, all cards are fully opaque
    if (isExpanded) return baseColor;

    // In stacked state, cards get progressively more transparent
    const opacity = getStackedOpacity(index);
    return baseColor.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  };

  // Get position classes based on position prop
  const getPositionClasses = () => {
    switch (config.position) {
      case "top-right":
        return "fixed top-12 right-4 items-end justify-end";
      case "top-left":
        return "fixed top-12 left-4 items-start justify-start";
      case "bottom-right":
        return "fixed bottom-4 right-4 items-end justify-end";
      case "bottom-left":
        return "fixed bottom-4 left-4 items-start justify-start";
      case "bottom-center":
        return "fixed bottom-4 inset-x-0 items-end justify-center";
      case "top-center":
      default:
        return "fixed top-12 inset-x-0 items-start justify-center";
    }
  };

  // Handle action button click
  const handleActionButtonClick = (e) => {
    e.stopPropagation();

    if (config.actionButton === "Collapse") {
      toggleExpand();
    } else if (config.actionButton === "Clear") {
      clearAllNotifications();
    } else if (config.actionButton === "Mute") {
      // Implement mute functionality
      console.log("Mute button clicked");
      // Add your mute logic here
    }
  };

  // Create a reversed array for display (newest on top)
  const displayNotifications = [...notifications].reverse();

  return (
    <div
      className={`flex ${getPositionClasses()} z-${
        config.zIndex
      } pointer-events-none`}
    >
      <div
        className="relative pointer-events-auto"
        style={{ width: config.width }}
      >
        <div className="relative">
          {/* Header with text and action button - only show when expanded */}
          <AnimatePresence>
            {isExpanded && displayNotifications.length > 0 && (
              <motion.div
                className="absolute left-0 top-0 z-10 transform -translate-y-12 w-full flex justify-between items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
                transition={{
                  delay: 0.3,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {/* Text on left side from config */}
                <div className="text-gray-700 font-medium p-2">
                  {config.headerText}
                </div>

                {/* Action button on right side from config */}
                <button
                  onClick={handleActionButtonClick}
                  className="text-gray-600 px-4 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  {config.actionButton}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className="relative"
            style={{
              minHeight: isExpanded
                ? getFinalY(displayNotifications.length - 1) +
                  parseInt(config.cardHeight) +
                  "px"
                : parseInt(config.cardHeight) + 4 + "px", // Dynamic height based on config
              transition: "min-height 0.5s ease",
              width: "100%", // Ensure the container maintains full width
            }}
          >
            <div
              className="relative"
              style={{
                height: isExpanded
                  ? "auto"
                  : parseInt(config.cardHeight) + 4 + "px", // Dynamic height based on config
                paddingBottom: isExpanded
                  ? getFinalY(displayNotifications.length - 1) +
                    parseInt(config.cardHeight) -
                    10
                  : 0,
                transition: "padding-bottom 0.5s ease",
                width: "100%", // Ensure the container maintains full width
              }}
            >
              <AnimatePresence>
                {displayNotifications.map((notification, index) => {
                  // Get notification-specific config (if available) or use global config
                  const notifConfig = notification.config || config;

                  // Calculate stacked appearance
                  const zIndex = displayNotifications.length - index;
                  const stackedY = index * -config.stackOffset;
                  const stackedScale = Math.pow(0.97, index);
                  const stackedOpacity = index > 2 ? 0 : 1; // This is for the card visibility, not the background

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{
                        y: -20,
                        opacity: 0,
                        scale: 1,
                        position: "absolute",
                        width: "100%",
                        left: 0,
                        backgroundColor: getCardBackground(
                          notification.type,
                          index
                        ),
                      }}
                      animate={{
                        zIndex,
                        y: isExpanded ? getFinalY(index) : stackedY,
                        scale: isExpanded ? 1 : stackedScale,
                        opacity: isExpanded ? 1 : stackedOpacity,
                        position: "absolute",
                        backgroundColor: getCardBackground(
                          notification.type,
                          index
                        ),
                        width: notifConfig.width || "100%", // Use notification-specific width if available
                        left: 0, // Ensure left alignment within container
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 350,
                        duration: 0.3,
                      }}
                      className="text-white rounded-xl p-4 shadow-lg cursor-pointer"
                      style={{
                        transformOrigin: "top center",
                        top: 0,
                        willChange: "transform, opacity, background-color",
                        backfaceVisibility: "hidden",
                        height: notifConfig.cardHeight || config.cardHeight, // Use notification-specific height if available
                        minHeight: "auto", // Ensure no minimum height is enforced
                        overflow: "hidden", // Hide overflow content using the config value
                      }}
                      onClick={toggleExpand}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate pr-2">
                          {notification.title}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-white opacity-70 hover:opacity-100 flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-gray-100 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCardStack;
