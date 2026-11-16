"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Clock3,
  Loader2,
  PackageCheck,
  RefreshCw,
  Truck,
} from "lucide-react";
import ChatHeader from "../../components/ChatHeader";

const naira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

const ORDER_STEPS = [
  { value: "pending", label: "Order placed" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
];

const statusClass = {
  pending:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  processing:
    "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  completed:
    "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  delivered:
    "bg-[#22C55E]/15 text-[#0D4633] dark:text-[#4ADE80]",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-300",
};

function formatStatus(status) {
  return status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";
}

function OrderTracking({ status }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
        <CircleAlert size={16} /> This order was cancelled.
      </p>
    );
  }

  const activeStep = ORDER_STEPS.findIndex((step) => step.value === status);
  const stepIndex = status === "shipped" ? 2 : activeStep < 0 ? 0 : activeStep;

  return (
    <ol
      aria-label={`Order tracking: ${formatStatus(status)}`}
      className="grid grid-cols-4"
    >
      {ORDER_STEPS.map((step, index) => {
        const complete = index <= stepIndex;
        const current = index === stepIndex;
        const StepIcon = index === 2 ? Truck : index === 3 ? PackageCheck : Check;
        return (
          <li
            key={step.value}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-3 h-0.5 w-full ${
                  index <= stepIndex
                    ? "bg-[#22C55E]"
                    : "bg-[#E4E0D3] dark:bg-white/10"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                complete
                  ? "bg-[#22C55E] text-[#0D110E]"
                  : "bg-[#E4E0D3] text-[#6B7269] dark:bg-white/10 dark:text-[#A3AAA4]"
              }`}
            >
              <StepIcon size={13} />
            </span>
            <span
              className={`text-[10px] leading-tight sm:text-xs ${
                current
                  ? "font-semibold text-[#12201A] dark:text-white"
                  : "text-[#6B7269] dark:text-[#A3AAA4]"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data: response } = await axios.get("/api/orders");
      const data = response?.data ?? response;
      if (!Array.isArray(data)) {
        throw new TypeError("Unexpected order history response from the server.");
      }
      setOrders(data);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Could not load your orders. Please try again."),
      );
      console.error("Failed to load orders:", requestError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadOrders());
  }, [loadOrders]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F5F4EE] text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
      <ChatHeader started />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-7">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Link
              href="/chat"
              className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-white"
            >
              <ArrowLeft size={16} /> Continue shopping
            </Link>
            <h1 className="text-3xl font-semibold">My orders</h1>
            <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              View your purchases and follow their delivery progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadOrders(true)}
            disabled={loading || refreshing}
            aria-label="Refresh orders"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#E4E0D3] bg-white px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:bg-[#151B18] dark:hover:bg-white/5"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between gap-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="shrink-0 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2
              className="animate-spin text-[#6B7269] dark:text-[#A3AAA4]"
              size={24}
              aria-label="Loading orders"
            />
          </div>
        ) : orders.length === 0 ? (
          <section className="rounded-2xl border border-[#E4E0D3] bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#151B18]">
            <PackageCheck
              className="mx-auto mb-4 text-[#6B7269] dark:text-[#A3AAA4]"
              size={34}
            />
            <h2 className="text-lg font-medium">No orders yet</h2>
            <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              Your purchases will appear here so you can follow their status.
            </p>
            <Link
              href="/chat"
              className="mt-5 inline-flex rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-medium text-[#0D110E] hover:bg-[#16A34A]"
            >
              Find a phone
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const cancelled = order.orderStatus === "cancelled";
              const orderDate = new Date(order.createdAt);
              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#E4E0D3] bg-white dark:border-white/10 dark:bg-[#151B18]"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E0D3] px-5 py-4 dark:border-white/10">
                    <div>
                      <h2 className="font-semibold">Order #{order.id}</h2>
                      <p className="mt-0.5 text-xs text-[#6B7269] dark:text-[#A3AAA4]">
                        {Number.isNaN(orderDate.getTime())
                          ? "Date unavailable"
                          : orderDate.toLocaleDateString("en-NG", {
                              dateStyle: "medium",
                            })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusClass[order.paymentStatus] || statusClass.pending
                        }`}
                      >
                        Payment: {formatStatus(order.paymentStatus)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusClass[order.orderStatus] || statusClass.pending
                        }`}
                      >
                        {formatStatus(order.orderStatus)}
                      </span>
                    </div>
                  </header>

                  <div className="space-y-5 p-5">
                    {!cancelled && order.paymentStatus !== "paid" && (
                      <p className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                        <Clock3 size={16} />
                        Payment is not confirmed yet. Delivery will begin once
                        payment is received.
                      </p>
                    )}
                    <OrderTracking status={order.orderStatus} />

                    <div className="grid gap-5 border-t border-[#E4E0D3] pt-4 dark:border-white/10 md:grid-cols-[1fr_auto]">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">Items</h3>
                        <ul className="space-y-2">
                          {(order.items || []).map((item) => (
                            <li
                              key={item.id}
                              className="flex justify-between gap-4 text-sm"
                            >
                              <span className="text-[#6B7269] dark:text-[#A3AAA4]">
                                {item.productName} × {item.quantity}
                              </span>
                              <span className="shrink-0">
                                {naira(item.lineTotal)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="md:min-w-48 md:text-right">
                        <h3 className="text-sm font-semibold">Delivering to</h3>
                        <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                          {order.fullName}
                          <br />
                          {order.deliveryAddress}
                          <br />
                          {[order.city, order.state, order.country]
                            .filter(Boolean)
                            .join(", ")}
                          <br />
                          {order.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-[#E4E0D3] pt-4 font-semibold dark:border-white/10">
                      <span>Total</span>
                      <span>{naira(order.totalAmount)}</span>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex rounded-full border border-[#E4E0D3] px-4 py-2 text-sm font-medium hover:border-[#22C55E] hover:text-[#0D4633] dark:border-white/10 dark:hover:text-[#4ADE80]"
                    >
                      View full order details
                    </Link>
                    {order.orderStatus === "delivered" && (
                      <Link
                        href={`/orders/${order.id}#rating`}
                        className="ml-3 inline-flex rounded-full px-4 py-2 text-sm font-medium text-[#0D4633] hover:bg-[#22C55E]/10 dark:text-[#4ADE80]"
                      >
                        Rate your experience
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
