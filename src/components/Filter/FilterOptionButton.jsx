import React from "react";

const FilterOptionButton = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`filter-option ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default FilterOptionButton;
