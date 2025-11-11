import { useNavigate, useParams } from "react-router-dom";
import "./CourseDetail.css";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Heart,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../services/api"; // ✅ Chỉ dùng coursesAPI, KHÔNG dùng mockCourses
import test from "../assets/test.jpg";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { showSuccess, showFavorite, showUnfavorite } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await coursesAPI.getCourseById(id);
        setCourse(data);
      } catch (err) {
        setError("Không tìm thấy khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ratingEdit, setRatingEdit] = useState(0);
  const [hoverEdit, setHoverEdit] = useState(0);
  const [commentList, setCommentList] = useState([]);
  const [sortMode, setSortMode] = useState("all-comment");
  const [editComment, setEditComment] = useState(0);

  useEffect(() => {
    if (course?.commentList) {
      setCommentList(course.commentList);
    }
  }, [course]);

  useEffect(() => {
    if (editComment !== 0 && course?.commentList) {
      const comment = course.commentList.find((c) => c.id === editComment);
      if (comment) setRatingEdit(comment.rate);
    } else {
      setRatingEdit(0);
    }
  }, [editComment, course?.commentList]);

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

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch({ type: actionTypes.REMOVE_FROM_FAVORITES, payload: course.id });
      showUnfavorite(`💔 Đã bỏ yêu thích "${course.title}"`);
    } else {
      dispatch({ type: actionTypes.ADD_TO_FAVORITES, payload: course.id });
      showFavorite(`❤️ Đã thêm "${course.title}" vào yêu thích!`);
    }
  };

  const handleAddToCart = () => {
    if (!isInCart) {
      dispatch({ type: actionTypes.ADD_TO_CART, payload: course.id });
      showSuccess(`🛒 Đã thêm "${course.title}" vào giỏ hàng!`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const submitComment = (e) => {
    e.preventDefault();
    const form = e.target;
    const content = form?.comment?.value?.trim() || "";
    if (!rating || !content) return;

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
        image: user?.image || test,
      },
      date: dateStr,
      comment: content,
      rate: rating,
    };

    const updated = [newComment, ...commentList];
    const sorted = sortComments(updated, sortMode);
    setCommentList(sorted);
    setCourse((prev) => ({ ...prev, commentList: sorted }));

    setRating(0);
    setHover(0);
    form.reset();
  };

  const submitEditComment = () => {
    if (!editComment) return;
    const textarea = document.getElementById("comment-edit");
    const content = textarea?.value?.trim() || "";
    if (!ratingEdit || !content) return;

    const updated = commentList.map((c) =>
      c.id === editComment ? { ...c, comment: content, rating: ratingEdit } : c
    );
    const sorted = sortComments(updated, sortMode);
    setCommentList(sorted);
    setCourse((prev) => ({ ...prev, commentList: sorted }));

    setEditComment(0);
    setRatingEdit(0);
    setHoverEdit(0);
  };

  const handleDeleteComment = () => {
    if (!editComment) return;
    const updated = commentList.filter((c) => c.id !== editComment);
    const sorted = sortComments(updated, sortMode);
    setCommentList(sorted);
    setCourse((prev) => ({ ...prev, commentList: sorted }));

    setEditComment(0);
    setRatingEdit(0);
    setHoverEdit(0);
  };

  const handleSortChange = (e) => {
    const newMode = e.target.value;
    setSortMode(newMode);
    setCommentList(sortComments(commentList, newMode));
  };

  const sortComments = (list, mode) => {
    const sortedList = [...list];
    switch (mode) {
      case "star-asc":
        return sortedList.sort((a, b) => a.rate - b.rate);
      case "star-desc":
        return sortedList.sort((a, b) => b.rate - a.rate);
      case "date-asc":
        return sortedList.sort(
          (a, b) =>
            new Date(a.date.split("/").reverse()) -
            new Date(b.date.split("/").reverse())
        );
      case "date-desc":
        return sortedList.sort(
          (a, b) =>
            new Date(b.date.split("/").reverse()) -
            new Date(a.date.split("/").reverse())
        );
      default:
        return list;
    }
  };

  const handleCommentClick = (commentId, userId) => {
    if (userId === 2) setEditComment(commentId);
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
                    {course.instructor?.email}
                  </a>
                </strong>
              </div>
              <div>
                📞 Số điện thoại:{" "}
                <strong>
                  <a href={"tel:" + course.instructor?.phone}>
                    {course.instructor?.phone}
                  </a>
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
            </div>
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
              {course.intendedLearners?.map((item, index) => (
                <li key={index}>{item.description}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>💪 Kỹ năng đạt được</h2>
            <div className="skills-grid">
              {course.skillsAcquired?.map((skill, idx) => (
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
              <option value="star-asc">Số sao tăng dần</option>
              <option value="star-desc">Số sao giảm dần</option>
              <option value="date-asc">Cũ nhất</option>
              <option value="date-desc">Mới nhất</option>
            </select>
          </div>

          {commentList.map((comment) => (
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
                    <div className="comment-user-name">{comment.user.name}</div>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
