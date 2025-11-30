import React, { useEffect, useMemo, useState } from "react";
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

const SellerCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rating, setRating] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // State cho danh sách khóa học từ API
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch danh sách khóa học của seller từ API
  useEffect(() => {
    const fetchSellerCourses = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await courseAPI.getSellerCourses({
          SellerId: user.id,
          page: 1,
          pageSize: 100, // Lấy nhiều để hiển thị tất cả
          IncludeUnApproved: true, // Bao gồm cả khóa học chưa được duyệt
        });

        setCourses(response.items);
      } catch (err) {
        console.error("Lỗi khi tải khóa học của seller:", err);
        setError("Không thể tải danh sách khóa học. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerCourses();
  }, [user?.id]);

  const [filtered, setFiltered] = useState([]);

  // Lọc và sắp xếp khóa học
  useEffect(() => {
    let result = [...courses];

    if (searchTerm.trim()) {
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.teacherName || "").toLowerCase().includes(searchTerm.toLowerCase())
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

    setFiltered(result);
  }, [
    courses,
    searchTerm,
    sortOrder,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCourse(null);
  };

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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(270deg, #667DE9 0%, #7258B5 100%)",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
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
          <div className="courses-grid">
            {filtered.map((course) => (
              <PurchasedCourseCard
                key={course.id}
                course={course}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
      {showPopup && selectedCourse && (
        <CourseDetailPopup course={selectedCourse} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default SellerCoursesPage;
