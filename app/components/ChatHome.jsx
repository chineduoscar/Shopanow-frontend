"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";

import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowUp,
  ShoppingBag,
  Plus,
  Menu,
  Copy,
  Check,
  RotateCcw,
  Pencil,
  Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PLACEHOLDER = "/placeholder-phone.svg"; // lives in your Next.js /public folder

const SUGGESTIONS = [
  "Phones within 200k",
  "Best phone for photography",
  "Cheap phone for my mum",
  "Which phone has the biggest battery?",
  "Compare iPhone 15 and Galaxy S24",
  "Good gaming phone under 400k",
];

const naira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

// Backend gives paths like "/images/x.jpg" (served by Express) or full URLs.
const imageSrc = (img) =>
  !img ? PLACEHOLDER : img.startsWith("/") ? `${API}${img}` : img;

// Shared classes for the row of action icons under a message
const actionsCls =
  "flex items-center gap-0.5 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100";

/* ---------------------------------------------------------
   Small action buttons (copy / retry / edit)
--------------------------------------------------------- */
function ActionBtn({ label, onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="p-1.5 rounded-md text-[#6B7269] dark:text-[#A3AAA4] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#12201A] dark:hover:text-[#F5F4EE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked (e.g. non-HTTPS) */
    }
  };

  return (
    <ActionBtn label={copied ? "Copied" : "Copy"} onClick={copy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </ActionBtn>
  );
}

