import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { chatAPI } from '../../services/chatAPI';
import './CourseList.css';

const CourseList = ({ sellerId }) => {
    // ✅ Lấy activeCourseFilter từ Context để đồng bộ UI
    const { filterByCourse, activeCourseFilter } = useChat();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    // State phân trang
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Ref cho thanh cuộn
    const listRef = useRef(null);

    // ✅ Hàm gọi API
    const fetchCourses = useCallback(async (pageNum) => {
        if (!sellerId) return;

        try {
            setLoading(true);
            const pageSize = 10; // Số lượng load mỗi lần

            const response = await chatAPI.getSellerCourses(sellerId, pageNum, pageSize);
            const newItems = response.items || [];
            const totalCount = response.totalCount || 0;

            setCourses(prev => {
                if (pageNum === 1) {
                    return newItems; // Trang 1: Thay thế hoàn toàn
                } else {
                    // Trang > 1: Nối thêm và lọc trùng
                    const existingIds = new Set(prev.map(c => c.id));
                    const uniqueItems = newItems.filter(c => !existingIds.has(c.id));
                    return [...prev, ...uniqueItems];
                }
            });

            setPage(pageNum);
            // Nếu số lượng item trả về < pageSize hoặc tổng số item hiện tại >= totalCount -> Hết dữ liệu
            setHasMore(newItems.length === pageSize && (pageNum * pageSize) < totalCount);

        } catch (error) {
            console.error('Error loading courses:', error);
            if (pageNum === 1) setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    // Load trang 1 khi component mount hoặc sellerId thay đổi
    useEffect(() => {
        fetchCourses(1);
    }, [fetchCourses]);

    // ✅ Xử lý cuộn để load more
    const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;

            // Nếu cuộn gần đáy (cách 10px), không đang loading và còn dữ liệu
            if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
                console.log("📥 Loading more courses...");
                fetchCourses(page + 1);
            }
        }
    };

    // ✅ Xử lý chọn khóa học
    const handleCourseSelect = async (course) => {
        // So sánh an toàn (chuyển về string)
        const isSelected = activeCourseFilter?.toString() === course.id.toString();

        if (isSelected) {
            await filterByCourse(null); // Bỏ chọn
        } else {
            await filterByCourse(course.id); // Chọn
        }
    };

    const handleShowAll = async () => {
        await filterByCourse(null);
    };

    return (
        <div className="course-list">
            <div className="course-list-header">
                <h2>📚 Khóa học</h2>
                {activeCourseFilter && (
                    <button className="show-all-btn" onClick={handleShowAll}>
                        Hiện tất cả
                    </button>
                )}
            </div>

            {/* ✅ Container cuộn riêng biệt */}
            <div
                className="course-items-container"
                ref={listRef}
                onScroll={handleScroll}
            >
                {loading && courses.length === 0 ? (
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
                        {courses.map((course) => {
                            // Kiểm tra active dựa trên Context
                            const isActive = activeCourseFilter?.toString() === course.id.toString();

                            return (
                                <div
                                    key={course.id}
                                    className={`course-item ${isActive ? 'selected' : ''}`}
                                    onClick={() => handleCourseSelect(course)}
                                >
                                    <div className="course-thumbnail">
                                        <img
                                            src={course.imageUrl || '/default-course.png'}
                                            alt={course.title}
                                            onError={(e) => { e.target.src = '/default-course.png'; }}
                                        />
                                    </div>

                                    <div className="course-info">
                                        <h3 className="course-title" title={course.title}>
                                            {course.title}
                                        </h3>

                                        <div className="course-stats">
                                            <span className="stat-item">
                                                👥 {course.totalPurchased || 0}
                                            </span>
                                            {course.messageCount > 0 && (
                                                <span className="stat-item">
                                                    💬 {course.messageCount}
                                                </span>
                                            )}
                                        </div>

                                        {course.unreadMessageCount > 0 && (
                                            <div className="course-unread">
                                                <span className="unread-badge">{course.unreadMessageCount} tin mới</span>
                                            </div>
                                        )}
                                    </div>

                                    {isActive && (
                                        <div className="selected-indicator">✓</div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Spinner load more */}
                        {loading && courses.length > 0 && (
                            <div className="loading-more">
                                <div className="spinner-small"></div> Đang tải thêm...
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer thống kê */}
            {courses.length > 0 && (
                <div className="course-summary">
                    <small>Đã tải {courses.length} khóa học</small>
                </div>
            )}
        </div>
    );
};

export default CourseList;