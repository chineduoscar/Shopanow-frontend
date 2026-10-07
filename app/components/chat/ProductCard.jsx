"use client";
import React from "react";
import { Plus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PLACEHOLDER = "/placeholder-phone.svg"; // lives in your Next.js /public folder

const naira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

// Backend gives paths like "/images/x.jpg" (served by Express) or full URLs.
const imageSrc = (img) =>
  !img ? PLACEHOLDER : img.startsWith("/") ? `${API}${img}` : img;

/* ---------------------------------------------------------
   Product card (data comes from the backend)
--------------------------------------------------------- */
export default function ProductCard({ product, onAdd }) {
  const specs = [
    product.ram_gb && `${product.ram_gb}GB RAM`,
    product.storage_gb && `${product.storage_gb}GB`,
    product.battery_mah && `${product.battery_mah}mAh`,
    product.network,
    product.rear_camera && product.rear_camera.split("+")[0].trim(),
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl overflow-hidden flex flex-col min-w-0 shadow-sm transition-colors">
      <div className="bg-white h-56 sm:h-60 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc(product.image)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(PLACEHOLDER))
              e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <div className="text-[10.5px] tracking-wide text-[#6B7269] dark:text-[#8A9188] uppercase font-medium">
            {product.brand}
          </div>
          <div className="text-[16px] text-[#12201A] dark:text-[#F5F4EE] leading-tight mt-0.5 font-medium">
            {product.name}
          </div>
          {product.reason && (
            <div className="text-[12.5px] text-[#6B7269] dark:text-[#A3AAA4] mt-1 leading-snug">
              {product.reason}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <span
              key={s}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[#22C55E]/12 text-[#0D4633] dark:bg-[#22C55E]/20 dark:text-[#4ADE80]"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#E4E0D3]/60 dark:border-white/10">
          <span className="text-[15.5px] text-[#0D4633] dark:text-[#4ADE80] font-semibold">
            {naira(product.price_ngn)}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="flex items-center gap-1 bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#22C55E] dark:hover:bg-[#4ADE80] transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
