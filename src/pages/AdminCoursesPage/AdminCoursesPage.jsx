import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { courseAPI } from "../../services/courseAPI";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import Filter from "../../components/Filter/Filter";
import AdminCourseCard from "../../components/AdminCourseCard/AdminCourseCard";
import CourseDetailPopup from "../../components/CourseDetailPopup/CourseDetailPopup";
import "../PurchasedCoursesPage/PurchasedCoursesPage.css";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import styled from "styled-components";

const FilterDropdown = styled.div`
  position: relative;
  user-select: none;
`;

const FilterButton = styled.button`
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
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
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
    padding-left: ${(props) => (props.$isSelected ? "16px" : "20px")};
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f3f5;
  }
`;

const AdminCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all"); // "all", "approved", "pending", "restricted"
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const observerTarget = useRef(null);
  const isLoadingRef = useRef(false);

  const [filtered, setFiltered] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🧠 Lấy danh sách khóa học từ API với infinite scroll
  const loadCourses = useCallback(
    async (page, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        // Xác định CategoryId từ selectedCategory
        const categoryId =
          state.selectedCategory && state.selectedCategory !== "Tất cả"
            ? state.categories?.find(
                (cat) => cat.name === state.selectedCategory
              )?.id
            : null;

        console.log("🔍 Filter Debug:", {
          selectedCategory: state.selectedCategory,
          availableCategories: state.categories,
          foundCategoryId: categoryId,
        });

        // Xác định MinPrice và MaxPrice từ selectedPriceRange
        const minPrice =
          state.selectedPriceRange?.label !== "Tất cả"
            ? state.selectedPriceRange?.min
            : null;
        const maxPrice =
          state.selectedPriceRange?.label !== "Tất cả" &&
          state.selectedPriceRange?.max !== Infinity
            ? state.selectedPriceRange?.max
            : null;

        // Luôn lấy tất cả khóa học (approved, unapproved, restricted) để có thể filter ở client
        const response = await courseAPI.getAdminCourses({
          page: page,
          pageSize: pageSize,
          Q: searchTerm.trim() || null,
          CategoryId: categoryId,
          SellerId: null,
          MinPrice: minPrice,
          MaxPrice: maxPrice,
          SortBy: null,
          Level: null,
          IncludeUnApproved: true,
          IncludeRestricted: true,
        });

        // Normalize data
        const normalized = (response.items || []).map((item) => ({
          ...item,
          imageUrl:
            item.imageUrl ??
            "https://via.placeholder.com/400x250?text=No+Image",
          categoryName: item.categoryName ?? "Khóa học",
        }));

        if (isLoadMore) {
          // Append courses cho infinite scroll
          setCourses((prev) => [...prev, ...normalized]);
        } else {
          // Replace courses khi filter/search thay đổi
          setCourses(normalized);
        }

        // Check nếu còn trang để load
        setHasMore(page < (response.totalPages || 1));
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      searchTerm,
      state.selectedCategory,
      state.selectedPriceRange,
      state.categories,
    ]
  );

  // Load courses lần đầu hoặc khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadCourses(1, false);
  }, [
    searchTerm,
    approvalFilter,
    state.selectedCategory,
    state.selectedPriceRange,
    loadCourses,
  ]);

  // Infinite scroll với scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled near bottom of page
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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, loadingMore, currentPage, loadCourses]);

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
          loadCourses(nextPage, true).finally(() => {
            isLoadingRef.current = false;
          });
        }
      },
      {
        threshold: 0,
        rootMargin: "100px",
      }
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

  // Filter courses theo trạng thái duyệt (client-side filter)
  useEffect(() => {
    let result = [...courses];

    // Lọc theo trạng thái duyệt
    if (approvalFilter === "approved") {
      result = result.filter(
        (c) => c.isApproved === true && c.isRestricted === false
      );
    } else if (approvalFilter === "pending") {
      result = result.filter(
        (c) => c.isApproved === false && c.isRestricted === false
      );
    } else if (approvalFilter === "restricted") {
      result = result.filter((c) => c.isRestricted === true);
    }
    // approvalFilter === "all" → hiển thị tất cả

    setFiltered(result);
  }, [courses, approvalFilter]);

  const handleToggleApproval = async (courseId, isApproved, isRestricted) => {
    try {
      console.log("🔄 Toggle approval:", {
        courseId,
        isApproved,
        isRestricted,
      });

      if (isRestricted) {
        // Nếu đang bị hạn chế → Bỏ hạn chế (toggle restrict)
        console.log("📤 Calling restrictCourse to unrestrict:", courseId);
        await courseAPI.restrictCourse(courseId);
        // Cập nhật local state
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? { ...c, isApproved: true, isRestricted: false }
              : c
          )
        );
        console.log("✅ Course unrestricted successfully");
      } else if (isApproved && !isRestricted) {
        // Nếu đã duyệt và chưa bị hạn chế → Hạn chế (toggle restrict)
        console.log("📤 Calling restrictCourse:", courseId);
        await courseAPI.restrictCourse(courseId);
        // Cập nhật local state
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, isRestricted: true } : c
          )
        );
        console.log("✅ Course restricted successfully");
      } else {
        // Nếu chưa duyệt → Duyệt
        console.log("📤 Calling approveCourse:", courseId);
        await courseAPI.approveCourse(courseId);
        // Cập nhật local state
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? { ...c, isApproved: true, isRestricted: false }
              : c
          )
        );
        console.log("✅ Course approved successfully");
      }
    } catch (err) {
      console.error("❌ Lỗi khi thay đổi trạng thái khóa học:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        message: err.message,
      });

      // Hiển thị thông báo lỗi chi tiết hơn
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        "Không thể thay đổi trạng thái khóa học.";
      alert(`Lỗi: ${errorMessage}`);
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

            <FilterDropdown ref={dropdownRef}>
              <FilterButton
                $isOpen={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FilterIcon size={18} className="icon" />
                  <span>
                    {approvalFilter === "all" && "Tất cả"}
                    {approvalFilter === "approved" && "Đã duyệt"}
                    {approvalFilter === "pending" && "Chưa duyệt"}
                    {approvalFilter === "restricted" && "Bị hạn chế"}
                  </span>
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
              </FilterButton>
              <DropdownMenu $isOpen={isDropdownOpen}>
                <DropdownItem
                  $isSelected={approvalFilter === "all"}
                  onClick={() => {
                    setApprovalFilter("all");
                    setIsDropdownOpen(false);
                  }}
                >
                  Tất cả
                </DropdownItem>
                <DropdownItem
                  $isSelected={approvalFilter === "approved"}
                  onClick={() => {
                    setApprovalFilter("approved");
                    setIsDropdownOpen(false);
                  }}
                >
                  Đã duyệt
                </DropdownItem>
                <DropdownItem
                  $isSelected={approvalFilter === "pending"}
                  onClick={() => {
                    setApprovalFilter("pending");
                    setIsDropdownOpen(false);
                  }}
                >
                  Chưa duyệt
                </DropdownItem>
                <DropdownItem
                  $isSelected={approvalFilter === "restricted"}
                  onClick={() => {
                    setApprovalFilter("restricted");
                    setIsDropdownOpen(false);
                  }}
                >
                  Bị hạn chế
                </DropdownItem>
              </DropdownMenu>
            </FilterDropdown>
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
          <>
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
      {showPopup && selectedCourse && (
        <CourseDetailPopup course={selectedCourse} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default AdminCoursesPage;
