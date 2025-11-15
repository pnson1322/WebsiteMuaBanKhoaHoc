import { Image } from "lucide-react";
import "./CourseDetailMain.css";
import { useState } from "react";
import CourseDetailInfo from "./CourseDetailInfo";
import CourseDetailStudents from "./CourseDetailStudents";
import CourseDetailStatistic from "./CourseDetailStatistic";

export default function CourseDetailMain({
  course,
  user,
  formData,
  isEditable,
  handleChange,
  handleSubmit,
  handleImageChange,
  handleRemoveImage,
  addIntendedLearner,
  addContent,
  addSkill,
  removeContent,
  removeIntendedLearner,
  removeSkill,
  setInfo,
  setStudents,
  setStatistic,
}) {
  const {
    name,
    instructorName,
    category,
    level,
    price,
    duration,
    description,
    imageUrl,
  } = formData;

  const studentsCount = course?.students || 0;
  const rating = course?.rating || 0;
  const commentsCount = course?.commentList?.length || 0;

  const [active, setActive] = useState("info");

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
                    onChange={handleImageChange}
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
                      onClick={handleRemoveImage}
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
                    value={name}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Tên giảng viên *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên giảng viên"
                    value={instructorName}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="instructorName"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Danh mục *</label>
                  <select
                    value={category}
                    disabled={!isEditable}
                    onChange={handleChange}
                    name="category"
                    required
                  >
                    <option value="" disabled>
                      Chọn danh mục
                    </option>
                    <option value="Marketing">Marketing</option>
                    <option value="Lập trình">Lập trình</option>
                    <option value="Thiết kế">Thiết kế</option>
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
                    type="text"
                    placeholder="Ví dụ: 92 tiếng"
                    value={duration}
                    readOnly={!isEditable}
                    onChange={handleChange}
                    name="duration"
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
            className={`nav-button-popup ${
              active === "info" ? "active-nav-btn" : ""
            }`}
            onClick={() => {
              setInfo();
              setActive("info");
            }}
          >
            Thông tin
          </button>
          <button
            className={`nav-button-popup ${
              active === "students" ? "active-nav-btn" : ""
            }`}
            onClick={() => {
              setStudents();

              setActive("students");
            }}
          >
            Học viên
          </button>

          <button
            className={`nav-button-popup ${
              active === "statistic" ? "active-nav-btn" : ""
            }`}
            onClick={() => {
              setStatistic();

              setActive("statistic");
            }}
          >
            Thống kê
          </button>
        </div>

        {active === "info" ? (
          <CourseDetailInfo
            formData={formData}
            isEditable={isEditable}
            addIntendedLearner={addIntendedLearner}
            addContent={addContent}
            addSkill={addSkill}
            removeContent={removeContent}
            removeIntendedLearner={removeIntendedLearner}
            removeSkill={removeSkill}
          />
        ) : active === "students" ? (
          <CourseDetailStudents course={course} isEditable={isEditable} />
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
