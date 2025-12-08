import React from "react";
import LazyLoadCourses from "../../components/LazyLoadCourses";

const CoursesSection = ({ onViewDetails, CardComponent }) => {
  return (
    <section className="courses-section" id="all-courses">
      <div className="section-header">
        <h2>Tất cả khóa học</h2>
        <p>Khám phá những khóa học phù hợp với bạn.</p>
      </div>

      <LazyLoadCourses
        onViewDetails={onViewDetails}
        CardComponent={CardComponent}
      />
    </section>
  );
};

export default CoursesSection;
