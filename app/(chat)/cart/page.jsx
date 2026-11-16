"use client";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import ChatHeader from "../../components/ChatHeader";
import { useBag } from "../../components/BagContext";

const PLACEHOLDER = "/placeholder-phone.svg";
const naira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function CartPage() {
  const {
    items,
    count,
    totalPrice,
    loading,
    error,
    setQuantity,
    removeFromBag,
  } = useBag();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F5F4EE] text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
      <ChatHeader started />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-7">
        <Link
          href="/chat"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Continue shopping
        </Link>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Your bag</h1>
            <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">
            Loading your bag…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-[#E4E0D3] bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#151B18]">
            <ShoppingBag className="mx-auto mb-4 text-[#6B7269]" size={32} />
            <h2 className="text-lg font-medium">Your bag is empty</h2>
            <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              Add a phone you like and it will appear here.
            </p>
            <Link
              href="/chat"
              className="mt-5 inline-flex rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-medium text-[#0D110E] hover:bg-[#16A34A]"
            >
              Find a phone
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
            <section className="divide-y divide-[#E4E0D3] rounded-2xl border border-[#E4E0D3] bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-[#151B18]">
              {items.map((item) => {
                const product = item.product;
                const productId = product?.id ?? item.productId;
                return (
                  <article
                    key={productId}
                    className="flex gap-4 py-4 sm:gap-5"
                  >
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#F5F4EE] p-2 dark:bg-[#0D110E]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product?.image || PLACEHOLDER}
                        alt={product?.name || "Unavailable product"}
                        onError={(event) => {
                          if (!event.currentTarget.src.endsWith(PLACEHOLDER)) {
                            event.currentTarget.src = PLACEHOLDER;
                          }
                        }}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <p className="text-xs text-[#6B7269] dark:text-[#A3AAA4]">
                          {product?.brand || "Product unavailable"}
                        </p>
                        <h2 className="truncate font-medium">
                          {product?.name || `Product #${productId}`}
                        </h2>
                        {product && (
                          <p className="mt-1 text-sm font-medium text-[#0D4633] dark:text-[#4ADE80]">
                            {naira(product.price_ngn)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex items-center rounded-full border border-[#E4E0D3] dark:border-white/10">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity === 1
                                ? void removeFromBag(productId)
                                : void setQuantity(productId, item.quantity - 1)
                            }
                            aria-label={`Decrease quantity of ${product?.name || "item"}`}
                            className="p-2.5 text-[#6B7269] hover:text-[#12201A] dark:hover:text-white"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void setQuantity(productId, item.quantity + 1)
                            }
                            aria-label={`Increase quantity of ${product?.name || "item"}`}
                            className="p-2.5 text-[#6B7269] hover:text-[#12201A] dark:hover:text-white"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeFromBag(productId)}
                          aria-label={`Remove ${product?.name || "item"} from bag`}
                          className="p-2 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-4 flex justify-between text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                <span>Subtotal</span>
                <span>{naira(totalPrice)}</span>
              </div>
              <div className="mt-4 border-t border-[#E4E0D3] pt-4 dark:border-white/10">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{naira(totalPrice)}</span>
                </div>
                <p className="mt-2 text-xs text-[#6B7269] dark:text-[#A3AAA4]">
                  Delivery details are collected at checkout.
                </p>
              </div>
              <Link
                href="/checkout"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[#22C55E] px-5 py-3 text-sm font-semibold text-[#0D110E] transition-colors hover:bg-[#16A34A]"
              >
                Continue to checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
