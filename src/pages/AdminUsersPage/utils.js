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

