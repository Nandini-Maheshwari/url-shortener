import { redirect, notFound } from "next/navigation";
import { after } from "next/server";
import { supabase } from "@/lib/supabase";

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;
    
    //1. fetch url
    const { data, error } = await supabase
        .from("short_urls")
        .select("long_url, expires_at")
        .eq("short_code", code)
        .single();
    
    if(error || !data) {
        notFound();
    }

    //2. expiry check
    if(data.expires_at !== null && new Date(data.expires_at) < new Date()) {
        notFound();
    }

    //3. Increment click count after the response is sent, so the redirect doesn't wait on it
    after(async () => {
        const { error } = await supabase.rpc("handle_short_url_click", { sc: code });
        if (error) console.error("click increment failed:", error);
    });

    //4. Redirect
    redirect(data.long_url);
}

//server-rendered page, not a controller
//navigation / redirect