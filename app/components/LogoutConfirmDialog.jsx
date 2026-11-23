"use client";

import { Loader2, LogOut } from "lucide-react";

export default function LogoutConfirmDialog({
  open,
  loggingOut,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className="w-full max-w-sm rounded-2xl border border-[#E4E0D3] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#151B18]"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-300">
          {loggingOut ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut size={20} />
          )}
        </div>
        <h2
          id="logout-dialog-title"
          className="text-lg font-semibold text-[#12201A] dark:text-white"
        >
          {loggingOut ? "Logging out..." : "Log out?"}
        </h2>
        <p
          id="logout-dialog-description"
          className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]"
        >
          {loggingOut
            ? "Taking you to the login page."
            : "Are you sure you want to log out of your account?"}
        </p>
        {!loggingOut && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#E4E0D3] px-4 py-2 text-sm font-medium text-[#12201A] transition-colors hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Log out
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
