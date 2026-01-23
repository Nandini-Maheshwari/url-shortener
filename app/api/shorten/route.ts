import { generateShortCode } from "@/lib/shortCode";
import { validateUrl } from "@/lib/validateUrl";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rateLimiter";

export async function POST(req: Request) {
    const body = await req.json();
    const { url, alias, expiresAt } = body;

    if(!url) {
        return NextResponse.json(
            {error: "URL is required"},
            {status: 400}
        );
    }

    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ||"unknown";

    if(isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
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

    let shortCode: string | null = null;

    if(alias) {
        const isValid = /^[a-zA-Z0-9-]{3,30}$/.test(alias);

        if(!isValid) {
            return NextResponse.json(
                { error: "Alias must be 3-30 characters and contain only letters, numbers or dashes" },
                { status: 400 }
            );
        }

        shortCode = alias;
    }
    
    if(shortCode) {
        const { data: existing } = await supabase
            .from("short_urls")
            .select("short_code")
            .eq("short_code", shortCode)
            .maybeSingle();

        if(existing) {
            return NextResponse.json(
                { error: "This custom alias is already taken." },
                { status: 400 }
            );
        }
    }

    let attempts = 0;

    while(!shortCode && attempts < 5) {
        const candidate = generateShortCode();

        const { error } = await supabase
            .from("short_urls")
            .insert({
                short_code: candidate,
                long_url: validatedUrl,
                expires_at: expiryDate,
            });
        
        if(!error) {
            shortCode = candidate;
            break;
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

    if(shortCode && alias) {
        const { error } = await supabase
            .from("short_urls")
            .insert({
                short_code: shortCode,
                long_url: validatedUrl,
                expires_at: expiryDate, 
            });
        
        if(error) {
            return NextResponse.json(
                { error: "Failed to create custom alias" },
                { status: 500 } 
            ); 
        }
    }

    return NextResponse.json(
        { shortUrl: `http://localhost:3000/${shortCode}` }
    );
}