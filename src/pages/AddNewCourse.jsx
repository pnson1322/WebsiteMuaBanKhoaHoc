import { Image } from "lucide-react";
import "./AddNewCourse.css";
import { useState } from "react";
import { useAppState, useAppDispatch } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";

const AddNewCourse = () => {
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
  });
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [contentList, setContentList] = useState([]);
  const [intendedLearners, setIntendedLearners] = useState([]);
  const [skillsAcquired, setSkillsAcquired] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreviewUrl("");
  };

  const [intendedLearnerInput, setIntendedLearnerInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [contentTitleInput, setContentTitleInput] = useState("");
  const [contentDesInput, setContentDesInput] = useState("");

  const addIntendedLearner = () => {
    if (intendedLearnerInput.trim()) {
      setIntendedLearners([...intendedLearners, intendedLearnerInput.trim()]);
      setIntendedLearnerInput("");
    }
  };

  const removeIntendedLearner = (index) => {
    setIntendedLearners(intendedLearners.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkillsAcquired([...skillsAcquired, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setSkillsAcquired(skillsAcquired.filter((_, i) => i !== index));
  };

  const addContent = () => {
    if (contentTitleInput.trim() && contentDesInput.trim()) {
      setContentList([
        ...contentList,
        {
          title: contentTitleInput.trim(),
          des: contentDesInput.trim(),
        },
      ]);
      setContentTitleInput("");
      setContentDesInput("");
    }
  };

  const removeContent = (index) => {
    setContentList(contentList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name.trim()) {
        showError("Vui lòng nhập tên khóa học");
        return;
      }
      if (!instructor.name.trim()) {
        showError("Vui lòng nhập tên giảng viên");
        return;
      }
      if (!category) {
        showError("Vui lòng chọn danh mục");
        return;
      }
      if (!level) {
        showError("Vui lòng chọn mức độ");
        return;
      }
      if (!price || Number(price) <= 0) {
        showError("Vui lòng nhập giá khóa học hợp lệ");
        return;
      }
      if (!duration.trim()) {
        showError("Vui lòng nhập thời lượng khóa học");
        return;
      }

      const maxId =
        state.courses.length > 0
          ? Math.max(...state.courses.map((c) => c.id || 0))
          : 0;
      const newId = maxId + 1;

      const imageUrl = image ? URL.createObjectURL(image) : "";

      const shortDescription = description
        ? description.substring(0, 100) +
          (description.length > 100 ? "..." : "")
        : "";

      const payload = {
        id: newId,
        name,
        description,
        shortDescription,
        instructor,
        category,
        level,
        price: Number(price) || 0,
        duration,
        image: imageUrl,
        contentList,
        intendedLearners,
        skillsAcquired,
        rating: 0,
        students: 0,
      };

      const courseName = name;

      dispatch({ type: actionTypes.ADD_COURSE, payload });
      console.log("Create course payload", payload);

      clearForm();

      console.log(state.courses);

      showSuccess(`✅ Đã tạo khóa học "${courseName}" thành công!`);
    } catch (error) {
      console.log(state.courses);

      showError(
        `❌ Lỗi khi tạo khóa học: ${error.message || "Đã có lỗi xảy ra"}`
      );
      console.error("Error creating course:", error);
    }
  };

  const clearForm = () => {
    setName("");
    setInstructor({
      id: "",
      name: "",
      email: "",
      phone: "",
    });
    setCategory("");
    setLevel("");
    setPrice("");
    setDuration("");
    setDescription("");
    setImage(null);
    setImagePreviewUrl("");
    setContentList([]);
    setIntendedLearners([]);
    setSkillsAcquired([]);
    setIntendedLearnerInput("");
    setSkillInput("");
    setContentTitleInput("");
    setContentDesInput("");
  };

  return (
    <div className="add-new-course">
      <div className="container">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Quản lý khóa học</h1>
            <p>Tạo và quản lý các khóa học của bạn</p>
          </div>
        </section>

        <div className="add-course-section">
          <div className="add-course-title">Tạo khóa học mới</div>

          <div className="add-course-main">
            <form className="course-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Tên khóa học *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên khóa học"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Tên giảng viên *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên giảng viên"
                    value={instructor.name}
                    onChange={(e) =>
                      setInstructor((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Danh mục *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    onChange={(e) => setLevel(e.target.value)}
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
                  <label>Giá khóa học (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Nhập giá"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Thời lượng khóa học *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 92 tiếng"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field form-field--full">
                  <label>Mô tả khóa học</label>
                  <textarea
                    rows="5"
                    placeholder="Mô tả ngắn về khóa học"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div
                className="form-field form-field--full"
                style={{ marginTop: "1rem" }}
              >
                <label>Ảnh đại diện khóa học</label>
                <div className="image-uploader">
                  {!imagePreviewUrl && (
                    <label className="upload-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                      <Image />
                      <span>Chọn ảnh</span>
                    </label>
                  )}

                  {imagePreviewUrl && (
                    <div className="image-preview">
                      <img src={imagePreviewUrl} alt="preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={handleRemoveImage}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Đối tượng học viên */}
              <div className="list-section">
                <div className="list-section-title">Đối tượng học viên</div>
                <div className="list-items">
                  {intendedLearners.map((item, index) => (
                    <div key={index} className="list-item">
                      <span>{item}</span>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeIntendedLearner(index)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <div className="list-input-group">
                  <input
                    type="text"
                    className="list-input"
                    placeholder="Thêm đối tượng"
                    value={intendedLearnerInput}
                    onChange={(e) => setIntendedLearnerInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addIntendedLearner();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={addIntendedLearner}
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Kỹ năng đạt được */}
              <div className="list-section">
                <div className="list-section-title">Kỹ năng đạt được</div>
                <div className="list-items">
                  {skillsAcquired.map((item, index) => (
                    <div key={index} className="list-item">
                      <span>{item}</span>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeSkill(index)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <div className="list-input-group">
                  <input
                    type="text"
                    className="list-input"
                    placeholder="Thêm kĩ năng"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={addSkill}
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Nội dung khóa học */}
              <div className="list-section">
                <div className="list-section-title">Nội dung khóa học</div>
                <div className="content-items">
                  {contentList.map((item, index) => (
                    <div key={index} className="content-item-wrapper">
                      <div className="content-item-info">
                        <div className="content-item-title">{item.title}</div>
                        <div className="content-item-des">{item.des}</div>
                      </div>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeContent(index)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <div className="content-input-group">
                  <input
                    type="text"
                    className="content-input"
                    placeholder="Tiêu đề"
                    value={contentTitleInput}
                    onChange={(e) => setContentTitleInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addContent();
                      }
                    }}
                  />
                  <input
                    type="text"
                    className="content-input"
                    placeholder="Mô tả"
                    value={contentDesInput}
                    onChange={(e) => setContentDesInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addContent();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={addContent}
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => clearForm()}
                >
                  Hủy
                </button>

                <button type="submit" className="btn btn-primary">
                  Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewCourse;
