import { SidebarNav } from "@/components/layout/SidebarNav";

const SERVICE_NAME = "限界突破塾";

export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="border-sidebar-border flex h-14 items-center border-b px-5">
        <span className="text-sm font-semibold tracking-wide">{SERVICE_NAME}</span>
      </div>
      <SidebarNav />
    </aside>
  );
}
