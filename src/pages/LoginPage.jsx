import React, { useEffect, useState } from "react";
import AuthLayout from "../components/Auth/AuthLayout";
import useAuthForm from "../hooks/useAuthForm";
import VerifyEmailModal from "../components/AdminUser/VerifyEmailModal/VerifyEmailModal";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Xác định mode dựa trên URL path hoặc search params
  const getInitialMode = () => {
    const path = window.location.pathname;
    const modeParam = searchParams.get("mode");

    if (path === "/register" || modeParam === "register") {
      return "register";
    }
    return "login";
  };

  const [success, setSuccess] = useState(false);

  // ✅ Sử dụng hook useAuthForm
  const {
    mode,
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    switchMode,
    setMode,
    showVerifyEmailModal,
    verifyEmail,
    handleResendOTP,
    handleCloseVerifyModal,
  } = useAuthForm(getInitialMode(), () => {
    setSuccess(true);
    navigate("/");
  });

  useEffect(() => {
    const initialMode = getInitialMode();
    setMode(initialMode);
  }, [window.location.pathname, searchParams, setMode]);

  // ✅ Chuyển qua lại login/register
  const toggleMode = () => {
    const newMode = mode === "login" ? "register" : "login";
    switchMode(newMode);

    if (newMode === "register") navigate("/register");
    else navigate("/login");
  };

  return (
    <>
      <AuthLayout
        mode={mode}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        success={success}
        loading={loading}
        onSwitchMode={toggleMode}
      />

      {/* ✅ Verify Email Modal */}
      <VerifyEmailModal
        isOpen={showVerifyEmailModal}
        email={verifyEmail}
        onClose={handleCloseVerifyModal}
        onResendOTP={handleResendOTP}
      />
    </>
  );
};

export default LoginPage;
