import React from "react";
import { Filter as FilterIcon } from "lucide-react";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import "./Filter.css";
import FilterSection from "./FilterSection";

const categories = [
  "Tất cả",
  "Lập trình",
  "Thiết kế",
  "Ngoại ngữ",
  "Marketing",
];

const priceRanges = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 500K", min: 0, max: 500000 },
  { label: "500K - 1 triệu", min: 500000, max: 1000000 },
  { label: "Trên 1 triệu", min: 1000000, max: Infinity },
];

const Filter = () => {
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

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
