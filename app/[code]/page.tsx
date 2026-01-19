import { redirect, notFound } from "next/navigation";
import { getUrl } from "@/lib/urlStore";

export default function RedirectPage({
    params,
}: {
    params: { code: string };
}) {
    const longUrl = getUrl(params.code);

    if(!longUrl) {
        notFound();
    }

    redirect(longUrl);
}