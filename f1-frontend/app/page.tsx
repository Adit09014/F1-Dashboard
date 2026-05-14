import DashboardPage from "@/components/dashboard";
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-[#0B0D17]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <DashboardPage />
      </div>
    </main>
  );
}
