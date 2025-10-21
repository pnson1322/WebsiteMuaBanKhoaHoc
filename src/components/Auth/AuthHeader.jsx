import React from "react";
import { AuthHeaderWrapper } from "./Auth.styled";

const AuthHeader = ({ mode }) => (
  <AuthHeaderWrapper>
    <h1>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản mới"}</h1>
    <p>
      {mode === "login"
        ? "Chào mừng trở lại! Hãy đăng nhập để tiếp tục hành trình học tập."
        : "Đăng ký ngay để khám phá hàng nghìn khóa học chất lượng!"}
    </p>
  </AuthHeaderWrapper>
);

export default AuthHeader;
