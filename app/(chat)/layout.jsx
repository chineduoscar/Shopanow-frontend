import Sidebar from "../components/Sidebar";
import { SidebarProvider } from "../components/SidebarContext";
import AuthWatcher from "../components/AuthWatcher";

export default function ChatLayout({ children }) {
  return (
    <SidebarProvider>
      <AuthWatcher />
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />
        <main className="flex h-dvh min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
