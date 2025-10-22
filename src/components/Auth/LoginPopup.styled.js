import styled, { keyframes } from "styled-components";

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
  z-index: 999;
  animation: ${fadeIn} 0.25s ease;
`;

export const PopupContainer = styled.div`
  position: relative;
  width: 450px;
  max-height: ${({ $isRegister }) => ($isRegister ? "920px" : "760px")};
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

  /* thanh cuộn nhẹ */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(102, 125, 233, 0.6);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
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

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.2rem;

  label {
    font-weight: 700;
    font-size: 15px;
    color: #2d3748;
  }

  .input-wrapper {
    position: relative;
  }

  .forgot {
    color: #667de9;
    font-size: 14px;
    background: none;
    border: none;
    margin-top: 6px;
    text-align: right;
    cursor: pointer;
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
`;

export const InputField = styled.input`
  width: 100%;
  height: 54px;
  background: #f8f9fa;
  border: 2px solid rgba(226, 232, 240, 0.53);
  border-radius: 12px;
  padding: 0 40px;
  font-size: 16px;
  outline: none;
  color: #2d3748;
  &:focus {
    border-color: #667de9;
  }
`;

export const ToggleEye = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.7;
`;

export const SubmitButton = styled.button`
  width: 100%;
  height: 60px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  color: white;
  font-size: 17px;
  background: linear-gradient(90deg, #667de9 0%, #7258b5 100%);
  cursor: pointer;
  margin-top: 12px;

  &:hover {
    opacity: 0.9;
  }
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

export const LinkText = styled.a`
  color: #667de9;
  margin-left: 4px;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

export const FullPageButton = styled.button`
  display: block;
  width: 150px;
  height: 40px;
  margin: 1.5rem auto 0;
  border: 2px solid rgba(226, 232, 240, 0.53);
  border-radius: 8px;
  background: #f8f9fa;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;

  &:hover {
    background: #edf2f7;
  }
`;
