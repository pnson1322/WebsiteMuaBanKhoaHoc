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
import AdminHomePage from "./AdminHomePage";

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
      {user?.role === "Buyer" || !isLoggedIn ? (
        <>
          <HeroSection />
          {isLoggedIn && <ViewHistory onViewDetails={handleViewDetails} />}
          <Filter />
          <CoursesSection onViewDetails={handleViewDetails} />
        </>
      ) : null}

      {isLoggedIn && user?.role === "Seller" ? <SellerHomePage /> : null}

      {isLoggedIn && user?.role === "Admin" ? <AdminHomePage /> : null}

      {/* {!isLoggedIn ? <AdminHomePage /> : null} */}
    </HomePageLayout>
  );
};

export default HomePage;
