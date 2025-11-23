import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lock, User } from "lucide-react";
import LoginPopup from "./Auth/LoginPopup";
import logger from "../utils/logger";
import "./ProtectedRoute.css";

const ProtectedRoute = ({
  children,
  requireAuth = true,
  showModal = false,
}) => {
  const { isLoggedIn, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    logger.debug("PROTECTED_ROUTE", "Checking route protection", {
      loading,
      requireAuth,
      isLoggedIn,
      showModal,
      path: location.pathname,
    });

    if (!loading && requireAuth && !isLoggedIn) {
      logger.warn(
        "PROTECTED_ROUTE_BLOCKED",
        "User not authenticated - blocking access",
        {
          path: location.pathname,
          showModal,
        }
      );

      if (showModal) {
        logger.info("PROTECTED_ROUTE_MODAL", "Showing login modal");
        setShowAuthModal(true);
      } else {
        // Redirect to auth page with redirect parameter
        const redirect = location.pathname;
        logger.info("PROTECTED_ROUTE_REDIRECT", "Redirecting to login page", {
          from: redirect,
          to: `/login?redirect=${encodeURIComponent(redirect)}`,
        });
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    } else if (!loading && requireAuth && isLoggedIn) {
      logger.debug(
        "PROTECTED_ROUTE_ALLOWED",
        "User authenticated - allowing access",
        {
          path: location.pathname,
          userId: user?.id,
        }
      );
    }
  }, [
    loading,
    requireAuth,
    isLoggedIn,
    showModal,
    navigate,
    location.pathname,
  ]);

  const handleModalClose = () => {
    setShowAuthModal(false);
    navigate("/");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  // If user is not logged in and we're in modal mode
  if (requireAuth && !isLoggedIn && showModal) {
    return (
      <>
        <div className="protected-route-placeholder">
          <div className="protection-message">
            <Lock className="protection-icon" />
            <h2>Tính năng này cần đăng nhập</h2>
            <p>Vui lòng đăng nhập để sử dụng tính năng này</p>
            <button
              className="login-prompt-btn"
              onClick={() => setShowAuthModal(true)}
            >
              <User />
              Đăng nhập ngay
            </button>
          </div>
        </div>
        {showAuthModal && <LoginPopup onClose={handleModalClose} />}
      </>
    );
  }

  // If user is not logged in and we're in redirect mode, the redirect happens in useEffect
  if (requireAuth && !isLoggedIn) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
