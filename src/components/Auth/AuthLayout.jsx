import React, { useState } from "react";
import {
  AuthPage,
  AuthContainer,
  BackButton,
  AuthContent,
  AuthFormSection,
  AuthBenefitsSection,
} from "./Auth.styled";
import AuthHeader from "./AuthHeader";
import AuthForm from "./AuthForm";
import AuthBenefits from "./AuthBenefits";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthLayout = ({ 
  mode, 
  formData, 
  onChange, 
  onSubmit, 
  errors, 
  success, 
  loading, 
  onSwitchMode 
}) => {
  const navigate = useNavigate();

  return (
    <AuthPage>
      <AuthContainer>
        <BackButton onClick={() => navigate("/")}>
          <ArrowLeft /> Quay lại
        </BackButton>

        <AuthContent>
          <AuthFormSection>
            <AuthHeader mode={mode} />
            <AuthForm
              mode={mode}
              formData={formData}
              onChange={onChange}
              onSubmit={onSubmit}
              errors={errors}
              success={success}
              loading={loading}
              onSwitchMode={onSwitchMode}
            />
          </AuthFormSection>

          <AuthBenefitsSection>
            <AuthBenefits />
          </AuthBenefitsSection>
        </AuthContent>
      </AuthContainer>
    </AuthPage>
  );
};

export default AuthLayout;
