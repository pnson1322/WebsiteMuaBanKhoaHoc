import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";

// ⚙️ Cấu hình axios kết nối BE .NET (chạy ở cổng 5230)
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

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
  }, [mode, formData]);

  // ✅ Khi người dùng nhập form
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  // ✅ Đăng nhập thật qua API .NET
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const userData = res.data;
      // Lưu token vào localStorage
      localStorage.setItem("token", userData.token);
      localStorage.setItem("refreshToken", userData.refreshToken);
      login(userData);
      showSuccess("Đăng nhập thành công!");

      // ✅ Điều hướng theo role
      navigate("/");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      showError(
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, login, navigate, onSuccess, showError, showSuccess]);


  // ✅ Đăng ký tài khoản thật qua API .NET
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });

      showSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");

      // Sau 2s chuyển sang form login
      setTimeout(() => {
        setMode("login");
        setFormData({
          name: "",
          email: formData.email,
          password: formData.password,
          confirmPassword: "",
          role: "Học viên",
        });
        setErrors({});
      }, 2000);
    } catch (error) {
      console.error(error);
      showError(
        error.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, showError, showSuccess]);

  // ✅ Submit form
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (mode === "login") handleLogin();
      else handleRegister();
    },
    [mode, handleLogin, handleRegister]
  );

  // ✅ Chuyển qua lại login/register
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

  return {
    mode,
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    switchMode,
    setMode,
  };
};

export default useAuthForm;
