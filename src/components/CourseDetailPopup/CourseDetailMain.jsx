import { Image } from "lucide-react";
import "./CourseDetailMain.css";
import { useState } from "react";

export default function CourseDetailMain({
  handleSubmit,
  handleImageChange,
  handleRemoveImage,
  setInfo,
  setStudents,
  setStatistic,
  course,
}) {
  const name = course?.name || "";
  const instructorName = course?.instructor?.name || "";
  const category = course?.category || "";
  const level = course?.level || "";
  const price = course?.price || "";
  const duration = course?.duration || "";
  const description = course?.description || "";
  const courseImage = course?.image || "";
  const students = course?.students || 0;
  const rating = course?.rating || 0;
  const comments = course?.commentList?.length || 0;

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
              {!courseImage ? (
                <label className="course-detail-upload-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <Image size={48} />
                  <span>Tải lên hình ảnh khóa học</span>
                  <span className="course-detail-btn-choose-image">
                    Chọn ảnh
                  </span>
                </label>
              ) : (
                <div className="course-detail-image-preview">
                  <img src={courseImage} alt="Course preview" />
                  <button
                    type="button"
                    className="course-detail-remove-image"
                    onClick={handleRemoveImage}
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Form Fields Section */}
          <div className="course-form-section">
            <div className="form-grid-popup">
              <div className="form-grid-top">
                <div>
                  <div className="form-field">
                    <label>Tên khóa học *</label>
                    <input
                      type="text"
                      placeholder="Nhập tên khóa học"
                      value={name}
                      readOnly
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Tên giảng viên *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên giảng viên"
                    value={instructorName}
                    readOnly
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Danh mục *</label>
                  <select value={category} disabled required>
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
                  <select value={level} disabled required>
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
                    readOnly
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Thời lượng (giờ) *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 92 tiếng"
                    value={duration}
                    readOnly
                    required
                  />
                </div>
              </div>

              <div className="form-field form-field--full">
                <label>Mô tả khóa học</label>
                <textarea
                  placeholder="Mô tả ngắn về khóa học"
                  value={description}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Statistics Section */}
        <div className="course-stats-section">
          <div className="stat-card">
            <div className="stat-value">{students}</div>
            <div className="stat-label">HỌC VIÊN</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{rating}</div>
            <div className="stat-label">ĐÁNH GIÁ</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{comments}</div>
            <div className="stat-label">BÌNH LUẬN</div>
          </div>
        </div>
      </form>

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
    </div>
  );
}
