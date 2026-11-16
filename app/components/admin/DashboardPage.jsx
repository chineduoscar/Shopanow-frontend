"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  CalendarDays,
  PackageCheck,
  UsersRound,
} from "lucide-react";
import { dateTime, ErrorPanel, LoadingPanel, naira, PageHeading, StatusPill } from "./AdminShared";

const cards = [
  { key: "totalUsers", label: "Total users", Icon: UsersRound, format: (value) => Number(value || 0).toLocaleString() },
  { key: "totalOrders", label: "Total orders", Icon: PackageCheck, format: (value) => Number(value || 0).toLocaleString() },
  { key: "ordersToday", label: "Orders today", Icon: CalendarDays, format: (value) => Number(value || 0).toLocaleString() },
  { key: "totalRevenue", label: "Paid revenue", Icon: Banknote, format: naira },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      setDashboard(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load dashboard data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  return (
    <>
      <PageHeading
        title="Dashboard"
        description="A live overview of your store activity."
      />
      {error && <div className="mb-5"><ErrorPanel message={error} onRetry={() => void load()} /></div>}
      {loading ? (
        <LoadingPanel label="Loading dashboard" />
      ) : dashboard ? (
        <>
          <section aria-label="Store statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ key, label, Icon, format }) => (
              <article key={key} className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#6B7269] dark:text-[#A3AAA4]">{label}</p>
                  <span className="rounded-xl bg-[#22C55E]/15 p-2 text-[#0D4633] dark:text-[#4ADE80]"><Icon size={18} /></span>
                </div>
                <p className="mt-4 text-2xl font-semibold">{format(dashboard.statistics[key])}</p>
              </article>
            ))}
          </section>

          <section className="mt-7 rounded-2xl border border-[#E4E0D3] bg-white dark:border-white/10 dark:bg-[#151B18]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E0D3] px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="font-semibold">Recent orders</h2>
                <p className="mt-0.5 text-xs text-[#6B7269] dark:text-[#A3AAA4]">
                  {dashboard.statistics.unfulfilledOrders} orders need fulfillment
                </p>
              </div>
              <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-[#0D4633] hover:underline dark:text-[#4ADE80]">
                All orders <ArrowUpRight size={15} />
              </Link>
            </div>
            {!dashboard.recentOrders.length ? (
              <p className="px-5 py-10 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">No orders have been placed yet.</p>
            ) : (
              <div className="divide-y divide-[#E4E0D3] dark:divide-white/10">
                {dashboard.recentOrders.map((order) => (
                  <article key={order.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.2fr_1.7fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.customer?.fullName || "Customer"}</p>
                      <p className="mt-0.5 truncate text-xs text-[#6B7269] dark:text-[#A3AAA4]">
                        #{order.id.slice(-8)} · {dateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm text-[#56635B] dark:text-[#B1BBB4]">
                        {(order.items || []).map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="text-sm font-semibold">{naira(order.totalAmount)}</span>
                      <StatusPill value={order.paymentStatus} />
                      <StatusPill value={order.orderStatus} />
                      <Link
                        href={`/admin/orders/${order.id}`}
                        aria-label={`View order ${order.id}`}
                        className="rounded-lg p-2 text-[#0D4633] hover:bg-[#22C55E]/10 dark:text-[#4ADE80]"
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mt-7 rounded-2xl border border-[#E4E0D3] bg-white dark:border-white/10 dark:bg-[#151B18]">
            <div className="flex items-center justify-between border-b border-[#E4E0D3] px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="font-semibold">Recent contact messages</h2>
                <p className="mt-0.5 text-xs text-[#6B7269] dark:text-[#A3AAA4]">
                  {dashboard.statistics.unreadMessages} unread messages
                </p>
              </div>
              <Link href="/admin/messages" className="text-sm font-medium text-[#0D4633] hover:underline dark:text-[#4ADE80]">View all</Link>
            </div>
            {!dashboard.recentMessages.length ? (
              <p className="px-5 py-8 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-[#E4E0D3] dark:divide-white/10">
                {dashboard.recentMessages.map((message) => (
                  <li key={message.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{message.name} <span className="font-normal text-[#6B7269] dark:text-[#A3AAA4]">· {message.email}</span></p>
                      <p className="mt-1 line-clamp-2 text-sm text-[#56635B] dark:text-[#B1BBB4]">{message.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[#6B7269] dark:text-[#A3AAA4]">{dateTime(message.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
