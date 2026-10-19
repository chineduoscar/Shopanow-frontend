"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  // true until the first fetch finishes (success or failure)
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // manual refresh: called from ChatHome after each send (no spinner, list stays visible)
  const refreshConversations = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const { data } = await axios.get(`${API}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data);
    } catch {
      /* ignore: the sidebar just stays as it was */
    }
  }, []);

  // initial load when the layout mounts
  useEffect(() => {
    let cancelled = false;
    const token = Cookies.get("token");

    axios
      .get(`${API}/api/conversations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(({ data }) => {
        if (!cancelled) setConversations(data);
      })
      .catch(() => {
        /* ignore: the sidebar just stays empty */
      })
      .finally(() => {
        if (!cancelled) setConversationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // used on logout so the next user doesn't see this user's chats
  const clearAll = useCallback(() => setConversations([]), []);

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
        toggleMobile: () => setMobileOpen((v) => !v),

        conversations,
        conversationsLoading,
        refreshConversations,
        clearAll,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
