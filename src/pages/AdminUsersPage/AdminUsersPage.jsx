import React, { useMemo, useState } from "react";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import Pagination from "../../components/common/Pagination";
import UsersStats from "../../components/AdminUser/UsersStats/UsersStats";
import UsersToolbar from "../../components/AdminUser/UsersToolbar/UsersToolbar";
import UsersTable from "../../components/AdminUser/UsersTable/UsersTable";
import UserViewModal from "../../components/AdminUser/UserViewModal/UserViewModal";
import AddAdminModal from "../../components/AdminUser/AddAdminModal/AddAdminModal";
import DeleteUserModal from "../../components/AdminUser/DeleteUserModal/DeleteUserModal";
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

const AdminUsersPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
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
        <UsersStats stats={stats} />

        <UsersToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onAddAdmin={handleAddAdmin}
        />

        <UsersTable
          users={pageData}
          onViewUser={handleViewUser}
          onDeleteUser={handleDeleteUser}
        />

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

      <UserViewModal
        user={viewingUser}
        editingUser={editingUser}
        onClose={closeViewModal}
        onUpdate={handleUpdateUser}
        onFormChange={handleEditFormChange}
      />

      <AddAdminModal
        isOpen={showAddAdminModal}
        formData={addAdminForm}
        onClose={closeAddAdminModal}
        onSubmit={handleAddAdminSubmit}
        onFormChange={handleAddAdminFormChange}
      />

      <DeleteUserModal
        user={deletingUser}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminUsersPage;

