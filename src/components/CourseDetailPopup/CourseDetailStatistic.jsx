import "./CourseDetailStatistic.css";
import React, { useState, useEffect } from "react";
import { BarChart2, MessageCircle, Star } from "lucide-react";
import { LineChart } from "@mui/x-charts";
import { reviewAPI } from "../../services/reviewAPI";
import { dashboardAPI } from "../../services/dashboardAPI";
import { useToast } from "../../contexts/ToastContext";

const StarRating = ({ rating, setRating, hover, setHover }) => {
  return (
    <div className="star-rating-popup">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            className={`star ${starValue <= (hover || rating) ? "filled" : ""}`}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(rating)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const StarDisplay = ({ rating }) => {
  return (
    <div className="star-rating-display">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            className={`star ${starValue <= rating ? "filled" : ""}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default function CourseDetailStatistic({ course, user, isEditable }) {
  const { showSuccess, showError } = useToast();

  // State cho form "Viết đánh giá mới"
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  // State cho form "Chỉnh sửa"
  const [ratingEdit, setRatingEdit] = useState(0);
  const [hoverEdit, setHoverEdit] = useState(0);

  // State quản lý danh sách
  const [commentList, setCommentList] = useState([]);
  const [sortMode, setSortMode] = useState("all-comment");
  const [editComment, setEditComment] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewAPI.getReviewByCourseId(course.id);

      const formattedReviews = data.map((item) => {
        const d = new Date(item.createdAt || Date.now());
        const dateStr = d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        return {
          id: item.id,
          comment: item.comment,
          rate: item.rating,
          date: dateStr,
          user: {
            id: item.userId,
            name: item.userName || "Người dùng ẩn danh",
            image:
              item.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                item.userName
              )}&background=random&color=fff`,
          },
        };
      });

      console.log(formattedReviews);

      const sorted = sortComments(formattedReviews, sortMode);
      setCommentList(sorted);
    } catch (err) {
      showError("Lỗi tải bình luận:", err);
    }
  }, [course.id, sortMode]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (editComment !== 0 && commentList.length > 0) {
      const comment = commentList.find((c) => c.id === editComment);
      if (comment) setRatingEdit(comment.rate);
    } else {
      setRatingEdit(0);
    }
  }, [editComment, commentList]);

  // Hàm Gửi bình luận mới
  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showError("Vui lòng đăng nhập để đánh giá.");
      return;
    }

    const form = e.target;
    const content = form.comment.value?.trim() || "";
    if (!rating || !content)
      return alert("Vui lòng nhập đủ đánh giá và nội dung.");

    try {
      await reviewAPI.createReview({
        courseId: id,
        rating: rating,
        comment: content,
      });

      showSuccess("Đã gửi đánh giá thành công!");
      setRating(0);
      setHover(0);
      form.reset();

      fetchReviews();
    } catch (err) {
      showError(
        "Gửi đánh giá thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Hàm Gửi Cập nhật (Sửa)
  const submitEditComment = async (e) => {
    e.preventDefault();
    if (!editComment) return;

    const form = e.target;
    const content = form.commentEdit.value?.trim() || "";
    if (!ratingEdit || !content) {
      showError("Nội dung đánh giá không được để trống.");
      return;
    }

    try {
      await reviewAPI.updateReview({
        reviewId: editComment,
        rating: ratingEdit,
        comment: content,
      });

      showSuccess("Cập nhật đánh giá thành công!");
      setEditComment(0);
      setRatingEdit(0);
      setHoverEdit(0);

      fetchReviews();
    } catch (err) {
      showError(
        "Cập nhật thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Hàm Xóa
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      await reviewAPI.deleteReviewByAdmin(commentId);

      showSuccess("Đã xóa đánh giá.");

      fetchReviews();
    } catch (err) {
      showError(
        "Xóa thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleSortChange = (e) => {
    const newMode = e.target.value;
    setSortMode(newMode);
    if (newMode === "all-comment") {
      fetchReviews();
    } else {
      setCommentList((prev) => sortComments(prev, newMode));
    }
  };

  const sortComments = (list, mode) => {
    const sortedList = [...list];
    switch (mode) {
      case "all-comment":
        return sortedList;
      case "one-star":
        return sortedList.filter((a) => a.rate == 1);
      case "two-star":
        return sortedList.filter((a) => a.rate == 2);
      case "three-star":
        return sortedList.filter((a) => a.rate == 3);
      case "four-star":
        return sortedList.filter((a) => a.rate == 4);
      case "five-star":
        return sortedList.filter((a) => a.rate == 5);
      default:
        return sortedList;
    }
  };

  // Line Chart
  const [dataLineChart, setDataLineChart] = useState([]);
  const revenueLineColor = "#667eea";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monthlyRevenue = await dashboardAPI.getCourseMonthlyRevenue(
          course.id
        );

        setDataLineChart(
          monthlyRevenue.map((i) => ({
            date: i.year + "-" + i.month,
            revenue: i.totalRevenue,
          }))
        );
      } catch (err) {
        showError("Lỗi: " + err);
      }
    };

    fetchData();
  }, []);

  // Star Statistic
  const [ratingStats, setRatingStats] = useState({
    counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    total: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!course?.id) return;
      try {
        const data = await dashboardAPI.getCourseReviewStars(course.id);

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let total = 0;

        data.forEach((item) => {
          if (counts[item.star] !== undefined) {
            counts[item.star] = item.count;
            total += item.count;
          }
        });

        const percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (total > 0) {
          for (let i = 1; i <= 5; i++) {
            percentages[i] = (counts[i] / total) * 100;
          }
        }

        setRatingStats({ counts, percentages, total });
      } catch (err) {
        console.error("Lỗi tải thống kê sao:", err);
      }
    };

    fetchStats();
  }, [course?.id]);

  return (
    <div className="course-statistic-tab">
      <div className="stats-grid-container">
        {/* --- CỘT TRÁI: DOANH THU --- */}
        <div className="stats-card stats-chart-wrapper">
          <div className="stats-header">
            <BarChart2 size={18} className="stats-icon" />
            <h4>Doanh thu theo tháng</h4>
          </div>
          <div className="chart-area">
            <LineChart
              width={undefined}
              height={300}
              xAxis={[
                {
                  data: dataLineChart.map((i) => i.date),
                  tickLabelInterval: (index) => index % 2 !== 0,
                  tickLabelStyle: { fontSize: 12, fontWeight: 500 },
                  scaleType: "point",
                },
              ]}
              series={[
                {
                  data: dataLineChart.map((i) => i.revenue),
                  color: revenueLineColor,
                  label: "Doanh thu: ",
                  valueFormatter: (v) => `${v} triệu`,
                  area: true,
                  areaOpacity: 0.2,
                  curve: "monotoneX",
                  showMark: true,
                  markSize: 6,
                  lineWidth: 3,
                },
              ]}
              yAxis={[
                {
                  valueFormatter: (v) => `${v / 1000000} triệu`,
                  min: 0,
                },
              ]}
              grid={{ horizontal: true }}
              margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
              sx={{
                "& .MuiAreaElement-root": {
                  fillOpacity: 0.1,
                  fill: revenueLineColor,
                },
                "& .MuiMarkElement-root": {
                  fill: revenueLineColor,
                  stroke: "white",
                  strokeWidth: 2,
                },
                "& .MuiLineElement-root": { strokeWidth: 3 },
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* --- CỘT PHẢI: PHÂN BỐ ĐÁNH GIÁ --- */}
        <div className="stats-card stats-ratings-wrapper">
          <div className="stats-header">
            <Star size={18} className="stats-icon" />
            <h4>Phân bố đánh giá</h4>
          </div>
          <div className="rating-bars-area">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="rating-bar-row">
                <span className="rating-bar-label">{star} ★</span>
                <div className="rating-bar-track">
                  <div
                    className="rating-bar-fill"
                    style={{
                      width: `${ratingStats.percentages[star]}%`,
                    }}
                  ></div>
                </div>
                <span className="rating-bar-count">
                  {ratingStats.counts[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditable && (
        <div className="review-section review-form-wrapper">
          <div className="review-section-header">
            <MessageCircle size={20} className="review-icon" />
            <h4>Viết đánh giá của bạn</h4>
          </div>
          <form onSubmit={submitComment} className="review-form">
            <div className="form-group">
              <label>Đánh giá:</label>
              <StarRating
                rating={rating}
                setRating={setRating}
                hover={hover}
                setHover={setHover}
              />
            </div>
            <div className="form-group">
              <label>Nội dung đánh giá:</label>
              <textarea
                name="comment"
                rows="4"
                placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Gửi đánh giá
            </button>
          </form>
        </div>
      )}

      <div className="review-section review-list-wrapper">
        <div className="review-section-header">
          <MessageCircle size={20} className="review-icon" />
          <h4>Bình luận học viên</h4>
          <select
            className="sort-select"
            onChange={handleSortChange}
            value={sortMode}
          >
            <option value="all-comment">Tất cả đánh giá</option>
            <option value="one-star">1 sao</option>
            <option value="two-star">2 sao</option>
            <option value="three-star">3 sao</option>
            <option value="four-star">4 sao</option>
            <option value="five-star">5 sao</option>
          </select>
        </div>

        <div className="review-list">
          {commentList.length === 0 && sortMode === "all-comment" ? (
            <div className="empty-cart">
              <MessageCircle className="empty-icon" />
              <h3>Chưa có đánh giá nào</h3>
              <p>
                Hãy là người đầu tiên chia sẻ trải nghiệm của bạn về khóa học
                này
              </p>
            </div>
          ) : commentList.length === 0 ? (
            <div className="empty-cart">
              <MessageCircle className="empty-icon" />
              <h3>Không tìm thấy bình luận phù hợp</h3>
              <p>Không có đánh giá nào khớp với bộ lọc của bạn</p>
            </div>
          ) : (
            commentList.length > 0 &&
            commentList.map((comment) => (
              <div key={comment.id} className="review-item">
                {editComment !== comment.id && (
                  <>
                    <div className="review-item-header">
                      <img
                        src={comment.user.image}
                        alt={comment.user.name}
                        className="review-avatar"
                      />
                      <div className="review-user-info">
                        <span className="review-user-name">
                          {comment.user.name}
                        </span>
                        <span className="review-date">{comment.date}</span>
                      </div>
                      <div className="review-item-stars">
                        <StarDisplay rating={comment.rate} />
                      </div>
                    </div>
                    <p className="review-body">{comment.comment}</p>

                    {isEditable && user && user.id === comment.user.id && (
                      <div className="review-actions">
                        <button
                          className="btn btn-edit"
                          onClick={() => setEditComment(comment.id)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </>
                )}

                {isEditable && editComment === comment.id && (
                  <form
                    onSubmit={submitEditComment}
                    className="review-form review-form-edit"
                  >
                    <div className="form-group">
                      <label>Đánh giá:</label>
                      <StarRating
                        rating={ratingEdit}
                        setRating={setRatingEdit}
                        hover={hoverEdit}
                        setHover={setHoverEdit}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nội dung đánh giá:</label>
                      <textarea
                        name="commentEdit"
                        rows="4"
                        defaultValue={comment.comment}
                      ></textarea>
                    </div>
                    <div className="review-actions-edit">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditComment(0)}
                      >
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Cập nhật
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
