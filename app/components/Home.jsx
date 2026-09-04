"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from "./SidebarContext";
import Image from "next/image";
import {
  ArrowUp,
  ShoppingBag,
  Smartphone,
  Watch,
  Shirt,
  Gift,
  Headphones,
  Sparkles,
  Baby,
  Gem,
  Flower2,
  Laptop,
  Footprints,
  BookOpen,
  Home as HomeIcon,
  Plus,
  Menu,
} from "lucide-react";

/* ---------------------------------------------------------
   Mock catalog
--------------------------------------------------------- */
const CATALOG = [
  {
    id: 1,
    name: "Tecno Camon 30 Pro",
    cat: "Phones",
    price: 185000,
    icon: Smartphone,
    blurb: '6.7" AMOLED, 108MP camera, all-day battery.',
    tags: [
      "phone",
      "phones",
      "gift",
      "him",
      "her",
      "boyfriend",
      "husband",
      "birthday",
    ],
  },
  {
    id: 2,
    name: "Infinix Zero 30",
    cat: "Phones",
    price: 210000,
    icon: Smartphone,
    blurb: "Flagship look, 60x zoom, fast charging.",
    tags: ["phone", "phones", "gift", "him", "boyfriend", "birthday"],
  },
  {
    id: 3,
    name: "Samsung Galaxy A55",
    cat: "Phones",
    price: 265000,
    icon: Smartphone,
    blurb: "Clean Android, great screen, solid resale value.",
    tags: ["phone", "phones", "gift", "her", "him"],
  },
  {
    id: 4,
    name: "Rose Gold Tennis Bracelet",
    cat: "Jewelry",
    price: 42000,
    icon: Gem,
    blurb: "Delicate everyday piece, gift-boxed.",
    tags: [
      "wife",
      "her",
      "women",
      "anniversary",
      "birthday",
      "valentine",
      "jewelry",
    ],
  },
  {
    id: 5,
    name: "Layered Gold Necklace Set",
    cat: "Jewelry",
    price: 38000,
    icon: Gem,
    blurb: "Three-strand set, hypoallergenic finish.",
    tags: [
      "wife",
      "her",
      "women",
      "childbirth",
      "new mum",
      "gift",
      "anniversary",
    ],
  },
  {
    id: 6,
    name: "Postpartum Recovery Hamper",
    cat: "New Mum",
    price: 55000,
    icon: Baby,
    blurb: "Sitz bath soak, belly wrap, nursing essentials.",
    tags: [
      "wife",
      "childbirth",
      "new mum",
      "baby",
      "delivery",
      "postpartum",
      "her",
    ],
  },
  {
    id: 7,
    name: "Baby Welcome Gift Box",
    cat: "New Mum",
    price: 47000,
    icon: Baby,
    blurb: "Onesies, swaddle, and a hand-written card slot.",
    tags: ["childbirth", "baby", "new mum", "newborn", "wife", "gift"],
  },
  {
    id: 8,
    name: "Silk Wrap Robe (Mum Edition)",
    cat: "New Mum",
    price: 32000,
    icon: Flower2,
    blurb: "Nursing-friendly, soft-touch silk blend.",
    tags: ["wife", "childbirth", "new mum", "postpartum", "her"],
  },
  {
    id: 9,
    name: "Leather Chronograph Watch",
    cat: "Watches",
    price: 95000,
    icon: Watch,
    blurb: "Full-grain strap, sapphire-coated face.",
    tags: ["boyfriend", "husband", "him", "birthday", "anniversary", "gift"],
  },
  {
    id: 10,
    name: "Minimalist Steel Watch",
    cat: "Watches",
    price: 68000,
    icon: Watch,
    blurb: "Slim case, pairs with everything.",
    tags: ["boyfriend", "him", "her", "birthday", "gift"],
  },
  {
    id: 11,
    name: "Noise-Cancelling Headphones",
    cat: "Audio",
    price: 145000,
    icon: Headphones,
    blurb: "40hr battery, plush ear cushions.",
    tags: ["boyfriend", "him", "her", "birthday", "gift", "music"],
  },
  {
    id: 12,
    name: "Wireless Earbuds Pro",
    cat: "Audio",
    price: 62000,
    icon: Headphones,
    blurb: "Compact case, punchy bass.",
    tags: ["gift", "him", "her", "birthday"],
  },
  {
    id: 13,
    name: "Tailored Oxford Shirt",
    cat: "Fashion",
    price: 24500,
    icon: Shirt,
    blurb: "Wrinkle-resistant cotton, slim fit.",
    tags: ["boyfriend", "husband", "him", "birthday", "gift"],
  },
  {
    id: 14,
    name: "Leather Sneakers",
    cat: "Fashion",
    price: 58000,
    icon: Footprints,
    blurb: "Hand-stitched sole, breaks in fast.",
    tags: ["boyfriend", "him", "birthday", "gift"],
  },
  {
    id: 15,
    name: "Glow Skincare Set",
    cat: "Skincare",
    price: 29500,
    icon: Sparkles,
    blurb: "Vitamin-C serum, moisturizer, SPF.",
    tags: ["wife", "her", "women", "valentine", "birthday", "gift", "skincare"],
  },
  {
    id: 16,
    name: "Signature Eau de Parfum",
    cat: "Fragrance",
    price: 47500,
    icon: Sparkles,
    blurb: "Warm amber and citrus, long-lasting.",
    tags: [
      "wife",
      "her",
      "boyfriend",
      "him",
      "anniversary",
      "valentine",
      "gift",
    ],
  },
  {
    id: 17,
    name: "MacBook Air M2 (Refurb)",
    cat: "Laptops",
    price: 780000,
    icon: Laptop,
    blurb: "Certified refurbished, 8/256GB.",
    tags: ["laptop", "laptops", "gift", "him", "her"],
  },
  {
    id: 18,
    name: "Budget Windows Laptop",
    cat: "Laptops",
    price: 195000,
    icon: Laptop,
    blurb: "8GB RAM, great for school and work.",
    tags: ["laptop", "laptops", "budget", "student", "gift"],
  },
  {
    id: 19,
    name: "Woven Rattan Gift Basket",
    cat: "Home",
    price: 21000,
    icon: HomeIcon,
    blurb: "Fill-your-own hamper base, reusable.",
    tags: ["gift", "wedding", "housewarming", "boss", "friend"],
  },
  {
    id: 20,
    name: "Best-Selling Novel Box Set",
    cat: "Books",
    price: 18500,
    icon: BookOpen,
    blurb: "Three acclaimed reads, hardcover.",
    tags: ["gift", "friend", "boss", "birthday"],
  },
  {
    id: 21,
    name: "Engraved Leather Journal",
    cat: "Gifts",
    price: 15500,
    icon: Gift,
    blurb: "Custom initials, refillable pages.",
    tags: ["boss", "friend", "gift", "boyfriend", "him"],
  },
  {
    id: 22,
    name: "Diamond Stud Earrings",
    cat: "Jewelry",
    price: 175000,
    icon: Gem,
    blurb: "0.5ct total, 18k white gold setting.",
    tags: ["wife", "her", "women", "anniversary", "valentine", "birthday"],
  },
];

