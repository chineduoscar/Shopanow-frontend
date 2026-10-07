"use client";
import React, { useEffect, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

const PLACEHOLDER = "/placeholder-phone.svg";

/* ---------------------------------------------------------
   SAMPLE DATA: replace names, prices and images with real
   products from your catalog. Put images in /public/demo/.
--------------------------------------------------------- */
const SCENARIOS = [
  {
    q: "Phones within 200k",
    reply:
      "Here are two solid phones under ₦200,000. The first has the bigger battery, the second the better camera.",
    products: [
      {
        name: "Infinix Note 40",
        specs: ["8GB RAM", "5000mAh"],
        price: "₦185,000",
        image: "/demo/phone-1.png",
      },
      {
        name: "Tecno Camon 30",
        specs: ["8GB RAM", "50MP"],
        price: "₦198,000",
        image: "/demo/phone-2.png",
      },
    ],
  },
  {
    q: "Compare iPhone 15 and Galaxy S24",
    reply:
      "Both are great. The iPhone 15 holds its resale value and is simpler to use. The Galaxy S24 has a brighter screen and charges faster.",
    products: [
      {
        name: "iPhone 15",
        specs: ["128GB", "48MP"],
        price: "₦1,150,000",
        image: "/demo/phone-3.png",
      },
      {
        name: "Galaxy S24",
        specs: ["256GB", "50MP"],
        price: "₦1,050,000",
        image: "/demo/phone-4.png",
      },
    ],
  },
  {
    q: "Cheap phone for my mum",
    reply:
      "For your mum I'd pick phones with a big screen, loud speakers and a battery that lasts days. Both of these are easy to use.",
    products: [
      {
        name: "Tecno Spark Go",
        specs: ["4GB RAM", "5000mAh"],
        price: "₦95,000",
        image: "/demo/phone-5.png",
      },
      {
        name: "Itel A70",
        specs: ["4GB RAM", '6.6" screen'],
        price: "₦82,000",
        image: "/demo/phone-6.png",
      },
    ],
  },
];

const TYPE_MS = 45; // speed of the typing
const THINK_MS = 1300; // how long the dots show
const HOLD_MS = 5500; // how long each answer stays before the next question

function DemoCard({ p }) {
  return (
    <div className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl overflow-hidden flex flex-col min-w-0">
      <div className="bg-white h-24 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt=""
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(PLACEHOLDER))
              e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="text-[13.5px] font-medium leading-tight text-[#12201A] dark:text-[#F5F4EE]">
          {p.name}
        </div>
        <div className="flex flex-wrap gap-1">
          {p.specs.map((s) => (
            <span
              key={s}
              className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#22C55E]/12 text-[#0D4633] dark:bg-[#22C55E]/20 dark:text-[#4ADE80]"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#E4E0D3]/60 dark:border-white/10">
          <span className="text-[13.5px] font-semibold text-[#0D4633] dark:text-[#4ADE80]">
            {p.price}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] font-medium">
            + Add
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatDemo() {
  const [i, setI] = useState(0); // which scenario is showing
  const [phase, setPhase] = useState("typing"); // typing -> thinking -> answer
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const s = SCENARIOS[i];
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const next = () => setI((n) => (n + 1) % SCENARIOS.length);

    // people who prefer less motion get the answer straight away
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped("");
      setPhase("answer");
      later(next, HOLD_MS + 2000);
      return () => timers.forEach(clearTimeout);
    }

    setPhase("typing");
    setTyped("");
    let n = 0;
    const tick = () => {
      n += 1;
      setTyped(s.q.slice(0, n));
      if (n < s.q.length) {
        later(tick, TYPE_MS);
      } else {
        later(() => {
          setTyped("");
          setPhase("thinking");
          later(() => {
            setPhase("answer");
            later(next, HOLD_MS);
          }, THINK_MS);
        }, 400);
      }
    };
    later(tick, 600);

    return () => timers.forEach(clearTimeout);
  }, [i]);

  const s = SCENARIOS[i];
  const showChat = phase !== "typing";

  return (
    <div className="w-full max-w-140 mx-auto">
      <p className="sr-only">
        Example: ask for phones within ₦200,000 and Shopanow suggests matching
        phones with specs and prices.
      </p>

      <div
        aria-hidden="true"
        className="bg-[#F5F4EE] dark:bg-[#0D110E] border border-[#E4E0D3] dark:border-white/10 rounded-3xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E4E0D3] dark:border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E4E0D3] dark:bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E4E0D3] dark:bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E4E0D3] dark:bg-white/15" />
        </div>

        <div className="h-100 overflow-hidden px-4 pt-5 flex flex-col gap-4">
          {!showChat ? (
            <div className="flex-1 flex items-center justify-center text-[13px] text-[#6B7269] dark:text-[#A3AAA4]">
              Ask anything about phones
            </div>
          ) : (
            <>
              <div
                key={`q-${i}`}
                className="flex justify-end animate-[fadeUp_.3s_ease_both]"
              >
                <div className="bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13.5px]">
                  {s.q}
                </div>
              </div>

              {phase === "thinking" ? (
                <div className="flex gap-1.5 items-center pl-9 pt-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{ animationDelay: `${d * 0.15}s` }}
                      className="w-1.5 h-1.5 rounded-full bg-[#6B7269] dark:bg-[#A3AAA4] inline-block animate-[bounce_1s_infinite_ease-in-out]"
                    />
                  ))}
                </div>
              ) : (
                <div
                  key={`a-${i}`}
                  className="flex flex-col gap-3 animate-[fadeUp_.4s_ease_both]"
                >
                  <div className="flex gap-2.5 items-start">
                    <span className="w-6.5 h-6.5 shrink-0 rounded-lg bg-[#22C55E]/15 text-[#0D4633] dark:text-[#4ADE80] flex items-center justify-center">
                      <Sparkles size={14} />
                    </span>
                    <p className="m-0 text-[13.5px] leading-relaxed text-[#12201A] dark:text-[#F5F4EE]">
                      {s.reply}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 pl-9">
                    {s.products.map((p) => (
                      <DemoCard key={p.name} p={p} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-2 bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-full p-1.5 pl-4">
            <span
              className={`flex-1 min-w-0 truncate text-[13.5px] py-1.5 ${
                typed
                  ? "text-[#12201A] dark:text-[#F5F4EE]"
                  : "text-[#6B7269] dark:text-[#A3AAA4]"
              }`}
            >
              {typed || "Ask Shopanow about phones..."}
            </span>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                typed
                  ? "bg-[#22C55E] text-white"
                  : "bg-[#E4E0D3] dark:bg-white/10 text-[#6B7269] dark:text-[#A3AAA4]"
              }`}
            >
              <ArrowUp size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* dots: click to jump to a question */}
      <div className="flex justify-center gap-2 mt-4">
        {SCENARIOS.map((sc, idx) => (
          <button
            key={sc.q}
            onClick={() => idx !== i && setI(idx)}
            aria-label={`Show example: ${sc.q}`}
            aria-current={idx === i}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === i
                ? "w-6 bg-[#22C55E]"
                : "w-2 bg-[#E4E0D3] dark:bg-white/20 hover:bg-[#22C55E]/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
