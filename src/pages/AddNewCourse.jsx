import { Image } from "lucide-react";
import "./AddNewCourse.css";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { courseAPI } from "../services/courseAPI";
import { categoryAPI } from "../services/categoryAPI";

const AddNewCourse = () => {
  const { dispatch, actionTypes } = useAppDispatch();
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [courseContents, setCourseContents] = useState([]);
  const [targetLearners, setTargetLearners] = useState([]);
  const [courseSkills, setCourseSkills] = useState([]);
  const [cate, setCate] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCate(res);
      } catch (err) {
        showError(err);
      }
    };

    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImage(file);
    console.log("File đã chọn:", file);
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
      setTargetLearners([
        ...targetLearners,
        {
          id: 0,
          description: intendedLearnerInput.trim(),
        },
      ]);
      setIntendedLearnerInput("");
    }
  };

  const removeIntendedLearner = (index) => {
    setTargetLearners(targetLearners.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setCourseSkills([
        ...courseSkills,
        {
          id: 0,
          description: skillInput.trim(),
        },
      ]);
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setCourseSkills(courseSkills.filter((_, i) => i !== index));
  };

  const addContent = () => {
    if (contentTitleInput.trim() && contentDesInput.trim()) {
      setCourseContents([
        ...courseContents,
        {
          id: 0,
          title: contentTitleInput.trim(),
          description: contentDesInput.trim(),
        },
      ]);
      setContentTitleInput("");
      setContentDesInput("");
    }
  };

  const removeContent = (index) => {
    setCourseContents(courseContents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!title.trim()) {
        showError("Vui lòng nhập tên khóa học");
        return;
      }
      if (!teacherName.trim()) {
        showError("Vui lòng nhập tên giảng viên");
        return;
      }
      if (!categoryId) {
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
      if (!durationHours.trim()) {
        showError("Vui lòng nhập thời lượng khóa học");
        return;
      }

      const payload = {
        title,
        description,
        teacherName,
        categoryId,
        level,
        price: Number(price) || 0,
        durationHours,
        image: image,
        courseContents,
        courseSkills,
        targetLearners,
      };

      dispatch({ type: actionTypes.ADD_COURSE, payload });
      console.log("Create course payload", payload);

      await courseAPI.createCourse(payload);

      clearForm();

      showSuccess(`✅ Đã tạo khóa học "${title}" thành công!`);
    } catch (error) {
      showError(
        `❌ Lỗi khi tạo khóa học: ${error.message || "Đã có lỗi xảy ra"}`
      );
      console.error("Error creating course:", error);
    }
  };

  const clearForm = () => {
    setTitle("");
    setTeacherName("");
    setCategoryId(0);
    setLevel("");
    setPrice("");
    setDurationHours(0);
    setDescription("");
    setImage(null);
    setImagePreviewUrl("");
    setCourseContents([]);
    setCourseSkills([]);
    setTargetLearners([]);
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Tên giảng viên *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên giảng viên"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Danh mục *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
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
                    type="number"
                    placeholder="Ví dụ: 92 tiếng"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
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
                  {targetLearners.map((item, index) => (
                    <div key={index} className="list-item">
                      <span>{item.description}</span>
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
                  {courseSkills.map((item, index) => (
                    <div key={index} className="list-item">
                      <span>{item.description}</span>
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
                  {courseContents.map((item, index) => (
                    <div key={index} className="content-item-wrapper">
                      <div className="content-item-info">
                        <div className="content-item-title">{item.title}</div>
                        <div className="content-item-des">
                          {item.description}
                        </div>
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
