"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getTokenExp } from "../lib/auth";

export default function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const exp = token && getTokenExp(token);
    if (!exp) return;

    const logout = () => {
      Cookies.remove("token");
      router.replace("/");
    };

    const ms = exp - Date.now();
    if (ms <= 0) return logout();

    const timer = window.setTimeout(logout, ms);
    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
