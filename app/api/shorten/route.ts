import { generateShortCode, saveUrl, hasCode } from "@/lib/urlStore";
import { validateUrl } from "@/lib/validateUrl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const { url } = body;

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

    let code: string;
    do {
        code = generateShortCode();
    } while (hasCode(code));

    //In production, enforce a unique constraint at the DB level
    //and retry generation on conflict.

    saveUrl(code, validatedUrl);

    return NextResponse.json({
        shortUrl: `http://localhost:3000/${code}`
    });
}