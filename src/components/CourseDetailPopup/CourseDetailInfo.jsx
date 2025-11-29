import { useState } from "react";
import "./CourseDetailInfo.css";

export default function CourseDetailInfo({
  course,
  isEditable,
  targetLearners,
  courseContents,
  courseSkills,
  addIntendedLearner,
  addContent,
  addSkill,
  removeContent,
  removeIntendedLearner,
  removeSkill,
}) {
  const [intendedLearnerInput, setIntendedLearnerInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [contentTitleInput, setContentTitleInput] = useState("");
  const [contentDesInput, setContentDesInput] = useState("");

  const handleAddLearner = () => {
    addIntendedLearner(intendedLearnerInput);
    setIntendedLearnerInput("");
  };

  const handleAddSkill = () => {
    addSkill(skillInput);
    setSkillInput("");
  };

  const handleAddContent = () => {
    addContent({ title: contentTitleInput, description: contentDesInput });
    setContentTitleInput("");
    setContentDesInput("");
  };

  return (
    <>
      <div className="list-section">
        <div className="list-section-title">Đối tượng học viên</div>
        <div className="list-items">
          {targetLearners.map((item) => (
            <div key={item.id} className="list-item">
              <span>{item.description}</span>
              {isEditable && (
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeIntendedLearner(item.id)}
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditable && (
          <div className="list-input-group">
            <input
              type="text"
              className="list-input"
              placeholder="Thêm đối tượng"
              value={intendedLearnerInput}
              onChange={(e) => setIntendedLearnerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLearner();
                }
              }}
            />
            <button
              type="button"
              className="btn-add-item"
              onClick={handleAddLearner}
            >
              Thêm
            </button>
          </div>
        )}
      </div>

      <div className="list-section">
        <div className="list-section-title">Kỹ năng đạt được</div>
        <div className="list-items">
          {courseSkills.map((item) => (
            <div key={item.id} className="list-item">
              <span>{item.description}</span>
              {isEditable && (
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeSkill(item.id)}
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditable && (
          <div className="list-input-group">
            <input
              type="text"
              className="list-input"
              placeholder="Thêm kĩ năng"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <button
              type="button"
              className="btn-add-item"
              onClick={handleAddSkill}
            >
              Thêm
            </button>
          </div>
        )}
      </div>

      <div className="list-section">
        <div className="list-section-title">Nội dung khóa học</div>
        <div className="content-items">
          {courseContents.map((item) => (
            <div key={item.id} className="content-item-wrapper">
              <div className="content-item-info">
                <div className="content-item-title">{item.title}</div>
                <div className="content-item-des">{item.description}</div>
              </div>
              {isEditable && (
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeContent(item.id)}
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditable && (
          <div className="content-input-group">
            <input
              type="text"
              className="list-input"
              placeholder="Tiêu đề"
              value={contentTitleInput}
              onChange={(e) => setContentTitleInput(e.target.value)}
            />
            <input
              type="text"
              className="list-input"
              placeholder="Mô tả"
              value={contentDesInput}
              onChange={(e) => setContentDesInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddContent();
                }
              }}
            />
            <button
              type="button"
              className="btn-add-item"
              onClick={handleAddContent}
            >
              Thêm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
