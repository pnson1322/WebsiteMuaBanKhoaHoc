import React, { createContext, useContext, useReducer, useEffect } from "react";
import { courseAPI } from "../services/courseAPI"; // ⭐ Dùng API thật
import { setAppDispatchContext } from "./AuthContext";

// Initial state
const initialState = {
  courses: [],
  filteredCourses: [],
  favorites: JSON.parse(localStorage.getItem("favorites")) || [],
  viewHistory: JSON.parse(localStorage.getItem("viewHistory")) || [],
  searchTerm: "",
  selectedCategory: "Tất cả",
  selectedPriceRange: { label: "Tất cả", min: 0, max: Infinity },
  isLoadingSuggestions: false,
  error: null,
  cart: JSON.parse(localStorage.getItem("cart")) || [],
  showLoginPopup: false,
};

// Action types
const actionTypes = {
  SET_COURSES: "SET_COURSES",
  SET_FILTERED_COURSES: "SET_FILTERED_COURSES",
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_CATEGORY: "SET_CATEGORY",
  SET_PRICE_RANGE: "SET_PRICE_RANGE",
  ADD_TO_FAVORITES: "ADD_TO_FAVORITES",
  REMOVE_FROM_FAVORITES: "REMOVE_FROM_FAVORITES",
  SET_FAVORITES: "SET_FAVORITES",
  ADD_TO_VIEW_HISTORY: "ADD_TO_VIEW_HISTORY",
  SET_LOADING_SUGGESTIONS: "SET_LOADING_SUGGESTIONS",
  SET_ERROR: "SET_ERROR",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  SET_CART: "SET_CART",
  RESET_USER_DATA: "RESET_USER_DATA", // Reset cart, favorites khi logout
  SHOW_LOGIN_POPUP: "SHOW_LOGIN_POPUP",
  HIDE_LOGIN_POPUP: "HIDE_LOGIN_POPUP",
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_COURSES:
      return { ...state, courses: action.payload };

    case actionTypes.SET_FILTERED_COURSES:
      return { ...state, filteredCourses: action.payload };

    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };

    case actionTypes.SET_CATEGORY:
      return { ...state, selectedCategory: action.payload };

    case actionTypes.SET_PRICE_RANGE:
      return { ...state, selectedPriceRange: action.payload };

    case actionTypes.ADD_TO_FAVORITES:
      const newFav = [...state.favorites, action.payload];
      localStorage.setItem("favorites", JSON.stringify(newFav));
      return { ...state, favorites: newFav };

    case actionTypes.REMOVE_FROM_FAVORITES:
      const updatedFav = state.favorites.filter((id) => id !== action.payload);
      localStorage.setItem("favorites", JSON.stringify(updatedFav));
      return { ...state, favorites: updatedFav };

    case actionTypes.SET_FAVORITES:
      localStorage.setItem("favorites", JSON.stringify(action.payload));
      return { ...state, favorites: action.payload };

    case actionTypes.ADD_TO_VIEW_HISTORY:
      const id = action.payload;
      const updatedHistory = [
        id,
        ...state.viewHistory.filter((i) => i !== id),
      ].slice(0, 10);
      localStorage.setItem("viewHistory", JSON.stringify(updatedHistory));
      return { ...state, viewHistory: updatedHistory };

    case actionTypes.SET_LOADING_SUGGESTIONS:
      return { ...state, isLoadingSuggestions: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case actionTypes.ADD_TO_CART:
      const newCart = [...state.cart, action.payload];
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };

    case actionTypes.REMOVE_FROM_CART:
      const cartAfter = state.cart.filter((i) => i !== action.payload);
      localStorage.setItem("cart", JSON.stringify(cartAfter));
      return { ...state, cart: cartAfter };

    case actionTypes.SET_CART:
      localStorage.setItem("cart", JSON.stringify(action.payload));
      return { ...state, cart: action.payload };

    case actionTypes.RESET_USER_DATA:
      // Reset về guest state - clear cart và favorites
      localStorage.removeItem("cart");
      localStorage.removeItem("favorites");
      localStorage.removeItem("viewHistory");
      return {
        ...state,
        cart: [],
        favorites: [],
        viewHistory: [],
      };

    case actionTypes.SHOW_LOGIN_POPUP:
      return { ...state, showLoginPopup: true };

    case actionTypes.HIDE_LOGIN_POPUP:
      return { ...state, showLoginPopup: false };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();
const AppDispatchContext = createContext();

