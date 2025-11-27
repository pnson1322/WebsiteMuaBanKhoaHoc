import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { courseAPI } from "../services/courseAPI"; // ⭐ Dùng API thật
import { setAppDispatchContext } from "./AuthContext";
import { cartAPI } from "../services/cartAPI";
import { favoriteAPI } from "../services/favoriteAPI";

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
          dispatch({ type: actionTypes.RESET_USER_DATA });
          return { success: true };
        } catch (error) {
          console.error("Lỗi làm trống giỏ:", error);
          return { success: false, error };
        }
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
