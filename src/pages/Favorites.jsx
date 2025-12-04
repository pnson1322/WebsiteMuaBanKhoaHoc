import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { favoriteAPI } from "../services/favoriteAPI";
import CourseCard from "../components/CourseCard/CourseCard";
import logger from "../utils/logger";
import { useAppDispatch } from "../contexts/AppContext";
import "./Favorites.css";

const Favorites = () => {
  const navigate = useNavigate();
  const { dispatch, actionTypes } = useAppDispatch();
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // ===========================
  //   LOAD FAVORITES FROM API
  // ===========================
  useEffect(() => {
    const loadFavorites = async () => {
      logger.info("FAVORITES_LOAD", "Loading favorites page");

      try {
        setLoading(true);
        setError(null);

        logger.debug(
          "FAVORITES_API_CALL",
          "Calling favoriteAPI.getFavorites()"
        );
        const data = await favoriteAPI.getFavorites();
        console.log("⭐ Favorite API trả về:", data);

        logger.info("FAVORITES_API_SUCCESS", "Favorites loaded successfully", {
          count: data?.length || 0,
        });

        // ⭐ Chuyển imageUrl → image và đảm bảo categoryName tồn tại
        const normalized = (data || []).map((item) => ({
          ...item,
          id: item.courseId,
          image:
            item.imageUrl ??
            item.image ??
            "https://via.placeholder.com/400x250?text=No+Image",
          categoryName: item.categoryName ?? item.category ?? "Khóa học",
        }));

        setFavoriteCourses(normalized);

        // ⭐ Đồng bộ số lượng favorites vào AppContext để hiển thị đúng trên Header
        const favoriteIds = normalized.map((item) => item.courseId);
        dispatch({ type: actionTypes.SET_FAVORITES, payload: favoriteIds });
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách yêu thích:", err);

        if (err.response?.status === 401) {
          logger.error(
            "FAVORITES_401_ERROR",
            "Unauthorized - session expired",
            {
              status: err.response.status,
            }
          );

          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

          // 🔧 FIX: Auto redirect về login sau 2 giây
          logger.warn(
            "FAVORITES_AUTO_REDIRECT",
            "Will redirect to login in 2 seconds"
          );
          setTimeout(() => {
            logger.info("FAVORITES_REDIRECT_NOW", "Redirecting to login");
            navigate("/login?expired=true");
          }, 2000);
        } else {
          logger.error("FAVORITES_LOAD_ERROR", "Failed to load favorites", {
            error: err.message,
            status: err.response?.status,
          });
          setError("Không thể tải danh sách yêu thích.");
        }
      } finally {
        setLoading(false);
        logger.debug(
          "FAVORITES_LOAD_COMPLETE",
          "Favorites load process completed"
        );
      }
    };

    loadFavorites();
  }, [navigate, dispatch, actionTypes]);

  // ===========================
  //   VIEW COURSE DETAILS
  // ===========================
  const handleViewDetails = useCallback(
    (course) => {
      navigate(`/course/${course.id}`);
    },
    [navigate]
  );

  // ===========================
  //   CLEAR ALL FAVORITES
  // ===========================
  const clearAllFavorites = useCallback(async () => {
    if (
      !window.confirm("Bạn có chắc muốn xóa tất cả khóa học yêu thích không?")
    )
      return;

    try {
      await favoriteAPI.clearFavorites();
      setFavoriteCourses([]);
      // ⭐ Cập nhật AppContext
      dispatch({ type: actionTypes.SET_FAVORITES, payload: [] });
    } catch (err) {
      console.error("❌ Lỗi:", err);
      alert("Không thể xóa danh sách yêu thích.");
    }
  }, [dispatch, actionTypes]);

  // ===========================
  //   REMOVE ONE COURSE
  // ===========================
  const handleRemoveFavorite = useCallback(
    async (courseId) => {
      try {
        await favoriteAPI.removeFavorite(courseId);
        setFavoriteCourses((prev) => prev.filter((c) => c.id !== courseId));
        // ⭐ Cập nhật AppContext
        dispatch({
          type: actionTypes.REMOVE_FROM_FAVORITES,
          payload: courseId,
        });
      } catch (err) {
        console.error("❌ Lỗi khi xóa khóa học:", err);
        alert("Không thể xóa khóa học khỏi yêu thích.");
      }
    },
    [dispatch, actionTypes]
  );

  // ===========================
  //   LOADING UI
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
  //   ERROR UI
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
  //   MAIN UI
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
            <p>Hãy thêm những khóa học bạn quan tâm để theo dõi dễ dàng hơn!</p>
            <button
              className="browse-courses-btn"
              onClick={() => navigate("/")}
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <>
            <div className="favorites-grid">
              {favoriteCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{ ...course, courseId: course.id }}
                  onViewDetails={() => handleViewDetails(course)}
                  onRemoveFavorite={() => handleRemoveFavorite(course.id)}
                />
              ))}
            </div>
            {favoriteCourses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "30px 0",
                  padding: "20px",
                  color: "#28a745",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor: "#d4edda",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    ✓
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#155724",
                    }}
                  >
                    Đã hiển thị tất cả {favoriteCourses.length} khóa học yêu
                    thích
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
