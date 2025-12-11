import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lock, User, ShieldAlert } from "lucide-react";
import LoginPopup from "./Auth/LoginPopup";
import logger from "../utils/logger";
import "./ProtectedRoute.css";

const ProtectedRoute = ({
  children,
  requireAuth = true,
  showModal = false,
  allowedRoles = [],
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
      allowedRoles,
      userRole: user?.role,
      path: location.pathname,
    });

    if (!loading && requireAuth) {
      if (!isLoggedIn) {
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
          const redirect = location.pathname;
          logger.info("PROTECTED_ROUTE_REDIRECT", "Redirecting to login page", {
            from: redirect,
            to: `/login?redirect=${encodeURIComponent(redirect)}`,
          });
          navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
        }
      } else if (
        allowedRoles.length > 0 &&
        user &&
        !allowedRoles.includes(user.role)
      ) {
        logger.warn("PROTECTED_ROUTE_FORBIDDEN", "User role not authorized", {
          required: allowedRoles,
          current: user.role,
          path: location.pathname,
        });
      } else {
        logger.debug(
          "PROTECTED_ROUTE_ALLOWED",
          "User authenticated and authorized - allowing access",
          {
            path: location.pathname,
            userId: user?.id,
          }
        );
      }
    }
  }, [
    loading,
    requireAuth,
    isLoggedIn,
    showModal,
    allowedRoles,
    user,
    navigate,
    location.pathname,
  ]);

  const handleModalClose = () => {
    setShowAuthModal(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (requireAuth && !isLoggedIn) {
    if (showModal) {
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
    } else {
      return (
        <div className="protected-route-loading">
          <div className="loading-spinner"></div>
          <p>Đang chuyển hướng...</p>
        </div>
      );
    }
  }

  if (
    requireAuth &&
    isLoggedIn &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <div className="protected-route-placeholder">
        <div className="protection-message error-state">
          <ShieldAlert
            className="protection-icon error-icon"
            color="#ef4444"
            size={64}
          />
          <h2 style={{ color: "#ef4444" }}>Truy cập bị từ chối</h2>
          <p>
            Tài khoản của bạn ({user?.role}) không có quyền truy cập trang này.
          </p>
          <button
            className="login-prompt-btn"
            style={{ backgroundColor: "#ef4444", marginTop: "1rem" }}
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
