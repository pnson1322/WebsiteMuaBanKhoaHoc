import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ArrowLeft, Clock, Eye, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { historyAPI } from "../../services/historyAPI";
import CourseCard from "../../components/CourseCard/CourseCard";
import "./HistoryPage.css";
import logger from "../../utils/logger";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const state = useAppState();
  const { dispatch, actionTypes, addToCart, removeFromFavorite } =
    useAppDispatch();
  const { user, isLoggedIn: isAuth } = useAuth();
  const { showUnfavorite, showSuccess, showError } = useToast();
  // === MEMOIZED SETS cho O(1) lookup ===
  const favoriteSet = useMemo(
    () => new Set(state.favorites),
    [state.favorites]
  );
  const cartSet = useMemo(() => new Set(state.cart), [state.cart]);
  const purchasedSet = useMemo(
    () => new Set(state.purchasedCourses),
    [state.purchasedCourses]
  );
  const showActions = useMemo(
    () => !isAuth || user?.role === "Buyer",
    [isAuth, user]
  );
  // ===========================
  //   TOGGLE YÊU THÍCH (ADD/REMOVE)
  // ===========================
  const { addToFavorite } = useAppDispatch();
  const { showFavorite } = useToast();
  const handleToggleFavorite = useCallback(
    async (courseId) => {
      const isFav = favoriteSet.has(courseId);
      try {
        if (isFav) {
          const result = await removeFromFavorite(courseId);
          if (result.success) {
            showUnfavorite("💔 Đã bỏ yêu thích");
          } else {
            showError("Lỗi khi bỏ yêu thích");
          }
        } else {
          const result = await addToFavorite(courseId);
          if (result.success) {
            showFavorite("❤️ Đã thêm vào yêu thích!");
          } else {
            showError("Lỗi khi thêm yêu thích");
          }
        }
      } catch (err) {
        showError("Không thể cập nhật trạng thái yêu thích.");
      }
    },
    [
      favoriteSet,
      removeFromFavorite,
      addToFavorite,
      showUnfavorite,
      showFavorite,
      showError,
    ]
  );

  // ===========================
  //   ADD TO CART
  // ===========================
  const handleAddToCart = useCallback(
    async (courseId, title, isPurchased, isInCart) => {
      const isLogged = !!user || localStorage.getItem("isLoggedIn") === "true";
      if (!isLogged) {
        dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
        return;
      }
      if (isPurchased) {
        showError("Bạn đã sở hữu khóa học này rồi!");
        return;
      }
      if (isInCart) {
        showError("Đã có trong giỏ hàng.");
        return;
      }
      const result = await addToCart(courseId);
      if (result.success) showSuccess(`🛒 Đã thêm "${title}" vào giỏ hàng!`);
      else showError("Lỗi khi thêm vào giỏ hàng.");
    },
    [user, dispatch, actionTypes, addToCart, showSuccess, showError]
  );

  const [allHistoryCourses, setAllHistoryCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;
  const observerTarget = useRef(null);
  const isLoadingRef = useRef(false);

  // 🧠 Load lịch sử xem từ API với infinite scroll
  const loadAllHistoryCourses = useCallback(
    async (page, isLoadMore = false) => {
      if (!isLoggedIn) {
        logger.warn("HISTORY_PAGE", "User not logged in, redirecting to home");
        navigate("/");
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        logger.info("HISTORY_PAGE", "Loading history from API", {
          page,
          pageSize,
        });
        const response = await historyAPI.getHistory(page, pageSize);

        if (isLoadMore) {
          setAllHistoryCourses((prev) => [...prev, ...(response.items || [])]);
          setFilteredCourses((prev) => [...prev, ...(response.items || [])]);
        } else {
          setAllHistoryCourses(response.items || []);
          setFilteredCourses(response.items || []);
        }

        setHasMore(page < (response.totalPages || 1));
        logger.info("HISTORY_PAGE", "History loaded successfully", {
          itemsCount: response.items?.length,
          totalCount: response.totalCount,
        });
      } catch (error) {
        logger.error("HISTORY_PAGE", "Error loading history", error);
        setAllHistoryCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isLoggedIn, navigate, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadAllHistoryCourses(1, false);
  }, [loadAllHistoryCourses]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 300;

      if (
        scrolledToBottom &&
        hasMore &&
        !loading &&
        !loadingMore &&
        !isLoadingRef.current
      ) {
        isLoadingRef.current = true;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadAllHistoryCourses(nextPage, true).finally(() => {
          isLoadingRef.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadingMore, currentPage, loadAllHistoryCourses]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !loadingMore &&
          !isLoadingRef.current
        ) {
          isLoadingRef.current = true;
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadAllHistoryCourses(nextPage, true).finally(() => {
            isLoadingRef.current = false;
          });
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, currentPage, loadAllHistoryCourses]);

  // 🔍 Bộ lọc tìm kiếm theo tên / giảng viên / danh mục
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCourses(allHistoryCourses);
    } else {
      const filtered = allHistoryCourses.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, allHistoryCourses]);

  // 🗑 Xóa toàn bộ lịch sử
  const clearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem?")) {
      try {
        await historyAPI.clearHistory();
        logger.info("HISTORY_PAGE", "History cleared successfully");

        setAllHistoryCourses([]);
        setFilteredCourses([]);
        setCurrentPage(1);
        setHasMore(false);

        // Cập nhật context nếu cần
        dispatch({ type: actionTypes.CLEAR_VIEW_HISTORY });
      } catch (error) {
        logger.error("HISTORY_PAGE", "Failed to clear history", error);
        alert("Có lỗi xảy ra khi xóa lịch sử. Vui lòng thử lại!");
      }
    }
  };

  // 📖 Xem chi tiết khóa học
  const handleViewDetails = (course) => {
    navigate(`/course/${course.id}`);
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử xem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="container">
        {/* 🔙 Nút quay lại */}
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft /> Quay lại
        </button>

        {/* 🧭 Header */}
        <div className="history-header">
          <div className="header-content">
            <div className="title-section">
              <Clock className="page-icon" />
              <h1>Lịch sử xem khóa học</h1>
              <span className="total-count">
                ({allHistoryCourses.length} khóa học)
              </span>
            </div>

            <div className="header-actions">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong lịch sử..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {allHistoryCourses.length > 0 && (
                <button className="clear-all-btn" onClick={clearHistory}>
                  <Trash2 className="trash-icon" />
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📚 Nội dung */}
        {filteredCourses.length === 0 ? (
          <div className="empty-history">
            {searchTerm ? (
              <>
                <Search className="empty-icon" />
                <h3>Không tìm thấy kết quả</h3>
                <p>
                  Không có khóa học nào phù hợp với từ khóa "
                  <strong>{searchTerm}</strong>"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-btn"
                >
                  Xóa bộ lọc
                </button>
              </>
            ) : (
              <>
                <Eye className="empty-icon" />
                <h3>Chưa có lịch sử xem</h3>
                <p>
                  Bạn chưa xem khóa học nào. Hãy khám phá các khóa học thú vị!
                </p>
                <button onClick={() => navigate("/")} className="explore-btn">
                  Khám phá khóa học
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="history-content">
            <div className="results-info">
              <p>
                {searchTerm ? (
                  <>
                    Tìm thấy <strong>{filteredCourses.length}</strong> kết quả
                    cho "{searchTerm}"
                  </>
                ) : (
                  <>
                    Hiển thị <strong>{filteredCourses.length}</strong> khóa học
                    đã xem
                  </>
                )}
              </p>
            </div>

            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={favoriteSet.has(course.id)}
                  isInCart={cartSet.has(course.id)}
                  isPurchased={purchasedSet.has(course.id)}
                  showActions={showActions}
                  onViewDetails={() => handleViewDetails(course)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div
              ref={observerTarget}
              style={{
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "30px auto",
                gap: "12px",
                border: hasMore ? "2px dashed #e0e0e0" : "none",
                borderRadius: "12px",
                padding: "25px",
                backgroundColor: hasMore ? "#fafafa" : "transparent",
                maxWidth: "500px",
              }}
            >
              {loadingMore && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#007bff",
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "3px solid #f3f3f3",
                      borderTop: "3px solid #007bff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  Đang tải thêm...
                </div>
              )}
              {!hasMore && filteredCourses.length > 0 && (
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
                    Đã hiển thị tất cả {filteredCourses.length} khóa học
                  </p>
                </div>
              )}
              {hasMore && !loadingMore && (
                <button
                  onClick={() => {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    loadAllHistoryCourses(nextPage, true);
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  📚 Tải thêm
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
