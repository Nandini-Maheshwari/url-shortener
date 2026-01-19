import { redirect, notFound } from "next/navigation";
import { getUrl } from "@/lib/urlStore";

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    console.log("hit");

    const { code } = await params;
    const longUrl = getUrl(code);

    if(!longUrl) {
        notFound();
    }
    console.log("longUrl found: ", longUrl);
    redirect(longUrl);
}

// GET /abc123
// ↓
// app/[code]/page.tsx runs
// ↓
// await params → { code: "abc123" }
// ↓
// getUrl("abc123")
// ↓
// redirect("https://...")
// ↓
// 307 Location header
// ↓
// Browser redirects