"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import { ArrowLeft, Loader2, RefreshCw, Star } from "lucide-react";
import ChatHeader from "./ChatHeader";

const naira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusClass = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  completed: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  delivered: "bg-[#22C55E]/15 text-[#0D4633] dark:text-[#4ADE80]",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-300",
};

function StatusBadge({ value }) {
  const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        statusClass[value] || statusClass.pending
      }`}
    >
      {label}
    </span>
  );
}

export default function OrderDetailPage({ id }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [remark, setRemark] = useState("");
  const [savingRating, setSavingRating] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSaved, setRatingSaved] = useState(false);

  const loadOrder = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { data: response } = await axios.get(`/api/orders/${id}`);
      const result = response?.data ?? response;
      if (!result?.id) {
        throw new TypeError("Unexpected order response from the server.");
      }
      setOrder(result);
      setRating(result.rating || 0);
      setRemark(result.ratingRemark || "");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load this order."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => loadOrder());
  }, [loadOrder]);

  const submitRating = async (event) => {
    event.preventDefault();
    if (savingRating || rating < 1 || rating > 5) return;
    setSavingRating(true);
    setRatingError("");
    setRatingSaved(false);
    try {
      const { data: response } = await axios.post(`/api/orders/${id}/rating`, {
        rating,
        remark,
      });
      const result = response?.data ?? response;
      setOrder((current) =>
        current
          ? {
              ...current,
              rating: result.rating,
              ratingRemark: result.remark,
            }
          : current,
      );
      setRatingSaved(true);
    } catch (requestError) {
      setRatingError(
        getApiErrorMessage(requestError, "Could not save your feedback."),
      );
    } finally {
      setSavingRating(false);
    }
  };

  const orderDate = order?.createdAt ? new Date(order.createdAt) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F5F4EE] text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
      <ChatHeader started />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-7">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to orders
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2
              className="animate-spin text-[#6B7269] dark:text-[#A3AAA4]"
              size={24}
              aria-label="Loading order"
            />
          </div>
        ) : error ? (
          <section
            role="alert"
            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadOrder()}
              className="mt-4 inline-flex items-center gap-2 underline"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </section>
        ) : order ? (
          <>
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold">Order #{order.id}</h1>
                <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                  {orderDate && !Number.isNaN(orderDate.getTime())
                    ? `Placed ${orderDate.toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}`
                    : "Order date unavailable"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={order.paymentStatus} />
                <StatusBadge value={order.orderStatus} />
              </div>
            </header>

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-5">
                {order.paymentStatus === "paid" && order.deliveryCode ? (
                  <section className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-5 text-center">
                    <h2 className="font-semibold">Your delivery verification code</h2>
                    <p className="mt-3 font-mono text-4xl font-bold tracking-[0.3em] text-[#0D4633] dark:text-[#4ADE80]">
                      {order.deliveryCode}
                    </p>
                    <p className="mx-auto mt-3 max-w-lg text-sm text-[#56635B] dark:text-[#B1BBB4]">
                      Only give this code to the rider when your order arrives
                      and you are ready to receive it. Never share it in advance.
                    </p>
                  </section>
                ) : (
                  <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                    Your delivery verification code will appear here after your
                    payment is confirmed.
                  </section>
                )}

                <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                  <h2 className="font-semibold">Items ordered</h2>
                  <ul className="mt-4 divide-y divide-[#E4E0D3] dark:divide-white/10">
                    {(order.items || []).map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-4 py-3 text-sm"
                      >
                        <span className="text-[#56635B] dark:text-[#B1BBB4]">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="shrink-0">
                          {naira(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between border-t border-[#E4E0D3] pt-4 font-semibold dark:border-white/10">
                    <span>Total</span>
                    <span>{naira(order.totalAmount)}</span>
                  </div>
                </section>

                {order.orderStatus === "delivered" && (
                  <section
                    id="rating"
                    className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]"
                  >
                    <h2 className="font-semibold">Rate your Shopanow experience</h2>
                    <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                      Your feedback helps us improve the app and our service.
                    </p>
                    <form onSubmit={submitRating} className="mt-4 space-y-4">
                      <div
                        role="group"
                        aria-label="Choose a rating from 1 to 5 stars"
                        className="flex gap-1"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            aria-label={`${value} star${value === 1 ? "" : "s"}`}
                            aria-pressed={rating === value}
                            className="rounded-md p-1 text-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22C55E]"
                          >
                            <Star
                              size={27}
                              fill={value <= rating ? "currentColor" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                      <label className="block text-sm font-medium">
                        Remark <span className="font-normal text-[#6B7269]">(optional)</span>
                        <textarea
                          value={remark}
                          onChange={(event) => setRemark(event.target.value)}
                          maxLength={1000}
                          rows={3}
                          placeholder="Tell us what went well or what we can improve."
                          className="mt-1 w-full rounded-xl border border-[#E4E0D3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#22C55E] dark:border-white/10 dark:bg-[#0D110E]"
                        />
                      </label>
                      {ratingError && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
                          {ratingError}
                        </p>
                      )}
                      {ratingSaved && (
                        <p role="status" className="text-sm text-[#0D4633] dark:text-[#4ADE80]">
                          Thanks. Your feedback has been saved.
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={savingRating || rating < 1}
                        className="inline-flex items-center gap-2 rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-[#0D110E] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingRating && <Loader2 size={15} className="animate-spin" />}
                        {order.rating ? "Update feedback" : "Submit feedback"}
                      </button>
                    </form>
                  </section>
                )}
              </div>

              <aside className="space-y-5">
                <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                  <h2 className="font-semibold">Delivery details</h2>
                  <p className="mt-3 text-sm font-medium">{order.fullName}</p>
                  <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                    {order.deliveryAddress}
                    <br />
                    {[order.city, order.state, order.country]
                      .filter(Boolean)
                      .join(", ")}
                    <br />
                    {order.phoneNumber}
                  </p>
                  {order.deliveryInstructions && (
                    <p className="mt-3 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                      <strong>Instructions:</strong> {order.deliveryInstructions}
                    </p>
                  )}
                </section>
                {order.rating && (
                  <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                    <h2 className="font-semibold">Your feedback</h2>
                    <p className="mt-2 text-amber-500" aria-label={`${order.rating} out of 5 stars`}>
                      {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}
                    </p>
                    {order.ratingRemark && (
                      <p className="mt-2 break-words text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                        {order.ratingRemark}
                      </p>
                    )}
                  </section>
                )}
              </aside>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
