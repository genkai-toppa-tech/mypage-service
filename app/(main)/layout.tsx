import { AppShell } from "@/components/layout/AppShell";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
