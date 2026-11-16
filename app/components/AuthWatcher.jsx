"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getTokenExp } from "../lib/auth";

export default function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const expiresAt = token && getTokenExp(token);
    if (!expiresAt) return;
    const logout = () => {
      Cookies.remove("token", { path: "/" });
      router.replace("/auth/login");
    };
    const delay = expiresAt - Date.now();
    if (delay <= 0) return logout();
    const timer = window.setTimeout(logout, delay);
    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
