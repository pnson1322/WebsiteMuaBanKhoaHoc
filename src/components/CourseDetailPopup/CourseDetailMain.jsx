import { Image } from "lucide-react";
import "./CourseDetailMain.css";
import { useState } from "react";
import CourseDetailInfo from "./CourseDetailInfo";
import CourseDetailStudents from "./CourseDetailStudents";
import CourseDetailStatistic from "./CourseDetailStatistic";
import { categoryAPI } from "../../services/categoryAPI";

export default function CourseDetailMain({
  course,
  formData,
  user,
  isEditable,
  handleChange,
  handleSubmit,
  handleImageChange,
  handleRemoveImage,
  targetLearners,
  courseSkills,
  courseContents,
  addIntendedLearner,
  addContent,
  addSkill,
  removeContent,
  removeIntendedLearner,
  removeSkill,
}) {
  const { title, teacherName, level, price, durationHours, description } =
    formData;

  const [imageUrl, setImageUrl] = useState(course.imageUrl);
  const [cate, setCate] = useState([]);
  const [categoryId, setCategoryId] = useState(formData.categoryId);
  const studentsCount = course?.totalPurchased || 0;
  const rating = course?.averageRating || 0;
  const commentsCount = course?.commentCount || 0;

  const [active, setActive] = useState("info");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCate(res);
        setCategoryId(cate.filter((item) => item.name === course.categoryName));
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const handleImageUrlChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setImageUrl(URL.createObjectURL(file));

      handleImageChange(e);
    }
  };

  const handleRemoveImageUrl = () => {
    setImageUrl(null);

    handleRemoveImage();
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);

    handleImageChange(e);
  };

  return (
    <div className="course-detail-main">
      <form className="course-form" onSubmit={handleSubmit}>
        <div className="course-form-layout">
          {/* Left: Image Upload Section */}
          <div className="course-detail-image-section">
            <label className="course-detail-image-label">
              Ảnh đại diện khóa học
            </label>
            <div className="course-detail-image-uploader">
              {!imageUrl ? (
                <label className="course-detail-upload-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUrlChange}
                    style={{ display: "none" }}
                    disabled={!isEditable}
                  />
                  <Image size={48} />
                  <span>Tải lên hình ảnh khóa học</span>
                  <span className="course-detail-btn-choose-image">
                    Chọn ảnh
                  </span>
                </label>
              ) : (
                <div className="course-detail-image-preview">
                  <img src={imageUrl} alt="Course preview" />
                  {isEditable && (
                    <button
                      type="button"
                      className="course-detail-remove-image"
                      onClick={handleRemoveImageUrl}
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Form Fields Section */}
          <div className="course-form-section">
            <div className="form-grid-popup">
              <div className="form-grid-top">
                <div className="form-field">
                  <label>Tên khóa học *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên khóa học"
                    value={title}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="title"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Tên giảng viên *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên giảng viên"
                    value={teacherName}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="teacherName"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Danh mục *</label>
                  <select
                    value={categoryId}
                    disabled={!isEditable}
                    onChange={handleCategoryChange}
                    name="categoryId"
                    required
                  >
                    <option value="0" disabled>
                      Chọn danh mục
                    </option>
                    {cate.map((item) => {
                      return <option value={item.id}>{item.name}</option>;
                    })}
                  </select>
                </div>

                <div className="form-field">
                  <label>Mức độ *</label>
                  <select
                    value={level}
                    disabled={!isEditable}
                    onChange={handleChange}
                    name="level"
                    required
                  >
                    <option value="" disabled>
                      Chọn mức độ
                    </option>
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Giá (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Nhập giá"
                    value={price}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="price"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Thời lượng (giờ) *</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 92 tiếng"
                    value={durationHours}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="durationHours"
                    required
                  />
                </div>
              </div>

              <div className="form-field form-field--full">
                <label>Mô tả khóa học</label>
                <textarea
                  placeholder="Mô tả ngắn về khóa học"
                  value={description}
                  readOnly={!isEditable}
                  onChange={handleChange}
                  name="description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Statistics Section (Dùng 'course' prop) */}
        <div className="course-stats-section">
          <div className="stat-card">
            <div className="stat-value-popup">{studentsCount}</div>
            <div className="stat-label-popup">HỌC VIÊN</div>
          </div>
          <div className="stat-card">
            <div className="stat-value-popup">{rating}</div>
            <div className="stat-label-popup">ĐÁNH GIÁ</div>
          </div>
          <div className="stat-card">
            <div className="stat-value-popup">{commentsCount}</div>
            <div className="stat-label-popup">BÌNH LUẬN</div>
          </div>
        </div>

        <div className="nav-buttons">
          <button
            type="button"
            className={`nav-button-popup ${
              active === "info" ? "active-nav-btn" : ""
            }`}
            onClick={() => {
              setActive("info");
            }}
          >
            Thông tin
          </button>
          <button
            type="button"
            className={`nav-button-popup ${
              active === "students" ? "active-nav-btn" : ""
            }`}
            onClick={() => {
              setActive("students");
            }}
          >
            Học viên
          </button>

          <button
            type="button"
            className={`nav-button-popup ${
              active === "statistic" ? "active-nav-btn" : ""
            }`}
            onClick={() => {
              setActive("statistic");
            }}
          >
            Thống kê
          </button>
        </div>

        {active === "info" ? (
          <CourseDetailInfo
            course={course}
            isEditable={isEditable}
            targetLearners={targetLearners}
            courseContents={courseContents}
            courseSkills={courseSkills}
            addIntendedLearner={addIntendedLearner}
            addContent={addContent}
            addSkill={addSkill}
            removeContent={removeContent}
            removeIntendedLearner={removeIntendedLearner}
            removeSkill={removeSkill}
          />
        ) : active === "students" ? (
          <CourseDetailStudents course={course} />
        ) : (
          <CourseDetailStatistic
            course={course}
            user={user}
            isEditable={isEditable}
          />
        )}
      </form>
    </div>
  );
}
