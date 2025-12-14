import React from "react";

const CourseContent = React.memo(
  ({ course }) => {
    return (
      <>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
      </>
    );
  },
  // Custom comparator - chỉ re-render khi title hoặc description thay đổi
  (prevProps, nextProps) => {
    return (
      prevProps.course.title === nextProps.course.title &&
      prevProps.course.description === nextProps.course.description
    );
  }
);

CourseContent.displayName = "CourseContent";

export default CourseContent;
