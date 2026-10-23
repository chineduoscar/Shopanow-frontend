"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

const BagContext = createContext(null);
const STORAGE_KEY = "shopanow_bag";
const EMPTY = []; // stable reference, required by useSyncExternalStore

/* ---------- tiny localStorage-backed store ---------- */
let cache = null; // null = not read yet
const listeners = new Set();

function getSnapshot() {
  if (cache !== null) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function getServerSnapshot() {
  return EMPTY;
}

function setItems(next) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);

  // keep other browser tabs in sync
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null; // force a re-read
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---------- provider ---------- */
export function BagProvider({ children }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  const addToBag = useCallback(
    (product) => {
      const prev = getSnapshot();
      const found = prev.find((i) => i.id === product.id);

      setItems(
        found
          ? prev.map((i) =>
              i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
            )
          : [
              ...prev,
              {
                id: product.id,
                name: product.name,
                brand: product.brand,
                price_ngn: product.price_ngn,
                image: product.image,
                qty: 1,
              },
            ],
      );
      showToast(`Added "${product.name}" to your bag`);
    },
    [showToast],
  );

  const removeFromBag = useCallback((id) => {
    setItems(getSnapshot().filter((i) => i.id !== id));
  }, []);

  const clearBag = useCallback(() => setItems(EMPTY), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, count, addToBag, removeFromBag, clearBag }),
    [items, count, addToBag, removeFromBag, clearBag],
  );

  return (
    <BagContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] px-4 py-2.5 rounded-full text-[13px] shadow-xl animate-[fadeUp_.2s_ease]">
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
