"use client";
import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useBag } from "./BagContext";

export default function ChatHeader({ started = false }) {
  const { openMobile } = useSidebar();
  const { count } = useBag();

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 shrink-0 ${
        started
          ? "border-b border-[#E4E0D3] dark:border-white/10"
          : "border-b border-transparent"
      }`}
    >
      <button
        onClick={openMobile}
        className="md:hidden text-[#12201A] dark:text-[#F5F4EE] p-1 -ml-1"
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={1.7} />
      </button>

      <Link
        href="/cart"
        aria-label={`Shopping bag${count ? `, ${count} items` : ""}`}
        className="relative p-1 ml-auto"
      >
        <ShoppingBag
          size={19}
          strokeWidth={1.7}
          className="text-[#12201A] dark:text-[#F5F4EE]"
        />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#F5B915] text-[#12201A] text-[10px] rounded-full min-w-3.75 h-3.75 flex items-center justify-center px-1 font-bold">
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}
