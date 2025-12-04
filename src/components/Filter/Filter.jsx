import React, { useMemo } from "react";
import { Filter as FilterIcon } from "lucide-react";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import "./Filter.css";
import FilterSection from "./FilterSection";

const priceRanges = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 500K", min: 0, max: 500000 },
  { label: "500K - 1 triệu", min: 500000, max: 1000000 },
  { label: "Trên 1 triệu", min: 1000000, max: Infinity },
];

const Filter = () => {
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  // 🔥 Lấy categories từ API (đã được load trong AppContext)
  const categories = useMemo(() => {
    // Nếu có categories từ API, sử dụng chúng
    if (state.categories && state.categories.length > 0) {
      const categoryNames = state.categories.map((cat) => cat.name);
      const categoriesArray = ["Tất cả", ...categoryNames.sort()];
      console.log("📚 Categories from API:", categoriesArray);
      return categoriesArray;
    }

    // Fallback: Extract từ courses nếu chưa có categories từ API
    if (state.courses && state.courses.length > 0) {
      console.log("⚠️ Using fallback - extracting categories from courses");
      const categorySet = new Set();
      state.courses.forEach((course) => {
        if (course.categoryName) {
          categorySet.add(course.categoryName);
        }
      });
      const categoriesArray = ["Tất cả", ...Array.from(categorySet).sort()];
      return categoriesArray;
    }

    // Không có dữ liệu
    console.log("⚠️ No categories available");
    return ["Tất cả"];
  }, [state.categories, state.courses]);

  return (
    <div className="filter-container">
      <div className="filter-header">
        <FilterIcon className="filter-icon" />
        <h3>Bộ lọc khóa học</h3>
      </div>

      <FilterSection
        title="📚 Danh mục"
        options={categories}
        selectedValue={state.selectedCategory}
        onSelect={(value) =>
          dispatch({ type: actionTypes.SET_CATEGORY, payload: value })
        }
      />

      <FilterSection
        title="💰 Khoảng giá"
        options={priceRanges}
        selectedValue={state.selectedPriceRange.label}
        onSelect={(range) =>
          dispatch({ type: actionTypes.SET_PRICE_RANGE, payload: range })
        }
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.label}
      />
    </div>
  );
};

export default Filter;
