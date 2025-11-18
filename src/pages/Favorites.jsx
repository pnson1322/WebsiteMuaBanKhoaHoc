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

  // ===========================
  //   LOAD DANH SÁCH YÊU THÍCH
  // ===========================
  useEffect(() => {
    const loadFavoriteCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await favoriteAPI.getFavorites(); // GET /Favorite
        console.log("⭐ Favorite API trả về:", data);

        // Map dữ liệu API -> format chuẩn để CourseCard dùng
        const mapped = (data || []).map((item) => ({
          id: item.courseId,
          name: item.title,
          description: item.description,
          image:
            item.image || "https://via.placeholder.com/400x250?text=No+Image",
          category: item.category || "Chưa phân loại",
          instructor: {
            id: item.teacherId || 0,
            name: item.teacherName || "Giảng viên ẩn danh",
          },
          rating: Number(item.averageRating || 0).toFixed(1),
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

  // ===========================
  //     VIEW COURSE DETAILS
  // ===========================
  const handleViewDetails = (course) => {
    navigate(`/course/${course.id}`);
  };

  // ===========================
  //     XÓA TẤT CẢ YÊU THÍCH
  // ===========================
  const clearAllFavorites = async () => {
    if (
      !window.confirm("Bạn có chắc muốn xóa tất cả khóa học yêu thích không?")
    )
      return;

    try {
      await favoriteAPI.clearFavorites(); // DELETE /Favorite/clear
      setFavoriteCourses([]);
    } catch (err) {
      console.error("❌ Lỗi khi xóa toàn bộ:", err);
      alert("Không thể xóa danh sách yêu thích.");
    }
  };

  // ===========================
  //     XÓA 1 KHÓA HỌC
  // ===========================
  const handleRemoveFavorite = async (courseId) => {
    try {
      await favoriteAPI.removeFavorite(courseId); // DELETE /Favorite/{courseId}
      setFavoriteCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("❌ Lỗi khi xóa khóa học:", err);
      alert("Không thể xóa khóa học khỏi yêu thích.");
    }
  };

  // ===========================
  //      UI LOADING
  // ===========================
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

  // ===========================
  //      UI ERROR
  // ===========================
  if (error) {
    return (
      <div className="favorites-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>

          <div className="error-page">
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
    );
  }

  // ===========================
  //      UI EMPTY STATE
  // ===========================
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
