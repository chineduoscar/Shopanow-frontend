"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dateTime, ErrorPanel, LoadingPanel, naira, PageHeading, StatusPill } from "./AdminShared";

const statuses = ["pending", "processing", "completed", "delivered", "cancelled"];

export default function OrderDetailPage({ id }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await axios.get(`/api/admin/orders/${id}`);
      setOrder(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load this order."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const updateStatus = async (orderStatus) => {
    setSaving(true);
    setError("");
    try {
      const { data } = await axios.patch(`/api/admin/orders/${id}`, { orderStatus });
      setOrder(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not update order status."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-white">
        <ArrowLeft size={16} /> Back to orders
      </Link>
      {error && <div className="mb-5"><ErrorPanel message={error} onRetry={() => void load()} /></div>}
      {loading ? <LoadingPanel label="Loading order" /> : order ? (
        <>
          <PageHeading
            title={`Order #${order.id.slice(-8)}`}
            description={`Placed ${dateTime(order.createdAt)}`}
            action={<div className="flex flex-wrap items-center gap-2"><StatusPill value={order.paymentStatus} /><StatusPill value={order.orderStatus} /></div>}
          />
          <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
            <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
              <h2 className="font-semibold">Items ordered</h2>
              <ul className="mt-4 divide-y divide-[#E4E0D3] dark:divide-white/10">
                {order.items.map((item, index) => (
                  <li key={`${item.productId}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="shrink-0 font-medium">{naira(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-[#E4E0D3] pt-4 font-semibold dark:border-white/10">
                <span>Total amount</span><span>{naira(order.totalAmount)}</span>
              </div>
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                <h2 className="font-semibold">Customer</h2>
                <p className="mt-3 text-sm font-medium">{order.customer?.fullName || order.fullName}</p>
                <p className="mt-1 break-all text-sm text-[#6B7269] dark:text-[#A3AAA4]">{order.customer?.email}</p>
                <p className="mt-3 text-sm">{order.phoneNumber}</p>
                <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                  {order.deliveryAddress}, {order.city}, {order.state}, {order.country}
                </p>
                {order.deliveryInstructions && <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">Note: {order.deliveryInstructions}</p>}
              </section>
              <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                <label htmlFor="order-status" className="block text-sm font-semibold">Fulfillment status</label>
                <select
                  id="order-status"
                  value={order.orderStatus}
                  disabled={saving}
                  onChange={(event) => void updateStatus(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-[#E4E0D3] bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#0D110E]"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                </select>
                <p className="mt-2 text-xs text-[#6B7269] dark:text-[#A3AAA4]">Changes are saved to the order record immediately.</p>
              </section>
              <section className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-5">
                <h2 className="font-semibold">Delivery verification code</h2>
                {order.deliveryCode ? (
                  <>
                    <p className="mt-3 font-mono text-3xl font-bold tracking-[0.25em] text-[#0D4633] dark:text-[#4ADE80]">
                      {order.deliveryCode}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#56635B] dark:text-[#B1BBB4]">
                      Share this code with the rider. The rider should verify it
                      with the customer at handover.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                    This code is available after payment is confirmed.
                  </p>
                )}
              </section>
              {order.rating && (
                <section className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                  <h2 className="font-semibold">Shopanow experience feedback</h2>
                  <p className="mt-2 text-amber-500" aria-label={`${order.rating} out of 5 stars`}>
                    {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}
                    <span className="ml-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                      {order.rating}/5
                    </span>
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
    </>
  );
}
