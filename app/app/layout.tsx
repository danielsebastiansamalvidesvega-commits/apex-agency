import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#070709]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
