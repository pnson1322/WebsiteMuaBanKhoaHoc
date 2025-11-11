import "./CourseDetailPopup.css";
import { useAuth } from "../../contexts/AuthContext";
import { X } from "lucide-react";
import CourseDetailMain from "./CourseDetailMain";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useState } from "react";

export default function CourseDetailPopup({ onClose, course }) {
  const { user } = useAuth();

  const [info, setInfo] = useState(true);
  const [students, setStudents] = useState(false);
  const [statistic, setStatistic] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleImageChange = () => {};

  const handleRemoveImage = () => {};

  const handleSubmit = () => {};

  return (
    <div className="course-detail-overlay" onClick={onClose}>
      <div className="course-detail-popup" onClick={(e) => e.stopPropagation()}>
        <div className="title-section-popup">
          <div>Thông tin khóa học</div>

          <X className="cancel-icon" onClick={onClose} />
        </div>

        <SimpleBar style={{ maxHeight: "calc(90vh - 80px)" }}>
          <CourseDetailMain
            course={course}
            handleSubmit={handleSubmit}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
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
        </SimpleBar>
      </div>
    </div>
  );
}
