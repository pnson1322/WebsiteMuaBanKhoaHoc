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
import PurchasedCourseCard from "../../components/PurchasedCourseCard/PurchasedCourseCard";
import { useAppState, useAppDispatch } from "../../contexts/AppContext"; // ✅ Kết nối AppContext
import Filter from "../../components/Filter/Filter";
import "./PurchasedCoursesPage.css";

const PurchasedCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;
  const observerTarget = useRef(null);
  const isLoadingRef = useRef(false);

  // 🧠 Lấy danh sách khóa học đã mua từ API với infinite scroll
  const loadCourses = useCallback(
    async (page, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await courseAPI.getPurchasedCourses({
          page: page,
          pageSize: pageSize,
        });

        if (!response || !response.items) {
          setCourses([]);
          setHasMore(false);
          return;
        }

        // Map dữ liệu từ API về format component
        const normalized = response.items.map((item) => ({
          ...item,
          imageUrl:
            item.imageUrl ||
            "https://via.placeholder.com/400x250?text=No+Image",
          categoryName: item.categoryName || "Khóa học",
          shortDescription: item.description || "",
          averageRating: item.averageRating || 0,
          totalPurchased: item.totalPurchased || 0,
          durationHours: item.durationHours || 0,
          price: item.price || 0,
        }));

        if (isLoadMore) {
          setCourses((prev) => [...prev, ...normalized]);
        } else {
          setCourses(normalized);
        }

        setHasMore(page < (response.totalPages || 1));
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize]
  );

  // Load lần đầu
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadCourses(1, false);
  }, [loadCourses]);

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
        loadCourses(nextPage, true).finally(() => {
          isLoadingRef.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadingMore, currentPage, loadCourses]);

  // Intersection Observer
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
          loadCourses(nextPage, true).finally(() => {
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
  }, [hasMore, loading, loadingMore, currentPage, loadCourses]);

  // 🔍 Tìm kiếm + sắp xếp + lọc danh mục & giá với useMemo
  const filtered = useMemo(() => {
    let result = [...courses];

    // 1️⃣ Tìm kiếm theo tên hoặc giảng viên
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(search) ||
          c.teacherName?.toLowerCase().includes(search)
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

    // 4️⃣ Sắp xếp theo lựa chọn
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
        {/* 🏷️ Tiêu đề */}
        <div className="purchased-header">
          <h1>🛍️ Quản lý khóa học đã mua</h1>
          {/* 🔍 Thanh tìm kiếm + sắp xếp */}
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

        {/* 🧩 Bộ lọc toàn màn */}
        <div className="filter-wrapper">
          <Filter />
        </div>

        {/* 🧾 Danh sách khóa học */}
        {loading ? (
          <p className="loading-text">⏳ Đang tải dữ liệu...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h2>Chưa có khóa học nào</h2>
            <p>
              Bạn chưa mua khóa học nào. Hãy khám phá hàng ngàn khóa học chất
              lượng cao
              <br />
              để bắt đầu hành trình học tập của bạn ngay hôm nay!
            </p>
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
                      loadCourses(nextPage, true);
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
    </div>
  );
};

export default PurchasedCoursesPage;
