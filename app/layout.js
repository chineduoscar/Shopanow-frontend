import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import ThemeProvider from "./components/ThemeProvider";
import { SidebarProvider } from "./components/SidebarContext";

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
      <body className="bg-[#F5F4EE] dark:bg-[#0D110E] h-full overflow-hidden transition-colors">
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
