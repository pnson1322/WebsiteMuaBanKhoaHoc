import styled, { keyframes } from "styled-components";
import {
  Input,
  InputContainer,
  SubmitButton as AuthSubmitButton,
  FormGroup as AuthFormGroup,
  Label,
  TogglePassword,
  ForgotPasswordLink,
  SwitchButton,
  ErrorText,
} from "./Auth.styled";
export { ErrorText };
/* Hiệu ứng mờ popup */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  animation: ${fadeIn} 0.25s ease;
`;

export const PopupContainer = styled.div`
  position: relative;
  width: 450px;
  max-height: ${({ $isRegister }) => ($isRegister ? "760px" : "760px")};
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.25s ease;
`;
export const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  /* ẩn thanh cuộn */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none; /* IE và Edge */
  scrollbar-width: none; /* Firefox */
`;
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #2d3748;
`;

export const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export const HighlightBox = styled.div`
  background: linear-gradient(90deg, #667de9 0%, #7258b5 100%);
  color: white;
  border-radius: 16px;
  padding: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const HighlightTitle = styled.p`
  font-weight: 700;
  font-size: 20px;
`;

export const HighlightDesc = styled.p`
  font-size: 15px;
  opacity: 0.9;
  margin-top: 6px;
`;

// Sử dụng Label từ Auth.styled.js
export { Label };

// Sử dụng Input, InputContainer, TogglePassword từ Auth.styled.js
export { Input, InputContainer, TogglePassword };

// Sử dụng ForgotPasswordLink từ Auth.styled.js
export { ForgotPasswordLink };

// Tùy chỉnh FormGroup cho LoginPopup với spacing lớn hơn
export const FormGroup = styled(AuthFormGroup)`
  margin-bottom: 1.5rem;
  gap: 0.75rem;
`;

// Tùy chỉnh SubmitButton cho LoginPopup với width 100%
export const SubmitButton = styled(AuthSubmitButton)`
  width: 100%;
  margin-top: 1rem;
`;

export const Divider = styled.hr`
  border: 1px solid #d9d9d9;
  margin: 1.5rem 0;
`;

export const FooterText = styled.p`
  text-align: center;
  color: #2d3748;
  font-size: 15px;
`;

// Sử dụng SwitchButton từ Auth.styled.js cho các link
export { SwitchButton as LinkText };

export const FullPageButton = styled.button`
  display: block;
  width: 160px;
  height: 44px;
  margin: 1.5rem auto 0;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8f9fa;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
    transform: translateY(-1px);
  }
`;
