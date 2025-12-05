import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminManagementCard.css";

const AdminManagementCard = ({ icon, title, description, route, color }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <div className="admin-management-card" onClick={handleClick}>
      <div className="admin-card-content">
        <div
          className="admin-card-icon-wrapper"
          style={{ background: color.light }}
        >
          <div className="admin-card-icon" style={{ color: color.main }}>
            {icon}
          </div>
        </div>
        <div className="admin-card-text">
          <h3 className="admin-card-title">{title}</h3>
          <p className="admin-card-description">{description}</p>
        </div>
      </div>
      <div className="admin-card-arrow" style={{ color: color.main }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default AdminManagementCard;
