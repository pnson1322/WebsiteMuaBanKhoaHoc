import React from "react";
import "./PasswordStrengthBar.css";

const PasswordStrengthBar = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { label: "Yếu", color: "#ddd", percent: 0 };

    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    let percent = (score / 4) * 100;

    if (score === 0) return { label: "Yếu", color: "#ddd", percent: 0 };
    if (score === 1) return { label: "Yếu", color: "#667eea", percent };
    if (score === 2)
      return {
        label: "Trung bình",
        color: "linear-gradient(90deg, #667eea 0%, #a06ee1 100%)",
        percent,
      };
    if (score >= 3)
      return {
        label: "Mạnh",
        color: "linear-gradient(90deg, #667eea 0%, #a06ee1 50%, #764ba2 100%)",
        percent,
      };
  };

  const strength = calculateStrength(password);

  return (
    <div className="strength-bar-container">
      <div className="strength-bar-wrapper">
        <div
          className="strength-bar-fill"
          style={{
            width: `${strength.percent}%`,
            background: strength.color,
          }}
        ></div>
      </div>
      <div className="strength-text">{strength.label}</div>
    </div>
  );
};

export default PasswordStrengthBar;
