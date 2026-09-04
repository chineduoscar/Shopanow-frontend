"use client";
import { useState } from "react";
import Image from "next/image";
import {
  SquarePen,
  Cloud,
  FolderPlus,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSidebar } from "./SidebarContext";

const RECENT = [
  "Gift ideas for wife",
  "Phones under 200k",
  "Best laptop deals",
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, closeMobile } = useSidebar();

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
        {/* Brand + mobile close button */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Image
            src="/logoname.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="object-contain"
            priority
          />
          <button
            onClick={closeMobile}
            className="md:hidden text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-white p-1.5 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={() => window.location.reload()}
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
        </nav>

        <div className="px-4 pt-6 pb-2 text-[11px] uppercase tracking-wide text-[#6B7269] dark:text-[#6B7269] font-medium">
          Recent
        </div>
        <div className="flex-1 overflow-hidden px-2 flex flex-col gap-0.5">
          {RECENT.map((r) => (
            <button
              key={r}
              className="text-left text-[13px] text-[#6B7269] dark:text-[#A3AAA4] px-2.5 py-2 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 hover:text-[#12201A] dark:hover:text-white transition-colors truncate cursor-pointer"
            >
              {r}
            </button>
          ))}
        </div>

        {/* Appearance */}
        <div className="px-4 pt-2 pb-1 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wide text-[#6B7269] font-medium">
            Appearance
          </span>
          <ThemeToggle />
        </div>

        <div className="p-3 border-t border-[#E4E0D3] dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#F5B915] flex items-center justify-center text-[11px] font-bold text-[#12201A]">
              S
            </div>
            <span className="text-[12.5px] text-[#12201A] dark:text-[#D5D9D6]">
              Shopper
            </span>
          </div>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:inline-flex text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-white p-1.5 rounded-md hover:bg-[#12201A]/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
