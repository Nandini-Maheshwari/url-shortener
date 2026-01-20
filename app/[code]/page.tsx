import { redirect, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    console.log("hit");

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

    //2. Optional expiry check
    if(data.expires_at && new Date(data.expires_at) < new Date()) {
        notFound();
    }

    //3. Incremenet click count
    void supabase.rpc("increment_click_count", {
        sc: code,
    });

    //4. Redirect
    console.log("redirect: ", data.long_url);
    redirect(data.long_url);
}
