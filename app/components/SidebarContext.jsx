"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios, { API_URL } from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";

const API = API_URL;

const SidebarContext = createContext(null);

function getConversations(data) {
  const conversations = [
    data,
    data?.conversations,
    data?.data,
    data?.data?.conversations,
  ].find(Array.isArray);

  if (!conversations) {
    throw new TypeError("Expected the conversations API response to contain an array.");
  }

  return conversations;
}

export function SidebarProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationsError, setConversationsError] = useState("");
  // true until the first fetch finishes (success or failure)
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // manual refresh: called from ChatHome after each send (no spinner, list stays visible)
  const refreshConversations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/conversations`);
      setConversations(getConversations(data));
      setConversationsError("");
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load conversation history.");
      setConversationsError(message);
      console.error("Failed to load conversations:", message);
    }
  }, []);

  // initial load when the layout mounts
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/api/conversations`)
      .then(({ data }) => {
        if (!cancelled) {
          setConversations(getConversations(data));
          setConversationsError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          const message = getApiErrorMessage(
            error,
            "Could not load conversation history.",
          );
          setConversationsError(message);
          console.error("Failed to load conversations:", message);
        }
      })
      .finally(() => {
        if (!cancelled) setConversationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // used on logout so the next user doesn't see this user's chats
  const clearAll = useCallback(() => {
    setConversations([]);
    setConversationsError("");
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
        toggleMobile: () => setMobileOpen((v) => !v),

        conversations,
        conversationsLoading,
        conversationsError,
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
