"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/app/lib/api-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ThemeToggle from "../ThemeToggle";
import LogoutConfirmDialog from "../LogoutConfirmDialog";
import { getTokenName } from "@/app/lib/auth";
import { getApiErrorMessage } from "@/app/lib/api-error";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PackageCheck,
  X,
} from "lucide-react";

const navigation = [
  { href: "/dean/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: PackageCheck, countKey: "unfulfilledOrders" },
  { href: "/admin/products", label: "Products", Icon: Boxes },
  { href: "/admin/messages", label: "Contact messages", Icon: MessageSquareText, countKey: "unreadMessages" },
];

function NavigationLink({ item, pathname, counts, onNavigate }) {
  const active =
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`);
  const count = counts[item.countKey] || 0;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-[#22C55E]/15 font-semibold text-[#0D4633] dark:text-[#4ADE80]"
          : "text-[#56635B] hover:bg-black/5 dark:text-[#B1BBB4] dark:hover:bg-white/5"
      }`}
    >
      <span className="flex items-center gap-3">
        <item.Icon size={18} />
        {item.label}
      </span>
      {count > 0 && (
        <span className="min-w-5 rounded-full bg-[#22C55E] px-1.5 py-0.5 text-center text-[11px] font-bold text-[#0D110E]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState({});
  const [navigationError, setNavigationError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [name, setName] = useState("Administrator");

  const refreshCounts = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      setCounts(data?.data?.statistics || {});
      setNavigationError("");
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.replace("/auth/login");
      } else {
        const message = getApiErrorMessage(
          error,
          "Could not refresh admin navigation counts.",
        );
        setNavigationError(message);
        console.error("Could not refresh admin navigation counts:", message);
      }
    }
  }, [router]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setName(getTokenName(Cookies.get("token")) || "Administrator");
    });
    Promise.resolve().then(() => refreshCounts());
    const interval = window.setInterval(refreshCounts, 30000);
    return () => window.clearInterval(interval);
  }, [refreshCounts]);

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
          console.error("Could not log out cleanly:", error);
        });
    }
    Cookies.remove("token", { path: "/" });
    window.setTimeout(() => router.replace("/auth/login"), 250);
  };

  return (
    <div className="min-h-dvh bg-[#F5F4EE] text-[#12201A] dark:bg-[#0D110E] dark:text-[#F5F4EE] lg:flex">
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        loggingOut={loggingOut}
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={logout}
      />
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-[#E4E0D3] bg-white px-4 py-6 dark:border-white/10 dark:bg-[#151B18] lg:flex">
        <Link href="/dean/dashboard" className="mb-9 px-2 text-xl font-bold tracking-tight">
          Shopanow <span className="text-[#16A34A]">Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => (
            <NavigationLink key={item.href} {...{ item, pathname, counts }} />
          ))}
        </nav>
        <div className="border-t border-[#E4E0D3] pt-4 dark:border-white/10">
          <div className="mb-3 flex min-w-0 items-center gap-2 px-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5B915] text-xs font-bold text-[#12201A]">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-xs text-[#6B7269] dark:text-[#A3AAA4]" title={name}>
              {name}
            </span>
          </div>
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-xs text-[#6B7269] dark:text-[#A3AAA4]">Appearance</span>
            <ThemeToggle />
          </div>
          <button onClick={() => setLogoutDialogOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-300">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E4E0D3] bg-[#F5F4EE]/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0D110E]/95 lg:hidden">
          <Link href="/dean/dashboard" className="font-bold">
            Shopanow <span className="text-[#16A34A]">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {menuOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setMenuOpen(false)}>
            <nav
              aria-label="Admin navigation"
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-14 w-[min(20rem,90vw)] space-y-1 rounded-bl-2xl border border-[#E4E0D3] bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#151B18]"
            >
              <div className="mb-3 flex min-w-0 items-center gap-2 border-b border-[#E4E0D3] px-3 pb-3 dark:border-white/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5B915] text-xs font-bold text-[#12201A]">
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate text-xs text-[#6B7269] dark:text-[#A3AAA4]" title={name}>
                  {name}
                </span>
              </div>
              {navigation.map((item) => (
                <NavigationLink
                  key={item.href}
                  {...{ item, pathname, counts }}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-[#6B7269] dark:text-[#A3AAA4]">Appearance</span>
                <ThemeToggle />
              </div>
              <button onClick={() => setLogoutDialogOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-300">
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
        )}
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {navigationError && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              {navigationError}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
