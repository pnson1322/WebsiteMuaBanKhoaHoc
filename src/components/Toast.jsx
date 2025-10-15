import React, { useState, useEffect } from "react";
import { Heart, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import "./Toast.css";

const Toast = ({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 3000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "favorite":
        return <Heart className="toast-icon favorite-icon" />;
      case "unfavorite":
        return <Heart className="toast-icon unfavorite-icon" />;
      case "success":
        return <CheckCircle className="toast-icon success-icon" />;
      case "error":
        return <AlertCircle className="toast-icon error-icon" />;
      case "info":
        return <Info className="toast-icon info-icon" />;
      default:
        return <CheckCircle className="toast-icon success-icon" />;
    }
  };

  const getToastClass = () => {
    let baseClass = "toast";
    if (type === "favorite" || type === "unfavorite") {
      baseClass += " toast-favorite";
    } else {
      baseClass += ` toast-${type}`;
    }
    if (isVisible && isAnimating) {
      baseClass += " toast-enter";
    } else if (isVisible && !isAnimating) {
      baseClass += " toast-exit";
    }
    return baseClass;
  };

  if (!isVisible) return null;

  return (
    <div className={getToastClass()}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsAnimating(false);
          setTimeout(() => onClose && onClose(), 300);
        }}
      >
        <X size={16} />
      </button>

      {/* Heart animation for favorite actions */}
      {type === "favorite" && (
        <div className="floating-hearts">
          {[...Array(6)].map((_, i) => (
            <Heart
              key={i}
              className={`floating-heart floating-heart-${i + 1}`}
              size={12 + (i % 3) * 4}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: isAnimating ? "running" : "paused",
          }}
        />
      </div>
    </div>
  );
};

// Toast Container component to manage multiple toasts
const ToastContainer = ({ toasts = [] }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={toast.onClose}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default Toast;
