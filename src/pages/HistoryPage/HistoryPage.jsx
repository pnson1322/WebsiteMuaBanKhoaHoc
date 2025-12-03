import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Eye, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAppState, useAppDispatch } from "../../contexts/AppContext";
import { historyAPI } from "../../services/historyAPI";
import CourseCard from "../../components/CourseCard/CourseCard";
import "./HistoryPage.css";
import logger from "../../utils/logger";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  const [allHistoryCourses, setAllHistoryCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // 🧠 Load toàn bộ lịch sử xem từ API
  useEffect(() => {
    const loadAllHistoryCourses = async () => {
      // ✅ Chỉ load khi user đã đăng nhập
      if (!isLoggedIn) {
        logger.warn("HISTORY_PAGE", "User not logged in, redirecting to home");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        logger.info("HISTORY_PAGE", "Loading history from API", {
          page: pagination.page,
          pageSize: pagination.pageSize,
        });

        const response = await historyAPI.getHistory(
          pagination.page,
          pagination.pageSize
        );

        setAllHistoryCourses(response.items || []);
        setFilteredCourses(response.items || []);
        setPagination({
          page: response.page,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        });

        logger.info("HISTORY_PAGE", "History loaded successfully", {
          itemsCount: response.items?.length,
          totalCount: response.totalCount,
        });
      } catch (error) {
        logger.error("HISTORY_PAGE", "Error loading history", error);
        setAllHistoryCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllHistoryCourses();
  }, [pagination.page, isLoggedIn, navigate]);

  // 🔍 Bộ lọc tìm kiếm theo tên / giảng viên / danh mục
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCourses(allHistoryCourses);
    } else {
      const filtered = allHistoryCourses.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, allHistoryCourses]);

  // 🗑 Xóa toàn bộ lịch sử
  const clearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem?")) {
      try {
        await historyAPI.clearHistory();
        logger.info("HISTORY_PAGE", "History cleared successfully");

        setAllHistoryCourses([]);
        setFilteredCourses([]);
        setPagination({ page: 1, pageSize: 10, totalCount: 0, totalPages: 0 });

        // Cập nhật context nếu cần
        dispatch({ type: actionTypes.CLEAR_VIEW_HISTORY });
      } catch (error) {
        logger.error("HISTORY_PAGE", "Failed to clear history", error);
        alert("Có lỗi xảy ra khi xóa lịch sử. Vui lòng thử lại!");
      }
    }
  };

  // 📖 Xem chi tiết khóa học
  const handleViewDetails = (course) => {
    navigate(`/course/${course.id}`);
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử xem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="container">
        {/* 🔙 Nút quay lại */}
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft /> Quay lại
        </button>

        {/* 🧭 Header */}
        <div className="history-header">
          <div className="header-content">
            <div className="title-section">
              <Clock className="page-icon" />
              <h1>Lịch sử xem khóa học</h1>
              <span className="total-count">
                ({allHistoryCourses.length} khóa học)
              </span>
            </div>

            <div className="header-actions">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong lịch sử..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {allHistoryCourses.length > 0 && (
                <button className="clear-all-btn" onClick={clearHistory}>
                  <Trash2 className="trash-icon" />
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📚 Nội dung */}
        {filteredCourses.length === 0 ? (
          <div className="empty-history">
            {searchTerm ? (
              <>
                <Search className="empty-icon" />
                <h3>Không tìm thấy kết quả</h3>
                <p>
                  Không có khóa học nào phù hợp với từ khóa "
                  <strong>{searchTerm}</strong>"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-btn"
                >
                  Xóa bộ lọc
                </button>
              </>
            ) : (
              <>
                <Eye className="empty-icon" />
                <h3>Chưa có lịch sử xem</h3>
                <p>
                  Bạn chưa xem khóa học nào. Hãy khám phá các khóa học thú vị!
                </p>
                <button onClick={() => navigate("/")} className="explore-btn">
                  Khám phá khóa học
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="history-content">
            <div className="results-info">
              <p>
                {searchTerm ? (
                  <>
                    Tìm thấy <strong>{filteredCourses.length}</strong> kết quả
                    cho "{searchTerm}"
                  </>
                ) : (
                  <>
                    Hiển thị <strong>{filteredCourses.length}</strong> khóa học
                    đã xem
                  </>
                )}
              </p>
            </div>

            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onViewDetails={() => handleViewDetails(course)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
