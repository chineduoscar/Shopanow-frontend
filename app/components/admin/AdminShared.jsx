import { AlertCircle, LoaderCircle } from "lucide-react";

export const naira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const dateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
};

export const statusLabel = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";

const statusColors = {
  pending: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  processing: "bg-blue-500/10 text-blue-800 dark:text-blue-200",
  completed: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  delivered: "bg-green-500/15 text-green-800 dark:text-green-200",
  paid: "bg-green-500/15 text-green-800 dark:text-green-200",
  failed: "bg-red-500/10 text-red-700 dark:text-red-300",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
  unread: "bg-violet-500/10 text-violet-800 dark:text-violet-200",
};

export function StatusPill({ value }) {
  const label = statusLabel(value);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[value] || "bg-black/5 text-[#56635B] dark:bg-white/10 dark:text-[#D5D9D6]"}`}>
      {label}
    </span>
  );
}

export function PageHeading({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#6B7269] dark:text-[#A3AAA4]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingPanel({ label = "Loading data" }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
      <LoaderCircle size={19} className="animate-spin" /> {label}…
    </div>
  );
}

export function ErrorPanel({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
      <span className="flex items-center gap-2"><AlertCircle size={17} />{message}</span>
      {onRetry && <button onClick={onRetry} className="font-medium underline">Try again</button>}
    </div>
  );
}
