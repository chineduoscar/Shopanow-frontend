import { Poppins } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Shopanow - Shop with AI",
  description:
    "Chat with Shopanow to find the best deals, gift inspiration, and product reviews in seconds. Shop smarter, not harder.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-[#F5F4EE] text-[#12201A] transition-colors dark:bg-[#0D110E] dark:text-[#F5F4EE]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