/* ---------------------------------------------------------
   Product card (data comes from the backend)
--------------------------------------------------------- */
function ProductCard({ product, onAdd }) {
  const specs = [
    product.ram_gb && `${product.ram_gb}GB RAM`,
    product.storage_gb && `${product.storage_gb}GB`,
    product.battery_mah && `${product.battery_mah}mAh`,
    product.network,
    product.rear_camera && product.rear_camera.split("+")[0].trim(),
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl overflow-hidden flex flex-col min-w-0 shadow-sm transition-colors">
      <div className="bg-white h-56 sm:h-60 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc(product.image)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(PLACEHOLDER))
              e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <div className="text-[10.5px] tracking-wide text-[#6B7269] dark:text-[#8A9188] uppercase font-medium">
            {product.brand}
          </div>
          <div className="text-[16px] text-[#12201A] dark:text-[#F5F4EE] leading-tight mt-0.5 font-medium">
            {product.name}
          </div>
          {product.reason && (
            <div className="text-[12.5px] text-[#6B7269] dark:text-[#A3AAA4] mt-1 leading-snug">
              {product.reason}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <span
              key={s}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[#22C55E]/12 text-[#0D4633] dark:bg-[#22C55E]/20 dark:text-[#4ADE80]"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#E4E0D3]/60 dark:border-white/10">
          <span className="text-[15.5px] text-[#0D4633] dark:text-[#4ADE80] font-semibold">
            {naira(product.price_ngn)}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="flex items-center gap-1 bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#22C55E] dark:hover:bg-[#4ADE80] transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, onSubmit, compact, disabled }) {
  return (
    <div
      className={`w-full flex items-center gap-2 bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-full p-1.5 pl-4.5 shadow-sm transition-all focus-within:border-[#12201A] dark:focus-within:border-white/30 ${
        compact ? "max-w-175 mx-auto" : "max-w-140 mx-auto"
      }`}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Ask Shopanow about phones..."
        className="flex-1 min-w-0 border-none bg-transparent text-[14.5px] text-[#12201A] dark:text-[#F5F4EE] placeholder-[#6B7269] py-2 focus:outline-none"
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        aria-label="Send"
        className={`w-8.5 h-8.5 rounded-full border-none flex items-center justify-center cursor-pointer shrink-0 transition-colors disabled:cursor-not-allowed ${
          value.trim() && !disabled
            ? "bg-[#22C55E] text-white"
            : "bg-[#E4E0D3] dark:bg-white/10 text-[#6B7269] dark:text-[#A3AAA4]"
        }`}
      >
        <ArrowUp size={17} />
      </button>
    </div>
  );
}

function Suggestions({ items, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center max-w-160 mx-auto">
      {items.map((s, i) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          style={{ animationDelay: `${i * 0.05}s` }}
          className="text-[13px] text-[#0D4633] dark:text-[#D5D9D6] bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-full px-3.5 py-2 hover:border-[#22C55E] hover:text-[#22C55E] transition-all cursor-pointer animate-[fadeUp_.4s_ease_both]"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function Avatar() {
  return (
    <Image
      src="/logo.png"
      alt="Shopanow"
      width={28}
      height={20}
      className="rounded-lg object-contain"
    />
  );
}

/* ---------------------------------------------------------
   Chat page
--------------------------------------------------------- */
export default function ChatHome() {
  const [messages, setMessages] = useState([]); // { id?, role: "user" | "ai", text, products? }
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [bag, setBag] = useState(0);
  const [toast, setToast] = useState("");
  const [viewH, setViewH] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef(null);
  const lastTurnRef = useRef(null);
  const skipLoadRef = useRef(false);

  // the URL is the source of truth for the active chat:
  // /chat -> null (new chat), /chat/<id> -> that conversation
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id?.[0] ?? null;
  const { openMobile, refreshConversations } = useSidebar();

  // which chat id has finished loading; the spinner shows until it matches the URL
  const [loadedId, setLoadedId] = useState(null);
  const loadingChat = Boolean(activeId) && loadedId !== activeId;

  const started = messages.length > 0;

  // Measure the visible height of the chat area so the latest turn
  // can always be at least that tall.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [started, loadingChat]);

  // When the user sends a message, put it at the top of the chat area.
  // The AI reply then appears right underneath, with no jump to the bottom.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "user" && lastTurnRef.current) {
      lastTurnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages]);

  // Load a conversation when the URL changes,
  // or clear the screen on /chat ("New search").
  useEffect(() => {
    if (skipLoadRef.current) {
      skipLoadRef.current = false; // we just created this chat ourselves
      return;
    }

    let cancelled = false;

    const load = async () => {
      if (!activeId) {
        setMessages([]);
        return;
      }
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(
          `${API}/api/conversations/${activeId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (cancelled) return;
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            role: m.role === "assistant" ? "ai" : "user",
            text: m.content,
            products: m.products || [],
          })),
        );
      } catch {
        if (cancelled) return;
        setMessages([]);
      }
      // done (success or failure): hide the spinner
      if (!cancelled) setLoadedId(activeId);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Runs the request for a given history. send / retry / edit all use this.
  const run = async (history, { replaceFromId } = {}) => {
    setMessages(history);
    setThinking(true);

    try {
      const token = Cookies.get("token");
      const last = history[history.length - 1];

      const { data } = await axios.post(
        `${API}/api/chat`,
        {
          message: last.text,
          conversationId: activeId || undefined,
          replaceFromId: replaceFromId || undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      // a brand-new chat: move to /chat/<id> without refetching messages
      if (!activeId) {
        skipLoadRef.current = true; // we already have these messages on screen
        setLoadedId(data.conversationId); // new chat, nothing to load
        router.replace(`/chat/${data.conversationId}`);
      }

      setMessages((m) => [
        ...m.slice(0, -1),
        { ...m[m.length - 1], id: data.userMessageId },
        {
          id: data.message.id,
          role: "ai",
          text: data.reply,
          products: data.products || [],
        },
      ]);

      refreshConversations(); // sidebar picks up the new title / reorder
    } catch (err) {
      if (err.response?.status === 401) Cookies.remove("token");
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text:
            err.response?.data?.error ||
            "Sorry, I couldn't reach the server. Please try again.",
          products: [],
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const send = (text) => {
    const query = (text ?? input).trim();
    if (!query || thinking) return;
    setInput("");
    run([...messages, { role: "user", text: query }]);
  };

  // Works from either a user message or an AI message index
  const retry = (index) => {
    if (thinking) return;
    const userIdx = messages[index].role === "user" ? index : index - 1;
    if (userIdx < 0) return;
    setEditingIndex(null);
    run(messages.slice(0, userIdx + 1), {
      replaceFromId: messages[userIdx].id,
    });
  };

  const startEdit = (index) => {
    if (thinking) return;
    setEditingIndex(index);
    setEditText(messages[index].text);
  };

  const cancelEdit = () => setEditingIndex(null);

  const saveEdit = () => {
    const query = editText.trim();
    if (!query || thinking) return;
    const idx = editingIndex;
    const oldId = messages[idx].id;
    setEditingIndex(null);
    run([...messages.slice(0, idx), { role: "user", text: query }], {
      replaceFromId: oldId,
    });
  };

  const onAdd = (product) => {
    setBag((b) => b + 1);
    setToast(`Added "${product.name}" to your bag`);
    window.setTimeout(() => setToast(""), 2200);
  };

  // Split the conversation: everything before the latest user message,
  // and the latest turn (user message + AI reply / typing dots).
  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
  const earlier = lastUserIndex > 0 ? messages.slice(0, lastUserIndex) : [];
  const latest = lastUserIndex >= 0 ? messages.slice(lastUserIndex) : [];

  const renderMessage = (m, i) =>
    m.role === "user" ? (
      <div key={i} className="group flex flex-col items-end gap-1">
        {editingIndex === i ? (
          <div className="w-full max-w-[78%] flex flex-col gap-2">
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") cancelEdit();
              }}
              rows={Math.min(6, Math.max(2, editText.split("\n").length))}
              className="w-full resize-none rounded-2xl border border-[#E4E0D3] dark:border-white/20 bg-white dark:bg-[#151B18] text-[14.5px] text-[#12201A] dark:text-[#F5F4EE] px-4 py-2.5 leading-relaxed focus:outline-none focus:border-[#12201A] dark:focus:border-white/40"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="text-xs px-3 py-1.5 rounded-full border border-[#E4E0D3] dark:border-white/10 text-[#12201A] dark:text-[#F5F4EE] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!editText.trim()}
                className="text-xs px-3 py-1.5 rounded-full bg-[#22C55E] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Save &amp; send
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[78%] text-[14.5px] leading-relaxed shadow-sm">
              {m.text}
            </div>
            <div className={actionsCls}>
              <CopyBtn text={m.text} />
              <ActionBtn
                label="Retry"
                onClick={() => retry(i)}
                disabled={thinking}
              >
                <RotateCcw size={14} />
              </ActionBtn>
              <ActionBtn
                label="Edit"
                onClick={() => startEdit(i)}
                disabled={thinking}
              >
                <Pencil size={14} />
              </ActionBtn>
            </div>
          </>
        )}
      </div>
    ) : (
      <div key={i} className="group flex flex-col gap-3">
        <div className="flex gap-2.5 items-start">
          <Avatar />
          <div className="flex flex-col gap-1">
            <p className="text-[14.5px] leading-relaxed m-0 pt-0.5 text-[#12201A] dark:text-[#F5F4EE]">
              {m.text}
            </p>
            <div className={`${actionsCls} -ml-1.5`}>
              <CopyBtn text={m.text} />
              <ActionBtn
                label="Retry"
                onClick={() => retry(i)}
                disabled={thinking}
              >
                <RotateCcw size={14} />
              </ActionBtn>
            </div>
          </div>
        </div>
        {m.products?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
            {m.products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} />
            ))}
          </div>
        )}
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-[#F5F4EE] dark:bg-[#0D110E] text-[#12201A] dark:text-[#F5F4EE] min-h-screen transition-colors">
      <header
        className={`flex items-center justify-between px-6 py-4 shrink-0 ${
          started
            ? "border-b border-[#E4E0D3] dark:border-white/10"
            : "border-b border-transparent"
        }`}
      >
        <button
          onClick={openMobile}
          className="md:hidden text-[#12201A] dark:text-[#F5F4EE] p-1 -ml-1"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.7} />
        </button>
        <div className="relative p-1 ml-auto">
          <ShoppingBag
            size={19}
            strokeWidth={1.7}
            className="text-[#12201A] dark:text-[#F5F4EE]"
          />
          {bag > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F5B915] text-[#12201A] text-[10px] rounded-full min-w-3.75 h-3.75 flex items-center justify-center px-1 font-bold">
              {bag}
            </span>
          )}
        </div>
      </header>

      {loadingChat ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2
            size={20}
            strokeWidth={1.8}
            aria-label="Loading chats"
            className="animate-spin text-[#6B7269] dark:text-[#A3AAA4]"
          />
        </div>
      ) : !started ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-20 gap-7">
          <div className="text-center max-w-155">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] m-0 text-[#12201A] dark:text-[#F5F4EE]">
              Shop with AI now!
            </h1>
            <p className="text-[#6B7269] dark:text-[#A3AAA4] text-base mt-3.5 leading-relaxed">
              Tell Shopanow what phone you&apos;re looking for, who it&apos;s
              for, or how much you want to spend.
            </p>
          </div>

          <Suggestions items={SUGGESTIONS} onSelect={send} />

          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={() => send()}
            disabled={thinking}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 pt-7 pb-3"
          >
            <div className="max-w-175 mx-auto flex flex-col gap-6">
              {/* older conversation */}
              {earlier.map((m, i) => renderMessage(m, i))}

              {/* latest turn: always at least as tall as the visible area,
                  so a short message still lands at the top and the reply
                  appears right below it */}
              <div
                ref={lastTurnRef}
                style={{ minHeight: Math.max(0, viewH - 40) }}
                className="flex flex-col gap-6 scroll-mt-7"
              >
                {latest.map((m, i) => renderMessage(m, earlier.length + i))}

                {thinking && (
                  <div className="flex gap-2.5 items-center">
                    <Avatar />
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          style={{ animationDelay: `${d * 0.15}s` }}
                          className="w-1.5 h-1.5 rounded-full bg-[#6B7269] dark:bg-[#A3AAA4] inline-block animate-[bounce_1s_infinite_ease-in-out]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-5 pt-2 pb-6 shrink-0">
            <SearchBar
              value={input}
              onChange={setInput}
              onSubmit={() => send()}
              compact
              disabled={thinking}
            />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] px-4 py-2.5 rounded-full text-[13px] shadow-xl animate-[fadeUp_.2s_ease]">
          {toast}
        </div>
      )}
    </div>
  );
}
