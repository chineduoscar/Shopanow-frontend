"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ShoppingBag, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import ProductCard from "./ProductCard";
import { SearchBar, Suggestions, Avatar } from "./ChatParts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SUGGESTIONS = [
  "Phones within 200k",
  "Best phone for photography",
  "Cheap phone for my mum",
  "Which phone has the biggest battery?",
  "Compare iPhone 15 and Galaxy S24",
  "Good gaming phone under 400k",
];

/* ---------------------------------------------------------
   Chat page
--------------------------------------------------------- */
export default function ChatHome() {
  const [messages, setMessages] = useState([]); // { role: "user" | "ai", text, products? }
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [bag, setBag] = useState(0);
  const [toast, setToast] = useState("");
  const [viewH, setViewH] = useState(0);
  const scrollRef = useRef(null);
  const lastTurnRef = useRef(null);
  const { openMobile } = useSidebar();

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
  }, [started]);

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

  const send = async (text) => {
    const query = (text ?? input).trim();
    if (!query || thinking) return;

    const next = [...messages, { role: "user", text: query }];
    setMessages(next);
    setInput("");
    setThinking(true);

    try {
      const { data } = await axios.post(`${API}/api/chat`, {
        messages: next.map((m) => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.text,
        })),
      });

      setMessages((m) => [
        ...m,
        { role: "ai", text: data.reply, products: data.products || [] },
      ]);
    } catch (err) {
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
      <div key={i} className="flex justify-end">
        <div className="bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[78%] text-[14.5px] leading-relaxed shadow-sm">
          {m.text}
        </div>
      </div>
    ) : (
      <div key={i} className="flex flex-col gap-3">
        <div className="flex gap-2.5 items-start">
          <Avatar />
          <p className="text-[14.5px] leading-relaxed m-0 pt-0.5 text-[#12201A] dark:text-[#F5F4EE]">
            {m.text}
          </p>
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

      {!started ? (
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

              {/* latest turn: always at least as tall as the visible area */}
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
