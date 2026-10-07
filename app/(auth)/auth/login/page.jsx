"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import ThemedImage from "@/app/components/ThemedImage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const inputClass =
  "w-full rounded-xl border border-[#E4E0D3] bg-white px-4 py-2.5 text-[14.5px] text-[#12201A] placeholder-[#6B7269] transition-colors focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 dark:border-white/10 dark:bg-[#0D110E] dark:text-[#F5F4EE]";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API}/auth/login`, form);

      Cookies.set("token", data.token, { expires: 7 });

      router.push(data.user?.role === "admin" ? "/admin" : "/chat");
      router.refresh();
    } catch (err) {
      setError(
        err.response
          ? err.response.data?.message || "Incorrect email or password."
          : "Can't reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4EE] px-5 py-12 text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
      <div className="w-full max-w-105">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5"
        >
          <ThemedImage
            light="/logoname_light.png"
            dark="/logoname_dark.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="w-35 h-auto object-contain"
            priority
          />
        </Link>

        <div className="rounded-2xl border border-[#E4E0D3] bg-white p-7 shadow-sm transition-colors dark:border-white/10 dark:bg-[#151B18] sm:p-8">
          <h1 className="m-0 text-[26px] font-semibold leading-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7269] dark:text-[#A3AAA4]">
            Log in to pick up where you left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-invalid={!!error}
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-[13px] font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#0D4633] hover:underline dark:text-[#4ADE80]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!error}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-[#F5F4EE]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#12201A] py-3 text-sm font-medium text-[#F5F4EE] transition-colors hover:bg-[#22C55E] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#22C55E] dark:text-[#0D110E] dark:hover:bg-[#4ADE80]"
            >
              {loading ? "Logging in..." : "Log in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">
            New to Shopanow?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#0D4633] hover:underline dark:text-[#4ADE80]"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
