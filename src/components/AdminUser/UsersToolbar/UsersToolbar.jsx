import React, { useState } from "react";
import { Search, ChevronDown, UserPlus } from "lucide-react";
import { getRoleLabel } from "../../../pages/AdminUsersPage/utils";
import "./UsersToolbar.css";

const UsersToolbar = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onAddAdmin,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <div className="users-toolbar">
      <div className="users-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Tìm kiếm theo tên, email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="users-filters">
        <div className="role-filter-wrapper">
          <button
            className="role-filter-btn"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            {getRoleLabel(roleFilter)}
            <ChevronDown size={16} />
          </button>
          {showRoleDropdown && (
            <>
              <div
                className="role-dropdown-overlay"
                onClick={() => setShowRoleDropdown(false)}
              />
              <div className="role-dropdown">
                <button
                  className={`role-option ${
                    roleFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => {
                    onRoleFilterChange("all");
                    setShowRoleDropdown(false);
                  }}
                >
                  Tất cả vai trò
                </button>
                <button
                  className={`role-option ${
                    roleFilter === "BUYER" ? "active" : ""
                  }`}
                  onClick={() => {
                    onRoleFilterChange("BUYER");
                    setShowRoleDropdown(false);
                  }}
                >
                  Buyer
                </button>
                <button
                  className={`role-option ${
                    roleFilter === "SELLER" ? "active" : ""
                  }`}
                  onClick={() => {
                    onRoleFilterChange("SELLER");
                    setShowRoleDropdown(false);
                  }}
                >
                  Seller
                </button>
                <button
                  className={`role-option ${
                    roleFilter === "ADMIN" ? "active" : ""
                  }`}
                  onClick={() => {
                    onRoleFilterChange("ADMIN");
                    setShowRoleDropdown(false);
                  }}
                >
                  Admin
                </button>
              </div>
            </>
          )}
        </div>

        <button className="add-admin-btn" onClick={onAddAdmin}>
          <UserPlus size={18} />
          Thêm Admin
        </button>
      </div>
    </div>
  );
};

export default UsersToolbar;

