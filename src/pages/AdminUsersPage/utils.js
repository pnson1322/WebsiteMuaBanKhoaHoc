export const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch (error) {
    return date;
  }
};

export const getRoleLabel = (role) => {
  const roleMap = {
    all: "Tất cả vai trò",
    BUYER: "Buyer",
    SELLER: "Seller",
    ADMIN: "Admin",
  };
  return roleMap[role] || role;
};

export const getRoleLabelVN = (role) => {
  const roleMap = {
    BUYER: "Người Mua",
    SELLER: "Người Bán",
    ADMIN: "Quản Trị Viên",
  };
  return roleMap[role] || role;
};

export const getRoleColor = (role) => {
  const colorMap = {
    BUYER: "green",
    SELLER: "blue",
    ADMIN: "orange",
  };
  return colorMap[role] || "gray";
};

/**
 * Convert role từ format UI (BUYER, SELLER, ADMIN) sang format API (Buyer, Seller, Admin)
 */
export const convertRoleToAPIFormat = (role) => {
  const roleMap = {
    BUYER: "Buyer",
    SELLER: "Seller",
    ADMIN: "Admin",
  };
  return roleMap[role] || role;
};

/**
 * Normalize role từ API response về format chuẩn để filter
 * Xử lý nhiều format: BUYER, Buyer, User → "BUYER"
 * Xử lý nhiều format: SELLER, Seller, Instructor → "SELLER"
 * Xử lý nhiều format: ADMIN, Admin → "ADMIN"
 */
export const normalizeRoleFromAPI = (role) => {
  if (!role) return null;
  
  const roleUpper = role.toUpperCase();
  
  // Buyers: BUYER, Buyer, User
  if (roleUpper === "BUYER" || roleUpper === "USER") {
    return "BUYER";
  }
  
  // Sellers: SELLER, Seller, Instructor
  if (roleUpper === "SELLER" || roleUpper === "INSTRUCTOR") {
    return "SELLER";
  }
  
  // Admins: ADMIN, Admin
  if (roleUpper === "ADMIN") {
    return "ADMIN";
  }
  
  return role;
};

/**
 * Check xem user có match với roleFilter không (xử lý nhiều format)
 */
export const matchesRoleFilter = (userRole, roleFilter) => {
  if (roleFilter === "all") return true;
  
  const normalizedUserRole = normalizeRoleFromAPI(userRole);
  const normalizedFilter = normalizeRoleFromAPI(roleFilter);
  
  return normalizedUserRole === normalizedFilter;
};

