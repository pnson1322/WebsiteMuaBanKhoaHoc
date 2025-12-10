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
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (mode === "register" && !formData.name.trim())
      newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (mode === "register" && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  // ✅ Login: Lưu access token vào localStorage, refreshToken tự động lưu vào cookie
  // ✅ Login: Sửa lại để truyền đúng tham số cho AuthContext
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // 1. Gọi API Login
      const res = await instance.post(
        "/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      // 2. Tách dữ liệu trả về
      // Giả sử API trả về: { token: "abc...", refreshToken: "xyz...", id: 1, fullName: "..." }
      const data = res.data;

      // Lấy token ra riêng
      const tokens = {
        accessToken: data.token || data.accessToken,
        refreshToken: data.refreshToken
      };

      // Lấy thông tin user (loại bỏ token ra khỏi object user cho sạch, nếu thích)
      const { token, accessToken, refreshToken, ...userInfo } = data;

      // 3. 🛑 QUAN TRỌNG: Xóa token cũ trước khi set cái mới để tránh xung đột
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");

      // 4. Gọi login của AuthContext với ĐỦ 2 THAM SỐ
      // Tham số 1: Thông tin user
      // Tham số 2: Object chứa token
      await login(userInfo, tokens);

      showSuccess("Đăng nhập thành công!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        showError("Email hoặc mật khẩu không khớp, vui lòng thử lại!");
        setLoading(false);
        return;
      }

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!";

      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    validateForm,
    login,
    navigate, // Không cần navigate ở đây nếu component cha xử lý
    onSuccess,
    showError,
    showSuccess,
  ]);
  // ✅ Register: KHÔNG login tự động, yêu cầu verify email
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    let Role = formData.role;
    if (Role == "Học viên") {
      Role = "Buyer";
    } else {
      Role = "Seller";
    }
    try {
      const res = await instance.post("/api/auth/register", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        role: Role,
      });

      // ✅ Hiển thị message từ BE
      const message =
        res.data?.message ||
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.";
      showSuccess(message);

      // ✅ Lưu email và mở VerifyEmailModal
      setVerifyEmail(formData.email);
      setShowVerifyEmailModal(true);

      // ✅ Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Học viên",
      });
      setErrors({});
    } catch (error) {
      console.error("Register error:", error);
      const errorMsg =
        error.response?.data?.message ||
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
      // 1. Gọi logout context
      await logout();

      // 2. Xóa thủ công thêm lần nữa cho chắc (Double check)
      localStorage.clear();

      showSuccess("Đăng xuất thành công!");

      // 3. Chuyển trang
      navigate("/login");

      // 4. Reload trang để xóa sạch bộ nhớ RAM của React (Tránh cache biến global)
      // window.location.reload(); // 👉 Bỏ comment dòng này nếu lỗi vẫn còn tái diễn
    } catch (error) {
      console.error("Logout error:", error);
      showError("Có lỗi khi đăng xuất, vui lòng thử lại!");
    }
  }, [logout, navigate, showSuccess, showError]);

  // ✅ Gửi lại email xác thực
  const handleResendOTP = useCallback(async () => {
    try {
      await instance.post("/api/auth/resend-verification-email", {
        email: verifyEmail,
      });
      console.log("🔄 Gửi lại email xác thực cho:", verifyEmail);
      showSuccess("Đã gửi lại email xác thực!");
    } catch (error) {
      console.error("❌ Lỗi khi gửi lại email xác thực:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Có lỗi khi gửi lại email xác thực!";
      showError(errorMsg);
    }
  }, [verifyEmail, showSuccess, showError]);

  // ✅ Đóng VerifyEmailModal và chuyển sang login với email đã điền sẵn
  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyEmailModal(false);
    setMode("login");

    // Điền sẵn email vào form login
    setFormData({
      name: "",
      email: verifyEmail,
      password: "",
      confirmPassword: "",
      role: "Học viên",
    });
  }, [verifyEmail]);

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
    showVerifyEmailModal,
    verifyEmail,
    handleResendOTP,
    handleCloseVerifyModal,
  };
};

export default useAuthForm;
