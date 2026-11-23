"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { API_URL } from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import ChatHeader from "../../components/ChatHeader";
import { useBag } from "../../components/BagContext";

const naira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

function getErrorMessage(error) {
  return getApiErrorMessage(
    error,
    "Checkout could not be completed. Please try again.",
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { count, totalPrice, loading: cartLoading, refreshCart } = useBag();
  const [details, setDetails] = useState({
    fullName: "",
    phoneNumber: "",
    country: "Nigeria",
    state: "Rivers State",
    city: "",
    deliveryAddress: "",
    deliveryInstructions: "",
  });
  const [orderId, setOrderId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [paymentState, setPaymentState] = useState("form");
  const [error, setError] = useState("");
  const checkedReference = useRef(null);

  const verifyPayment = useCallback(
    async (reference) => {
      if (checkedReference.current === reference) return;
      checkedReference.current = reference;
      setPaymentState("verifying");
      setError("");

      try {
        const { data: response } = await axios.get(
          `${API_URL}/api/payments/verify/${encodeURIComponent(reference)}`,
        );
        const result = response?.data ?? response;
        if (result?.paymentStatus !== "paid") {
          throw new Error("Paystack has not confirmed this payment yet.");
        }
        setOrderId(result.orderId);
        setPaymentState("paid");
        refreshCart().catch((refreshError) =>
          console.error("Could not refresh bag after payment:", refreshError),
        );
        router.replace(`/orders/${result.orderId}`);
      } catch (verificationError) {
        checkedReference.current = null;
        setError(getErrorMessage(verificationError));
        setPaymentState("verify-error");
      }
    },
    [refreshCart, router],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (reference) {
      Promise.resolve().then(() => verifyPayment(reference));
    }
  }, [verifyPayment]);

  const updateDetails = (event) => {
    setDetails((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const beginPayment = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      let currentOrderId = orderId;
      if (!currentOrderId) {
        const { data: orderResponse } = await axios.post(
          `${API_URL}/api/orders`,
          details,
        );
        const order = orderResponse?.data ?? orderResponse;
        if (!order?.id)
          throw new TypeError("Unexpected order response from the server.");
        currentOrderId = order.id;
        setOrderId(currentOrderId);
      }

      const { data: paymentResponse } = await axios.post(
        `${API_URL}/api/payments/initialize`,
        { orderId: currentOrderId },
      );
      const payment = paymentResponse?.data ?? paymentResponse;
      if (typeof payment?.authorizationUrl !== "string") {
        throw new TypeError("Paystack did not return a checkout URL.");
      }
      const paymentUrl = new URL(payment.authorizationUrl);
      if (
        paymentUrl.protocol !== "https:" ||
        paymentUrl.hostname !== "checkout.paystack.com"
      ) {
        throw new TypeError("Paystack returned an invalid checkout URL.");
      }
      setPaymentState("redirecting");
      window.location.assign(paymentUrl.href);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setPaymentState("form");
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    "mt-1 w-full rounded-xl border border-[#E4E0D3] bg-white px-3.5 py-3 text-sm text-[#12201A] placeholder-[#8A9188] outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 disabled:opacity-60 dark:border-white/10 dark:bg-[#0D110E] dark:text-[#F5F4EE]";
  const outsideDeliveryArea =
    details.country !== "Nigeria" || details.state !== "Rivers State";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F5F4EE] text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
      <ChatHeader started />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-7">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6B7269] hover:text-[#12201A] dark:text-[#A3AAA4] dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to bag
        </Link>

        {paymentState === "paid" ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-[#E4E0D3] bg-white p-8 text-center dark:border-white/10 dark:bg-[#151B18]">
            <CheckCircle2 className="mx-auto mb-4 text-[#22C55E]" size={46} />
            <h1 className="text-2xl font-semibold">Payment confirmed</h1>
            <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              Thank you. Your order #{orderId} has been paid successfully.
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-full bg-[#22C55E] px-5 py-3 text-sm font-semibold text-[#0D110E] hover:bg-[#16A34A]"
            >
              Continue shopping
            </Link>
          </section>
        ) : paymentState === "verifying" ? (
          <div className="py-24 text-center">
            <Loader2
              className="mx-auto mb-4 animate-spin text-[#22C55E]"
              size={28}
            />
            <h1 className="text-xl font-semibold">Confirming your payment…</h1>
            <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              Please keep this page open while we verify with Paystack.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mb-6 text-3xl font-semibold">Delivery details</h1>
            {error && (
              <p
                role="alert"
                className="mb-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300"
              >
                {error}
              </p>
            )}
            {paymentState === "verify-error" && (
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  const reference =
                    params.get("reference") || params.get("trxref");
                  if (reference) void verifyPayment(reference);
                }}
                className="mb-5 rounded-full border border-[#E4E0D3] px-4 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                Check payment again
              </button>
            )}

            {cartLoading ? (
              <div className="py-16 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                Loading your bag…
              </div>
            ) : count === 0 && !orderId ? (
              <section className="rounded-2xl border border-[#E4E0D3] bg-white p-8 text-center dark:border-white/10 dark:bg-[#151B18]">
                <p className="text-[#6B7269] dark:text-[#A3AAA4]">
                  Your bag is empty.
                </p>
                <Link
                  href="/cart"
                  className="mt-4 inline-flex rounded-full bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-[#0D110E]"
                >
                  Return to bag
                </Link>
              </section>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
                <form
                  onSubmit={beginPayment}
                  className="space-y-4 rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18] sm:p-6"
                >
                  <label className="block text-sm font-medium">
                    Full name
                    <input
                      name="fullName"
                      autoComplete="name"
                      placeholder="e.g. Ada Okafor"
                      value={details.fullName}
                      onChange={updateDetails}
                      required
                      maxLength={150}
                      disabled={Boolean(orderId)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Phone number
                    <input
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      placeholder="e.g. 08012345678"
                      value={details.phoneNumber}
                      onChange={updateDetails}
                      required
                      maxLength={32}
                      disabled={Boolean(orderId)}
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Country
                      <select
                        name="country"
                        value={details.country}
                        onChange={updateDetails}
                        disabled={Boolean(orderId)}
                        className={fieldClass}
                      >
                        <option value="Nigeria">Nigeria</option>
                        <option value="Other">Outside Nigeria</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium">
                      State
                      <select
                        name="state"
                        value={details.state}
                        onChange={updateDetails}
                        disabled={
                          Boolean(orderId) || details.country !== "Nigeria"
                        }
                        className={fieldClass}
                      >
                        <option value="Rivers State">Rivers State</option>
                        <option value="Other">Another state</option>
                      </select>
                    </label>
                  </div>
                  {outsideDeliveryArea ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200"
                    >
                      Sorry, we currently deliver only within Rivers State,
                      Nigeria. We can&apos;t accept orders for this destination.
                    </p>
                  ) : (
                    <label className="block text-sm font-medium">
                      City
                      <input
                        name="city"
                        autoComplete="address-level2"
                        placeholder="e.g. Port Harcourt"
                        value={details.city}
                        onChange={updateDetails}
                        required
                        maxLength={150}
                        disabled={Boolean(orderId)}
                        className={fieldClass}
                      />
                    </label>
                  )}
                  <label className="block text-sm font-medium">
                    Delivery address
                    <textarea
                      name="deliveryAddress"
                      autoComplete="street-address"
                      placeholder="House number, street, area, city, and state"
                      value={details.deliveryAddress}
                      onChange={updateDetails}
                      required
                      maxLength={5000}
                      rows={3}
                      disabled={Boolean(orderId)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Delivery instructions{" "}
                    <span className="font-normal text-[#6B7269]">
                      (optional)
                    </span>
                    <textarea
                      name="deliveryInstructions"
                      placeholder="e.g. Call when you arrive or use the side gate"
                      value={details.deliveryInstructions}
                      onChange={updateDetails}
                      maxLength={5000}
                      rows={2}
                      disabled={Boolean(orderId)}
                      className={fieldClass}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={
                      busy ||
                      paymentState === "redirecting" ||
                      outsideDeliveryArea
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#22C55E] px-5 py-3.5 text-sm font-semibold text-[#0D110E] transition-colors hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy || paymentState === "redirecting" ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <ShieldCheck size={17} />
                    )}
                    {orderId && error ? "Retry payment" : "Continue to secure payment"}
                  </button>
                </form>

                <aside className="rounded-2xl border border-[#E4E0D3] bg-white p-5 dark:border-white/10 dark:bg-[#151B18]">
                  <h2 className="text-lg font-semibold">Order summary</h2>
                  <div className="mt-4 flex justify-between text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                    <span>
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                    <span>{naira(totalPrice)}</span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-[#E4E0D3] pt-4 font-semibold dark:border-white/10">
                    <span>Total</span>
                    <span>{naira(totalPrice)}</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#6B7269] dark:text-[#A3AAA4]">
                    The final amount is calculated from current catalogue
                    prices. Payment is securely processed by Paystack.
                  </p>
                </aside>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
