import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { favoriteAPI } from "../services/favoriteAPI";
import CourseCard from "../components/CourseCard/CourseCard";
import "./Favorites.css";

const Favorites = () => {
  const navigate = useNavigate();

  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Load danh sách khóa học yêu thích từ API
  useEffect(() => {
    const loadFavoriteCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await favoriteAPI.getFavorites(); // GET /Favorite
        console.log("⭐ Danh sách yêu thích tải về:", data);
        // 🧩 Map dữ liệu từ API -> format mockCourses
        const mapped = (data || []).map((item) => ({
          id: item.courseId,
          name: item.title,
          description: item.description,
          image:
            item.image || "https://via.placeholder.com/400x250?text=No+Image", // fallback nếu API chưa có image
          category: item.category || "Chưa phân loại",
          instructor: {
            id: item.teacherId || 0,
            name: item.teacherName || "Giảng viên ẩn danh",
            email: "",
            phone: "",
          },
          rating: item.averageRating?.toFixed?.(1) || "0.0",
          students: item.totalPurchased || 0,
          duration: item.durationHours
            ? `${item.durationHours} giờ`
            : "Chưa cập nhật",
          level: item.level || "Không xác định",
          price: item.price || 0,
        }));

        setFavoriteCourses(mapped);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách yêu thích:", err);
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteCourses();
  }, []);

  // 🔹 Xem chi tiết khóa học
  const handleViewDetails = (course) => {
    navigate(`/course/${course.id}`);
  };

  // 🔹 Xóa tất cả yêu thích
  const clearAllFavorites = async () => {
    if (
      !window.confirm("Bạn có chắc muốn xóa tất cả khóa học yêu thích không?")
    )
      return;
    try {
      await favoriteAPI.clearFavorites(); // DELETE /Favorite/clear
      setFavoriteCourses([]);
    } catch (err) {
      console.error("❌ Lỗi khi xóa tất cả:", err);
      alert("Không thể xóa danh sách yêu thích.");
    }
  };

  // 🔹 Xóa 1 khóa học khỏi yêu thích
  const handleRemoveFavorite = async (courseId) => {
    try {
      await favoriteAPI.removeFavorite(courseId); // DELETE /Favorite/{id}
      setFavoriteCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("❌ Lỗi khi xóa khóa học:", err);
      alert("Không thể xóa khóa học khỏi yêu thích.");
    }
  };

  // 🔹 Giao diện khi đang tải
  if (loading) {
    return (
      <div className="favorites-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>
          <div className="favorites-header">
            <div className="favorites-title">
              <Heart className="favorites-icon" />
              <h1>Khóa học yêu thích</h1>
            </div>
          </div>
          <div className="favorites-loading">
            <p>Đang tải khóa học yêu thích...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Giao diện khi lỗi
  if (error) {
    return (
      <div className="favorites-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>

          <div className="error-page">
            <div className="error-content">
              <h2>⚠️ Có lỗi xảy ra</h2>
              <p>{error}</p>
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Giao diện khi hiển thị danh sách yêu thích
  return (
    <div className="favorites-page page-transition">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft className="back-icon" />
          <span>Quay lại</span>
        </button>

        <div className="favorites-header">
          <div className="favorites-title">
            <Heart className="favorites-icon" />
            <h1>Khóa học yêu thích</h1>
            <span className="favorites-count">({favoriteCourses.length})</span>
          </div>

          {favoriteCourses.length > 0 && (
            <button className="clear-favorites-btn" onClick={clearAllFavorites}>
              <Trash2 className="trash-icon" />
              Xóa tất cả
            </button>
          )}
        </div>

        {favoriteCourses.length === 0 ? (
          <div className="empty-favorites">
            <Heart className="empty-icon" />
            <h3>Chưa có khóa học yêu thích</h3>
            <p>
              Hãy thêm những khóa học bạn quan tâm vào danh sách yêu thích để
              theo dõi dễ dàng hơn!
            </p>
            <button
              className="browse-courses-btn"
              onClick={() => navigate("/")}
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onViewDetails={() => handleViewDetails(course)}
                onRemoveFavorite={() => handleRemoveFavorite(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
