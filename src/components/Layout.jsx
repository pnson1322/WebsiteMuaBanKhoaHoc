import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";
import Footer from "./Footer";
import LoginPopup from "./Auth/LoginPopup";
import { useAppState, useAppDispatch } from "../contexts/AppContext";

export const Layout = () => {
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();

  return (
    <div className="app">
      <Header onOpenLoginPopup={() => dispatch({ type: actionTypes.SHOW_LOGIN_POPUP })} />

      <main className="main-content">
        <Outlet />
      </main>

      {state.showLoginPopup && (
        <LoginPopup onClose={() => dispatch({ type: actionTypes.HIDE_LOGIN_POPUP })} />
      )}

      <Footer />
    </div>
  );
};
