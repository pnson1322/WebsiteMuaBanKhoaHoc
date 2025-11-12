import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import instance from "../services/axiosInstance";

const useAuthForm = (initialMode = "login", onSuccess = null) => {
  const { login, logout } = useAuth();
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

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (mode === "register" && !formData.name.trim())
      newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email.trim())
      newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.password)
      newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (mode === "register" && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  // ✅ Login: Lưu access token vào localStorage, refreshToken tự động lưu vào cookie
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await instance.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      },
        { withCredentials: true }
      );


      const userData = res.data;

      // ✅ Chỉ lưu access token, KHÔNG lưu refreshToken (đã có trong cookie)
      localStorage.setItem("token", userData.token);

      // ✅ Lưu thông tin user vào context
      login({
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
      });

      showSuccess("Đăng nhập thành công!");

      if (onSuccess) {
        onSuccess();
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.Message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, login, navigate, onSuccess, showError, showSuccess]);

  // ✅ Register: KHÔNG login tự động, yêu cầu verify email
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await instance.post("/api/auth/register", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // ✅ Hiển thị message từ BE
      const message = res.data?.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.";
      showSuccess(message);

      // ✅ Chờ 2s rồi chuyển sang form login
      setTimeout(() => {
        setMode("login");
        setFormData({
          name: "",
          email: formData.email, // Giữ email để user dễ login
          password: "", // ✅ XÓA password vì lý do bảo mật
          confirmPassword: "",
          role: "Học viên",
        });
        setErrors({});
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.Message ||
        "Đăng ký thất bại. Vui lòng thử lại!";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, showError, showSuccess]);

  // ✅ Logout: Gọi logout từ AuthContext (đã xử lý API + clear storage)
  const handleLogout = useCallback(async () => {
    try {
      await logout(); // ✅ logout từ AuthContext đã xử lý tất cả
      showSuccess("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      showError("Có lỗi khi đăng xuất, vui lòng thử lại!");
    }
  }, [logout, navigate, showSuccess, showError]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (mode === "login") handleLogin();
      else handleRegister();
    },
    [mode, handleLogin, handleRegister]
  );

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
    handleLogout, // ✅ Export thêm handleLogout
    switchMode,
    setMode,
  };
};

export default useAuthForm;