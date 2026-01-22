import { generateShortCode } from "@/lib/shortCode";
import { validateUrl } from "@/lib/validateUrl";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    const body = await req.json();
    const { url, expiresAt } = body;

    if(!url) {
        return NextResponse.json(
            {error: "URL is required"},
            {status: 400}
        );
    }

    const validatedUrl = validateUrl(url);
    if(!validatedUrl) {
        return NextResponse.json(
            { error: "Invalid URL" },
            { status: 400 }
        );
    }

    let expiryDate: string;

    if(expiresAt) {
        const date = new Date(expiresAt);
        if(isNaN(date.getTime())) {
            return NextResponse.json(
                { error: "Invalid expiry date" },
                { status: 400 }
            );
        }
        if(date <= new Date()) {
            return NextResponse.json(
                { error: "Expiry must be in the future"},
                { status: 400 }
            );
        }

        expiryDate = date.toISOString();
    } else {
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 3);

        expiryDate = defaultExpiry.toISOString();
    }

    // check if long url already exists
    const { data: existing } = await supabase
        .from("short_urls")
        .select("short_code")
        .eq("long_url", validatedUrl)
        .gt("expires_at", new Date().toISOString()) //expired urls are ignored
        .single();

    //not deleting expired url's data cause we dont wanna
    //loose analytics

    if (existing) {
        return NextResponse.json({
            shortUrl: `http://localhost:3000/${existing.short_code}`,
        });
    }

    let shortCode: string;
    let attempts = 0;

    while(attempts < 5) {
        shortCode = generateShortCode();

        const { error } = await supabase
            .from("short_urls")
            .insert({
                short_code: shortCode,
                long_url: validatedUrl,
                expires_at: expiryDate,
            });
        
        if(!error) {
            return NextResponse.json({
                shortUrl: `http://localhost:3000/${shortCode}`,
            });
        }

        //retry only on unique constraint violation
        if(error.code != "23505") {
            return NextResponse.json(
                { error: "Database error"},
                { status: 500 }
            );
        }

        attempts++;
    }

    return NextResponse.json(
        { error: "Failed to generate unique short url" },
        { status: 500 }
    );
}