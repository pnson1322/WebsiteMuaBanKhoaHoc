import React from "react";
import "./UsersStats.css";

const UsersStats = ({ stats }) => {
  return (
    <div className="users-stats">
      <div className="stat-card stat-card--green">
        <div className="stat-card__number">{stats.buyers}</div>
        <div className="stat-card__label">Người mua</div>
      </div>
      <div className="stat-card stat-card--blue">
        <div className="stat-card__number">{stats.sellers}</div>
        <div className="stat-card__label">Người bán</div>
      </div>
      <div className="stat-card stat-card--orange">
        <div className="stat-card__number">{stats.admins}</div>
        <div className="stat-card__label">Quản trị viên</div>
      </div>
      <div className="stat-card stat-card--purple">
        <div className="stat-card__number">{stats.total}</div>
        <div className="stat-card__label">Tổng người dùng</div>
      </div>
    </div>
  );
};

export default UsersStats;

