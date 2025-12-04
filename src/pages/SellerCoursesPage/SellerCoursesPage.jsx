import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Search, Filter as FilterIcon, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import Filter from "../../components/Filter/Filter";
import PurchasedCourseCard from "../../components/PurchasedCourseCard/PurchasedCourseCard";
import CourseDetailPopup from "../../components/CourseDetailPopup/CourseDetailPopup";
import "../PurchasedCoursesPage/PurchasedCoursesPage.css";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import SellerStatsSummary from "../../components/Seller/SellerStatsSummary";
import { dashboardAPI } from "../../services/dashboardAPI";
import { courseAPI } from "../../services/courseAPI";
import styled from "styled-components";
const SellerCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { user } = useAuth();
  const [isHover, setIsHover] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rating, setRating] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;
  const observerTarget = useRef(null);
  const isLoadingRef = useRef(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // State cho danh sách khóa học từ API
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Memoize callbacks để tránh re-render không cần thiết
  const handleViewDetails = React.useCallback((course) => {
    setSelectedCourse(course);
    setShowPopup(true);
  }, []);

  const handleClosePopup = React.useCallback(() => {
    setShowPopup(false);
    setSelectedCourse(null);
  }, []);

  // Callback để refresh course sau khi update
  const handleCourseUpdate = React.useCallback(
    async (courseId) => {
      try {
        // Fetch lại thông tin course vừa update
        const updatedCourse = await courseAPI.getCourseById(courseId);

        // Cập nhật trong danh sách courses
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c.id === courseId ? { ...c, ...updatedCourse } : c
          )
        );

        // Cập nhật selectedCourse nếu đang mở popup
        if (selectedCourse?.id === courseId) {
          setSelectedCourse({ ...selectedCourse, ...updatedCourse });
        }
      } catch (err) {
        console.error("Lỗi khi refresh course:", err);
      }
    },
    [selectedCourse]
  );

  // Fetch thống kê seller
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryStats = await dashboardAPI.getCourseStatsByCategory();
        const totalStudentsnRating = await dashboardAPI.getSellerStats();
        const revenue = await dashboardAPI.getSellerTotalRevenue();

        const total = categoryStats.reduce((sum, category) => {
          return sum + category.courseCount;
        }, 0);

        setTotalCourses(total);
        setTotalStudents(totalStudentsnRating.totalStudents);
        setRating(totalStudentsnRating.averageRating);
        setTotalRevenue(revenue.totalRevenue);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  // Fetch danh sách khóa học của seller từ API với infinite scroll
  const fetchSellerCourses = useCallback(
    async (page, isLoadMore = false) => {
      if (!user?.id) return;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await courseAPI.getSellerCourses({
          SellerId: user.id,
          page: page,
          pageSize: pageSize,
          IncludeUnApproved: true,
        });

        if (isLoadMore) {
          setCourses((prev) => [...prev, ...response.items]);
        } else {
          setCourses(response.items);
        }

        setHasMore(page < (response.totalPages || 1));
      } catch (err) {
        console.error("Lỗi khi tải khóa học của seller:", err);
        setError("Không thể tải danh sách khóa học. Vui lòng thử lại.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?.id, pageSize]
  );

  // Load lần đầu
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchSellerCourses(1, false);
  }, [fetchSellerCourses]);

  // Infinite scroll với scroll event listener
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
        fetchSellerCourses(nextPage, true).finally(() => {
          isLoadingRef.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadingMore, currentPage, fetchSellerCourses]);

  // Intersection Observer as backup
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
          fetchSellerCourses(nextPage, true).finally(() => {
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
  }, [hasMore, loading, loadingMore, currentPage, fetchSellerCourses]);

  // Lọc và sắp xếp khóa học với useMemo để tối ưu performance
  const filtered = useMemo(() => {
    let result = [...courses];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(search) ||
          (c.teacherName || "").toLowerCase().includes(search)
      );
    }

    // Lọc theo danh mục & khoảng giá dựa trên AppContext
    if (state.selectedCategory && state.selectedCategory !== "Tất cả") {
      result = result.filter((c) => c.categoryName === state.selectedCategory);
    }

    if (
      state.selectedPriceRange &&
      state.selectedPriceRange.label !== "Tất cả"
    ) {
      const range = state.selectedPriceRange;
      result = result.filter(
        (c) => c.price >= range.min && c.price <= range.max
      );
    }

    // Sắp xếp
    switch (sortOrder) {
      case "newest":
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case "oldest":
        result.sort((a, b) => Number(a.id) - Number(b.id));
        break;
      case "priceLow":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [
    courses,
    searchTerm,
    sortOrder,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  return (
    <div className="purchased-page">
      <div className="container">
        <SellerStatsHeader
          title="📚 Quản lý khóa học"
          subtitle="Thống kê thông tin giao dịch khóa học của bạn"
        />

        <SellerStatsSummary
          totalCourses={totalCourses}
          totalStudents={totalStudents}
          totalRevenue={totalRevenue}
          averageRating={rating}
        />

        {/* Header */}
        <div className="purchased-header">
          <h1>📚 Quản lý khóa học </h1>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Search + sort */}
            <div className="controls">
              <div className="search-box">
                <Search className="icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="sort-box">
                <FilterIcon className="icon" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="priceLow">Giá thấp → cao</option>
                  <option value="priceHigh">Giá cao → thấp</option>
                </select>
              </div>
            </div>

            {/* Thêm khóa học */}
            <button
              onClick={() => navigate("/add-new-course")}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: isHover
                  ? "linear-gradient(270deg, #5b76f0 0%, #6f4cb6 100%)" // màu hover
                  : "linear-gradient(270deg, #667DE9 0%, #7258B5 100%)",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.25s ease",
                transform: isHover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHover
                  ? "0 6px 20px rgba(0,0,0,0.15)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
            >
              <Plus size={18} /> Thêm khóa học
            </button>
          </div>
        </div>

        {/* Bộ lọc toàn màn */}
        <div className="filter-wrapper">
          <Filter />
        </div>

        {/* Danh sách khóa học */}
        {loading ? (
          <div className="empty-state">
            <p>Đang tải khóa học...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p style={{ color: "#e74c3c" }}>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có khóa học nào. Hãy thêm khóa học đầu tiên!</p>
            <button onClick={() => navigate("/add-new-course")}>
              Thêm khóa học
            </button>
          </div>
        ) : (
          <>
            <div className="courses-grid">
              {filtered.map((course) => (
                <PurchasedCourseCard
                  key={course.id}
                  course={course}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div
              ref={observerTarget}
              className="loading-more-trigger"
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
                transition: "all 0.3s ease",
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
                  Đang tải thêm khóa học...
                </div>
              )}
              {!hasMore && filtered.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    color: "#28a745",
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
                    Đã hiển thị tất cả {filtered.length} khóa học
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#6c757d",
                    }}
                  >
                    Bạn đã xem hết danh sách khóa học
                  </p>
                </div>
              )}
              {hasMore && !loadingMore && (
                <>
                  <p
                    style={{
                      color: "#6c757d",
                      fontSize: "14px",
                      margin: "0 0 10px 0",
                      fontStyle: "italic",
                    }}
                  >
                    Scroll xuống để tải thêm hoặc
                  </p>
                  <button
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      fetchSellerCourses(nextPage, true);
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
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0,123,255,0.2)",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#0056b3";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 8px rgba(0,123,255,0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#007bff";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 4px rgba(0,123,255,0.2)";
                    }}
                  >
                    📚 Tải thêm khóa học
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {showPopup && selectedCourse && (
        <CourseDetailPopup
          course={selectedCourse}
          onClose={handleClosePopup}
          onUpdate={handleCourseUpdate}
        />
      )}
    </div>
  );
};

export default SellerCoursesPage;
