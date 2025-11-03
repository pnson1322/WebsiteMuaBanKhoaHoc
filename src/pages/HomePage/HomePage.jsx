import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../contexts/AppContext";
import HomePageLayout from "./HomePageLayout";
import HeroSection from "./HeroSection";
import CoursesSection from "./CoursesSection";
import ViewHistory from "../../components/ViewHistory/ViewHistory";
import Filter from "../../components/Filter/Filter";

const HomePage = () => {
  const navigate = useNavigate();
  const { dispatch, actionTypes } = useAppDispatch();

  const handleViewDetails = (course) => {
    // Lưu lịch sử xem
    dispatch({
      type: actionTypes.ADD_TO_VIEW_HISTORY,
      payload: course.id,
    });

    // Sau đó điều hướng sang trang chi tiết
    navigate(`/course/${course.id}`);
  };

  return (
    <HomePageLayout>
      <HeroSection />
      <ViewHistory onViewDetails={handleViewDetails} />
      <Filter />
      <CoursesSection onViewDetails={handleViewDetails} />
    </HomePageLayout>
  );
};

export default HomePage;
