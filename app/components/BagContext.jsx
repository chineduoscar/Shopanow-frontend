"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";

const BagContext = createContext(null);

function getCart(data) {
  const cart = data?.data ?? data;
  if (!Array.isArray(cart?.items)) {
    throw new TypeError("Unexpected cart response from the server.");
  }
  return cart;
}

function getErrorMessage(error) {
  return getApiErrorMessage(error, "Could not update your bag. Please try again.");
}

export function BagProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const request = useCallback(
    (method, path, body) => {
      return axios({
        method,
        url: `/api/cart${path}`,
        ...(body ? { data: body } : {}),
      });
    },
    [],
  );

  const refreshCart = useCallback(async () => {
    setError("");
    try {
      const { data } = await request("get", "");
      setCart(getCart(data));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      throw requestError;
    }
  }, [request]);

  useEffect(() => {
    let cancelled = false;
    request("get", "")
      .then(({ data }) => {
        if (!cancelled) setCart(getCart(data));
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(getErrorMessage(requestError));
          console.error("Failed to load bag:", requestError);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [request]);

  const addToBag = useCallback(
    async (product, quantity = 1) => {
      try {
        const { data } = await request("post", "/items", {
          productId: product.id,
          quantity,
        });
        setCart(getCart(data));
        setError("");
        showToast(`Added "${product.name}" to your bag`);
        return true;
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        showToast(getErrorMessage(requestError));
        return false;
      }
    },
    [request, showToast],
  );

  const setQuantity = useCallback(
    async (productId, quantity) => {
      try {
        const { data } = await request("patch", `/items/${productId}`, {
          quantity,
        });
        setCart(getCart(data));
        setError("");
        return true;
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        showToast(getErrorMessage(requestError));
        return false;
      }
    },
    [request, showToast],
  );

  const removeFromBag = useCallback(
    async (productId) => {
      try {
        const { data } = await request("delete", `/items/${productId}`);
        setCart(getCart(data));
        setError("");
        return true;
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        showToast(getErrorMessage(requestError));
        return false;
      }
    },
    [request, showToast],
  );

  const clearBag = useCallback(async () => {
    try {
      const { data } = await request("delete", "");
      setCart(getCart(data));
      setError("");
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      showToast(getErrorMessage(requestError));
      return false;
    }
  }, [request, showToast]);

  const value = useMemo(
    () => ({
      items: cart.items,
      count: cart.totalItems,
      totalPrice: cart.totalPrice,
      loading,
      error,
      refreshCart,
      addToBag,
      setQuantity,
      removeFromBag,
      clearBag,
    }),
    [
      cart,
      loading,
      error,
      refreshCart,
      addToBag,
      setQuantity,
      removeFromBag,
      clearBag,
    ],
  );

  return (
    <BagContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] px-4 py-2.5 rounded-full text-[13px] shadow-xl animate-[fadeUp_.2s_ease]"
        >
          {toast}
        </div>
      )}
    </BagContext.Provider>
  );
}

export const useBag = () => {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside <BagProvider>");
  return ctx;
};
