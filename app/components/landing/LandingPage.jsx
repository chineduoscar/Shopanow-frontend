"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LoaderCircle, MessageCircle, Sparkles, ShoppingBag } from "lucide-react";
import axios from "@/app/lib/api-client";
import { getApiErrorMessage } from "@/app/lib/api-error";
import ChatDemo from "./ChatDemo";

// Change these to match your real routes
const SIGNUP = "/auth/register";
const LOGIN = "/auth/login";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Say what you need",
    text: "Share your budget, who it's for, or two phones to compare.",
  },
  {
    icon: Sparkles,
    title: "Get matched picks",
    text: "See phones that fit, with specs, prices in naira, and why.",
  },
  {
    icon: ShoppingBag,
    title: "Add to your bag",
    text: "Keep the ones you like and decide when you're ready.",
  },
];

const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[#12201A] dark:bg-[#22C55E] text-[#F5F4EE] dark:text-[#0D110E] font-medium hover:bg-[#22C55E] dark:hover:bg-[#4ADE80] transition-colors";
const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-[#12201A]/25 dark:border-white/20 text-[#12201A] dark:text-[#F5F4EE] font-medium hover:border-[#22C55E] hover:text-[#22C55E] transition-colors";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [contactState, setContactState] = useState("idle");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios.get("/api/products")
      .then(({ data: response }) => {
        const result = response?.data ?? response;
        if (!Array.isArray(result)) throw new TypeError("Unexpected product catalog response.");
        if (!cancelled) setProducts(result.slice(0, 8));
      })
      .catch((error) => {
        if (!cancelled) {
          setProductsError(
            getApiErrorMessage(error, "Could not load the product catalog."),
          );
          console.error("Failed to load the public product catalog:", error);
        }
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submitContact = async (event) => {
    event.preventDefault();
    setContactState("loading");
    setContactError("");
    try {
      await axios.post("/api/contact", contact);
      setContact({ name: "", email: "", message: "" });
      setContactState("success");
    } catch (error) {
      setContactError(
        getApiErrorMessage(error, "Your message could not be sent. Please try again."),
      );
      setContactState("error");
    }
  };

  const naira = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  return (
    <div className="min-h-screen bg-[#F5F4EE] dark:bg-[#0D110E] text-[#12201A] dark:text-[#F5F4EE] transition-colors">
      {/* top bar */}
      <header className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4">
        <Link href="/" aria-label="Shopanow home" className="shrink-0">
          <Image
            src="/logoname_light.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="w-24 sm:w-32 h-auto object-contain dark:hidden"
            priority
          />
          <Image
            src="/logoname_dark.png"
            alt="Shopanow"
            width={140}
            height={36}
            className="w-24 sm:w-32 h-auto object-contain hidden dark:block"
            priority
          />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Link
            href={LOGIN}
            className="text-[13px] sm:text-[14px] px-2.5 sm:px-3 py-2 whitespace-nowrap hover:text-[#22C55E] transition-colors"
          >
            Log in
          </Link>
          <Link
            href={SIGNUP}
            className={`${primaryBtn} text-[13px] sm:text-[14px] px-3.5 sm:px-4 py-2 whitespace-nowrap`}
          >
            <span className="sm:hidden">Sign up</span>
            <span className="hidden sm:inline">Create account</span>
          </Link>
        </nav>
      </header>

      <main>
        {/* hero */}
        <section className="max-w-5xl mx-auto px-5 pt-12 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] m-0 max-w-2xl mx-auto">
            Find your next phone just by asking
          </h1>
          <p className="text-[#6B7269] dark:text-[#A3AAA4] text-base sm:text-lg mt-4 leading-relaxed max-w-xl mx-auto">
            Tell Shopanow your budget and what matters to you. Get phones that
            fit, with prices in naira.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link
              href={SIGNUP}
              className={`${primaryBtn} text-[15px] px-6 py-3`}
            >
              Create free account
            </Link>
            <Link
              href={LOGIN}
              className={`${outlineBtn} text-[15px] px-6 py-3`}
            >
              Log in
            </Link>
          </div>
        </section>

        {/* animated chat preview */}
        <section className="px-5 pb-16">
          <ChatDemo />
        </section>

        {/* how it works */}
        <section className="max-w-5xl mx-auto px-5 pb-16">
          <h2 className="text-2xl sm:text-3xl text-center m-0 mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#151B18] border border-[#E4E0D3] dark:border-white/10 rounded-2xl p-5"
              >
                <span className="w-10 h-10 rounded-full bg-[#22C55E]/15 text-[#0D4633] dark:text-[#4ADE80] flex items-center justify-center mb-3">
                  <Icon size={18} />
                </span>
                <h3 className="text-[16px] font-medium m-0">{title}</h3>
                <p className="text-[14px] text-[#6B7269] dark:text-[#A3AAA4] mt-1.5 mb-0 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="max-w-5xl mx-auto px-5 pb-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl m-0">Shop the latest</h2>
              <p className="mt-2 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
                Products currently available in our catalog.
              </p>
            </div>
            <Link href={LOGIN} className="inline-flex items-center gap-1 text-sm font-medium hover:text-[#16A34A]">
              Shop with Shopanow <ArrowRight size={15} />
            </Link>
          </div>
          {productsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#6B7269] dark:text-[#A3AAA4]">
              <LoaderCircle size={18} className="animate-spin" /> Loading products…
            </div>
          ) : productsError ? (
            <p role="status" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">{productsError}</p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-[#E4E0D3] bg-white p-6 text-center text-sm text-[#6B7269] dark:border-white/10 dark:bg-[#151B18] dark:text-[#A3AAA4]">
              New products are on the way. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={LOGIN}
                  className="overflow-hidden rounded-2xl border border-[#E4E0D3] bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#151B18]"
                >
                  <div className="flex h-36 items-center justify-center bg-white p-3 dark:bg-[#151B18] sm:h-44">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain" />
                    ) : <ShoppingBag size={30} className="text-[#A3AAA4]" />}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[11px] uppercase tracking-wide text-[#6B7269] dark:text-[#A3AAA4]">{product.brand || product.category}</p>
                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium">{product.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-[#0D4633] dark:text-[#4ADE80]">{naira(product.price_ngn)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="contact" className="border-y border-[#E4E0D3] bg-white/70 py-14 dark:border-white/10 dark:bg-[#151B18]/60">
          <div className="mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-[.8fr_1.2fr] md:items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl">Get in touch</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7269] dark:text-[#A3AAA4]">
                Have a question or need a hand? Send us a message and our team will be in touch.
              </p>
            </div>
            <form onSubmit={submitContact} className="space-y-4">
              {contactState === "success" && (
                <p role="status" className="rounded-xl bg-[#22C55E]/10 p-3 text-sm text-[#0D4633] dark:text-[#4ADE80]">
                  Thanks for reaching out. Your message has been received.
                </p>
              )}
              {contactError && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{contactError}</p>}
              <label className="block text-sm font-medium">
                Name
                <input
                  name="name"
                  value={contact.name}
                  onChange={(event) => setContact({ ...contact, name: event.target.value })}
                  required
                  maxLength={150}
                  autoComplete="name"
                  className="mt-1 w-full rounded-xl border border-[#E4E0D3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-[#0D110E]"
                />
              </label>
              <label className="block text-sm font-medium">
                Email
                <input
                  name="email"
                  type="email"
                  value={contact.email}
                  onChange={(event) => setContact({ ...contact, email: event.target.value })}
                  required
                  maxLength={254}
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-[#E4E0D3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-[#0D110E]"
                />
              </label>
              <label className="block text-sm font-medium">
                Message
                <textarea
                  name="message"
                  value={contact.message}
                  onChange={(event) => setContact({ ...contact, message: event.target.value })}
                  required
                  maxLength={5000}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-xl border border-[#E4E0D3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-[#0D110E]"
                />
              </label>
              <button
                type="submit"
                disabled={contactState === "loading"}
                className={`${primaryBtn} gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {contactState === "loading" ? "Sending…" : "Send message"}
                {contactState !== "loading" && <ArrowRight size={15} />}
              </button>
            </form>
          </div>
        </section>

        {/* closing call to action */}
        <section className="max-w-5xl mx-auto px-5 pb-20 text-center">
          <h2 className="text-2xl sm:text-3xl m-0">
            Ready to find your phone?
          </h2>
          <Link
            href={SIGNUP}
            className={`${primaryBtn} text-[15px] px-6 py-3 mt-6`}
          >
            Create free account
          </Link>
          <p className="text-[13.5px] text-[#6B7269] dark:text-[#A3AAA4] mt-4">
            Already have an account?{" "}
            <Link href={LOGIN} className="underline hover:text-[#22C55E]">
              Log in
            </Link>
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E4E0D3] dark:border-white/10">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-9 text-sm text-[#6B7269] dark:text-[#A3AAA4] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" aria-label="Shopanow home">
              <Image src="/logoname_light.png" alt="Shopanow" width={140} height={36} className="w-32 h-auto dark:hidden" />
              <Image src="/logoname_dark.png" alt="Shopanow" width={140} height={36} className="hidden w-32 h-auto dark:block" />
            </Link>
            <p className="mt-3 max-w-xs leading-relaxed">Find the right phone for your needs, compare options, and shop with confidence.</p>
          </div>
          <div>
            <h2 className="font-semibold text-[#12201A] dark:text-[#F5F4EE]">Explore</h2>
            <ul className="mt-3 space-y-2">
              <li><Link href="#products" className="hover:text-[#16A34A]">Products</Link></li>
              <li><Link href={LOGIN} className="hover:text-[#16A34A]">Log in</Link></li>
              <li><Link href={SIGNUP} className="hover:text-[#16A34A]">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-[#12201A] dark:text-[#F5F4EE]">Contact</h2>
            <p className="mt-3 leading-relaxed">Questions? Send us a message using the contact form and we’ll get back to you.</p>
            <Link href="#contact" className="mt-2 inline-block font-medium text-[#0D4633] hover:underline dark:text-[#4ADE80]">Contact our team</Link>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="font-semibold text-[#12201A] dark:text-[#F5F4EE]">Shopanow</h2>
            <p className="mt-3">Smart choices, made simple.</p>
          </div>
          <p className="border-t border-[#E4E0D3] pt-5 sm:col-span-2 lg:col-span-4 dark:border-white/10">
            © {new Date().getFullYear()} Shopanow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
