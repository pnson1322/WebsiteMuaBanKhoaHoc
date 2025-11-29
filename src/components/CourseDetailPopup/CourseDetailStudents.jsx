import "./CourseDetailStudents";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { courseAPI } from "../../services/courseAPI";
import { useState, useEffect } from "react";
import "./CourseDetailStudents.css";

export default function CourseDetailStudents({ course }) {
  const formatPrice = (price) => {
    if (typeof price !== "number") return price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };
  const [studentList, setStudentList] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await courseAPI.getStudentList(course.id);

        console.log(course.id);
        console.log(res);

        setStudentList(res);
        setTotalStudents(res.length);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="course-student-list">
      <h3 className="student-list-title">
        Danh sách học viên đã mua ({totalStudents} học viên)
      </h3>

      <SimpleBar style={{ maxHeight: "400px" }}>
        <div className="student-list-items">
          {studentList.length > 0 ? (
            studentList.map((item) => {
              const studentName = item.studentName || "Học viên ẩn danh";

              return (
                <div className="student-card">
                  <div className="student-info">
                    <div className="student-name">{studentName}</div>
                    <div className="student-payment">
                      Thanh toán: {formatPrice(item.purchasedAmount)}
                    </div>
                  </div>

                  <div className="student-status-section">
                    <div className="student-date">
                      Mua ngày: {formatDate(item.enrollAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="student-list-empty">Chưa có học viên nào.</div>
          )}
        </div>
      </SimpleBar>
    </div>
  );
}
