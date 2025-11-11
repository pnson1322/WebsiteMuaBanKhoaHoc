import "./CourseDetailStudents";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

export default function CourseDetailStudents({ course, isEditable }) {
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
  const studentList = course?.enrollments || [];
  const totalStudents = studentList.length;

  return (
    <div className="course-student-list">
      <h3 className="student-list-title">
        Danh sách học viên đã mua ({totalStudents} học viên)
      </h3>

      <SimpleBar style={{ maxHeight: "400px" }}>
        <div className="student-list-items">
          {studentList.length > 0 ? (
            studentList.map((enrollment) => {
              // Giả sử 'enrollment.user' là object chứa tên,
              // hoặc có thể là 'enrollment.studentName'
              const studentName = enrollment.user?.name || "Học viên ẩn danh";
              const statusInfo = getStatusInfo(enrollment.status);

              return (
                <div key={enrollment.id} className="student-card">
                  {/* Phần thông tin tên + thanh toán */}
                  <div className="student-info">
                    <div className="student-name">{studentName}</div>
                    <div className="student-payment">
                      Thanh toán: {formatPrice(enrollment.amount)}
                    </div>
                  </div>

                  {/* Phần trạng thái + ngày mua */}
                  <div className="student-status-section">
                    <div className="student-date">
                      Mua ngày: {formatDate(enrollment.purchaseDate)}
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
