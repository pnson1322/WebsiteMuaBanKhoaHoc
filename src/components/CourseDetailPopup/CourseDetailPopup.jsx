import "./CourseDetailPopup.css";
import { useAuth } from "../../contexts/AuthContext";
import { X } from "lucide-react";
import CourseDetailMain from "./CourseDetailMain";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useState } from "react";

export default function CourseDetailPopup({ onClose, course }) {
  const { user } = useAuth();

  const isEditable = user?.role === "Seller";

  const [formData, setFormData] = useState({
    name: course?.name || "",
    instructorName: course?.instructor?.name || "",
    category: course?.category || "",
    level: course?.level || "",
    price: course?.price || 0,
    duration: course?.duration || "",
    totalPurchased: course?.totalPurchased || 0,
    description: course?.description || "",
    imageUrl: course?.imageUrl || null,
    imageFile: null,
    targetLearners: course?.targetLearners || [],
    courseSkills: course?.courseSkills || [],
    courseContents: course?.courseContents || [],
  });

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

      const previewUrl = URL.createObjectURL(file);

      setFormData((prevData) => ({
        ...prevData,
        imageUrl: previewUrl,
        imageFile: file,
      }));
    }
  };

  const handleRemoveImage = () => {
    if (formData.imageFile) {
      URL.revokeObjectURL(formData.imageUrl);
    }
    setFormData((prevData) => ({
      ...prevData,
      imageUrl: null,
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

  const addIntendedLearner = (learner) => {
    if (learner.trim() === "") return;
    setFormData((prev) => ({
      ...prev,
      targetLearners: [...prev.targetLearners, learner],
    }));
  };
  const removeIntendedLearner = (index) => {
    setFormData((prev) => ({
      ...prev,
      targetLearners: prev.targetLearners.filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skill) => {
    if (skill.trim() === "") return;
    setFormData((prev) => ({
      ...prev,
      courseSkills: [...prev.courseSkills, skill],
    }));
  };
  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      courseSkills: prev.courseSkills.filter((_, i) => i !== index),
    }));
  };

  const addContent = (content) => {
    if (content.title.trim() === "" || content.des.trim() === "") return;
    setFormData((prev) => ({
      ...prev,
      courseContents: [...prev.courseContents, content],
    }));
  };
  const removeContent = (index) => {
    setFormData((prev) => ({
      ...prev,
      courseContents: prev.courseContents.filter((_, i) => i !== index),
    }));
  };

  const [info, setInfo] = useState(true);
  const [students, setStudents] = useState(false);
  const [statistic, setStatistic] = useState(false);

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
            course={course}
            formData={formData}
            isEditable={isEditable}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            addIntendedLearner={addIntendedLearner}
            removeIntendedLearner={removeIntendedLearner}
            addSkill={addSkill}
            removeSkill={removeSkill}
            addContent={addContent}
            removeContent={removeContent}
            setInfo={() => {
              setInfo(true);
              setStudents(false);
              setStatistic(false);
            }}
            setStudents={() => {
              setInfo(false);
              setStudents(true);
              setStatistic(false);
            }}
            setStatistic={() => {
              setInfo(false);
              setStudents(false);
              setStatistic(true);
            }}
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
