export const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch (error) {
    return date;
  }
};

