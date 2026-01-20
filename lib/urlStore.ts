type UrlStore = Map<string, string>;

const globalForUrlStore = globalThis as unknown as {
    urlStore?: UrlStore;
}

export const urlStore = globalForUrlStore.urlStore ?? new Map<string, string>();

if(process.env.NODE_ENV !== "production") {
    globalForUrlStore.urlStore = urlStore;
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export function generateShortCode(length = 6) {
    let code = "";

    for(let i=0; i<length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

export function getUrl(code: string) {
    return urlStore.get(code);
}