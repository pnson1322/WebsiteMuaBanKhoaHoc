import React from "react";
import { AuthHeaderWrapper } from "./Auth.styled";

const AuthHeader = ({ mode }) => (
  <AuthHeaderWrapper>
    <h1>{mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}</h1>
    <p>
      {mode === "login"
        ? "Đăng nhập để tiếp tục hành trình học tập của bạn"
        : "Đăng ký để khám phá hàng nghìn khóa học chất lượng!"}
    </p>
  </AuthHeaderWrapper>
);

export default AuthHeader;
