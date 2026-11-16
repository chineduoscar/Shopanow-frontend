"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { API_URL } from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import ChatHeader from "../../../../components/ChatHeader";
import { useBag } from "../../../../components/BagContext";

const PLACEHOLDER = "/placeholder-phone.svg";

const naira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const imageSrc = (img) =>
  !img ? PLACEHOLDER : img.startsWith("/") ? `${API_URL}${img}` : img;

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToBag } = useBag();
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: response } = await axios.get(`/api/products/${id}`);
        if (cancelled) return;
        const data = response?.data ?? response;
        if (!data?.id || !data?.name) {
          throw new TypeError("Unexpected product response from the server.");
        }
        setLoadError("");
        setProduct(data);
        setStatus("ok");
      } catch (err) {
        if (cancelled) return;
        const message = getApiErrorMessage(err, "Could not load this product.");
        console.error("Failed to load product:", message);
        setLoadError(message);
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
        ["Screen", product.screen_size_in && `${product.screen_size_in} inches`],
        ["Display", product.display_type],
        ["Chipset", product.chipset],
        ["Battery", product.battery_mah && `${product.battery_mah}mAh`],
        ["Operating system", product.os],
        ["Release year", product.release_year],
        ["Network", product.network],
        ["Rear camera", product.rear_camera],
        ["Front camera", product.front_camera_mp && `${product.front_camera_mp}MP`],
      ].filter(([, v]) => v)
    : [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F4EE] dark:bg-[#0D110E] text-[#12201A] dark:text-[#F5F4EE] transition-colors">
      <ChatHeader started />

      <div className="w-full max-w-6xl mx-auto px-5 py-6">
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
          <p role="alert" className="text-center py-24 text-[#6B7269] dark:text-[#A3AAA4]">
            {loadError || "Could not load this product."}
          </p>
        )}

        {status === "ok" && product && (
          <div className="grid items-start md:grid-cols-2 gap-6 lg:gap-10">
            <div className="aspect-square w-full max-h-[34rem] bg-white dark:bg-[#151B18] rounded-2xl border border-[#E4E0D3] dark:border-white/10 flex items-center justify-center overflow-hidden p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc(product.image)}
                alt={product.name}
                loading="eager"
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith(PLACEHOLDER))
                    e.currentTarget.src = PLACEHOLDER;
                }}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-[#6B7269] dark:text-[#8A9188] font-medium">
                  {product.brand}
                </div>
                <h1 className="text-3xl sm:text-4xl leading-tight mt-1 font-semibold">
                  {product.name}
                </h1>
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
                onClick={() => void addToBag(product)}
                className="flex items-center justify-center gap-1.5 bg-[#22C55E] text-black rounded-full px-5 py-3.5 text-sm font-medium hover:bg-[#16A34A] transition-colors cursor-pointer"
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
