/**
 * Utility functions cho Course
 */

/**
 * Chuyển đổi level từ tiếng Anh sang tiếng Việt
 * @param {string} level - Level của khóa học (có thể là tiếng Anh hoặc tiếng Việt)
 * @returns {string} - Level bằng tiếng Việt
 */
export const getLevelInVietnamese = (level) => {
  if (!level) return "Cơ bản";

  const levelMap = {
    // Tiếng Anh
    Beginner: "Cơ bản",
    beginner: "Cơ bản",
    BEGINNER: "Cơ bản",
    Intermediate: "Trung cấp",
    intermediate: "Trung cấp",
    INTERMEDIATE: "Trung cấp",
    Advanced: "Nâng cao",
    advanced: "Nâng cao",
    ADVANCED: "Nâng cao",
    // Tiếng Việt (giữ nguyên)
    "Cơ bản": "Cơ bản",
    "Trung cấp": "Trung cấp",
    "Nâng cao": "Nâng cao",
  };

  return levelMap[level] || level;
};

/**
 * Lấy màu sắc cho level badge
 * @param {string} level - Level của khóa học
 * @returns {string} - Class name cho màu sắc
 */
export const getLevelColor = (level) => {
  const vietnameseLevel = getLevelInVietnamese(level);

  switch (vietnameseLevel) {
    case "Cơ bản":
      return "level-beginner";
    case "Trung cấp":
      return "level-intermediate";
    case "Nâng cao":
      return "level-advanced";
    default:
      return "level-beginner";
  }
};
