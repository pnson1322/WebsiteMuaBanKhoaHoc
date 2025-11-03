import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../contexts/AppContext';
import { coursesAPI } from '../services/api';
import CourseCard from '../components/CourseCard/CourseCard';
import './Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { dispatch, actionTypes } = useAppDispatch();
  
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFavoriteCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (state.favorites.length === 0) {
          setFavoriteCourses([]);
          setLoading(false);
          return;
        }

        // Load favorite courses from API
        const courses = await Promise.all(
          state.favorites.map(courseId => coursesAPI.getCourseById(courseId))
        );
        
        setFavoriteCourses(courses.filter(course => course !== null));
      } catch (err) {
        setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.');
        console.error('Error loading favorite courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteCourses();
  }, [state.favorites]);

  const handleViewDetails = (course) => {
    navigate(`/course/${course.id}`);
  };

  const clearAllFavorites = () => {
    state.favorites.forEach(courseId => {
      dispatch({ type: actionTypes.REMOVE_FROM_FAVORITES, payload: courseId });
    });
  };

  if (loading) {
    return (
      <div className="favorites-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>

          <div className="favorites-header">
            <div className="favorites-title">
              <Heart className="favorites-icon" />
              <h1>Khóa học yêu thích</h1>
            </div>
          </div>

          <div className="favorites-loading">
            <p>Đang tải khóa học yêu thích...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page page-transition">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft className="back-icon" />
            <span>Quay lại</span>
          </button>

          <div className="error-page">
            <div className="error-content">
              <h2>⚠️ Có lỗi xảy ra</h2>
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page page-transition">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft className="back-icon" />
          <span>Quay lại</span>
        </button>

        <div className="favorites-header">
          <div className="favorites-title">
            <Heart className="favorites-icon" />
            <h1>Khóa học yêu thích</h1>
            <span className="favorites-count">({state.favorites.length})</span>
          </div>
          
          {state.favorites.length > 0 && (
            <button 
              className="clear-favorites-btn"
              onClick={clearAllFavorites}
            >
              <Trash2 className="trash-icon" />
              Xóa tất cả
            </button>
          )}
        </div>

        {favoriteCourses.length === 0 ? (
          <div className="empty-favorites">
            <Heart className="empty-icon" />
            <h3>Chưa có khóa học yêu thích</h3>
            <p>Hãy thêm những khóa học bạn quan tâm vào danh sách yêu thích để theo dõi dễ dàng hơn!</p>
            <button 
              className="browse-courses-btn"
              onClick={() => navigate('/')}
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;




