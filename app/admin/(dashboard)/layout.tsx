import Link from "next/link";
import { logoutAction } from "../actions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-lg font-semibold text-slate-800 tracking-tight"
          >
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Back to Shortener
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
