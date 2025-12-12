import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Search, Filter as FilterIcon, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { courseAPI } from "../../services/courseAPI";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PurchasedCourseCard from "../../components/PurchasedCourseCard/PurchasedCourseCard";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import Filter from "../../components/Filter/Filter";
import "./PurchasedCoursesPage.css";

/**
 * ✅ REFACTORED PurchasedCoursesPage
 * - CHỈ dùng IntersectionObserver
 * - Local state cho courses
 * - Filter tại component level
 */
const PurchasedCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  // === LOCAL STATE ===
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;
  const loadedPagesRef = useRef(new Set());

  // === LOAD COURSES ===
  const loadCourses = useCallback(
    async (page, isLoadMore = false) => {
      // Tránh load trùng page
      if (loadedPagesRef.current.has(page) && isLoadMore) {
        return;
      }

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          loadedPagesRef.current.clear();
        }

        const response = await courseAPI.getPurchasedCourses({
          page,
          pageSize,
        });

        if (!response?.items) {
          setCourses([]);
          setHasMore(false);
          return;
        }

        const normalized = response.items.map((item) => ({
          ...item,
          imageUrl:
            item.imageUrl ||
            "https://via.placeholder.com/400x250?text=No+Image",
          categoryName: item.categoryName || "Khóa học",
        }));

        loadedPagesRef.current.add(page);

        if (isLoadMore) {
          setCourses((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newCourses = normalized.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newCourses];
          });
        } else {
          setCourses(normalized);
        }

        setHasMore(page < (response.totalPages || 1));
      } catch (err) {
        console.error("Error loading purchased courses:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize]
  );

  // === LOAD MORE ===
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return Promise.resolve();
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    return loadCourses(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, loadCourses]);

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
    loadCourses(1, false);
  }, [loadCourses]);

  // === FILTER & SORT (local) ===
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
        result.sort(
          (a, b) =>
            new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.purchaseDate || 0) - new Date(b.purchaseDate || 0)
        );
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

  const handleViewDetails = useCallback(
    (course) => navigate(`/course/${course.id}`),
    [navigate]
  );

  return (
    <div className="purchased-page">
      <div className="container">
        {/* Header */}
        <div className="purchased-header">
          <h1>🛍️ Quản lý khóa học đã mua</h1>
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
        </div>

        {/* Filter */}
        <div className="filter-wrapper">
          <Filter />
        </div>

        {/* Content */}
        {isLoading ? (
          <p className="loading-text">⏳ Đang tải dữ liệu...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h2>Chưa có khóa học nào</h2>
            <p>Bạn chưa mua khóa học nào.</p>
            <div className="empty-state-buttons">
              <button onClick={() => navigate("/")}>
                <Search className="icon" size={18} />
                Khám phá khóa học
              </button>
              <button
                className="secondary"
                onClick={() => navigate("/favorites")}
              >
                <Heart className="icon" size={18} />
                Xem yêu thích
              </button>
            </div>
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
              className="loading-more-trigger"
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
    </div>
  );
};

export default PurchasedCoursesPage;
