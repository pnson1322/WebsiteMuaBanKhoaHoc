import React, { useEffect, useMemo, useState } from "react";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import Pagination from "../../components/common/Pagination";
import UsersStats from "../../components/AdminUser/UsersStats/UsersStats";
import UsersToolbar from "../../components/AdminUser/UsersToolbar/UsersToolbar";
import UsersTable from "../../components/AdminUser/UsersTable/UsersTable";
import UserViewModal from "../../components/AdminUser/UserViewModal/UserViewModal";
import AddAdminModal from "../../components/AdminUser/AddAdminModal/AddAdminModal";
import DeleteUserModal from "../../components/AdminUser/DeleteUserModal/DeleteUserModal";
import { userAPI } from "../../services/userAPI";
import { useToast } from "../../contexts/ToastContext";
import {
  convertRoleToAPIFormat,
  normalizeRoleFromAPI,
  matchesRoleFilter,
} from "./utils";

import "./AdminUsersPage.css";

const PAGE_SIZE = 10;

const AdminUsersPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [stats, setStats] = useState({
    buyers: 0,
    sellers: 0,
    admins: 0,
    total: 0,
  });

  const [addAdminForm, setAddAdminForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [addAdminErrors, setAddAdminErrors] = useState({
    email: "",
    phoneNumber: "",
  });

  // =============================================================
  // 🔥 1. Load Stats từ API (với fallback nếu endpoint statistics không hoạt động)
  // =============================================================
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);

        // Thử gọi endpoint statistics trước
        try {
          const data = await userAPI.getUserStatistics();
          console.log("📊 Raw API Response from /User/statistics:", data);

          // API trả về: { totalUsers, roleCounts: { Admin, Instructor, User } }
          const roleCounts = data.roleCounts || {};

          const statsData = {
            buyers:
              roleCounts.User ||
              roleCounts.user ||
              roleCounts.Buyer ||
              roleCounts.buyer ||
              data.buyer ||
              data.Buyer ||
              0,
            sellers:
              roleCounts.Instructor ||
              roleCounts.instructor ||
              roleCounts.Seller ||
              roleCounts.seller ||
              data.seller ||
              data.Seller ||
              0,
            admins:
              roleCounts.Admin ||
              roleCounts.admin ||
              data.admin ||
              data.Admin ||
              0,
            total: data.totalUsers || data.total || 0,
          };

          console.log("📊 Parsed Stats from /User/statistics:", statsData);
          setStats(statsData);
          return; // Thành công, không cần fallback
        } catch (statsError) {
          console.warn(
            "⚠️ /User/statistics endpoint failed, trying fallback methods...",
            statsError.response?.status
          );

          // Fallback 1: Thử getUsersByRole cho từng role
          try {
            const [buyersData, sellersData, adminsData] = await Promise.all([
              userAPI.getUsersByRole("Buyer", 1, 1).catch(() => null),
              userAPI.getUsersByRole("Seller", 1, 1).catch(() => null),
              userAPI.getUsersByRole("Admin", 1, 1).catch(() => null),
            ]);

            // Nếu có ít nhất 1 response thành công
            if (buyersData || sellersData || adminsData) {
              const buyers = buyersData?.totalCount || 0;
              const sellers = sellersData?.totalCount || 0;
              const admins = adminsData?.totalCount || 0;
              const total = buyers + sellers + admins;

              const statsData = {
                buyers,
                sellers,
                admins,
                total,
              };

              console.log(
                "📊 Stats calculated from getUsersByRole (fallback 1):",
                statsData
              );
              setStats(statsData);
              return;
            }
          } catch (roleError) {
            console.warn(
              "⚠️ getUsersByRole also failed, trying final fallback..."
            );
          }

          // Fallback 2: Tính từ getUsers() với pageSize lớn
          try {
            // Lấy tất cả users với pageSize lớn để tính stats
            const allUsersData = await userAPI.getUsers(1, 1000);
            const allUsers = allUsersData.items || [];

            const buyers = allUsers.filter(
              (u) =>
                u.role === "BUYER" || u.role === "Buyer" || u.role === "User"
            ).length;
            const sellers = allUsers.filter(
              (u) =>
                u.role === "SELLER" ||
                u.role === "Seller" ||
                u.role === "Instructor"
            ).length;
            const admins = allUsers.filter(
              (u) => u.role === "ADMIN" || u.role === "Admin"
            ).length;
            const total = allUsersData.totalCount || allUsers.length;

            const statsData = {
              buyers,
              sellers,
              admins,
              total,
            };

            console.log(
              "📊 Stats calculated from getUsers() (fallback 2):",
              statsData
            );
            setStats(statsData);
          } catch (usersError) {
            console.error("❌ All fallback methods failed:", usersError);
            // Set default values
            setStats({
              buyers: 0,
              sellers: 0,
              admins: 0,
              total: 0,
            });
          }
        }
      } catch (error) {
        console.error("❌ Error loading stats:", error);
        // Set default values nếu tất cả đều fail
        setStats({
          buyers: 0,
          sellers: 0,
          admins: 0,
          total: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // =============================================================
  // 🔥 Helper function: Load Users với fallback và xử lý nhiều format role
  // =============================================================
  const loadUsersWithFallback = async (
    page = currentPage,
    filter = roleFilter,
    showLoading = true
  ) => {
    try {
      if (showLoading) setIsLoading(true);
      let data;

      if (filter === "all") {
        // Lấy tất cả users
        console.log(
          `📌 Loading all users - Page: ${page}, PageSize: ${PAGE_SIZE}`
        );
        data = await userAPI.getUsers(page, PAGE_SIZE);
        console.log("📌 Response từ getUsers():", {
          items: data.items?.length || 0,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
          page: data.page,
          pageSize: data.pageSize,
        });
      } else {
        // Lấy users theo role (convert từ BUYER/SELLER/ADMIN sang Buyer/Seller/Admin)
        const apiRole = convertRoleToAPIFormat(filter);
        console.log(
          `📌 Loading users by role - Filter: ${filter}, API Role: ${apiRole}, Page: ${page}, PageSize: ${PAGE_SIZE}`
        );

        try {
          data = await userAPI.getUsersByRole(apiRole, page, PAGE_SIZE);
          console.log("📌 Response từ getUsersByRole():", {
            role: apiRole,
            items: data.items?.length || 0,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
            page: data.page,
            pageSize: data.pageSize,
          });
        } catch (roleError) {
          // Fallback: Nếu getUsersByRole fail (404), filter từ getUsers()
          console.warn(
            `⚠️ getUsersByRole(${apiRole}) failed (${roleError.response?.status}), using fallback filter from getUsers()`
          );

          const allUsersData = await userAPI.getUsers(1, 1000);
          const allUsers = allUsersData.items || [];

          // Filter theo role với xử lý nhiều format
          const filtered = allUsers.filter((user) =>
            matchesRoleFilter(user.role, filter)
          );

          // Tính pagination thủ công
          const startIndex = (page - 1) * PAGE_SIZE;
          const endIndex = startIndex + PAGE_SIZE;
          const paginatedUsers = filtered.slice(startIndex, endIndex);
          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

          data = {
            items: paginatedUsers,
            totalCount: filtered.length,
            totalPages: totalPages,
            page: page,
            pageSize: PAGE_SIZE,
          };

          console.log("📌 Fallback filter result:", {
            originalTotal: allUsers.length,
            filteredTotal: filtered.length,
            paginatedItems: paginatedUsers.length,
            totalPages: totalPages,
            currentPage: page,
          });
        }
      }

      // Normalize roles trong response để đảm bảo consistency
      const normalizedItems = (data.items || []).map((user) => ({
        ...user,
        role: normalizeRoleFromAPI(user.role) || user.role,
      }));

      console.log("📌 Final users data:", {
        itemsCount: normalizedItems.length,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        roles: normalizedItems.map((u) => u.role),
      });

      setUsers(normalizedItems);
      setTotalPages(data.totalPages || 1);
      return data;
    } catch (error) {
      console.error("❌ Error loading users:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setUsers([]);
      setTotalPages(1);
      throw error;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // =============================================================
  // 🔥 2. Load Users từ API (server-side pagination & filtering)
  // Với fallback và xử lý nhiều format role
  // =============================================================
  useEffect(() => {
    loadUsersWithFallback();
  }, [currentPage, roleFilter]);

  // =============================================================
  // 🔥 3. Filtering (search ở frontend, role filter đã ở server nhưng có thể fallback)
  // =============================================================
  const filteredUsers = useMemo(() => {
    let result = [...users];
    const keyword = searchTerm.trim().toLowerCase();

    console.log("🔍 Filtering users:", {
      totalUsers: result.length,
      searchTerm: keyword,
      roleFilter: roleFilter,
    });

    // Search filter
    if (keyword) {
      const beforeSearch = result.length;
      result = result.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(keyword) ||
          user.email?.toLowerCase().includes(keyword)
      );
      console.log("🔍 After search filter:", {
        before: beforeSearch,
        after: result.length,
        keyword: keyword,
      });
    }

    // Role filtering (nếu fallback được dùng, có thể cần filter lại ở đây)
    // Nếu roleFilter !== "all" và đang dùng fallback, đảm bảo filter đúng
    if (roleFilter !== "all") {
      const beforeRoleFilter = result.length;
      result = result.filter((user) =>
        matchesRoleFilter(user.role, roleFilter)
      );
      console.log("🔍 After role filter:", {
        before: beforeRoleFilter,
        after: result.length,
        roleFilter: roleFilter,
      });
    }

    console.log("🔍 Final filtered users:", {
      count: result.length,
      roles: [...new Set(result.map((u) => u.role))],
    });

    return result;
  }, [users, searchTerm, roleFilter]);

  // =============================================================
  // 🔥 4. Xem thông tin user
  // =============================================================
  const handleViewUser = (user) => {
    setViewingUser(user);
    setEditingUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || user.phone || "",
    });
  };

  const closeViewModal = () => {
    setViewingUser(null);
    setEditingUser(null);
  };

  const handleEditFormChange = (field, value) => {
    setEditingUser((prev) => ({ ...prev, [field]: value }));
  };

  // =============================================================
  // 🔥 5. Cập nhật user (API PUT /User)
  // =============================================================
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    await userAPI.updateCurrentUser({
      fullName: editingUser.fullName,
      email: editingUser.email,
      phoneNumber: "0000000000",
    });

    closeViewModal();

    // reload users và stats
    const reloadData = async () => {
      console.log("🔄 Reloading users and stats after update...");
      await loadUsersWithFallback(currentPage, roleFilter, false);

      // Reload stats (với fallback)
      try {
        const statsData = await userAPI.getUserStatistics();
        const roleCounts = statsData.roleCounts || {};
        setStats({
          buyers: roleCounts.User || roleCounts.Buyer || statsData.buyer || 0,
          sellers:
            roleCounts.Instructor || roleCounts.Seller || statsData.seller || 0,
          admins: roleCounts.Admin || statsData.admin || 0,
          total: statsData.totalUsers || 0,
        });
      } catch (statsError) {
        // Fallback: Tính từ getUsers() với pageSize lớn
        try {
          const allUsersData = await userAPI.getUsers(1, 1000);
          const allUsers = allUsersData.items || [];

          const buyers = allUsers.filter(
            (u) => u.role === "BUYER" || u.role === "Buyer" || u.role === "User"
          ).length;
          const sellers = allUsers.filter(
            (u) =>
              u.role === "SELLER" ||
              u.role === "Seller" ||
              u.role === "Instructor"
          ).length;
          const admins = allUsers.filter(
            (u) => u.role === "ADMIN" || u.role === "Admin"
          ).length;
          const total = allUsersData.totalCount || allUsers.length;

          setStats({
            buyers,
            sellers,
            admins,
            total,
          });
        } catch (fallbackError) {
          console.error("❌ Fallback stats calculation failed:", fallbackError);
        }
      }
    };

    reloadData();
  };

  // =============================================================
  // 🔥 6. Xóa user (API DELETE /User)
  // =============================================================
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    await userAPI.deleteUser(deletingUser.id);

    // reload users và stats
    const reloadData = async () => {
      console.log("🔄 Reloading users and stats after update...");
      await loadUsersWithFallback(currentPage, roleFilter, false);

      // Reload stats (với fallback)
      try {
        const statsData = await userAPI.getUserStatistics();
        const roleCounts = statsData.roleCounts || {};
        setStats({
          buyers: roleCounts.User || roleCounts.Buyer || statsData.buyer || 0,
          sellers:
            roleCounts.Instructor || roleCounts.Seller || statsData.seller || 0,
          admins: roleCounts.Admin || statsData.admin || 0,
          total: statsData.totalUsers || 0,
        });
      } catch (statsError) {
        // Fallback: Tính từ getUsers() với pageSize lớn
        try {
          const allUsersData = await userAPI.getUsers(1, 1000);
          const allUsers = allUsersData.items || [];

          const buyers = allUsers.filter(
            (u) => u.role === "BUYER" || u.role === "Buyer" || u.role === "User"
          ).length;
          const sellers = allUsers.filter(
            (u) =>
              u.role === "SELLER" ||
              u.role === "Seller" ||
              u.role === "Instructor"
          ).length;
          const admins = allUsers.filter(
            (u) => u.role === "ADMIN" || u.role === "Admin"
          ).length;
          const total = allUsersData.totalCount || allUsers.length;

          setStats({
            buyers,
            sellers,
            admins,
            total,
          });
        } catch (fallbackError) {
          console.error("❌ Fallback stats calculation failed:", fallbackError);
        }
      }
    };

    reloadData();
    setDeletingUser(null);
  };

  // =============================================================
  // 🔥 7. Thêm admin mới (API POST /User/Admin)
  // =============================================================
  const handleAddAdmin = () => {
    setShowAddAdminModal(true);
  };

  const closeAddAdminModal = () => {
    setShowAddAdminModal(false);
    setAddAdminForm({
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
    });
    setAddAdminErrors({
      email: "",
      phoneNumber: "",
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "";
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: admin@example.com)";
    }
    return "";
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    if (!phone) return "";
    if (!phoneRegex.test(phone)) {
      return "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số bắt đầu bằng 0 hoặc +84";
    }
    return "";
  };

  const handleAddAdminFormChange = (field, value) => {
    setAddAdminForm((prev) => ({ ...prev, [field]: value }));

    // Validate khi người dùng nhập
    if (field === "email") {
      const error = validateEmail(value);
      setAddAdminErrors((prev) => ({ ...prev, email: error }));
    } else if (field === "phoneNumber") {
      const error = validatePhoneNumber(value);
      setAddAdminErrors((prev) => ({ ...prev, phoneNumber: error }));
    }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, phoneNumber } = addAdminForm;

    // Validate trước khi submit
    const emailError = validateEmail(email);
    const phoneError = validatePhoneNumber(phoneNumber);

    if (emailError || phoneError) {
      setAddAdminErrors({
        email: emailError,
        phoneNumber: phoneError,
      });
      addToast("Vui lòng kiểm tra lại thông tin!", "error");
      return;
    }

    try {
      await userAPI.createAdmin({
        fullName: fullName,
        email,
        password,
        phoneNumber,
      });

      addToast("Thêm admin thành công!", "success");
      closeAddAdminModal();
    } catch (error) {
      console.error("❌ Error creating admin:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Không thể thêm admin. Vui lòng thử lại!";
      addToast(errorMessage, "error");
      return;
    }

    // reload users và stats
    const reloadData = async () => {
      console.log("🔄 Reloading users and stats after update...");
      await loadUsersWithFallback(currentPage, roleFilter, false);

      // Reload stats (với fallback)
      try {
        const statsData = await userAPI.getUserStatistics();
        const roleCounts = statsData.roleCounts || {};
        setStats({
          buyers: roleCounts.User || roleCounts.Buyer || statsData.buyer || 0,
          sellers:
            roleCounts.Instructor || roleCounts.Seller || statsData.seller || 0,
          admins: roleCounts.Admin || statsData.admin || 0,
          total: statsData.totalUsers || 0,
        });
      } catch (statsError) {
        // Fallback: Tính từ getUsers() với pageSize lớn
        try {
          const allUsersData = await userAPI.getUsers(1, 1000);
          const allUsers = allUsersData.items || [];

          const buyers = allUsers.filter(
            (u) => u.role === "BUYER" || u.role === "Buyer" || u.role === "User"
          ).length;
          const sellers = allUsers.filter(
            (u) =>
              u.role === "SELLER" ||
              u.role === "Seller" ||
              u.role === "Instructor"
          ).length;
          const admins = allUsers.filter(
            (u) => u.role === "ADMIN" || u.role === "Admin"
          ).length;
          const total = allUsersData.totalCount || allUsers.length;

          setStats({
            buyers,
            sellers,
            admins,
            total,
          });
        } catch (fallbackError) {
          console.error("❌ Fallback stats calculation failed:", fallbackError);
        }
      }
    };

    reloadData();
  };

  // =============================================================
  // 🔥 Reset page khi đổi role filter (search là frontend nên không cần reset)
  // =============================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  return (
    <div className="admin-users-wrapper">
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
          users={filteredUsers}
          onViewUser={handleViewUser}
          onDeleteUser={handleDeleteUser}
          isLoading={isLoading}
        />

        {totalPages > 1 && (
          <div className="users-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* View User */}
      <UserViewModal
        user={viewingUser}
        editingUser={editingUser}
        onClose={closeViewModal}
        onUpdate={handleUpdateUser}
        onFormChange={handleEditFormChange}
      />

      {/* Add Admin */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        formData={addAdminForm}
        errors={addAdminErrors}
        onClose={closeAddAdminModal}
        onSubmit={handleAddAdminSubmit}
        onFormChange={handleAddAdminFormChange}
      />

      {/* Delete User */}
      <DeleteUserModal
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminUsersPage;
