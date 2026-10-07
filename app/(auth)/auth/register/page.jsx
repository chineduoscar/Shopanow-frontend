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
  "w-full rounded-lg border border-[#E4E0D3] bg-white px-3.5 py-2 text-[14px] text-[#12201A] placeholder-[#6B7269] transition-colors focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 dark:border-white/10 dark:bg-[#0D110E] dark:text-[#F5F4EE]";

const labelClass = "mb-1 block text-xs font-medium";

/* Password box with its OWN show/hide button */
function PasswordField({ id, label, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          required
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={
            show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-[#F5F4EE]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords don't match.");
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API}/auth/register`, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (data.token) {
        Cookies.set("token", data.token, { expires: 7 });
        router.push(data.user?.role === "admin" ? "/admin" : "/chat");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(
        err.response
          ? err.response.data?.message ||
              "Couldn't create your account. Try again."
          : "Can't reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    form.fullName && form.email && form.password && form.confirmPassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4EE] px-4 py-6 text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-4 flex items-center justify-center gap-2">
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

        <div className="rounded-2xl border border-[#E4E0D3] bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-[#151B18] sm:p-6">
          <h1 className="m-0 text-xl font-semibold leading-tight">
            Create your account
          </h1>
          <p className="mt-1 text-[13px] leading-snug text-[#6B7269] dark:text-[#A3AAA4]">
            Tell Shopanow what you need and get picks made for you.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Ada Okafor"
                autoComplete="name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
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
                className={inputClass}
              />
            </div>

            {/* Side by side on tablet/desktop, stacked on phones */}
            <div className="grid gap-3 sm:grid-cols-2">
              <PasswordField
                id="password"
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="8+ characters"
              />
              <PasswordField
                id="confirmPassword"
                label="Confirm password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#12201A] py-2.5 text-sm font-medium text-[#F5F4EE] transition-colors hover:bg-[#22C55E] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#22C55E] dark:text-[#0D110E] dark:hover:bg-[#4ADE80]"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px] text-[#6B7269] dark:text-[#A3AAA4]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0D4633] hover:underline dark:text-[#4ADE80]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
