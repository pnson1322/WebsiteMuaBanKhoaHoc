import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const useAuthForm = (initialMode = "login", onSuccess = null) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Học viên",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate name for register
    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate confirm password for register
    if (mode === "register") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, formData]);

  // ✅ Handle input change
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  // ✅ Handle login
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        name: formData.name || "Người dùng",
        email: formData.email,
        role:
          formData.role === "Người bán"
            ? "seller"
            : formData.role === "Admin"
            ? "admin"
            : "learner",
      };

      login(userData);
      showSuccess("Đăng nhập thành công!");

      // Call custom success handler if provided
      if (onSuccess) {
        onSuccess();
      }
      navigate("/"); // Redirect to homepage
    } catch (error) {
      showError("Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    formData,
    login,
    showSuccess,
    showError,
    onSuccess,
    navigate,
  ]);

  // ✅ Handle register
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // ✅ Giả lập gọi API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess("Đăng ký thành công! Chuyển sang đăng nhập...");

      // ✅ Sau 1.5s: chuyển sang form đăng nhập
      setTimeout(() => {
        setMode("login");
        setFormData((prev) => ({
          ...prev,
          name: "",
          confirmPassword: "",
          // ⚡ Giữ lại email & password để login nhanh
          email: prev.email,
          password: prev.password,
        }));
        setErrors({});
      }, 1500);
    } catch (error) {
      showError("Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [validateForm, showSuccess, showError]);

  // ✅ Handle form submit
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (mode === "login") {
        handleLogin();
      } else {
        handleRegister();
      }
    },
    [mode, handleLogin, handleRegister]
  );

  // ✅ Switch between login/register modes
  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Học viên",
    });
    setErrors({});
  }, []);

  // ✅ Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Học viên",
    });
    setErrors({});
    setLoading(false);
  }, []);

  return {
    // State
    mode,
    formData,
    errors,
    loading,

    // Actions
    handleChange,
    handleSubmit,
    switchMode,
    resetForm,
    setMode,
    setFormData,
    setErrors,
    setLoading,

    // Handlers
    handleLogin,
    handleRegister,
    validateForm,
  };
};

export default useAuthForm;
