import React from "react";
import { Star, Users, Clock } from "lucide-react";

const CourseStats = ({ course }) => {
  return (
    <div className="course-stats">
      <div className="stat">
        <Star className="stat-icon" /> {course.rating}
      </div>
      <div className="stat">
        <Users className="stat-icon" /> {course.students}
      </div>
      <div className="stat">
        <Clock className="stat-icon" /> {course.level}
      </div>
    </div>
  );
};

export default CourseStats;
