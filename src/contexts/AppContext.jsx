import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { courseAPI } from "../services/courseAPI";
import { categoryAPI } from "../services/categoryAPI";
import { setAppDispatchContext } from "./AuthContext";
import { cartAPI } from "../services/cartAPI";
import { favoriteAPI } from "../services/favoriteAPI";
import instance from "../services/axiosInstance";
import { useAuth } from "./AuthContext";

/**
 * ✅ REFACTORED AppContext
 * - Chỉ giữ state GLOBAL thực sự cần thiết
 * - KHÔNG lưu courses, filteredCourses (chuyển về Page level)
 * - Tách riêng StateContext và DispatchContext để tránh re-render cascade
 */

// ==================== INITIAL STATE ====================
const initialState = {
  // Global user data
  cart: [],
  favorites: [],
  purchasedCourses: [],
  viewHistory: [],

  // Categories (ít thay đổi)
  categories: [],

  // UI state
  showLoginPopup: false,

  // Filter preferences (global để share giữa các page)
  searchTerm: "",
  selectedCategory: "Tất cả",
  selectedPriceRange: { label: "Tất cả", min: 0, max: Infinity },
};

// ==================== ACTION TYPES ====================
const actionTypes = {
  // Cart
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  SET_CART: "SET_CART",
  REMOVE_MULTIPLE_FROM_CART: "REMOVE_MULTIPLE_FROM_CART",

  // Favorites
  ADD_TO_FAVORITES: "ADD_TO_FAVORITES",
  REMOVE_FROM_FAVORITES: "REMOVE_FROM_FAVORITES",
  SET_FAVORITES: "SET_FAVORITES",

  // Purchased
  SET_PURCHASED_COURSES: "SET_PURCHASED_COURSES",

  // View History
  ADD_TO_VIEW_HISTORY: "ADD_TO_VIEW_HISTORY",
  CLEAR_VIEW_HISTORY: "CLEAR_VIEW_HISTORY",

  // Categories
  SET_CATEGORIES: "SET_CATEGORIES",

  // Filter (global preferences)
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_CATEGORY: "SET_CATEGORY",
  SET_PRICE_RANGE: "SET_PRICE_RANGE",

  // UI
  SHOW_LOGIN_POPUP: "SHOW_LOGIN_POPUP",
  HIDE_LOGIN_POPUP: "HIDE_LOGIN_POPUP",

  // Auth
  RESET_USER_DATA: "RESET_USER_DATA",
};

