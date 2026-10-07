"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Sparkles, ShoppingBag } from "lucide-react";
import ChatDemo from "./ChatDemo";

// Change these to match your real routes
const SIGNUP = "/auth/register";
const LOGIN = "/auth/login";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Say what you need",
    text: "Share your budget, who it's for, or two phones to compare.",
  },
  {
    icon: Sparkles,
    title: "Get matched picks",
    text: "See phones that fit, with specs, prices in naira, and why.",
  },
  {
    icon: ShoppingBag,
    title: "Add to your bag",
    text: "Keep the ones you like and decide when you're ready.",
  },
];

const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] font-medium hover:bg-[#22C55E] dark:hover:bg-[#4ADE80] transition-colors";
const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-[#12201A]/25 dark:border-white/20 text-[#12201A] dark:text-[#F5F4EE] font-medium hover:border-[#22C55E] hover:text-[#22C55E] transition-colors";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F4EE] dark:bg-[#0D110E] text-[#12201A] dark:text-[#F5F4EE] transition-colors">
      {/* top bar */}
      <header className="max-w-5xl mx-auto flex items-center justify-between px-5 py-4">
        <Link href="/" aria-label="Shopanow home">
          <Image
            src="/logoname_light.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="w-32 h-auto object-contain dark:hidden"
            priority
          />
          <Image
            src="/logoname_dark.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="w-32 h-auto object-contain hidden dark:block"
            priority
          />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={LOGIN}
            className="text-[14px] px-3 py-2 hover:text-[#22C55E] transition-colors"
          >
            Log in
          </Link>
          <Link href={SIGNUP} className={`${primaryBtn} text-[14px] px-4 py-2`}>
            Create account
          </Link>
        </nav>
      </header>

      <main>
        {/* hero */}
        <section className="max-w-5xl mx-auto px-5 pt-12 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] m-0 max-w-2xl mx-auto">
            Find your next phone just by asking
          </h1>
          <p className="text-[#6B7269] dark:text-[#A3AAA4] text-base sm:text-lg mt-4 leading-relaxed max-w-xl mx-auto">
            Tell Shopanow your budget and what matters to you. Get phones that
            fit, with prices in naira.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link
              href={SIGNUP}
              className={`${primaryBtn} text-[15px] px-6 py-3`}
            >
              Create free account
            </Link>
            <Link
              href={LOGIN}
              className={`${outlineBtn} text-[15px] px-6 py-3`}
            >
              Log in
            </Link>
          </div>
        </section>

        {/* animated chat preview */}
        <section className="px-5 pb-16">
          <ChatDemo />
        </section>

        {/* how it works */}
        <section className="max-w-5xl mx-auto px-5 pb-16">
          <h2 className="text-2xl sm:text-3xl text-center m-0 mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl p-5"
              >
                <span className="w-10 h-10 rounded-full bg-[#22C55E]/15 text-[#0D4633] dark:text-[#4ADE80] flex items-center justify-center mb-3">
                  <Icon size={18} />
                </span>
                <h3 className="text-[16px] font-medium m-0">{title}</h3>
                <p className="text-[14px] text-[#6B7269] dark:text-[#A3AAA4] mt-1.5 mb-0 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* closing call to action */}
        <section className="max-w-5xl mx-auto px-5 pb-20 text-center">
          <h2 className="text-2xl sm:text-3xl m-0">
            Ready to find your phone?
          </h2>
          <Link
            href={SIGNUP}
            className={`${primaryBtn} text-[15px] px-6 py-3 mt-6`}
          >
            Create free account
          </Link>
          <p className="text-[13.5px] text-[#6B7269] dark:text-[#A3AAA4] mt-4">
            Already have an account?{" "}
            <Link href={LOGIN} className="underline hover:text-[#22C55E]">
              Log in
            </Link>
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E4E0D3] dark:border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-5 text-[13px] text-[#6B7269] dark:text-[#A3AAA4]">
          © {new Date().getFullYear()} Shopanow
        </div>
      </footer>
    </div>
  );
}
