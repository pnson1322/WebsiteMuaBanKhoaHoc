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

  // 🔥 Lấy categories động từ courses thực tế
  const categories = useMemo(() => {
    if (!state.courses || state.courses.length === 0) {
      console.log("⚠️ No courses available for filter");
      return ["Tất cả"];
    }

    // Debug: Log một vài course samples để kiểm tra structure
    if (state.courses.length > 0) {
      console.log("📝 Sample course structure:", {
        first: state.courses[0],
        totalCourses: state.courses.length,
      });
    }

    // Lấy tất cả categoryName từ courses
    const categorySet = new Set();
    state.courses.forEach((course) => {
      if (course.categoryName) {
        categorySet.add(course.categoryName);
      } else {
        console.warn("⚠️ Course without categoryName:", course);
      }
    });

    // Convert Set sang Array và sort, thêm "Tất cả" ở đầu
    const categoriesArray = ["Tất cả", ...Array.from(categorySet).sort()];

    console.log("📚 Available categories:", categoriesArray);
    return categoriesArray;
  }, [state.courses]);

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
