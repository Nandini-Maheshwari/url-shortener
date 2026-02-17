import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { UrlDetail, DailyClick } from "@/lib/admin-types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-slate-800 font-medium">{String(value)}</p>
    </div>
  );
}

function DailyClicksChart({ dailyClicks }: { dailyClicks: DailyClick[] }) {
  if (!Array.isArray(dailyClicks) || dailyClicks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No click data for the last 14 days.
      </div>
    );
  }

  const validDays = dailyClicks.filter(
    (d) => d && typeof d.date === "string" && typeof d.clicks === "number"
  );

  if (validDays.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No click data for the last 14 days.
      </div>
    );
  }

  const maxClicks = Math.max(...validDays.map((d) => d.clicks), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="space-y-2">
        {validDays.map((day) => (
          <div key={day.date} className="flex items-center gap-3">
            <span className="w-20 text-xs text-slate-500 shrink-0 font-mono">
              {new Date(day.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
              <div
                className="bg-violet-500 h-6 rounded-full transition-all duration-300"
                style={{
                  width: `${(day.clicks / maxClicks) * 100}%`,
                  minWidth: day.clicks > 0 ? "8px" : "0px",
                }}
              />
            </div>
            <span className="w-10 text-xs text-slate-600 text-right font-mono">
              {day.clicks}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminUrlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_admin_url_detail", {
    url_id: id,
  });

  if (error || !data) {
    notFound();
  }

  console.log("RPC get_admin_url_detail response:", JSON.stringify(data, null, 2));
  const detail = data as UrlDetail;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          /{detail.short_code}
        </h1>
        <p className="text-slate-500 text-sm break-all">{detail.long_url}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
          <InfoItem
            label="Total Clicks"
            value={(detail.click_count ?? 0).toLocaleString()}
          />
          <InfoItem label="Created" value={formatDate(detail.created_at)} />
          <InfoItem
            label="Expires"
            value={detail.expires_at ? formatDate(detail.expires_at) : "Never"}
          />
          <InfoItem
            label="Last Clicked"
            value={formatDate(detail.last_clicked_at)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Daily Clicks (Last 14 Days)
        </h2>
        <DailyClicksChart dailyClicks={detail.daily_clicks ?? []} />
      </div>
    </div>
  );
}
