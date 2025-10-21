import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";
import Footer from "./Footer";

export const Layout = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="app">
      <Header onOpenChatbox={() => setShowChatbot(true)} />

      <main className="main-content">
        <Outlet />
      </main>

      {/* Chatbox */}

      <Footer />
    </div>
  );
};
