"use client";
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import Image from "next/image";

const PLACEHOLDER = "/placeholder-phone.svg";

/* ---------------------------------------------------------
   SAMPLE DATA: replace names, prices and images with real
   products from your catalog. Put images in /public/demo/.
--------------------------------------------------------- */
const SCENARIOS = [
  {
    q: "Phones within 200k",
    reply:
      "Here are two solid phones under ₦200,000. The first gives you more storage, while the second has a 108MP camera.",
    products: [
      {
        name: "Infinix Hot 40 Pro",
        image:
          "https://i.pinimg.com/1200x/ba/48/c2/ba48c26c23fe5244c72a807ea92a8da3.jpg",
        specs: ["8GB + 256GB", "6.78″ 120Hz", "5000mAh"],
        price: "₦185,000",
      },
      {
        name: "Realme C67",
        image:
          "https://i.pinimg.com/1200x/f8/76/ef/f876efe73da9c862ad5bbe58eef91376.jpg",
        specs: ["6GB + 128GB", "108MP camera", "33W charging"],
        price: "₦170,000",
      },
    ],
  },
  {
    q: "Compare iPhone 15 and Galaxy S24",
    reply:
      "Both are great flagship phones. The iPhone 15 is a strong choice for the Apple ecosystem, while the Galaxy S24 offers a 120Hz display and telephoto camera.",
    products: [
      {
        name: "iPhone 15",
        image:
          "https://i.pinimg.com/1200x/2c/72/b1/2c72b1c676062281b5b013da3f6f58f0.jpg",
        specs: ["A16 Bionic", "48MP camera", "128GB"],
        price: "₦1,050,000",
      },
      {
        name: "Galaxy S24",
        image:
          "https://i.pinimg.com/736x/24/22/32/24223258deb2711a6cfb6ffe2ba3b5e9.jpg",
        specs: ["120Hz display", "3x telephoto", "128GB"],
        price: "₦1,000,000",
      },
    ],
  },
  {
    q: "Cheap phone for my mum",
    reply:
      "For your mum, I'd pick phones with a big screen, good battery life and simple everyday performance.",
    products: [
      {
        name: "Galaxy A05s",
        image:
          "https://i.pinimg.com/736x/e4/f0/70/e4f070561eb18a0112b248c9f53637d6.jpg",
        specs: ["6.7″ screen", "5000mAh", "64GB"],
        price: "₦125,000",
      },
      {
        name: "Redmi 13C",
        image:
          "https://i.pinimg.com/1200x/e8/01/d6/e801d62d130cf3ecd74a392a44c92205.jpg",
        specs: ["6.74″ screen", "5000mAh", "128GB"],
        price: "₦120,000",
      },
    ],
  },
];
const TYPE_MS = 45; // speed of the typing
const THINK_MS = 1300; // how long the dots show
const HOLD_MS = 5500; // how long each answer stays before the next question

function DemoCard({ p }) {
  return (
    <div className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl overflow-hidden flex flex-row sm:flex-col min-w-0">
      <div className="bg-white w-24 sm:w-full sm:h-24 shrink-0 flex items-center justify-center p-1.5 sm:p-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt=""
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(PLACEHOLDER))
              e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-20 sm:h-full w-full object-contain"
        />
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1 min-w-0 justify-center">
        <div className="text-[13.5px] font-medium leading-tight text-[#12201A] dark:text-[#F5F4EE]">
          {p.name}
        </div>
        <div className="flex flex-wrap gap-1">
          {p.specs.map((s) => (
            <span
              key={s}
              className="text-[10.5px] sm:text-[9px] px-2 py-0.5 rounded-full bg-[#22C55E]/12 text-[#0D4633] dark:bg-[#22C55E]/20 dark:text-[#4ADE80]"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E4E0D3]/60 dark:border-white/10">
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
      later(() => {
        setTyped("");
        setPhase("answer");
      }, 0);
      later(next, HOLD_MS + 2000);
      return () => timers.forEach(clearTimeout);
    }

    // reset for the new scenario (in a callback, not the effect body)
    later(() => {
      setPhase("typing");
      setTyped("");
    }, 0);

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

        <div className="h-120 sm:h-100 overflow-hidden px-3 sm:px-4 pt-5 flex flex-col gap-4">
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
                    <span className="w-6 h-6 shrink-0">
                      <Image
                        src="/logo.png"
                        alt=""
                        width={400}
                        height={400}
                        className="w-full h-full object-contain"
                      />
                    </span>
                    <p className="m-0 flex-1 min-w-0 text-[13.5px] leading-relaxed text-[#12201A] dark:text-[#F5F4EE]">
                      {s.reply}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:pl-9">
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
