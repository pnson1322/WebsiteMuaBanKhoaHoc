import React from "react";
import { Star, Users, Clock } from "lucide-react";

const CourseStats = React.memo(
  ({ course }) => {
    return (
      <div className="course-stats">
        <div className="stat">
          <Star className="stat-icon" /> {course.averageRating}
        </div>
        <div className="stat">
          <Users className="stat-icon" /> {course.totalPurchased}
        </div>
        <div className="stat">
          <Clock className="stat-icon" /> {course.durationHours} giờ
        </div>
      </div>
    );
  },
  // Custom comparator - chỉ re-render khi stats thay đổi
  (prevProps, nextProps) => {
    return (
      prevProps.course.averageRating === nextProps.course.averageRating &&
      prevProps.course.totalPurchased === nextProps.course.totalPurchased &&
      prevProps.course.durationHours === nextProps.course.durationHours
    );
  }
);

CourseStats.displayName = "CourseStats";

export default CourseStats;
