import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { courseAPI } from "../services/courseAPI"; // ⭐ Dùng API thật
import { categoryAPI } from "../services/categoryAPI"; // ⭐ API danh mục
import { setAppDispatchContext } from "./AuthContext";
import { cartAPI } from "../services/cartAPI";
import { favoriteAPI } from "../services/favoriteAPI";
import { useDebounce } from "../hooks/useDebounce";

// Initial state
const initialState = {
  courses: [],
  categories: [], // ⭐ Danh sách danh mục từ API
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
  SET_CATEGORIES: "SET_CATEGORIES", // ⭐ Action để set danh mục
  APPEND_COURSES: "APPEND_COURSES",
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
  REMOVE_MULTIPLE_FROM_CART: "REMOVE_MULTIPLE_FROM_CART",
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_COURSES:
      return { ...state, courses: action.payload };

    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };

    case actionTypes.APPEND_COURSES:
      // Lọc bỏ các khóa học trùng lặp dựa trên ID
      const existingIds = new Set(state.courses.map((c) => c.id));
      const newUniqueCourses = action.payload.filter(
        (c) => !existingIds.has(c.id)
      );
      return { ...state, courses: [...state.courses, ...newUniqueCourses] };

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

    case actionTypes.REMOVE_MULTIPLE_FROM_CART: {
      // action.payload là mảng các courseId đã mua
      // Giữ lại những id KHÔNG nằm trong danh sách đã mua
      const newCart = state.cart.filter((id) => !action.payload.includes(id));
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

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

  // Debounce search term để tránh filter quá nhiều lần
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  const cartActions = useMemo(
    () => ({
      addToCart: async (courseId) => {
        try {
          await cartAPI.createCartItem(courseId);
          dispatch({ type: actionTypes.ADD_TO_CART, payload: courseId });
          return { success: true };
        } catch (error) {
          console.error("Lỗi thêm vào giỏ:", error);
          return { success: false, error };
        }
      },

      removeFromCart: async (courseId) => {
        try {
          await cartAPI.deleteCartItem(courseId);
          dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: courseId });
          return { success: true };
        } catch (error) {
          console.error("Lỗi xóa khỏi giỏ:", error);
          return { success: false, error };
        }
      },

      clearCart: async () => {
        try {
          await cartAPI.deleteCart();
          dispatch({ type: actionTypes.SET_CART, payload: [] });
          return { success: true };
        } catch (error) {
          console.error("Lỗi làm trống giỏ:", error);
          return { success: false, error };
        }
      },

      removePaidCourses: (courseIds) => {
        dispatch({
          type: actionTypes.REMOVE_MULTIPLE_FROM_CART,
          payload: courseIds,
        });
      },
    }),
    []
  );

  const favoriteActions = useMemo(
    () => ({
      addToFavorite: async (courseId) => {
        try {
          await favoriteAPI.addFavorite(courseId);
          dispatch({ type: actionTypes.ADD_TO_FAVORITES, payload: courseId });
          return { success: true };
        } catch (error) {
          console.error("Lỗi thêm yêu thích:", error);
          return { success: false, error };
        }
      },

      removeFromFavorite: async (courseId) => {
        try {
          await favoriteAPI.removeFavorite(courseId);
          dispatch({
            type: actionTypes.REMOVE_FROM_FAVORITES,
            payload: courseId,
          });
          return { success: true };
        } catch (error) {
          console.error("Lỗi xóa yêu thích:", error);
          return { success: false, error };
        }
      },

      clearFavorites: async () => {
        try {
          await favoriteAPI.clearFavorites();
          dispatch({ type: actionTypes.SET_FAVORITES, payload: [] });
          return { success: true };
        } catch (error) {
          return { success: false, error };
        }
      },
    }),
    []
  );

  const resetUserData = useCallback(() => {
    console.log("🗑️ Resetting user data");
    dispatch({ type: actionTypes.RESET_USER_DATA });
  }, []);

  const syncUserData = useCallback(async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) return;

    console.log("🔄 Syncing user data (Cart & Favorites)...");

    try {
      const [favoriteRes, cartRes] = await Promise.allSettled([
        favoriteAPI.getFavorites(),
        cartAPI.getCart(),
      ]);

      // Xử lý Favorites
      if (favoriteRes.status === "fulfilled") {
        const favoriteData = favoriteRes.value;
        // Kiểm tra xem API trả về mảng trực tiếp hay object { items: [] }
        // Giả sử API trả về mảng các object [{ courseId: 1, ... }]
        const favoriteIds = Array.isArray(favoriteData)
          ? favoriteData.map((item) => item.courseId || item.id) // Fallback nếu cấu trúc khác
          : [];
        dispatch({ type: actionTypes.SET_FAVORITES, payload: favoriteIds });
      }

      // Xử lý Cart
      if (cartRes.status === "fulfilled") {
        const cartData = cartRes.value;
        if (cartData && cartData.items) {
          const cartIds = cartData.items.map((item) => item.courseId);
          dispatch({ type: actionTypes.SET_CART, payload: cartIds });
        }
      }
    } catch (err) {
      console.error("❌ General sync error:", err);
    }
  }, []);

  // Set context cho Auth
  useEffect(() => {
    setAppDispatchContext({
      resetUserData,
      syncUserData,
    });
  }, [resetUserData, syncUserData]);

  // ⭐ KHÔNG load courses ở đây nữa
  // ✅ LazyLoadCourses component sẽ tự load với infinite scroll và pagination đúng
  // ⚠️ Việc load 100 courses ở đây gây ra hiển thị sai và xung đột với lazy load

  // ⭐ Load categories từ API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("📚 Loading categories from API...");
        const data = await categoryAPI.getAll();
        console.log("✅ Categories loaded:", data);
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: data });
      } catch (err) {
        console.error("❌ Failed to load categories:", err);
        // Fallback: Extract từ courses nếu API fail
        if (state.courses.length > 0) {
          const uniqueCategories = [
            ...new Set(state.courses.map((course) => course.categoryName)),
          ];
          const categories = uniqueCategories.map((name, index) => ({
            id: index + 1,
            name: name,
          }));
          console.log(
            "⚠️ Using fallback - categories from courses:",
            categories
          );
          dispatch({ type: actionTypes.SET_CATEGORIES, payload: categories });
        }
      }
    };

    loadCategories();
  }, []);

  // ⭐ Auto filter với useMemo và debounced search để tránh re-render không cần thiết
  const filteredCoursesResult = useMemo(() => {
    let filtered = state.courses;

    // Search - sử dụng debounced value để giảm số lần filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
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

    return filtered;
  }, [
    state.courses,
    debouncedSearchTerm,
    state.selectedCategory,
    state.selectedPriceRange,
  ]);

  // Cập nhật filteredCourses chỉ khi thực sự thay đổi
  useEffect(() => {
    dispatch({
      type: actionTypes.SET_FILTERED_COURSES,
      payload: filteredCoursesResult,
    });
  }, [filteredCoursesResult]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider
        value={{
          dispatch,
          actionTypes,
          resetUserData,
          syncUserData,
          ...cartActions,
          ...favoriteActions,
        }}
      >
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
};
