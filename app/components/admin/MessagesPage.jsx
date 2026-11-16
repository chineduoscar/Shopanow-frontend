"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { dateTime, ErrorPanel, LoadingPanel, PageHeading } from "./AdminShared";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await axios.get("/api/admin/messages");
      setMessages(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load contact messages."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const updateRead = async (message) => {
    setError("");
    try {
      const { data } = await axios.patch(`/api/admin/messages/${message.id}`, { isRead: !message.isRead });
      setMessages((current) => current.map((item) => item.id === message.id ? data.data : item));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not update message."));
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await axios.delete(`/api/admin/messages/${message.id}`);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not delete message."));
    }
  };

  const visible = unreadOnly ? messages.filter((message) => !message.isRead) : messages;

  return (
    <>
      <PageHeading
        title="Contact messages"
        description="Messages sent through the public contact form."
        action={
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />
            Unread only
          </label>
        }
      />
      {error && <div className="mb-5"><ErrorPanel message={error} onRetry={() => void load()} /></div>}
      {loading ? <LoadingPanel label="Loading messages" /> : (
        <section className="divide-y divide-[#E4E0D3] overflow-hidden rounded-2xl border border-[#E4E0D3] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#151B18]">
          {!visible.length ? (
            <p className="px-5 py-14 text-center text-sm text-[#6B7269] dark:text-[#A3AAA4]">{unreadOnly ? "No unread messages." : "No messages received yet."}</p>
          ) : visible.map((message) => (
            <article key={message.id} className="p-5">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{message.name}</h2>
                    {!message.isRead && <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-800 dark:text-violet-200">Unread</span>}
                  </div>
                  <a href={`mailto:${message.email}`} className="mt-1 block break-all text-sm text-[#0D4633] hover:underline dark:text-[#4ADE80]">{message.email}</a>
                  <p className="mt-1 text-xs text-[#6B7269] dark:text-[#A3AAA4]">{dateTime(message.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => void updateRead(message)} aria-label={message.isRead ? "Mark as unread" : "Mark as read"} title={message.isRead ? "Mark as unread" : "Mark as read"} className="rounded-lg p-2 text-[#0D4633] hover:bg-[#22C55E]/10 dark:text-[#4ADE80]">
                    {message.isRead ? <Mail size={17} /> : <MailOpen size={17} />}
                  </button>
                  <button type="button" onClick={() => void deleteMessage(message)} aria-label="Delete message" className="rounded-lg p-2 text-red-600 hover:bg-red-500/10 dark:text-red-300"><Trash2 size={17} /></button>
                </div>
              </header>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#35433A] dark:text-[#D5D9D6]">{message.message}</p>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
