import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { DashboardOverview } from "@/lib/admin-types";
import DashboardContent from "./_components/dashboard-content";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_admin_dashboard_overview");

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-sm text-red-600">
          Failed to load dashboard: {error.message}
        </p>
      </div>
    );
  }

  const overview = data as DashboardOverview;

  return <DashboardContent overview={overview} />;
}
