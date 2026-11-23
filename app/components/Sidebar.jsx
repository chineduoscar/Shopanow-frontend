"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "@/app/lib/api-client";
import Cookies from "js-cookie";
import {
  SquarePen,
  Cloud,
  FolderPlus,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  X,
  Loader2,
  PackageCheck,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSidebar } from "./SidebarContext";
import ThemedImage from "./ThemedImage";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { getTokenName } from "../lib/auth";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("User");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const params = useParams();
  // the URL decides the active chat: /chat/<id> -> id, /chat -> null
  const activeId = params?.id?.[0] ?? null;
  const {
    mobileOpen,
    closeMobile,
    conversations,
    conversationsLoading,
    conversationsError,
    clearAll,
  } = useSidebar();

  useEffect(() => {
    Promise.resolve().then(() => {
      setUserName(getTokenName(Cookies.get("token")) || "User");
    });
  }, []);

  const logout = () => {
    setLoggingOut(true);
    const token = Cookies.get("token");
    if (token) {
      axios
        .post(
          "/api/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .catch((error) => {
          console.error("Failed to end the session:", error);
        });
    }
    Cookies.remove("token", { path: "/" });
    clearAll();
    closeMobile();
    window.setTimeout(() => router.replace("/auth/login"), 250);
  };

  return (
    <>
      {/* Backdrop — mobile only, shown while drawer is open */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true"
        />
      )}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        loggingOut={loggingOut}
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={logout}
      />

      {/* Compact desktop rail — only when collapsed, desktop only, never on mobile */}
      {collapsed && (
        <div className="hidden md:flex w-14 h-dvh bg-[#fefafa] dark:bg-[#151B18] flex-col items-center py-4 gap-4 shrink-0 transition-colors">
          <Image
            src="/logo.png"
            alt="Shopanow"
            width={28}
            height={20}
            className="rounded-lg object-contain"
          />
          <button
            onClick={() => setCollapsed(false)}
            className="text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-white p-2 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft size={18} />
          </button>
        </div>
      )}

      {/* Full sidebar — normal flow on desktop (unless collapsed), fixed slide-in drawer on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          ${collapsed ? "md:hidden" : "md:static md:z-auto md:flex"}
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          flex flex-col shrink-0 h-dvh
          bg-[#fefafa] dark:bg-[#151B18] border-r border-[#E4E0D3] dark:border-transparent
        `}
      >
        {/* Brand + close (mobile) / collapse (desktop) */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <ThemedImage
            light="/logoname_light.png"
            dark="/logoname_dark.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="w-35 h-auto object-contain"
            priority
          />

          {/* Mobile: close drawer */}
          <button
            onClick={closeMobile}
            className="md:hidden text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-white p-1.5 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          {/* Desktop: collapse sidebar */}
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:inline-flex text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-white p-1.5 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={() => {
              router.push("/chat");
              closeMobile();
            }}
            className="w-full flex items-center gap-2 text-[13.5px] font-medium text-[#0D4633] dark:text-white bg-[#22C55E]/10 dark:bg-[#22C55E]/15 border border-[#22C55E]/30 rounded-lg px-3 py-2.5 hover:bg-[#22C55E]/20 dark:hover:bg-[#22C55E]/25 transition-colors cursor-pointer"
          >
            <SquarePen size={16} className="text-[#22C55E]" />
            New search
          </button>
        </div>

        <nav className="px-3 pt-3 flex flex-col gap-0.5">
          <button className="flex items-center gap-2.5 text-[13.5px] text-[#12201A] dark:text-[#D5D9D6] px-2.5 py-2 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <Cloud size={15} className="text-[#6B7269] dark:text-[#A3AAA4]" />{" "}
            Deals
          </button>
          <button className="flex items-center gap-2.5 text-[13.5px] text-[#12201A] dark:text-[#D5D9D6] px-2.5 py-2 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <FolderPlus
              size={15}
              className="text-[#6B7269] dark:text-[#A3AAA4]"
            />{" "}
            Wishlists
          </button>
          <button
            onClick={() => {
              router.push("/orders");
              closeMobile();
            }}
            className="flex items-center gap-2.5 text-[13.5px] text-[#12201A] dark:text-[#D5D9D6] px-2.5 py-2 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <PackageCheck
              size={15}
              className="text-[#6B7269] dark:text-[#A3AAA4]"
            />
            My orders
          </button>
        </nav>

        <div className="px-4 pt-6 pb-2 text-[11px] uppercase tracking-wide text-[#6B7269] dark:text-[#6B7269] font-medium">
          Recent
        </div>
        <div className="min-h-0 flex-1 overflow-y-scroll px-2 flex flex-col gap-0.5">
          {conversationsError && (
            <p
              role="alert"
              className="px-2.5 py-2 text-xs text-red-600 dark:text-red-300"
            >
              {conversationsError}
            </p>
          )}
          {conversationsLoading ? (
            <div className="px-2.5 py-2">
              <Loader2
                size={14}
                strokeWidth={1.8}
                aria-label="Loading chats"
                className="animate-spin text-[#6B7269] dark:text-[#A3AAA4]"
              />
            </div>
          ) : conversations.length === 0 && !conversationsError ? (
            <p className="px-2.5 py-2 text-[12.5px] text-[#6B7269]">
              No chats yet
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  router.push(`/chat/${c.id}`);
                  closeMobile();
                }}
                className={`shrink-0 text-left text-[13px] px-2.5 py-2 rounded-md transition-colors truncate cursor-pointer hover:bg-[#12201A]/5 dark:hover:bg-white/5 hover:text-[#12201A] dark:hover:text-white ${
                  activeId === c.id
                    ? "bg-[#12201A]/5 dark:bg-white/10 text-[#12201A] dark:text-white"
                    : "text-[#6B7269] dark:text-[#A3AAA4]"
                }`}
              >
                {c.title ?? "New chat"}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-[#E4E0D3] p-3 dark:border-white/5">
          <div className="mb-3 flex min-w-0 items-center gap-2 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5B915] text-xs font-bold text-[#12201A]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span
              className="truncate text-xs text-[#6B7269] dark:text-[#A3AAA4]"
              title={userName}
            >
              {userName}
            </span>
          </div>
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs text-[#6B7269] dark:text-[#A3AAA4]">
              Appearance
            </span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-300"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
