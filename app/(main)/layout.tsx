import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