// ==================== REDUCER ====================
const appReducer = (state, action) => {
  switch (action.type) {
    // Cart
    case actionTypes.ADD_TO_CART: {
      if (state.cart.includes(action.payload)) return state;
      const newCart = [...state.cart, action.payload];
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

    case actionTypes.REMOVE_FROM_CART: {
      const newCart = state.cart.filter((id) => id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

    case actionTypes.SET_CART:
      localStorage.setItem("cart", JSON.stringify(action.payload));
      return { ...state, cart: action.payload };

    case actionTypes.REMOVE_MULTIPLE_FROM_CART: {
      const newCart = state.cart.filter((id) => !action.payload.includes(id));
      localStorage.setItem("cart", JSON.stringify(newCart));
      return { ...state, cart: newCart };
    }

    // Favorites
    case actionTypes.ADD_TO_FAVORITES: {
      if (state.favorites.includes(action.payload)) return state;
      const newFav = [...state.favorites, action.payload];
      localStorage.setItem("favorites", JSON.stringify(newFav));
      return { ...state, favorites: newFav };
    }

    case actionTypes.REMOVE_FROM_FAVORITES: {
      const newFav = state.favorites.filter((id) => id !== action.payload);
      localStorage.setItem("favorites", JSON.stringify(newFav));
      return { ...state, favorites: newFav };
    }

    case actionTypes.SET_FAVORITES:
      localStorage.setItem("favorites", JSON.stringify(action.payload));
      return { ...state, favorites: action.payload };

    // Purchased
    case actionTypes.SET_PURCHASED_COURSES:
      localStorage.setItem("purchasedCourses", JSON.stringify(action.payload));
      return { ...state, purchasedCourses: action.payload };

    // View History
    case actionTypes.ADD_TO_VIEW_HISTORY: {
      const id = action.payload;
      const updated = [id, ...state.viewHistory.filter((i) => i !== id)].slice(
        0,
        10
      );
      localStorage.setItem("viewHistory", JSON.stringify(updated));
      return { ...state, viewHistory: updated };
    }

    case actionTypes.CLEAR_VIEW_HISTORY:
      localStorage.removeItem("viewHistory");
      return { ...state, viewHistory: [] };

    // Categories
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };

    // Filter preferences
    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };

    case actionTypes.SET_CATEGORY:
      return { ...state, selectedCategory: action.payload };

    case actionTypes.SET_PRICE_RANGE:
      return { ...state, selectedPriceRange: action.payload };

    // UI
    case actionTypes.SHOW_LOGIN_POPUP:
      return { ...state, showLoginPopup: true };

    case actionTypes.HIDE_LOGIN_POPUP:
      return { ...state, showLoginPopup: false };

    // Auth reset
    case actionTypes.RESET_USER_DATA:
      localStorage.removeItem("cart");
      localStorage.removeItem("favorites");
      localStorage.removeItem("viewHistory");
      localStorage.removeItem("purchasedCourses");
      return {
        ...state,
        cart: [],
        favorites: [],
        viewHistory: [],
        purchasedCourses: [],
      };

    default:
      return state;
  }
};

// ==================== CONTEXTS ====================
// Tách riêng để component chỉ subscribe cái cần
const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

// ==================== SELECTORS (tránh re-render) ====================
// Dùng để lấy subset của state
export const useCartIds = () => {
  const state = useContext(AppStateContext);
  return state?.cart ?? [];
};

export const useFavoriteIds = () => {
  const state = useContext(AppStateContext);
  return state?.favorites ?? [];
};

export const usePurchasedIds = () => {
  const state = useContext(AppStateContext);
  return state?.purchasedCourses ?? [];
};

export const useCategories = () => {
  const state = useContext(AppStateContext);
  return state?.categories ?? [];
};

export const useFilterPreferences = () => {
  const state = useContext(AppStateContext);
  return {
    searchTerm: state?.searchTerm ?? "",
    selectedCategory: state?.selectedCategory ?? "Tất cả",
    selectedPriceRange: state?.selectedPriceRange ?? {
      label: "Tất cả",
      min: 0,
      max: Infinity,
    },
  };
};

// ==================== HOOKS ====================
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error("useAppDispatch must be used within AppProvider");
  }
  return context;
};

