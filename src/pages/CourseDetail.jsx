import { useNavigate, useParams } from "react-router-dom";
import "./CourseDetail.css";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Heart,
  MessageCircle,
  ShoppingCart,
  Star,
  Users,
  CreditCard,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { courseAPI } from "../services/courseAPI";
import { reviewAPI } from "../services/reviewAPI";
import ChatWidget from "../components/Chat/ChatWidge";
import { historyAPI } from "../services/historyAPI";
import logger from "../utils/logger";
import PaymentPopup from "../components/PaymentPopup";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const state = useAppState();
  const { addToCart, addToFavorite, removeFromFavorite } = useAppDispatch();
  const { showSuccess, showError, showFavorite, showUnfavorite } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await courseAPI.getCourseById(id);
        setCourse(data);

        if (isLoggedIn) {
          try {
            await historyAPI.addToHistory(id);
            logger.info("COURSE_DETAIL", "Course added to history", {
              courseId: id,
            });
          } catch (historyError) {
            logger.error(
              "COURSE_DETAIL",
              "Failed to add course to history",
              historyError
            );
          }
        }
      } catch (err) {
        setError("Không tìm thấy khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isLoggedIn]);

  // Comment
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ratingEdit, setRatingEdit] = useState(0);
  const [hoverEdit, setHoverEdit] = useState(0);
  const [commentList, setCommentList] = useState([]);
  const [sortMode, setSortMode] = useState("all-comment");
  const [editComment, setEditComment] = useState(0);

  const [showPayment, setShowPayment] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!isLoggedIn) return;

      try {
        const response = await courseAPI.getPurchasedCourses({
          page: 1,
          pageSize: 9999,
        });

        const found = response.items?.find((item) => item.id == id);

        if (found) {
          setIsPurchased(true);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra khóa học đã mua:", err);
      }
    };

    checkOwnership();
  }, [id, isLoggedIn]);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewAPI.getReviewByCourseId(id);

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
  }, [id, sortMode]);

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

  const handleSortChange = (e) => {
    const newMode = e.target.value;
    setSortMode(newMode);
    if (newMode === "all-comment") {
      fetchReviews();
    } else {
      setCommentList((prev) => sortComments(prev, newMode));
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showError("Vui lòng đăng nhập để đánh giá.");
      return;
    }

    const form = e.target;
    const content = form?.comment?.value?.trim() || "";
    if (!rating || !content) {
      showError("Vui lòng chọn số sao và nhập nội dung.");
      return;
    }

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
      showError("Gửi đánh giá thất bại: " + err.message);
    }
  };

  const submitEditComment = async () => {
    if (!editComment) return;
    const textarea = document.getElementById("comment-edit");
    const content = textarea?.value?.trim() || "";
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

  const handleDeleteComment = async () => {
    if (!editComment) return;

    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    try {
      await reviewAPI.deleteReviewByBuyer(editComment);

      showSuccess("Đã xóa đánh giá.");
      setEditComment(0);
      setRatingEdit(0);
      setHoverEdit(0);

      fetchReviews();
    } catch (err) {
      showError(
        "Xóa thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleCommentClick = (commentId, userId) => {
    console.log(commentId);
    console.log(userId);
    console.log(user);

    if (user && userId === user.id) setEditComment(commentId);
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="loading-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-content"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>❌ Lỗi</h2>
            <p>{error || "Không tìm thấy khóa học"}</p>
            <button onClick={() => navigate("/")} className="back-home-btn">
              <ArrowLeft /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFavorite = course && state.favorites.includes(course.id);
  const isInCart = course && state.cart.includes(course.id);

  const handleToggleFavorite = async () => {
    if (!user) {
      showError("Vui lòng đăng nhập để sử dụng tính năng yêu thích");
      return;
    }

    if (isFavorite) {
      const result = await removeFromFavorite(course.id);
      if (result.success) {
        showUnfavorite(`💔 Đã bỏ yêu thích "${course.title}"`);
      } else {
        showError("Lỗi khi bỏ yêu thích");
      }
    } else {
      const result = await addToFavorite(course.id);
      if (result.success) {
        showFavorite(`❤️ Đã thêm "${course.title}" vào yêu thích!`);
      } else {
        showError("Lỗi khi thêm yêu thích");
      }
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showError("Vui lòng đăng nhập để mua khóa học");
      navigate("/login");
      return;
    }

    if (isPurchased) {
      showError("Bạn đã sở hữu khóa học này rồi!");
      return;
    }

    if (isInCart) {
      showError("Bạn đã thêm khóa học này vào giỏ hàng rồi.");
      return;
    }

    const result = await addToCart(course.id);

    if (result.success) {
      showSuccess(`🛒 Đã thêm "${course.title}" vào giỏ hàng!`);
    } else {
      showError("Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      showError("Vui lòng đăng nhập để mua khóa học");
      navigate("/login");
      return;
    }

    if (isPurchased) {
      showError("Bạn đã sở hữu khóa học này rồi!");
      return;
    }

    setShowPayment(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="course-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft />
          <span>Quay lại</span>
        </button>

        {/* Header */}
        <div className="course-header">
          <div className="course-image-section">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="course-main-image"
            />
            <div className="course-category-badge">{course.categoryName}</div>

            <div className="course-instructor">
              <div>
                👨‍🏫 Giảng viên: <strong>{course.teacherName}</strong>
              </div>
              <div>
                📧 Email:{" "}
                <strong>
                  <a href={"mailto:" + course.instructor?.email}>
                    {course.email}
                  </a>
                </strong>
              </div>
              <div>
                📞 Số điện thoại:{" "}
                <strong>
                  <a href={"tel:" + course.instructor?.phone}>{course.phone}</a>
                </strong>
              </div>
            </div>
          </div>

          <div className="course-info-section">
            <h1 className="course-title">{course.title}</h1>
            <p className="course-description">{course.description}</p>

            <div className="course-stats-grid">
              <div className="stat-item">
                <Star className="stat-icon" />
                <div>
                  <span className="stat-value">{course.averageRating}</span>
                  <span className="stat-label">Đánh giá</span>
                </div>
              </div>
              <div className="stat-item">
                <Users className="stat-icon" />
                <div>
                  <span className="stat-value">{course.totalPurchased}</span>
                  <span className="stat-label">Học viên</span>
                </div>
              </div>
              <div className="stat-item">
                <Clock className="stat-icon" />
                <div>
                  <span className="stat-value">{course.durationHours}</span>
                  <span className="stat-label">Thời lượng</span>
                </div>
              </div>
              <div className="stat-item">
                <Award className="stat-icon" />
                <div>
                  <span className="stat-value">{course.level}</span>
                  <span className="stat-label">Trình độ</span>
                </div>
              </div>
            </div>

            <div className="course-price-section">
              <span className="price-label">Giá khóa học:</span>
              <span className="price-value">{formatPrice(course.price)}</span>
            </div>

            {!isLoggedIn ||
              (user.role === "Buyer" && (
                <div className="course-actions">
                  <button
                    className={`favorite-btn ${isFavorite ? "favorited" : ""}`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className="action-icon" />
                    {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                  </button>

                  <button
                    className={`cart-btn ${isInCart ? "in-cart" : ""}`}
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    <ShoppingCart className="action-icon" />
                    {isInCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                  </button>

                  <button className="buy-now-btn" onClick={handleBuyNow}>
                    <CreditCard className="action-icon" />
                    Mua ngay
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Nội dung khóa học */}
        <div className="course-content">
          <div className="content-section">
            <h2>📖 Nội dung khóa học</h2>
            <div className="content-list">
              {course.courseContents?.map((content, idx) => (
                <div className="content-item" key={content.title + idx}>
                  <BookOpen className="content-icon" />
                  <div>
                    <h3>{content.title}</h3>
                    <p>{content.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2>🎯 Đối tượng học viên</h2>
            <ul className="target-list">
              {course.targetLearners?.map((item, index) => (
                <li key={index}>{item.description}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>💪 Kỹ năng đạt được</h2>
            <div className="skills-grid">
              {course.courseSkills?.map((skill, idx) => (
                <span className="skill-tag" key={skill + idx}>
                  {skill.description}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Viết bình luận */}
        <div className="comment-section">
          <h3>💬 Viết đánh giá của bạn</h3>
          <form onSubmit={submitComment} className="comment-form">
            <label htmlFor="rating">Đánh giá:</label>
            <div className="star-rating">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <span
                    key={starValue}
                    className={`star ${
                      starValue <= (hover || rating) ? "filled" : ""
                    }`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(rating)}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            <label htmlFor="comment">Nội dung đánh giá:</label>
            <textarea
              id="comment"
              name="comment"
              rows="4"
              cols="50"
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
            ></textarea>
            <button type="submit" className="submit-btn">
              Gửi đánh giá
            </button>
          </form>
        </div>

        {/* Danh sách bình luận */}
        <div className="all-comment-section">
          <div className="all-comment-header">
            <h3>💬 Bình luận học viên</h3>
            <select
              id="sort"
              name="sort"
              className="sort-btn"
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
              <div
                key={comment.id}
                className="comment-item"
                onClick={() => handleCommentClick(comment.id, comment.user.id)}
              >
                <div className="comment">
                  <div className="comment-user">
                    <img
                      src={comment.user.image}
                      alt={comment.user.name}
                      className="comment-image"
                    />
                    <div>
                      <div className="comment-user-name">
                        {comment.user.name}
                      </div>
                      <div className="comment-date">{comment.date}</div>
                    </div>
                  </div>
                  <p>{comment.comment}</p>
                </div>

                <div className="star-rating star-rating-comment">
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <span
                        key={starValue}
                        className={`star star-comment ${
                          starValue <= comment.rate ? "filled" : ""
                        }`}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>

                {editComment === comment.id && (
                  <div className="comment-section comment-edit">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        submitEditComment();
                      }}
                      className="comment-form"
                    >
                      <label htmlFor="rating">Đánh giá:</label>
                      <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                          const starValue = index + 1;
                          return (
                            <span
                              key={starValue}
                              className={`star ${
                                starValue <= (hoverEdit || ratingEdit)
                                  ? "filled"
                                  : ""
                              }`}
                              onClick={() => setRatingEdit(starValue)}
                              onMouseEnter={() => setHoverEdit(starValue)}
                              onMouseLeave={() => setHoverEdit(ratingEdit)}
                            >
                              ★
                            </span>
                          );
                        })}
                      </div>
                      <label htmlFor="comment">Nội dung đánh giá:</label>
                      <textarea
                        id="comment-edit"
                        name="comment"
                        rows="4"
                        cols="50"
                        placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                        defaultValue={comment.comment}
                      />
                      <div className="comment-btn">
                        <button
                          type="button"
                          className="delete-comment-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment();
                          }}
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          className="cancel-comment-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditComment(0);
                          }}
                        >
                          Hủy
                        </button>
                        <button type="submit" className="edit-comment-btn">
                          Cập nhật
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Chat Widget */}
      {course && (
        <ChatWidget
          teacherId={course.sellerId}
          teacherName={course.teacherName}
          courseId={course.id}
        />
      )}

      {/* Payment Popup */}
      {showPayment && (
        <PaymentPopup onClose={() => setShowPayment(false)} course={[course]} />
      )}
    </div>
  );
};

export default CourseDetail;
