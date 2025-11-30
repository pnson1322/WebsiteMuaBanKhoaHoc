import React, { useState, useEffect } from "react";
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
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 🧠 Lấy danh sách khóa học đã mua từ API
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await courseAPI.getPurchasedCourses({
          page: currentPage,
          pageSize: pageSize,
        });

        console.log("📦 Purchased courses response:", response);
        console.log("📊 Total items:", response?.items?.length || 0);
        console.log("📄 Total pages:", response?.totalPages || 0);

        if (!response || !response.items) {
          console.warn("⚠️ No items in response");
          setCourses([]);
          setFiltered([]);
          setTotalPages(1);
          return;
        }

        // Map dữ liệu từ API về format component
        const normalized = response.items.map((item) => {
          console.log("🔍 Processing course:", item.title, item);
          return {
            ...item,
            imageUrl:
              item.imageUrl ||
              "https://via.placeholder.com/400x250?text=No+Image",
            categoryName: item.categoryName || "Khóa học",
            shortDescription: item.description || "",
            // Đảm bảo các thuộc tính số không bị undefined
            averageRating: item.averageRating || 0,
            totalPurchased: item.totalPurchased || 0,
            durationHours: item.durationHours || 0,
            price: item.price || 0,
          };
        });

        console.log("✅ Normalized courses:", normalized);

        setCourses(normalized);
        setFiltered(normalized);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [currentPage]);

  // 🔍 Tìm kiếm + sắp xếp + lọc danh mục & giá
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

    setFiltered(result);
  }, [
    courses,
    searchTerm,
    sortOrder,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  const handleViewDetails = (course) => navigate(`/course/${course.id}`);

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
    </div>
  );
};

export default PurchasedCoursesPage;
