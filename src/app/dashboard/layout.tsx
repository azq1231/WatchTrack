import type { Metadata } from "next";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "Dashboard | WatchTrack",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
