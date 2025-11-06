import React, { createContext, useContext, useReducer, useEffect } from "react";
import { coursesAPI } from "../services/api"; // ✅ thêm import API

// Initial state
const initialState = {
  myCourses: JSON.parse(localStorage.getItem("myCourses")) || [],
  courses: [],
  filteredCourses: [],
  favorites: JSON.parse(localStorage.getItem("favorites")) || [],
  viewHistory: JSON.parse(localStorage.getItem("viewHistory")) || [],
  searchTerm: "",
  selectedCategory: "Tất cả",
  selectedPriceRange: { label: "Tất cả", min: 0, max: Infinity },
  suggestions: [],
  isLoadingSuggestions: false,
  error: null,
  cart: JSON.parse(localStorage.getItem("cart")) || [],
};

// Action types
const actionTypes = {
  SET_COURSES: "SET_COURSES",
  ADD_COURSE: "ADD_COURSE",
  SET_FILTERED_COURSES: "SET_FILTERED_COURSES",
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_CATEGORY: "SET_CATEGORY",
  SET_PRICE_RANGE: "SET_PRICE_RANGE",
  ADD_TO_FAVORITES: "ADD_TO_FAVORITES",
  REMOVE_FROM_FAVORITES: "REMOVE_FROM_FAVORITES",
  ADD_TO_VIEW_HISTORY: "ADD_TO_VIEW_HISTORY",
  SET_SUGGESTIONS: "SET_SUGGESTIONS",
  SET_LOADING_SUGGESTIONS: "SET_LOADING_SUGGESTIONS",
  SET_ERROR: "SET_ERROR",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  CLEAR_VIEW_HISTORY: "CLEAR_VIEW_HISTORY",
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_COURSES:
      return { ...state, courses: action.payload };

    case actionTypes.ADD_COURSE:
      const newCourses = [...state.courses, action.payload];
      return { ...state, courses: newCourses };

    case actionTypes.SET_FILTERED_COURSES:
      return { ...state, filteredCourses: action.payload };

    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };

    case actionTypes.SET_CATEGORY:
      return { ...state, selectedCategory: action.payload };

    case actionTypes.SET_PRICE_RANGE:
      return { ...state, selectedPriceRange: action.payload };

    case actionTypes.ADD_TO_FAVORITES:
      const newFavorites = [...state.favorites, action.payload];
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return { ...state, favorites: newFavorites };

    case actionTypes.REMOVE_FROM_FAVORITES:
      const updatedFavorites = state.favorites.filter(
        (id) => id !== action.payload
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      return { ...state, favorites: updatedFavorites };

    case actionTypes.ADD_TO_VIEW_HISTORY: {
      const courseId = action.payload;

      // 1️⃣ Xóa khóa học nếu đã tồn tại (tránh trùng ID)
      const updatedHistory = state.viewHistory.filter((id) => id !== courseId);

      // 2️⃣ Đưa khóa học mới lên đầu danh sách
      const newHistory = [courseId, ...updatedHistory].slice(0, 10); // giới hạn 10 khóa gần nhất

      // 3️⃣ Lưu vào localStorage để giữ lại sau khi refresh
      localStorage.setItem("viewHistory", JSON.stringify(newHistory));

      // 4️⃣ Cập nhật state
      return { ...state, viewHistory: newHistory };
    }

    case actionTypes.SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };

    case actionTypes.SET_LOADING_SUGGESTIONS:
      return { ...state, isLoadingSuggestions: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case actionTypes.ADD_TO_CART:
      const newCart = [...state.cart, action.payload];
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };

    case actionTypes.REMOVE_FROM_CART:
      const updatedCart = state.cart.filter((id) => id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { ...state, cart: updatedCart };

    case actionTypes.CLEAR_VIEW_HISTORY:
      localStorage.removeItem("viewHistory");
      return { ...state, viewHistory: [] };

    default:
      return state;
  }
};

// Contexts
const AppContext = createContext();
const AppDispatchContext = createContext();

// Hooks
export const useAppState = () => useContext(AppContext);
export const useAppDispatch = () => useContext(AppDispatchContext);

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ✅ Fetch danh sách khoá học từ API một lần
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesAPI.getCoursesWithPagination(1, 200);
        dispatch({ type: actionTypes.SET_COURSES, payload: res.courses });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
      }
    };
    fetchCourses();
  }, []);

  // ✅ Tự động lọc khi state thay đổi
  useEffect(() => {
    let filtered = state.courses;

    // Tìm kiếm
    if (state.searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Danh mục
    if (state.selectedCategory !== "Tất cả") {
      filtered = filtered.filter(
        (course) => course.category === state.selectedCategory
      );
    }

    // Khoảng giá
    if (state.selectedPriceRange.label !== "Tất cả") {
      filtered = filtered.filter(
        (course) =>
          course.price >= state.selectedPriceRange.min &&
          course.price <= state.selectedPriceRange.max
      );
    }

    dispatch({ type: actionTypes.SET_FILTERED_COURSES, payload: filtered });
  }, [
    state.courses,
    state.searchTerm,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={{ dispatch, actionTypes }}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
};
