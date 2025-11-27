import "./CourseDetailPopup.css";
import { useAuth } from "../../contexts/AuthContext";
import { X } from "lucide-react";
import CourseDetailMain from "./CourseDetailMain";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useState } from "react";
import { courseAPI } from "../../services/courseAPI";
import { useToast } from "../contexts/ToastContext";

export default function CourseDetailPopup({ onClose, course }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const isEditable = user?.role === "Seller";

  const [formData, setFormData] = useState({
    title: course.title || "",
    teacherName: course.teacherName || "",
    categoryId: 0,
    level: course.level || "",
    price: course.price || 0,
    durationHours: course.durationHours || 0,
    description: course.description || "",
    imageFile: null,
  });

  const [targetLearners, setTargetLearners] = useState(
    course.targetLearners || []
  );
  const [courseSkills, setCourseSkills] = useState(course.courseSkills || []);
  const [courseContents, setCourseContents] = useState(
    course.courseContents || []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setFormData((prevData) => ({
        ...prevData,
        imageFile: file,
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({
      ...prevData,
      imageFile: null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditable) return;

    console.log("Dữ liệu gửi đi:", formData);
    // TODO:
    // 1. Bạn cần upload `formData.imageFile` (nếu có) lên server (ví dụ: Firebase Storage, Cloudinary)
    // 2. Nhận lại URL ảnh đã upload
    // 3. Gửi *toàn bộ* formData (với URL ảnh mới) lên API để cập nhật CSDL
    // 4. Sau khi thành công, gọi onClose()

    // Ví dụ tạm:
    alert("Đã lưu (xem console log)!");
    // onClose();
  };

  const addIntendedLearner = async (learnerDescription) => {
    if (learnerDescription.trim() === "") return;

    try {
      const newItem = await courseAPI.addTargetLearner(
        course.id,
        learnerDescription
      );

      if (newItem && newItem.id) {
        setTargetLearners((prev) => [...prev, newItem]);
      } else {
        setTargetLearners((prev) => [
          ...prev,
          { id: Date.now(), description: learnerDescription },
        ]);
      }
    } catch (err) {
      showError("Lỗi khi thêm: " + err.message);
    }
  };

  const removeIntendedLearner = async (itemId) => {
    if (!window.confirm("Bạn muốn xóa mục này?")) return;

    try {
      await courseAPI.deleteTargetLearner(course.id, itemId);

      setTargetLearners((prev) => prev.filter((item) => item.id !== itemId));

      showSuccess("Đã xóa thành công");
    } catch (err) {
      showError("Lỗi khi xóa: " + err.message);
    }
  };

  const addSkill = async (skillDescription) => {
    if (skillDescription.trim() === "") return;

    try {
      const newItem = await courseAPI.addCourseSkill(
        course.id,
        skillDescription
      );

      const itemToState =
        newItem && newItem.id
          ? newItem
          : { id: Date.now(), description: skillDescription };

      setCourseSkills((prev) => [...prev, itemToState]);

      showSuccess("Đã thêm kỹ năng");
    } catch (err) {
      showError("Lỗi khi thêm: " + err.message);
    }
  };

  const removeSkill = async (itemId) => {
    if (!window.confirm("Bạn muốn xóa kỹ năng này?")) return;

    try {
      await courseAPI.deleteCourseSkill(course.id, itemId);

      setCourseSkills((prev) => prev.filter((item) => item.id !== itemId));

      showSuccess("Đã xóa kỹ năng");
    } catch (err) {
      showError("Lỗi khi xóa: " + err.message);
    }
  };

  const addContent = async (contentData) => {
    if (
      contentData.title.trim() === "" ||
      contentData.description.trim() === ""
    ) {
      showError("Vui lòng nhập đủ tiêu đề và nội dung");
      return;
    }

    try {
      const newItem = await courseAPI.addCourseContent(course.id, contentData);

      const itemToState =
        newItem && newItem.id ? newItem : { id: Date.now(), ...contentData };

      setCourseContents((prev) => [...prev, itemToState]);

      showSuccess("Đã thêm nội dung bài học");
    } catch (err) {
      showError("Lỗi khi thêm: " + err.message);
    }
  };

  const removeContent = async (itemId) => {
    if (!window.confirm("Bạn muốn xóa bài học này?")) return;

    try {
      await courseAPI.deleteCourseContent(course.id, itemId);

      setCourseContents((prev) => prev.filter((item) => item.id !== itemId));

      showSuccess("Đã xóa bài học");
    } catch (err) {
      showError("Lỗi khi xóa: " + err.message);
    }
  };

  return (
    <div className="course-detail-overlay" onClick={onClose}>
      <div className="course-detail-popup" onClick={(e) => e.stopPropagation()}>
        <div className="title-section-popup">
          <div>Thông tin khóa học</div>
          <X className="cancel-icon" onClick={onClose} />
        </div>

        <SimpleBar style={{ maxHeight: "calc(90vh - 80px)" }}>
          <CourseDetailMain
            user={user}
            formData={formData}
            course={course}
            isEditable={isEditable}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            targetLearners={targetLearners}
            courseContents={courseContents}
            courseSkills={courseSkills}
            addIntendedLearner={addIntendedLearner}
            removeIntendedLearner={removeIntendedLearner}
            addSkill={addSkill}
            removeSkill={removeSkill}
            addContent={addContent}
            removeContent={removeContent}
          />

          {isEditable ? (
            <div className="submit-wrapper">
              <button onClick={handleSubmit} className="submit-popup-btn">
                Lưu thay đổi
              </button>
            </div>
          ) : null}
        </SimpleBar>
      </div>
    </div>
  );
}
