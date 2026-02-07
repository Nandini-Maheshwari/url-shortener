export function validateUrl(input: string): string | null {
    try {
        if (!/^https?:\/\//i.test(input)) {
            input = "https://" + input;
        }

        const url = new URL(input);

        if(url.protocol != "http:" && url.protocol !== "https:") {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}