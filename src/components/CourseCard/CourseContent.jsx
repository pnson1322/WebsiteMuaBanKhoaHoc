import React from "react";

const CourseContent = ({ course }) => {
  return (
    <>
      <h3 className="course-title">{course.name}</h3>
      <p className="course-description">{course.shortDescription}</p>
      <div className="course-instructor">
        <span>👨‍🏫 {course.instructor}</span>
      </div>
    </>
  );
};

export default CourseContent;


