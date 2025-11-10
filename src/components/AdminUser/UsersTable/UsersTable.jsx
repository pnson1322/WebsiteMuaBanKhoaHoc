import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { formatDate, getRoleColor } from "../../../pages/AdminUsersPage/utils";
import "./UsersTable.css";

const UsersTable = ({ users, onViewUser, onDeleteUser }) => {
  return (
    <div className="users-table-container">
      <h3 className="users-table-title">Danh sách người dùng</h3>
      <div className="users-table">
        <div className="users-table__header">
          <span>ID</span>
          <span>Họ tên</span>
          <span>Email</span>
          <span>Vai trò</span>
          <span>Ngày tạo</span>
          <span>Thao tác</span>
        </div>

        <div className="users-table__body">
          {users.length === 0 ? (
            <div className="users-empty">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            users.map((user) => (
              <div className="users-row" key={user.id}>
                <span className="users-cell users-cell--id">{user.id}</span>
                <span className="users-cell users-cell--name">{user.name}</span>
                <span className="users-cell users-cell--email">
                  {user.email}
                </span>
                <span className="users-cell users-cell--role">
                  <span
                    className={`role-badge role-badge--${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </span>
                <span className="users-cell users-cell--date">
                  {formatDate(user.createdAt)}
                </span>
                <span className="users-cell users-cell--actions">
                  <button
                    type="button"
                    className="users-action users-action--view"
                    onClick={() => onViewUser(user)}
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                  <button
                    type="button"
                    className="users-action users-action--delete"
                    onClick={() => onDeleteUser(user)}
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersTable;

