"use client";

import { useState } from "react";
import Link from "next/link";
import type { DashboardOverview, HotUrl } from "@/lib/admin-types";
import { searchUrlsAction } from "../../actions";

function truncateUrl(url: string, maxLength: number): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + "...";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-slate-800">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function UrlTable({ urls }: { urls: HotUrl[] }) {
  if (urls.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No URLs found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-6 py-3 font-medium text-slate-500">
                Short Code
              </th>
              <th className="px-6 py-3 font-medium text-slate-500">
                Long URL
              </th>
              <th className="px-6 py-3 font-medium text-slate-500 text-right">
                Total Clicks
              </th>
              <th className="px-6 py-3 font-medium text-slate-500 text-right">
                Last 7 Days
              </th>
              <th className="px-6 py-3 font-medium text-slate-500">
                Last Clicked
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {urls.map((url) => (
              <tr key={url.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/urls/${url.id}`}
                    className="text-violet-600 font-medium hover:text-violet-700"
                  >
                    /{url.short_code}
                  </Link>
                </td>
                <td
                  className="px-6 py-4 text-slate-600 max-w-xs"
                  title={url.long_url}
                >
                  {truncateUrl(url.long_url, 50)}
                </td>
                <td className="px-6 py-4 text-slate-800 font-medium text-right">
                  {(url.click_count ?? 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-800 font-medium text-right">
                  {(url.clicks_last_7_days ?? 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {formatDate(url.last_clicked_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardContent({
  overview,
}: {
  overview: DashboardOverview;
}) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HotUrl[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const isSearchActive = searchResults !== null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError(null);

    const result = await searchUrlsAction(trimmed);

    if (result.error) {
      setSearchError(result.error);
      setSearchResults(null);
    } else {
      setSearchResults(result.data ?? []);
    }

    setSearching(false);
  }

  function handleClear() {
    setQuery("");
    setSearchResults(null);
    setSearchError(null);
  }

  const displayedUrls = isSearchActive
    ? searchResults
    : overview.hot_urls.slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          URL shortener analytics at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total URLs" value={overview.total_urls} />
        <SummaryCard label="Total Clicks" value={overview.total_clicks} />
        <SummaryCard
          label="Clicks (Last 7 Days)"
          value={overview.clicks_last_7_days}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {isSearchActive ? "Search Results" : "Hot URLs (Top 10)"}
          </h2>
          {isSearchActive && (
            <button
              onClick={handleClear}
              className="text-sm text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by short code or URL..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{searchError}</p>
          </div>
        )}

        <UrlTable urls={displayedUrls} />
      </div>
    </div>
  );
}
