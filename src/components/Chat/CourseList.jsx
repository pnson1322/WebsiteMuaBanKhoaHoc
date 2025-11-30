// src/components/chat/CourseList.jsx
import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { chatAPI } from '../../services/chatAPI';
import './CourseList.css';

const CourseList = ({ sellerId }) => {
    const { filterByCourse } = useChat();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCourses();
    }, [sellerId]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getSellerCourses(sellerId);
            // API trả về { items: [...], page, pageSize, totalCount, totalPages }
            // Lấy mảng courses từ response.items
            setCourses(response.items || []);
        } catch (error) {
            console.error('Error loading courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = async (course) => {
        if (selectedCourse?.id === course.id) {
            // Deselect - show all conversations
            setSelectedCourse(null);
            await filterByCourse(null);
        } else {
            // Select course - filter conversations
            setSelectedCourse(course);
            await filterByCourse(course.id);
        }
    };

    const handleShowAll = async () => {
        setSelectedCourse(null);
        await filterByCourse(null);
    };

    return (
        <div className="course-list">
            <div className="course-list-header">
                <h2>📚 Khóa học của bạn</h2>
                {selectedCourse && (
                    <button
                        className="show-all-btn"
                        onClick={handleShowAll}
                    >
                        Hiện tất cả
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải khóa học...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📖</div>
                    <p>Chưa có khóa học nào</p>
                </div>
            ) : (
                <div className="course-items">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className={`course-item ${selectedCourse?.id === course.id ? 'selected' : ''
                                }`}
                            onClick={() => handleCourseSelect(course)}
                        >
                            <div className="course-thumbnail">
                                <img
                                    src={course.imageUrl || '/default-course.png'}
                                    alt={course.title}
                                    onError={(e) => {
                                        e.target.src = '/default-course.png';
                                    }}
                                />
                            </div>

                            <div className="course-info">
                                <h3 className="course-title">
                                    {course.title}
                                </h3>

                                <div className="course-stats">
                                    <span className="stat-item">
                                        <span className="stat-icon">👥</span>
                                        <span className="stat-value">
                                            {course.totalPurchased || 0} học viên
                                        </span>
                                    </span>

                                    {course.messageCount > 0 && (
                                        <span className="stat-item">
                                            <span className="stat-icon">💬</span>
                                            <span className="stat-value">
                                                {course.messageCount} tin nhắn
                                            </span>
                                        </span>
                                    )}
                                </div>

                                {course.unreadMessageCount > 0 && (
                                    <div className="course-unread">
                                        <span className="unread-badge">
                                            {course.unreadMessageCount} chưa đọc
                                        </span>
                                    </div>
                                )}

                                <div className="course-status">
                                    <span className={`status-badge ${course.isApproved && !course.isRestricted ? 'active' : 'inactive'}`}>
                                        {course.isApproved && !course.isRestricted ? '🟢 Đang bán' : '🔴 Dừng bán'}
                                    </span>
                                </div>
                            </div>

                            {selectedCourse?.id === course.id && (
                                <div className="selected-indicator">✓</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {courses.length > 0 && (
                <div className="course-summary">
                    <div className="summary-item">
                        <span className="summary-label">Tổng khóa học:</span>
                        <span className="summary-value">{courses.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Tổng học viên:</span>
                        <span className="summary-value">
                            {courses.reduce((sum, c) => sum + (c.totalPurchased || 0), 0)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseList;