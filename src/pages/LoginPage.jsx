import React, { useEffect, useState } from "react";
import AuthLayout from "../components/Auth/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
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

  const [mode, setMode] = useState(getInitialMode());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const mode = getInitialMode();
    if (mode === "register") {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [window.location.pathname, searchParams]);

  // ✅ Hàm validateForm (dùng chung cho cả login và register)
  const validateForm = () => {
    const newErrors = {};

    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (mode === "register") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Cập nhật input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Gửi form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      if (mode === "login") {
        // Đăng nhập giả lập
        login({ id: 1, name: "Demo User", email: formData.email });
        setSuccess(true);
        setTimeout(() => navigate("/"), 1000);
      } else {
        // Đăng ký giả lập
        setSuccess(true);
        setTimeout(() => {
          navigate("/login?mode=login");
          setMode("login");
        }, 2000);
      }
      setLoading(false);
    }, 1000);
  };

  // ✅ Chuyển qua lại login/register
  const toggleMode = () => {
    const newMode = mode === "login" ? "register" : "login";
    setMode(newMode);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});

    // Navigate dựa trên mode mới
    if (newMode === "register") {
      navigate("/register");
    } else {
      navigate("/login");
    }
  };

  return (
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
  );
};

export default LoginPage;
