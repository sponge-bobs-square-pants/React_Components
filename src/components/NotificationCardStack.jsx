import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";

const NotificationCardStack = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    notifications,
    removeNotification,
    clearAllNotifications,
    toggleMute,
    config,
  } = useNotification();

  if (notifications.length === 0) return null;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getFinalY = (index) => {
    return index * config.cardSpacing;
  };

  const getStackedOpacity = (index) => {
    return Math.max(1 - index * 0.2, 0.5);
  };

  const getCardBackground = (type, index) => {
    let baseColor =
      config.customColors[type] ||
      config.defaultColors[type] ||
      config.defaultColors.info;

    if (isExpanded) return baseColor;

    const opacity = getStackedOpacity(index);
    return baseColor.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  };

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

  const handleActionButtonClick = (e) => {
    e.stopPropagation();

    if (config.actionButton === "Collapse") {
      toggleExpand();
    } else if (config.actionButton === "Clear") {
      clearAllNotifications();
    } else if (config.actionButton === "Mute") {
      toggleMute();
    }
  };

  const displayNotifications = [...notifications].reverse();

  if (config.isMuted) {
    return (
      <div
        className={`flex ${getPositionClasses()} z-${
          config.zIndex
        } pointer-events-none mt-[-40px]`}
      >
        <div className="relative pointer-events-auto top-0 left-0">
          <motion.div
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md text-gray-700 font-medium cursor-pointer flex items-center"
            onClick={toggleMute}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span>Unmute</span>
            {config.unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                {config.unreadCount}
              </span>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

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
          <AnimatePresence>
            {isExpanded && displayNotifications.length > 0 && (
              <motion.div
                className="absolute left-0 top-0 z-10 transform -translate-y-10 w-full flex justify-between items-center"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
                transition={{
                  delay: 0.3,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className="text-gray-700 font-medium">
                  {config.headerText}
                </div>
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
                : parseInt(config.cardHeight) + 4 + "px",
              transition: "min-height 0.5s ease",
              width: "100%",
            }}
          >
            <div
              className="relative"
              style={{
                height: isExpanded
                  ? "auto"
                  : parseInt(config.cardHeight) + 4 + "px",
                paddingBottom: isExpanded
                  ? getFinalY(displayNotifications.length - 1) +
                    parseInt(config.cardHeight) -
                    10
                  : 0,
                transition: "padding-bottom 0.5s ease",
                width: "100%",
              }}
            >
              <AnimatePresence>
                {displayNotifications.map((notification, index) => {
                  const notifConfig = notification.config || config;
                  const zIndex = displayNotifications.length - index;
                  const stackedY = index * -config.stackOffset;
                  const stackedScale = Math.pow(0.97, index);
                  const stackedOpacity = index > 2 ? 0 : 1;
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
                        width: notifConfig.width || "100%",
                        left: 0,
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
                        height: notifConfig.cardHeight || config.cardHeight,
                        minHeight: "auto",
                        overflow: "hidden",
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
