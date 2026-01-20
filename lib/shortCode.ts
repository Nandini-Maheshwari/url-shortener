
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export function generateShortCode(length = 6) {
    let code = "";

    for(let i=0; i<length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}
