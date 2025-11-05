import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAppDispatch } from "../../contexts/AppContext";
import HomePageLayout from "./HomePageLayout";
import HeroSection from "./HeroSection";
import CoursesSection from "./CoursesSection";
import ViewHistory from "../../components/ViewHistory/ViewHistory";
import Filter from "../../components/Filter/Filter";
import SellerHomePage from "./SellerHomePage";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
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
      {user?.role === "learner" || !isLoggedIn ? (
        <>
          <HeroSection />
          <ViewHistory onViewDetails={handleViewDetails} />
          <Filter />
          <CoursesSection onViewDetails={handleViewDetails} />
        </>
      ) : null}

      {isLoggedIn && user?.role === "seller" ? <SellerHomePage /> : null}

      {isLoggedIn && user?.role === "admin" ? <div></div> : null}

      {/* {!isLoggedIn ? <SellerHomePage /> : null} */}
    </HomePageLayout>
  );
};

export default HomePage;




