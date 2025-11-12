import "./CourseDetailStatistic.css";
import React, { useState, useEffect, useMemo } from "react";
import { BarChart2, MessageCircle, Star } from "lucide-react";
import { LineChart } from "@mui/x-charts";

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

  useEffect(() => {
    if (course?.commentList) {
      const sorted = sortComments(course.commentList, "all-comment");
      setCommentList(sorted);
      setSortMode("all-comment");
    }
  }, [course]);

  useEffect(() => {
    if (editComment !== 0 && commentList) {
      const comment = commentList.find((c) => c.id === editComment);
      if (comment) setRatingEdit(comment.rate);
    } else {
      setRatingEdit(0);
    }
  }, [editComment, commentList]);

  // Hàm Gửi bình luận mới
  const submitComment = (e) => {
    e.preventDefault();
    const form = e.target;
    const content = form.comment.value?.trim() || "";
    if (!rating || !content)
      return alert("Vui lòng nhập đủ đánh giá và nội dung.");

    const today = new Date();
    const dateStr = today.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const newComment = {
      id: Date.now(),
      user: {
        id: user?.id || 0,
        name: user?.fullName || "Người dùng",
        image: user?.image || testAvatar,
      },
      date: dateStr,
      comment: content,
      rate: rating,
    };

    // --- TODO: GỌI API ĐỂ THÊM BÌNH LUẬN ---
    // Ví dụ: const createdComment = await coursesAPI.addComment(course.id, newComment);
    // Sau khi API thành công, cập nhật state:

    const updated = [newComment, ...commentList]; // Thay `newComment` bằng `createdComment`
    const sorted = sortComments(updated, sortMode);
    setCommentList(sorted);

    setRating(0);
    setHover(0);
    form.reset();
  };

  // Hàm Gửi Cập nhật (Sửa)
  const submitEditComment = (e) => {
    e.preventDefault();
    if (!editComment) return;

    const form = e.target;
    const content = form.commentEdit.value?.trim() || "";
    if (!ratingEdit || !content) return;

    // --- TODO: GỌI API ĐỂ SỬA BÌNH LUẬN ---
    // Ví dụ: await coursesAPI.updateComment(editComment, { comment: content, rate: ratingEdit });
    // Sau khi API thành công, cập nhật state:

    const updated = commentList.map((c) =>
      c.id === editComment ? { ...c, comment: content, rate: ratingEdit } : c
    );
    const sorted = sortComments(updated, sortMode);
    setCommentList(sorted);

    // Reset
    setEditComment(0);
    setRatingEdit(0);
    setHoverEdit(0);
  };

  // Hàm Xóa
  const handleDeleteComment = (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    // --- TODO: GỌI API ĐỂ XÓA BÌNH LUẬN ---
    // Ví dụ: await coursesAPI.deleteComment(commentId);
    // Sau khi API thành công, cập nhật state:

    const updated = commentList.filter((c) => c.id !== commentId);
    const sorted = sortComments(updated, sortMode);
    setCommentList(sorted);
  };

  const handleSortChange = (e) => {
    const newMode = e.target.value;
    setSortMode(newMode);
    setCommentList(sortComments(course.commentList, newMode));
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

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const revenueMonthlyData = [2.5, 3, 5, 4.5, 6, 7, 8, 9.5, 7, 6, 5, 8];
  const revenueLineColor = "#667eea";

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let total = 0;

    // Đếm số lượng từ commentList
    commentList.forEach((comment) => {
      const rate = comment.rate;
      if (counts[rate] !== undefined) {
        counts[rate]++;
        total++;
      }
    });

    // Tính phần trăm
    const percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (total > 0) {
      for (let i = 1; i <= 5; i++) {
        percentages[i] = (counts[i] / total) * 100;
      }
    }

    return { counts, percentages, total };
  }, [commentList]);

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
                  data: months,
                  valueFormatter: (v) => `T ${v}`,
                  tickLabelInterval: (index) => index % 2 !== 0,
                  tickLabelStyle: { fontSize: 10, fontWeight: 500 },
                  scaleType: "point",
                },
              ]}
              series={[
                {
                  data: revenueMonthlyData,
                  color: revenueLineColor,
                  label: "Doanh thu: ",
                  valueFormatter: (v) => `${v} triệu`,
                  area: true,
                  curve: "monotoneX",
                  showMark: true,
                  lineWidth: 3,
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  tickNumber: 5,
                  valueFormatter: (v) => `${v} tr`,
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
                      width: `${ratingDistribution.percentages[star]}%`,
                    }}
                  ></div>
                </div>
                <span className="rating-bar-count">
                  {ratingDistribution.counts[star]}
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
          {course.commentList.length === 0 ? (
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
                        src={comment.user.image || testAvatar}
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
