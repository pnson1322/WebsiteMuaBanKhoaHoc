import React from "react";

const CourseContent = ({ course }) => {
  return (
    <>
      <h3 className="course-title">{course.name}</h3>
      <p className="course-description">{course.description}</p>
    </>
  );
};

export default CourseContent;
