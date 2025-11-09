import React, { useEffect, useState } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import Filter from "../../components/Filter/Filter";
import AdminCourseCard from "../../components/AdminCourseCard/AdminCourseCard";
import "../PurchasedCoursesPage/PurchasedCoursesPage.css";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";

const AdminCoursesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all"); // "all", "approved", "pending"

  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    let result = [...(state.courses || [])];

    // 1️⃣ Tìm kiếm theo tên hoặc giảng viên
    if (searchTerm.trim()) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.instructor?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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

    // 4️⃣ Lọc theo trạng thái duyệt
    if (approvalFilter === "approved") {
      result = result.filter((c) => c.approved === true);
    } else if (approvalFilter === "pending") {
      result = result.filter((c) => !c.approved || c.approved === false);
    }

    setFiltered(result);
  }, [
    state.courses,
    searchTerm,
    approvalFilter,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  const handleToggleApproval = (courseId, approved) => {
    dispatch({
      type: actionTypes.TOGGLE_COURSE_APPROVAL,
      payload: { courseId, approved },
    });
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
              </select>
            </div>
          </div>
        </div>

        {/* 🧩 Bộ lọc toàn màn */}
        <div className="filter-wrapper">
          <Filter />
        </div>

        {/* 🧾 Danh sách khóa học */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>😢 Không tìm thấy khóa học nào.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map((course) => (
              <AdminCourseCard
                key={course.id}
                course={course}
                onToggleApproval={handleToggleApproval}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