export const useAppState = () => useContext(AppContext);
export const useAppDispatch = () => useContext(AppDispatchContext);

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 🔗 Export dispatch context để AuthContext có thể gọi
  useEffect(() => {
    setAppDispatchContext({
      resetUserData: () => dispatch({ type: actionTypes.RESET_USER_DATA }),
      syncUserData: async () => {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token) return;

        try {
          const { favoriteAPI } = await import("../services/favoriteAPI");
          const favoritesFromAPI = await favoriteAPI.getFavorites();
          const favoriteIds = favoritesFromAPI.map((item) => item.courseId);
          dispatch({ type: actionTypes.SET_FAVORITES, payload: favoriteIds });
        } catch (err) {
          console.error("❌ Error syncing user data:", err);
        }
      },
    });
  }, []);

  useEffect(() => {
    setAppDispatchContext({
      resetUserData: () => dispatch({ type: actionTypes.RESET_USER_DATA }),
      syncUserData: async () => {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token) return;

        try {
          const { cartAPI } = await import("../services/cartAPI");
          const cartFromAPI = await cartAPI.getCart();
          const cartIds = cartFromAPI.items.map((item) => item.courseId);
          dispatch({ type: actionTypes.SET_CART, payload: cartIds });
        } catch (err) {
          console.error("❌ Error syncing user data:", err);
        }
      },
    });
  }, []);

  // ⭐ Load khóa học từ API thật
  // ✅ Load cho TẤT CẢ: không đăng nhập, Buyer, Admin, Seller
  // ⚠️ Chỉ skip ở trang /login và /register để tránh API call không cần thiết
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === "/login" || currentPath === "/register";

    if (isAuthPage) {
      console.log("⏭️ Skipping course load on auth page:", currentPath);
      return;
    }

    console.log("📚 Loading courses for all users");

    const loadCourses = async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING_SUGGESTIONS, payload: true });

        const res = await courseAPI.getCourses({ page: 1, pageSize: 100 });

        console.log("📦 API Response:", res);

        // ✅ Kiểm tra response structure
        if (!res || !res.items) {
          console.error("❌ Invalid response structure:", res);
          throw new Error("API trả về dữ liệu không đúng format");
        }

        const normalized = res.items.map((c) => ({
          ...c,
          courseId: c.id,
          image: c.imageUrl,
        }));

        dispatch({ type: actionTypes.SET_COURSES, payload: normalized });
        console.log("✅ Courses loaded successfully:", normalized.length);
      } catch (err) {
        console.error("❌ Lỗi load courses:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          isNetworkError: err.code === "ERR_NETWORK",
        });

        // ⚠️ Xử lý các loại lỗi khác nhau
        if (err.response?.status === 401) {
          console.warn(
            "⚠️ Backend requires auth for /api/Course - setting empty courses"
          );
          dispatch({ type: actionTypes.SET_COURSES, payload: [] });
          dispatch({ type: actionTypes.SET_ERROR, payload: null }); // Clear error
        } else if (err.code === "ERR_NETWORK") {
          console.error("🌐 Network error - cannot connect to backend");
          dispatch({
            type: actionTypes.SET_ERROR,
            payload: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối.",
          });
        } else if (err.response?.status === 500) {
          console.error("💥 Server error");
          dispatch({
            type: actionTypes.SET_ERROR,
            payload: "Lỗi server. Vui lòng thử lại sau.",
          });
        } else {
          dispatch({
            type: actionTypes.SET_ERROR,
            payload: `Lỗi: ${err.message}`,
          });
        }
      } finally {
        dispatch({ type: actionTypes.SET_LOADING_SUGGESTIONS, payload: false });
      }
    };

    loadCourses();
  }, []);

  // ⭐ Auto filter
  useEffect(() => {
    let filtered = state.courses;

    // Search
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.categoryName?.toLowerCase().includes(term)
      );
    }

    // Category
    if (state.selectedCategory !== "Tất cả") {
      filtered = filtered.filter(
        (c) => c.categoryName === state.selectedCategory
      );
    }

    // Price range
    if (state.selectedPriceRange.label !== "Tất cả") {
      filtered = filtered.filter(
        (c) =>
          c.price >= state.selectedPriceRange.min &&
          c.price <= state.selectedPriceRange.max
      );
    }

    dispatch({
      type: actionTypes.SET_FILTERED_COURSES,
      payload: filtered,
    });
  }, [
    state.courses,
    state.searchTerm,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  // 🔄 Function để reset user data khi logout
  const resetUserData = () => {
    console.log("🗑️ Resetting user data (cart, favorites, viewHistory)");
    dispatch({ type: actionTypes.RESET_USER_DATA });
  };

  // 🔄 Function để sync data từ backend khi login
  const syncUserData = async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      console.log("⚠️ No token found - skipping sync");
      return;
    }

    console.log("🔄 Syncing user data from backend...");

    try {
      // Sync favorites
      const { favoriteAPI } = await import("../services/favoriteAPI");
      const favoritesFromAPI = await favoriteAPI.getFavorites();
      const favoriteIds = favoritesFromAPI.map((item) => item.courseId);
      dispatch({ type: actionTypes.SET_FAVORITES, payload: favoriteIds });
      console.log("✅ Favorites synced:", favoriteIds.length);

      // TODO: Sync cart từ backend nếu có API
      // const cartFromAPI = await cartAPI.getCart();
      // dispatch({ type: actionTypes.SET_CART, payload: cartFromAPI });
    } catch (err) {
      console.error("❌ Error syncing user data:", err);
    }
  };

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider
        value={{ dispatch, actionTypes, resetUserData, syncUserData }}
      >
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
};
