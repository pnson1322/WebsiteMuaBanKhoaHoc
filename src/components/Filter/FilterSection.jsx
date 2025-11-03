import React from "react";
import FilterOptionButton from "./FilterOptionButton";

const FilterSection = ({ 
  title, 
  options, 
  selectedValue, 
  onSelect, 
  getOptionLabel = (option) => option,
  getOptionValue = (option) => option 
}) => {
  return (
    <div className="filter-section">
      <h4>{title}</h4>
      <div className="filter-options">
        {options.map((option) => {
          const optionValue = getOptionValue(option);
          const optionLabel = getOptionLabel(option);
          const isActive = selectedValue === optionValue;
          
          return (
            <FilterOptionButton
              key={optionValue}
              label={optionLabel}
              isActive={isActive}
              onClick={() => onSelect(option)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FilterSection;
