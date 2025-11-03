import styled, { keyframes } from "styled-components";

/* Animations */
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

/* Layout */
export const AuthPage = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (min-width: 1200px) {
    min-height: ${({ $mode }) => ($mode === "register" ? "1000px" : "800px")};
    padding: 2rem;
  }
`;

export const AuthContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2 2rem;

  @media (min-width: 1200px) {
    max-width: ${({ $mode }) => ($mode === "register" ? "1100px" : "1000")};
    min-height: ${({ $mode }) => ($mode === "register" ? "850px" : "700px")};
    padding: 2rem;
  }
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-4px);
  }
`;

export const AuthContent = styled.div`
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }
`;

export const AuthFormSection = styled.div`
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

export const AuthHeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  p {
    color: #4a5568;
    font-size: 1.1rem;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    p {
      font-size: 1rem;
    }
  }
`;

/* Form */
export const AuthFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: calc(100%);
  margin-left: 0;
  overflow: hidden;
  .input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #718096;
    width: 20px;
    height: 20px;
  }
  .select-arrow {
    padding: 1rem 1rem 1rem 3.5rem;

    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #2d3748;
  transition: all 0.3s ease;
  appearance: none;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
  }

  &.error {
    border-color: #e53e3e;
    background: #fed7d7;
  }

  &::placeholder {
    color: #718096;
  }
`;
export const ErrorText = styled.span`
  color: #ff4d4f; /* 🔴 đỏ */
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.25rem;
  display: block;
`;

export const TogglePassword = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #718096;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #4a5568;
    background: rgba(113, 128, 150, 0.1);
  }
`;

export const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1.25rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 56px;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* ⚡ hiệu ứng cho icon */
  .arrow-icon {
    transition: transform 0.25s ease;
  }

  &:hover:not(:disabled) .arrow-icon {
    transform: translateX(5px); /* icon trượt nhẹ sang phải khi hover */
  }
`;

export const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const RegisterSuccess = styled.div`
  background: #c6f6d5;
  color: #22543d;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #9ae6b4;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${slideIn} 0.3s ease-out;

  svg {
    color: #22543d;
  }

  strong {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

export const AuthSwitch = styled.div`
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;

  p {
    margin: 0;
    color: #4a5568;
    font-size: 0.95rem;
  }
`;

export const SwitchButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  margin-left: 0.5rem;
  text-decoration: underline;
  transition: color 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    color: #5a67d8;
  }
`;

/* Benefits Section */
export const AuthBenefitsSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    padding: 2rem;
    text-align: center;
  }
`;

export const BenefitsContent = styled.div`
  max-width: 400px;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
  }

  .benefits-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.5rem;
    }
    p {
      font-size: 1rem;
    }
  }
`;

export const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  line-height: 1.5;

  .benefit-icon {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 16px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    svg {
      width: 22px;
      height: 22px;
      color: #fff;
    }
  }

  .benefit-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin: 0 0 0.25rem 0; /* ✅ nhỏ gọn */
  }

  p {
    font-size: 0.95rem;
    opacity: 0.9;
    color: #fff;
    margin: 0;
  }
`;

export const Testimonial = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);

  blockquote {
    margin: 0 0 1rem 0;
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  cite {
    font-size: 0.85rem;
    opacity: 0.8;
    font-style: normal;
  }
`;
// ForgotPasswordLink
export const ForgotPasswordLink = styled.a`
  display: block;
  text-align: right;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-top: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  width: 455px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  animation: fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95); /* ✅ scale nhẹ khi xuất hiện */
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  .icon-wrap {
    background: linear-gradient(90deg, #667de9 0%, #7258b5 100%);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
  }

  h2 {
    font-size: 18px;
    font-weight: 500;
    color: #1f2937;
  }
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  label {
    font-size: 14px;
    color: #374151;
  }

  input {
    height: 50px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0 1rem;
    font-size: 16px;
    color: #000;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;

    button {
      flex: 1;
      height: 42px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel {
      border: 1px solid #d1d5db;
      background: #fff;
      color: #374151;
    }

    .send {
      background: linear-gradient(90deg, #667de9 0%, #7258b5 100%);
      border: none;
      color: #fff;
    }

    .send:hover {
      opacity: 0.9;
    }
  }
`;