const SUGGESTIONS = [
  "What should I buy for my wife on childbirth day?",
  "What should I buy for my boyfriend's birthday?",
  "Phones within 200,000 Naira",
  "Something thoughtful for my boss",
  "Skincare gifts under 30,000 Naira",
  "Best gift for a friend's wedding",
];

const naira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

/* ---------------------------------------------------------
   Matching "AI" logic
--------------------------------------------------------- */
function extractMaxPrice(q) {
  const m = q.match(
    /(?:under|within|below|less than|not more than|budget of)\s*[₦]?\s*([\d,]+)/i,
  );
  if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  const alt = q.match(/[₦]?\s*([\d,]{4,})\s*naira/i);
  if (alt) return parseInt(alt[1].replace(/,/g, ""), 10);
  return null;
}

function matchProducts(query) {
  const q = query.toLowerCase();
  const maxPrice = extractMaxPrice(q);
  const words = q
    .replace(/[?,.]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let scored = CATALOG.map((p) => {
    let score = 0;
    words.forEach((w) => {
      if (p.tags.some((t) => t.includes(w) || w.includes(t))) score += 2;
      if (p.cat.toLowerCase().includes(w)) score += 3;
      if (p.name.toLowerCase().includes(w)) score += 2;
    });
    return { ...p, score };
  });

  if (maxPrice) {
    scored = scored.filter((p) => p.price <= maxPrice);
    scored.sort((a, b) => b.price - a.price || b.score - a.score);
  } else {
    scored.sort((a, b) => b.score - a.score);
  }

  const results = scored.filter((p) => maxPrice || p.score > 0).slice(0, 4);
  if (results.length === 0) {
    return CATALOG.slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }
  return results;
}

function replyText(query, results, maxPrice) {
  const q = query.toLowerCase();
  if (maxPrice)
    return `Here's what I found within ${naira(maxPrice)}. Picked the strongest options closest to your budget first.`;
  if (q.includes("childbirth") || q.includes("new mum") || q.includes("baby"))
    return "Congratulations to the family. Here are a few thoughtful picks for a new mum — comfort and care first, gifts second.";
  if (q.includes("wife") || q.includes("her"))
    return "Here's a shortlist she'd actually love, based on what's trending with couples right now.";
  if (q.includes("boyfriend") || q.includes("husband") || q.includes("him"))
    return "Got you. These tend to land well for the men in a shopper's life — useful, not generic.";
  if (q.includes("boss"))
    return "Keeping it professional but personal — here's what fits a workplace gift budget.";
  if (q.includes("wedding"))
    return "Wedding gifts that don't feel like everyone else's. Here's what I'd bring.";
  return `Here's what I found for "${query}".`;
}

function ProductCard({ product, onAdd }) {
  const Icon = product.icon;
  return (
    <div className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-2.5 min-w-0 shadow-sm transition-colors">
      <div>
        <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 dark:bg-[#22C55E]/20 flex items-center justify-center mb-2">
          <Icon
            size={19}
            className="text-[#0D4633] dark:text-[#4ADE80]"
            strokeWidth={1.8}
          />
        </div>
        <div className="text-[10.5px] tracking-wide text-[#6B7269] dark:text-[#8A9188] uppercase font-medium">
          {product.cat}
        </div>
        <div className="text-[16.5px] text-[#12201A] dark:text-[#F5F4EE] leading-tight mt-0.5">
          {product.name}
        </div>
        <div className="text-[12.5px] text-[#6B7269] dark:text-[#A3AAA4] mt-1 leading-snug">
          {product.blurb}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E4E0D3]/40 dark:border-white/10">
        <span className="text-[15.5px] text-[#0D4633] dark:text-[#4ADE80] font-semibold">
          {naira(product.price)}
        </span>
        <button
          onClick={() => onAdd(product)}
          className="flex items-center gap-1 bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#22C55E] dark:hover:bg-[#4ADE80] transition-colors cursor-pointer"
        >
          <Plus size={13} /> Add
        </button>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, onSubmit, compact }) {
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
        placeholder="Ask Shopanow what to buy..."
        className="flex-1 min-w-0 border-none bg-transparent text-[14.5px] text-[#12201A] dark:text-[#F5F4EE] placeholder-[#6B7269] dark:placeholder-[#6B7269] py-2 focus:outline-none"
      />
      <button
        onClick={onSubmit}
        aria-label="Search"
        className={`w-8.5 h-8.5 rounded-full border-none flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
          value.trim()
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

/* ---------------------------------------------------------
   Home — everything grouped together
--------------------------------------------------------- */
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [bag, setBag] = useState(0);
  const [toast, setToast] = useState("");
  const scrollRef = useRef(null);
  const { openMobile } = useSidebar();

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = (text) => {
    const query = (text ?? input).trim();
    if (!query) return;
    setMessages((m) => [...m, { role: "user", text: query }]);
    setInput("");
    setThinking(true);
    const maxPrice = extractMaxPrice(query.toLowerCase());
    window.setTimeout(() => {
      const results = matchProducts(query);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: replyText(query, results, maxPrice),
          products: results,
        },
      ]);
      setThinking(false);
    }, 650);
  };

  const onAdd = (product) => {
    setBag((b) => b + 1);
    setToast(`Added "${product.name}" to your bag`);
    window.setTimeout(() => setToast(""), 2200);
  };

  const started = messages.length > 0;

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
              Tell Shopanow what you&apos;re looking for, who it&apos;s for, or
              how much you want to spend.
            </p>
          </div>

          {/* Suggestions above the search bar */}
          <Suggestions items={SUGGESTIONS} onSelect={send} />

          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={() => send()}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 pt-7 pb-3"
          >
            <div className="max-w-175 mx-auto flex flex-col gap-6">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[78%] text-[14.5px] leading-relaxed shadow-sm">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex gap-2.5 items-start">
                      <Image
                        src="/logo.png"
                        alt="Shopanow"
                        width={28}
                        height={20}
                        className="rounded-lg object-contain"
                      />
                      <p className="text-[14.5px] leading-relaxed m-0 pt-0.5 text-[#12201A] dark:text-[#F5F4EE]">
                        {m.text}
                      </p>
                    </div>
                    {m.products && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                        {m.products.map((p) => (
                          <ProductCard key={p.id} product={p} onAdd={onAdd} />
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
              {thinking && (
                <div className="flex gap-2.5 items-center">
                  <Image
                    src="/logo.png"
                    alt="Shopanow"
                    width={28}
                    height={20}
                    className="rounded-lg object-contain"
                  />
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
          <div className="px-5 pt-2 pb-6 shrink-0">
            <SearchBar
              value={input}
              onChange={setInput}
              onSubmit={() => send()}
              compact
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
