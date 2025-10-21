import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";
import Footer from "./Footer";

export const Layout = () => {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
