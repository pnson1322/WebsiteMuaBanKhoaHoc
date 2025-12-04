import React from "react";

const CourseContent = React.memo(({ course }) => {
  return (
    <>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
    </>
  );
});

export default CourseContent;
