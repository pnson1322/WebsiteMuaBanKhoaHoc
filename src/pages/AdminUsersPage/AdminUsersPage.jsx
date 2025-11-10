import React, { useMemo, useState } from "react";
import {
  Eye,
  Search,
  Trash2,
  UserPlus,
  ChevronDown,
  AlertTriangle,
  User,
  Mail,
  Lock,
  Save,
} from "lucide-react";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import Pagination from "../../components/common/Pagination";
import "./AdminUsersPage.css";

const initialUsers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    role: "BUYER",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@email.com",
    role: "SELLER",
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    email: "cuong.le@email.com",
    role: "ADMIN",
    createdAt: "2024-01-05",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    email: "dung.pham@email.com",
    role: "BUYER",
    createdAt: "2024-01-12",
  },
  {
    id: 5,
    name: "Võ Minh Đức",
    email: "duc.vo@email.com",
    role: "SELLER",
    createdAt: "2024-01-08",
  },
];

const PAGE_SIZE = 5;

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch (error) {
    return date;
  }
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Tính toán thống kê
  const stats = useMemo(() => {
    const buyers = users.filter((u) => u.role === "BUYER").length;
    const sellers = users.filter((u) => u.role === "SELLER").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const total = users.length;
    return { buyers, sellers, admins, total };
  }, [users]);

  // Lọc người dùng
  const filteredUsers = useMemo(() => {
    let result = [...users];
    const keyword = searchTerm.trim().toLowerCase();

    // Lọc theo từ khóa
    if (keyword) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
      );
    }

    // Lọc theo vai trò
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    return result;
  }, [users, searchTerm, roleFilter]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý xem chi tiết
  const handleViewUser = (user) => {
    setViewingUser(user);
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const closeViewModal = () => {
    setViewingUser(null);
    setEditingUser(null);
  };

  // Xử lý cập nhật thông tin người dùng
  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name: editingUser.name,
              email: editingUser.email,
              role: editingUser.role,
            }
          : user
      )
    );
    closeViewModal();
  };

  const handleEditFormChange = (field, value) => {
    setEditingUser((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý xóa
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    }
  };

  const closeDeleteModal = () => {
    setDeletingUser(null);
  };

  // Xử lý thêm admin
  const handleAddAdmin = () => {
    setShowAddAdminModal(true);
  };

  const closeAddAdminModal = () => {
    setShowAddAdminModal(false);
    setAddAdminForm({ name: "", email: "", password: "" });
  };

  const handleAddAdminSubmit = (e) => {
    e.preventDefault();
    const { name, email, password } = addAdminForm;
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const nextId =
      users.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1;

    setUsers((prev) => [
      ...prev,
      {
        id: nextId,
        name: name.trim(),
        email: email.trim(),
        role: "ADMIN",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);

    closeAddAdminModal();
  };

  const handleAddAdminFormChange = (field, value) => {
    setAddAdminForm((prev) => ({ ...prev, [field]: value }));
  };

  // Lấy tên vai trò hiển thị
  const getRoleLabel = (role) => {
    const roleMap = {
      all: "Tất cả vai trò",
      BUYER: "Buyer",
      SELLER: "Seller",
      ADMIN: "Admin",
    };
    return roleMap[role] || role;
  };

  // Lấy tên vai trò tiếng Việt
  const getRoleLabelVN = (role) => {
    const roleMap = {
      BUYER: "Người Mua",
      SELLER: "Người Bán",
      ADMIN: "Quản Trị Viên",
    };
    return roleMap[role] || role;
  };

  // Lấy màu cho tag vai trò
  const getRoleColor = (role) => {
    const colorMap = {
      BUYER: "green",
      SELLER: "blue",
      ADMIN: "orange",
    };
    return colorMap[role] || "gray";
  };

  // Reset page khi filter thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  return (
    <div className="admin-users-wrapper">
      <SellerStatsHeader
        title="🛡️ Quản lý Người dùng"
        subtitle="Quản lý tất cả người dùng trong hệ thống - Người mua, Người bán và Quản trị viên"
      />

      <div className="admin-users-content">
        {/* Thẻ thống kê */}
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

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="users-toolbar">
          <div className="users-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                        setRoleFilter("all");
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
                        setRoleFilter("BUYER");
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
                        setRoleFilter("SELLER");
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
                        setRoleFilter("ADMIN");
                        setShowRoleDropdown(false);
                      }}
                    >
                      Admin
                    </button>
                  </div>
                </>
              )}
            </div>

            <button className="add-admin-btn" onClick={handleAddAdmin}>
              <UserPlus size={18} />
              Thêm Admin
            </button>
          </div>
        </div>

        {/* Bảng danh sách người dùng */}
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
              {pageData.length === 0 ? (
                <div className="users-empty">
                  Không tìm thấy người dùng phù hợp.
                </div>
              ) : (
                pageData.map((user) => (
                  <div className="users-row" key={user.id}>
                    <span className="users-cell users-cell--id">
                      {user.id}
                    </span>
                    <span className="users-cell users-cell--name">
                      {user.name}
                    </span>
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
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye size={16} />
                        Xem
                      </button>
                      <button
                        type="button"
                        className="users-action users-action--delete"
                        onClick={() => handleDeleteUser(user)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="users-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modal xem và chỉnh sửa thông tin người dùng */}
      {viewingUser && editingUser && (
        <div
          className="users-modal-overlay"
          onClick={closeViewModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="users-modal users-modal--edit"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="users-modal__header">
              <div>
                <div className="users-modal__icon users-modal__icon--edit">
                  <User size={20} />
                </div>
                <h3>Thông Tin Người Dùng</h3>
              </div>
              <button
                className="users-modal__close"
                onClick={closeViewModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </header>
            <form
              className="users-modal__form"
              onSubmit={handleUpdateUser}
            >
              <div className="users-form-group">
                <label htmlFor="edit-name">
                  <User size={16} />
                  Họ và Tên
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    handleEditFormChange("name", e.target.value)
                  }
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="edit-email">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    handleEditFormChange("email", e.target.value)
                  }
                  placeholder="Nhập email..."
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="edit-role">
                  <User size={16} />
                  Vai Trò
                </label>
                <select
                  id="edit-role"
                  value={editingUser.role}
                  onChange={(e) =>
                    handleEditFormChange("role", e.target.value)
                  }
                  className="users-form-select"
                >
                  <option value="BUYER">Người Mua</option>
                  <option value="SELLER">Người Bán</option>
                  <option value="ADMIN">Quản Trị Viên</option>
                </select>
              </div>

              <button type="submit" className="users-btn users-btn--primary users-btn--full">
                <Save size={18} />
                Cập Nhật Thông Tin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm Admin */}
      {showAddAdminModal && (
        <div
          className="users-modal-overlay"
          onClick={closeAddAdminModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="users-modal users-modal--add"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="users-modal__header">
              <div>
                <div className="users-modal__icon users-modal__icon--add">
                  <UserPlus size={20} />
                </div>
                <h3>Thêm Admin</h3>
              </div>
              <button
                className="users-modal__close"
                onClick={closeAddAdminModal}
                aria-label="Đóng"
              >
                ×
              </button>
            </header>
            <form
              className="users-modal__form"
              onSubmit={handleAddAdminSubmit}
            >
              <div className="users-form-group">
                <label htmlFor="add-name">
                  <User size={16} />
                  Họ và Tên
                </label>
                <input
                  id="add-name"
                  type="text"
                  value={addAdminForm.name}
                  onChange={(e) =>
                    handleAddAdminFormChange("name", e.target.value)
                  }
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="add-email">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  id="add-email"
                  type="email"
                  value={addAdminForm.email}
                  onChange={(e) =>
                    handleAddAdminFormChange("email", e.target.value)
                  }
                  placeholder="Nhập email..."
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="add-password">
                  <Lock size={16} />
                  Mật khẩu
                </label>
                <input
                  id="add-password"
                  type="password"
                  value={addAdminForm.password}
                  onChange={(e) =>
                    handleAddAdminFormChange("password", e.target.value)
                  }
                  placeholder="Nhập mật khẩu..."
                  required
                />
              </div>

              <button type="submit" className="users-btn users-btn--primary users-btn--full">
                <UserPlus size={18} />
                Thêm người dùng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletingUser && (
        <div
          className="users-modal-overlay"
          onClick={closeDeleteModal}
          role="alertdialog"
          aria-modal="true"
        >
          <div
            className="users-modal users-modal--danger"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="users-modal__header">
              <div>
                <div className="users-modal__icon users-modal__icon--danger">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3>Xác Nhận Xóa</h3>
                  <p>Hành động này không thể hoàn tác</p>
                </div>
              </div>
            </header>
            <div className="users-modal__body">
              <p>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>{deletingUser.name}</strong>?
              </p>
            </div>
            <footer className="users-modal__footer">
              <button
                className="users-btn users-btn--ghost"
                onClick={closeDeleteModal}
              >
                Hủy
              </button>
              <button
                className="users-btn users-btn--danger"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

