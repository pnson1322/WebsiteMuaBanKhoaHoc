import React from "react";
import "./HomePage.css";

const HomePageLayout = ({ children }) => {
  return (
    <div className="home-page">
      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default HomePageLayout;




