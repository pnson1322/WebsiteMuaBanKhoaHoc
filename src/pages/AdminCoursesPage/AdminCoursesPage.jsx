import React, { useEffect, useState } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { courseAPI } from "../../services/courseAPI";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import Filter from "../../components/Filter/Filter";
import AdminCourseCard from "../../components/AdminCourseCard/AdminCourseCard";
import CourseDetailPopup from "../../components/CourseDetailPopup/CourseDetailPopup";
import "../PurchasedCoursesPage/PurchasedCoursesPage.css";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";

const AdminCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all"); // "all", "approved", "pending", "restricted"
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [filtered, setFiltered] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // 🧠 Lấy danh sách khóa học từ API
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await courseAPI.getAdminCourses({
          page: currentPage,
          pageSize: pageSize,
          IncludeUnApproved: false,
          IncludeRestricted: false,
        });

        // Normalize data
        const normalized = (response.items || []).map((item) => ({
          ...item,
          imageUrl:
            item.imageUrl ??
            "https://via.placeholder.com/400x250?text=No+Image",
          categoryName: item.categoryName ?? "Khóa học",
        }));

        setCourses(normalized);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [currentPage]);

  useEffect(() => {
    let result = [...courses];

    // 1️⃣ Tìm kiếm theo tên hoặc giảng viên
    if (searchTerm.trim()) {
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2️⃣ Lọc theo danh mục (AppContext)
    if (state.selectedCategory && state.selectedCategory !== "Tất cả") {
      result = result.filter((c) => c.categoryName === state.selectedCategory);
    }

    // 3️⃣ Lọc theo khoảng giá (AppContext)
    if (
      state.selectedPriceRange &&
      state.selectedPriceRange.label !== "Tất cả"
    ) {
      const range = state.selectedPriceRange;
      result = result.filter(
        (c) => c.price >= range.min && c.price <= range.max
      );
    }

    // 4️⃣ Lọc theo trạng thái duyệt
    if (approvalFilter === "approved") {
      result = result.filter(
        (c) => c.isApproved === true && c.isRestricted === false
      );
    } else if (approvalFilter === "pending") {
      result = result.filter((c) => c.isApproved === false);
    } else if (approvalFilter === "restricted") {
      result = result.filter((c) => c.isRestricted === true);
    }

    setFiltered(result);
  }, [
    courses,
    searchTerm,
    approvalFilter,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  const handleToggleApproval = async (courseId, isApproved, isRestricted) => {
    try {
      if (isApproved && !isRestricted) {
        // Nếu đã duyệt → Hạn chế
        await courseAPI.restrictCourse(courseId);
        // Cập nhật local state
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, isRestricted: true } : c
          )
        );
      } else {
        // Nếu chưa duyệt hoặc bị hạn chế → Duyệt
        await courseAPI.approveCourse(courseId);
        // Cập nhật local state
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? { ...c, isApproved: true, isRestricted: false }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái khóa học:", err);
      alert("Không thể thay đổi trạng thái khóa học.");
    }
  };

  const handleCourseClick = (course) => {
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
          subtitle="Duyệt và quản lý tất cả khóa học trên nền tảng của bạn"
        />
        {/* 🏷️ Tiêu đề */}
        <div className="purchased-header">
          <h1>🔧 Quản lý khóa học (Admin)</h1>
          {/* 🔍 Thanh tìm kiếm + lọc trạng thái */}
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
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chưa duyệt</option>
                <option value="restricted">Bị hạn chế</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🧩 Bộ lọc toàn màn */}
        <div className="filter-wrapper">
          <Filter />
        </div>

        {/* 🧾 Danh sách khóa học */}
        {loading ? (
          <p className="loading-text">⏳ Đang tải dữ liệu...</p>
        ) : filtered.length === 0 ? (
          <div className="admin-no-results-state">
            <div className="admin-no-results-icon">
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                <path d="M12 8v4m0 4h.01"></path>
              </svg>
            </div>
            <h3>Không tìm thấy khóa học nào</h3>
            <p>
              {approvalFilter !== "all"
                ? `Không có khóa học nào ở trạng thái "${
                    approvalFilter === "approved"
                      ? "Đã duyệt"
                      : approvalFilter === "pending"
                      ? "Chưa duyệt"
                      : "Bị hạn chế"
                  }"`
                : "Không có khóa học nào khớp với bộ lọc của bạn"}
              <br />
              Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc xóa bộ lọc.
            </p>
            <div className="admin-no-results-suggestions">
              <p>
                <strong>Gợi ý:</strong>
              </p>
              <ul>
                <li>Thử tìm kiếm với từ khóa khác</li>
                <li>Chọn trạng thái "Tất cả"</li>
                <li>Mở rộng khoảng giá hoặc chọn danh mục khác</li>
                <li>Xóa tất cả bộ lọc để xem toàn bộ khóa học</li>
              </ul>
            </div>
            <div className="admin-no-results-actions">
              <button
                className="clear-filters-button"
                onClick={() => {
                  setSearchTerm("");
                  setApprovalFilter("all");
                  dispatch({
                    type: actionTypes.SET_CATEGORY,
                    payload: "Tất cả",
                  });
                  dispatch({
                    type: actionTypes.SET_PRICE_RANGE,
                    payload: { label: "Tất cả", min: 0, max: Infinity },
                  });
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Xóa tất cả bộ lọc
              </button>
              <button
                className="refresh-button"
                onClick={() => window.location.reload()}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Tải lại
              </button>
            </div>
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map((course) => (
              <AdminCourseCard
                key={course.id}
                course={course}
                onToggleApproval={handleToggleApproval}
                onClick={handleCourseClick}
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

export default AdminCoursesPage;
