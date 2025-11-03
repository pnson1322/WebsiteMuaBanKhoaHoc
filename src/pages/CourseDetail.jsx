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
import test from "../assets/test.jpg";
import test2 from "../assets/test2.jpg";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { showSuccess, showFavorite, showUnfavorite } = useToast();

  const [course, setCourse] = useState({
    id: 1,
    name: "Khóa học A",
    description:
      "Khóa học ngôn ngữ tiếng Anh dành cho học sinh mất gốc trong vòng 3 tháng.",
    image: test,
    category: "Ngoại ngữ",
    instructor: {
      id: 1,
      name: "Trương Ngọc Sang",
      email: "23521348@gm.uit.edu.vn",
      phone: "+84 945 784 041",
    },
    rating: "4.4",
    students: 852,
    duration: "36 giờ",
    level: "Cơ bản",
    price: 1107400,
    contentList: [
      {
        title: "Kiến thức cơ bản",
        des: "Nắm vững các khái niệm và nguyên lý cơ bản của lĩnh vực",
      },
      {
        title: "Thực hành dự án",
        des: "Áp dụng kiến thức vào các dự án thực tế với sự hướng dẫn thực tế",
      },
      {
        title: "Chứng chỉ hoàn thành",
        des: "Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học",
      },
    ],
    intendedLearners: [
      "Người mới bắt đầu muốn học từ cơ bản",
      "Học viên có kinh nghiệm muốn nâng cao kỹ năng",
      "Người làm việc muốn chuyển đổi ngành nghề",
      "Sinh viên muốn bổ sung kiến thức thực tế",
    ],
    skillsAcquired: [
      "Kiến thức chuyên môn",
      "Kỹ năng thực hành",
      "Tư duy logic",
      "Giải quyết vấn đề",
      "Làm việc nhóm",
      "Thuyết trình",
    ],
    commentList: [
      {
        id: 1,
        user: {
          id: 1,
          name: "Nguyễn Văn A",
          image: test2,
        },
        date: "15/3/2024",
        comment:
          "Khóa học rất hay và dễ hiểu. Giảng viên giải thích rất chi tiết, từ cơ bản đến nâng cao. Tôi đã học được rất nhiều kiến thức hữu ích.",
        rate: 5,
      },
      {
        id: 2,
        user: {
          id: 2,
          name: "Trần Thị B",
          image: test,
        },
        date: "10/3/2024",
        comment:
          "Nội dung phong phú, ví dụ thực tế. Tuy nhiên một số phần hơi khó theo kịp với người mới bắt đầu.",
        rate: 4,
      },
    ],
  });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ratingEdit, setRatingEdit] = useState(0);
  const [hoverEdit, setHoverEdit] = useState(0);

  const [commentList, setCommentList] = useState(course.commentList);
  const [sortMode, setSortMode] = useState("all-comment");
  const [editComment, setEditComment] = useState(0);

  useEffect(() => {
    if (editComment !== 0) {
      const comment = course.commentList.find((c) => c.id === editComment);
      if (comment) {
        setRatingEdit(comment.rate);
      }
    } else {
      setRatingEdit(0);
    }
  }, [editComment, course.commentList]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Thêm useEffect rồi sửa lại thành loading
  if (!loading) {
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
      showUnfavorite(`Đã bỏ yêu thích "${course.name}"`);
    } else {
      dispatch({ type: actionTypes.ADD_TO_FAVORITES, payload: course.id });
      showFavorite(`❤️ Đã thêm "${course.name}" vào yêu thích!`);
    }
  };

  const handleAddToCart = () => {
    if (!isInCart) {
      dispatch({ type: actionTypes.ADD_TO_CART, payload: course.id });
      showSuccess(`🛒 Đã thêm "${course.name}" vào giỏ hàng!`);
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
        name: user?.name || "Người dùng",
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
      c.id === editComment ? { ...c, comment: content, rate: ratingEdit } : c
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
    setSortMode(e.target.value);
    setCommentList(sortComments(commentList, sortMode));
  };

  const sortComments = (list, mode) => {
    const sortedList = [...list];

    switch (mode) {
      case "all-comment":
        return list;
      case "star-asc":
        return sortedList.sort((a, b) => a.rate - b.rate);
      case "star-desc":
        return sortedList.sort((a, b) => b.rate - a.rate);
      case "date-asc":
        return sortedList.sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split("/").map(Number);
          const [dayB, monthB, yearB] = b.date.split("/").map(Number);
          return (
            new Date(yearA, monthA - 1, dayA) -
            new Date(yearB, monthB - 1, dayB)
          );
        });
      case "date-desc":
        return sortedList.sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split("/").map(Number);
          const [dayB, monthB, yearB] = b.date.split("/").map(Number);
          return (
            new Date(yearB, monthB - 1, dayB) -
            new Date(yearA, monthA - 1, dayA)
          );
        });
      default:
        return list;
    }
  };

  const handleCommentClick = (commentId, userId) => {
    if (userId == 2)
      //sau thay bằng user.id
      setEditComment(commentId);
  };

  return (
    <div className="course-detail-page">
      <div className="container">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft />
          <span>Quay lại</span>
        </button>

        {/* Course Header*/}
        <div className="course-header">
          {/* Image and instructor section */}
          <div className="course-image-section">
            <img
              src={course?.image}
              alt={course?.name}
              className="course-main-image"
            />
            <div className="course-category-badge">{course?.category}</div>

            <div className="course-instructor">
              <div>
                👨‍🏫 Giảng viên: <strong>{course?.instructor.name}</strong>
              </div>

              <div>
                📧 Email:{" "}
                <strong>
                  <a href={"mailto:" + course.instructor.email}>
                    {course.instructor.email}
                  </a>
                </strong>
              </div>

              <div>
                📞 Số điện thoại:{" "}
                <strong>
                  <a href={"tel:" + course.instructor.phone}>
                    {course.instructor.phone}
                  </a>
                </strong>
              </div>
            </div>
          </div>

          {/* Information section */}
          <div className="course-info-section">
            <h1 className="course-title">{course.name}</h1>
            <p className="course-description">{course.description}</p>

            <div className="course-stats-grid">
              <div className="stat-item">
                <Star className="stat-icon" />
                <div>
                  <span className="stat-value">{course.rating}</span>
                  <span className="stat-label">Đánh giá</span>
                </div>
              </div>
              <div className="stat-item">
                <Users className="stat-icon" />
                <div>
                  <span className="stat-value">
                    {course.students.toLocaleString()}
                  </span>
                  <span className="stat-label">Học viên</span>
                </div>
              </div>
              <div className="stat-item">
                <Clock className="stat-icon" />
                <div>
                  <span className="stat-value">{course.duration}</span>
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

            {/* Price section */}
            <div className="course-price-section">
              <span className="price-label">Giá khóa học:</span>
              <span className="price-value">{formatPrice(course.price)}</span>
            </div>

            {/* Actions section */}
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

        {/* Course Content */}
        <div className="course-content">
          <div className="content-section">
            <h2>📖 Nội dung khóa học</h2>
            <div className="content-list">
              {course.contentList.map((content) => {
                return (
                  <div className="content-item">
                    <BookOpen className="content-icon" />
                    <div>
                      <h3>{content.title}</h3>
                      <p>{content.des}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="content-section">
            <h2>🎯 Đối tượng học viên</h2>
            <ul className="target-list">
              {course.intendedLearners.map((item, index) => (
                <li id={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>💪 Kỹ năng đạt được</h2>
            <div className="skills-grid">
              {course.skillsAcquired.map((skill) => (
                <span className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Comment and Rating */}
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

        {/* All Comment */}
        <div className="all-comment-section">
          <div className="all-comment-header">
            <h3>💬 Bình luận học viên</h3>

            <select
              id="sort"
              name="sort"
              className="sort-btn"
              onChange={handleSortChange}
            >
              <option value="all-comment" selected>
                Tất cả đánh giá
              </option>
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

              {editComment == comment.id && (
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
                    >
                      {comment.comment}
                    </textarea>
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