// ==================== PROVIDER ====================
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    cart: JSON.parse(localStorage.getItem("cart") || "[]"),
    favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
    viewHistory: JSON.parse(localStorage.getItem("viewHistory") || "[]"),
    purchasedCourses: JSON.parse(
      localStorage.getItem("purchasedCourses") || "[]"
    ),
  });
  const { isLoggedIn } = useAuth();

  // ========== CART ACTIONS ==========
  const cartActions = useMemo(
    () => ({
      addToCart: async (courseId) => {
        // 🚨 FRONTEND GUARD – CHƯA LOGIN → KHÔNG GỌI API
        const isAuth =
          isLoggedIn || localStorage.getItem("isLoggedIn") === "true";

        if (!isAuth) {
          dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
          return { success: false, unauthorized: true };
        }

        try {
          const res = await cartAPI.createCartItem(courseId);

          // 🚨 PHÒNG HỜ TOKEN HẾT HẠN
          if (res?.unauthorized) {
            dispatch({ type: actionTypes.SHOW_LOGIN_POPUP });
            return { success: false, unauthorized: true };
          }

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
    [isLoggedIn, dispatch]
  );

  // ========== FAVORITE ACTIONS ==========
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

  // ========== USER DATA SYNC ==========
  const resetUserData = useCallback(() => {
    dispatch({ type: actionTypes.RESET_USER_DATA });
  }, []);

  const syncUserData = useCallback(async (tokenOverride = null) => {
    const token =
      tokenOverride ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      dispatch({ type: actionTypes.SET_CART, payload: [] });
      dispatch({ type: actionTypes.SET_FAVORITES, payload: [] });
      dispatch({ type: actionTypes.SET_PURCHASED_COURSES, payload: [] });
      return;
    }

    // ✅ Auto sync user data khi reload trang

    try {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const [favoriteRes, cartRes, purchasedRes] = await Promise.allSettled([
        favoriteAPI.getFavorites(),
        cartAPI.getCart(),
        courseAPI.getPurchasedCourses({ page: 1, pageSize: 9999 }),
      ]);

      // Cart
      if (cartRes.status === "fulfilled") {
        const raw = cartRes.value;
        const items = Array.isArray(raw) ? raw : raw?.items || [];
        const ids = items
          .map((item) => Number(item.courseId || item.id))
          .filter((id) => !isNaN(id));
        dispatch({ type: actionTypes.SET_CART, payload: ids });
      }

      // Favorites
      if (favoriteRes.status === "fulfilled") {
        const raw = favoriteRes.value;
        const items = Array.isArray(raw) ? raw : raw?.items || [];
        const ids = items
          .map((item) => Number(item.courseId || item.id))
          .filter((id) => !isNaN(id));
        dispatch({ type: actionTypes.SET_FAVORITES, payload: ids });
      }

      // Purchased
      if (purchasedRes.status === "fulfilled") {
        const raw = purchasedRes.value;
        const items = Array.isArray(raw) ? raw : raw?.items || [];
        const ids = items
          .map((item) => Number(item.courseId || item.id))
          .filter((id) => !isNaN(id));
        dispatch({ type: actionTypes.SET_PURCHASED_COURSES, payload: ids });
      }
    } catch (err) {
      console.error("Lỗi sync user data:", err);
    }
  }, []);

  // Set context cho Auth
  useEffect(() => {
    setAppDispatchContext({ resetUserData, syncUserData });
  }, [resetUserData, syncUserData]);

  const prevAuthStatusRef = useRef(isLoggedIn);

  /**
   * Keep UI state in sync with auth status.
   * - Khi đăng nhập thành công: ẩn popup yêu cầu đăng nhập + đồng bộ dữ liệu mới nhất
   * - Khi đăng xuất/unauthenticated: xóa sạch dữ liệu phụ thuộc user để tránh hiển thị “ảo”
   */
  useEffect(() => {
    if (isLoggedIn) {
      dispatch({ type: actionTypes.HIDE_LOGIN_POPUP });
      syncUserData();
    } else {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      // Nếu không còn token → chắc chắn reset local data để tránh “login ảo”
      if (!token) {
        dispatch({ type: actionTypes.RESET_USER_DATA });
      } else if (prevAuthStatusRef.current) {
        // Trường hợp vừa logout nhưng token vẫn còn (edge) → vẫn reset
        dispatch({ type: actionTypes.RESET_USER_DATA });
      }
    }

    prevAuthStatusRef.current = isLoggedIn;
  }, [isLoggedIn, syncUserData]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll();
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: data });
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);
  // ✅ Auto sync user data khi reload trang
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      syncUserData(token);
    }
  }, [syncUserData]);

  // ========== DISPATCH VALUE (stable reference) ==========
  const dispatchValue = useMemo(
    () => ({
      dispatch,
      actionTypes,
      resetUserData,
      syncUserData,
      ...cartActions,
      ...favoriteActions,
    }),
    [cartActions, favoriteActions, resetUserData, syncUserData]
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatchValue}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
