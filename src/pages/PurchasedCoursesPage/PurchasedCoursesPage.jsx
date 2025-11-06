import React, { useState, useEffect } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { coursesAPI } from "../../services/api";
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

  // 🧠 Lấy danh sách khóa học đã mua (mock hoặc API thật)
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await coursesAPI.getPurchasedCourses();
        setCourses(data);
        setFiltered(data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // 🔍 Tìm kiếm + sắp xếp + lọc danh mục & giá
  useEffect(() => {
    let result = [...courses];

    // 1️⃣ Tìm kiếm theo tên hoặc giảng viên
    if (searchTerm.trim()) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2️⃣ Lọc theo danh mục (AppContext)
    if (state.selectedCategory && state.selectedCategory !== "Tất cả") {
      result = result.filter((c) => c.category === state.selectedCategory);
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
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate)
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
            <p>😢 Bạn chưa mua khóa học nào.</p>
            <button onClick={() => navigate("/")}>Khám phá thêm</button>
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
