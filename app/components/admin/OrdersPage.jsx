"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { dateTime, ErrorPanel, LoadingPanel, naira, PageHeading, StatusPill } from "./AdminShared";

const statuses = ["pending", "processing", "completed", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await axios.get("/api/admin/orders");
      setOrders(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const updateStatus = async (order, orderStatus) => {
    setSavingId(order.id);
    setError("");
    try {
      const { data } = await axios.patch(`/api/admin/orders/${order.id}`, { orderStatus });
      setOrders((current) => current.map((item) => item.id === order.id ? data.data : item));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not update order status."));
    } finally {
      setSavingId("");
    }
  };

  const visibleOrders = filter === "all" ? orders : orders.filter((order) => order.orderStatus === filter);

  return (
    <>
      <PageHeading title="Orders" description="Review customer purchases and update fulfillment." />
      {error && <div className="mb-5"><ErrorPanel message={error} onRetry={() => void load()} /></div>}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter orders by status">
        {["all", ...statuses].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            aria-pressed={filter === status}
            className={`rounded-full border px-3.5 py-2 text-xs font-medium ${
              filter === status
                ? "border-[#12201A] bg-[#12201A] text-white dark:border-[#22C55E] dark:bg-[#22C55E] dark:text-[#0D110E]"
                : "border-[#E4E0D3] bg-white hover:border-[#22C55E] dark:border-white/10 dark:bg-[#151B18]"
            }`}
          >
            {status === "all" ? "All orders" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <LoadingPanel label="Loading orders" /> : (
        <section className="overflow-hidden rounded-2xl border border-[#E4E0D3] bg-white dark:border-white/10 dark:bg-[#151B18]">
          {!visibleOrders.length ? (
            <p className="px-5 py-14 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">No orders match this filter.</p>
          ) : (
            <div className="divide-y divide-[#E4E0D3] dark:divide-white/10">
              {visibleOrders.map((order) => (
                <article key={order.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.1fr_1.5fr_auto] lg:items-center">
                  <div>
                    <p className="font-medium">{order.customer?.fullName || order.fullName}</p>
                    <p className="mt-0.5 text-xs text-[#6B7269] dark:text-[#A3AAA4]">{order.customer?.email || "Customer"} · {dateTime(order.createdAt)}</p>
                    <p className="mt-1 text-xs text-[#6B7269] dark:text-[#A3AAA4]">Order #{order.id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#56635B] dark:text-[#B1BBB4]">
                      {(order.items || []).map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill value={order.paymentStatus} />
                      <span className="font-semibold">{naira(order.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <select
                      aria-label={`Update order status for ${order.id}`}
                      value={order.orderStatus}
                      disabled={savingId === order.id}
                      onChange={(event) => void updateStatus(order, event.target.value)}
                      className="rounded-lg border border-[#E4E0D3] bg-white px-2.5 py-2 text-xs dark:border-white/10 dark:bg-[#0D110E]"
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                    </select>
                    <StatusPill value={order.orderStatus} />
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-[#0D4633] hover:bg-[#22C55E]/10 dark:text-[#4ADE80]">
                      View <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
