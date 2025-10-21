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
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

export const AuthContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
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
  width: calc(100% + 1.5rem);
  margin-left: -1.5rem;
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
  align-items: flex-start;
  gap: 1rem;

  .benefit-icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    opacity: 0.9;
    line-height: 1.4;
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
