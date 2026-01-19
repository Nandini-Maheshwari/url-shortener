import { generateShortCode, saveUrl } from "@/lib/urlStore";
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

    const code = generateShortCode();
    saveUrl(code, url);

    return NextResponse.json({
        shortUrl: `http://localhost:3000/${code}`
    });
}