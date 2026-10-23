"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import ChatHeader from "../../../../components/ChatHeader";
import { useBag } from "../../../../components/BagContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PLACEHOLDER = "/placeholder-phone.svg";

const naira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const imageSrc = (img) =>
  !img ? PLACEHOLDER : img.startsWith("/") ? `${API}${img}` : img;

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToBag } = useBag();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/api/products/${id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (cancelled) return;
        setProduct(data.product || data);
        setStatus("ok");
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          Cookies.remove("token");
          router.replace("/login"); // change to your login route
          return;
        }
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const specs = product
    ? [
        ["Brand", product.brand],
        ["RAM", product.ram_gb && `${product.ram_gb}GB`],
        ["Storage", product.storage_gb && `${product.storage_gb}GB`],
        ["Battery", product.battery_mah && `${product.battery_mah}mAh`],
        ["Network", product.network],
        ["Rear camera", product.rear_camera],
      ].filter(([, v]) => v)
    : [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F4EE] dark:bg-[#0D110E] text-[#12201A] dark:text-[#F5F4EE] transition-colors">
      <ChatHeader started />

      <div className="w-full max-w-4xl mx-auto px-5 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#6B7269] dark:text-[#A3AAA4] hover:text-[#12201A] dark:hover:text-[#F5F4EE] mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {status === "loading" && (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#6B7269]" size={22} />
          </div>
        )}

        {status === "error" && (
          <p className="text-center py-24 text-[#6B7269] dark:text-[#A3AAA4]">
            Couldn&apos;t load this product.
          </p>
        )}

        {status === "ok" && product && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-[#E4E0D3] dark:border-white/10 h-80 md:h-105 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc(product.image)}
                alt={product.name}
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith(PLACEHOLDER))
                    e.currentTarget.src = PLACEHOLDER;
                }}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-[#6B7269] dark:text-[#8A9188] font-medium">
                  {product.brand}
                </div>
                <h1 className="text-3xl leading-tight mt-1">{product.name}</h1>
              </div>

              <div className="text-2xl font-semibold text-[#0D4633] dark:text-[#4ADE80]">
                {naira(product.price_ngn)}
              </div>

              {product.description && (
                <p className="text-[14.5px] leading-relaxed text-[#6B7269] dark:text-[#A3AAA4]">
                  {product.description}
                </p>
              )}

              <dl className="rounded-2xl border border-[#E4E0D3] dark:border-white/10 bg-white dark:bg-[#151B18] divide-y divide-[#E4E0D3] dark:divide-white/10">
                {specs.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 px-4 py-2.5 text-sm"
                  >
                    <dt className="text-[#6B7269] dark:text-[#A3AAA4]">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              <button
                onClick={() => addToBag(product)}
                className="flex items-center justify-center gap-1.5 bg-[#22C55E] text-black rounded-full px-5 py-3 text-sm font-medium hover:bg-[#16A34A] transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add to bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
