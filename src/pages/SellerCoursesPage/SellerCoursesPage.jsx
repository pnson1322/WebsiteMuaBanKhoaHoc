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
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import Filter from "../../components/Filter/Filter";
import PurchasedCourseCard from "../../components/PurchasedCourseCard/PurchasedCourseCard";
import { CourseCardSkeleton } from "../../components/LoadingSkeleton";
import CourseDetailPopup from "../../components/CourseDetailPopup/CourseDetailPopup";
import "../PurchasedCoursesPage/PurchasedCoursesPage.css";
import SellerStatsSummary from "../../components/Seller/SellerStatsSummary";
import { dashboardAPI } from "../../services/dashboardAPI";
import { courseAPI } from "../../services/courseAPI";
import styled from "styled-components";

// === STYLED COMPONENTS ===
const SortDropdown = styled.div`
  position: relative;
  user-select: none;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1.8px solid ${(props) => (props.$isOpen ? "#667eea" : "#cbd5e0")};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  justify-content: space-between;
  box-shadow: ${(props) =>
    props.$isOpen ? "0 4px 15px rgba(102, 126, 234, 0.2)" : "none"};

  &:hover {
    border-color: #667eea;
  }

  .icon {
    color: #667eea;
    transition: transform 0.3s ease;
    transform: ${(props) =>
      props.$isOpen ? "rotate(180deg)" : "rotate(0deg)"};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1.8px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-10px)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$isSelected ? "#f7fafc" : "white")};
  font-weight: ${(props) => (props.$isSelected ? "600" : "500")};
  border-left: ${(props) =>
    props.$isSelected ? "3px solid #667eea" : "3px solid transparent"};

  &:hover {
    background: #f7fafc;
    color: #667eea;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f5;
  }
`;

/**
 * ✅ REFACTORED SellerCoursesPage
 * - CHỈ dùng IntersectionObserver
 * - Local state cho courses
 * - Filter tại component level
 */
const SellerCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { user } = useAuth();

  // === UI STATE ===
  const [isHover, setIsHover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // === STATS ===
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rating, setRating] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // === COURSES STATE ===
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;
  const loadedPagesRef = useRef(new Set());

  // === POPUP ===
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // === CLOSE DROPDOWN ON OUTSIDE CLICK ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === CALLBACKS ===
  const handleViewDetails = useCallback((course) => {
    setSelectedCourse(course);
    setShowPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setSelectedCourse(null);
  }, []);

  const handleCourseUpdate = useCallback(
    async (courseId) => {
      try {
        const updatedCourse = await courseAPI.getCourseById(courseId);
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, ...updatedCourse } : c))
        );
        if (selectedCourse?.id === courseId) {
          setSelectedCourse((prev) => ({ ...prev, ...updatedCourse }));
        }
      } catch (err) {
        console.error("Error refreshing course:", err);
      }
    },
    [selectedCourse]
  );

  // === FETCH STATS ===
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoryStats, sellerStats, revenue] = await Promise.all([
          dashboardAPI.getCourseStatsByCategory(),
          dashboardAPI.getSellerStats(),
          dashboardAPI.getSellerTotalRevenue(),
        ]);

        const total = categoryStats.reduce(
          (sum, cat) => sum + cat.courseCount,
          0
        );
        setTotalCourses(total);
        setTotalStudents(sellerStats.totalStudents);
        setRating(sellerStats.averageRating);
        setTotalRevenue(revenue.totalRevenue);
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    };
    fetchStats();
  }, []);

  // === FETCH COURSES ===
  const fetchSellerCourses = useCallback(
    async (page, isLoadMore = false) => {
      if (!user?.id) return;
      if (loadedPagesRef.current.has(page) && isLoadMore) return;

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          loadedPagesRef.current.clear();
        }
        setError(null);

        const response = await courseAPI.getSellerCourses({
          SellerId: user.id,
          page,
          pageSize,
          IncludeUnApproved: true,
        });

        loadedPagesRef.current.add(page);

        if (isLoadMore) {
          setCourses((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newCourses = response.items.filter(
              (c) => !existingIds.has(c.id)
            );
            return [...prev, ...newCourses];
          });
        } else {
          setCourses(response.items || []);
        }

        setHasMore(page < (response.totalPages || 1));
      } catch (err) {
        console.error("Error loading seller courses:", err);
        setError("Không thể tải danh sách khóa học.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user?.id, pageSize]
  );

  // === LOAD MORE ===
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return Promise.resolve();
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    return fetchSellerCourses(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, fetchSellerCourses]);

  // === INFINITE SCROLL ===
  const { observerTarget } = useInfiniteScroll({
    loadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
    rootMargin: "300px",
  });

  // === INITIAL LOAD ===
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchSellerCourses(1, false);
  }, [fetchSellerCourses]);

  // === FILTER & SORT ===
  const filtered = useMemo(() => {
    let result = [...courses];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.teacherName?.toLowerCase().includes(term)
      );
    }

    // Category
    if (state.selectedCategory && state.selectedCategory !== "Tất cả") {
      result = result.filter((c) => c.categoryName === state.selectedCategory);
    }

    // Price range
    if (state.selectedPriceRange?.label !== "Tất cả") {
      result = result.filter(
        (c) =>
          c.price >= state.selectedPriceRange.min &&
          c.price <= state.selectedPriceRange.max
      );
    }

    // Sort
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

  // === SORT OPTIONS ===
  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "priceLow", label: "Giá thấp → cao" },
    { value: "priceHigh", label: "Giá cao → thấp" },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortOrder)?.label || "";

  return (
    <div className="purchased-page">
      <div className="container">
        <SellerStatsSummary
          totalCourses={totalCourses}
          totalStudents={totalStudents}
          totalRevenue={totalRevenue}
          averageRating={rating}
        />

        {/* Header */}
        <div className="purchased-header">
          <h1>📚 Quản lý khóa học</h1>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
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

              <SortDropdown ref={dropdownRef}>
                <SortButton
                  $isOpen={isDropdownOpen}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FilterIcon size={18} className="icon" />
                    <span>{currentSortLabel}</span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="icon"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </SortButton>
                <DropdownMenu $isOpen={isDropdownOpen}>
                  {sortOptions.map((opt) => (
                    <DropdownItem
                      key={opt.value}
                      $isSelected={sortOrder === opt.value}
                      onClick={() => {
                        setSortOrder(opt.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </SortDropdown>
            </div>

            {/* Add Course Button */}
            <button
              onClick={() => navigate("/add-new-course")}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: isHover
                  ? "linear-gradient(270deg, #5b76f0 0%, #6f4cb6 100%)"
                  : "linear-gradient(270deg, #667DE9 0%, #7258B5 100%)",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.25s ease",
                transform: isHover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: isHover ? "0 6px 20px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <Plus size={18} /> Thêm khóa học
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-wrapper">
          <Filter />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="courses-grid">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <p style={{ color: "#e74c3c" }}>{error}</p>
            <button onClick={() => fetchSellerCourses(1, false)}>
              Thử lại
            </button>
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

            {/* Infinite Scroll Trigger */}
            <div
              ref={observerTarget}
              style={{
                minHeight: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              {isLoadingMore && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div className="spinner"></div>
                  <span>Đang tải thêm...</span>
                </div>
              )}
              {!hasMore && filtered.length > 0 && (
                <p style={{ color: "#6c757d" }}>
                  ✓ Đã hiển thị tất cả {filtered.length} khóa học
                </p>
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
