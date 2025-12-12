import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Custom hook cho infinite scroll - CHỈ dùng IntersectionObserver
 * Tránh double trigger, race condition
 */
export const useInfiniteScroll = ({
  loadMore,
  hasMore,
  isLoading,
  rootMargin = "200px",
}) => {
  const observerTarget = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // Guard: chỉ load khi thực sự cần
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          !loadingRef.current
        ) {
          loadingRef.current = true;

          Promise.resolve(loadMore()).finally(() => {
            // Delay nhỏ để tránh trigger liên tục
            setTimeout(() => {
              loadingRef.current = false;
            }, 100);
          });
        }
      },
      {
        threshold: 0,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMore, rootMargin]);

  return { observerTarget };
};

/**
 * Hook quản lý pagination state
 */
export const usePagination = (pageSize = 9) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadedPagesRef = useRef(new Set([1]));

  const reset = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadedPagesRef.current = new Set([1]);
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const next = prev + 1;
      // Tránh load trùng page
      if (loadedPagesRef.current.has(next)) {
        return prev;
      }
      loadedPagesRef.current.add(next);
      return next;
    });
  }, []);

  const updateHasMore = useCallback(
    (totalPages) => {
      setHasMore(currentPage < totalPages);
    },
    [currentPage]
  );

  return {
    currentPage,
    hasMore,
    isLoading,
    isLoadingMore,
    setIsLoading,
    setIsLoadingMore,
    setHasMore,
    reset,
    goToNextPage,
    updateHasMore,
    pageSize,
  };
};

export default useInfiniteScroll;
