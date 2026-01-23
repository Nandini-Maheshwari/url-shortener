"use client"
import { useState } from "react";

const ALIAS_REGEX = /^[a-zA-Z0-9-]{3,30}$/;

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiryOption, setExpiryOption] = useState("3d");
  const [customExpiry, setCustomExpiry] = useState("");
  const [alias, setAlias] = useState("");

  async function handleShorten() {
    setLoading(true);
    setError("");
    setShortUrl("");

    if (alias && !isAliasValid) {
      setError(
        "Invalid alias. Use 3–30 characters: letters, numbers, dashes only."
      );
      setLoading(false);
      return;
    }

    let expiresAt: string | undefined;

    if (expiryOption !== "custom") {
      const now = new Date();

      const daysMap: Record<string, number> = {
        "1d": 1,
        "3d": 3,
        "7d": 7,
        "30d": 30,
      };

      now.setDate(now.getDate() + daysMap[expiryOption]);
      expiresAt = now.toISOString();
    } else if (expiryOption === "custom" && customExpiry) {
      expiresAt = new Date(customExpiry).toISOString();
    }

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ 
          url,
          ...(alias && { alias }),
          ...(expiresAt && { expiresAt }),
        })
      });

      const data = await res.json();
      console.log("res data: ", data);

      if(!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setShortUrl(data.shortUrl);
      console.log("shortUrl: ", data.shortUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isAliasValid = alias.length === 0 || ALIAS_REGEX.test(alias);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-center">URL Shortener 🚀</h1>

        <input
          type="text"
          placeholder="Enter long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded border p-2"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Custom alias (optional)
          </label>
          <input
            type="text"
            placeholder="my-custom-link"
            value={alias}
            onChange={(e) =>
              setAlias(e.target.value.replace(/\s/g, ""))
            } //removes spaces
            className="w-full rounded border p-2"
          />
          <p className="text-xs text-gray-500">
            Letters, numbers, and dashes only
          </p>
        </div>

        {alias && !isAliasValid && (
          <p className="text-xs text-red-500">
            Alias must be 3–30 characters and contain only letters, numbers, or dashes
          </p>
        )}

        <button
          onClick={handleShorten}
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </button>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Expiry
          </label>

          <select
            value={expiryOption}
            onChange={(e) => setExpiryOption(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="1d">1 day</option>
            <option value="3d">3 days (default)</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="custom">Custom date</option>
          </select>

          {expiryOption === "custom" && (
            <input
              type="datetime-local"
              value={customExpiry}
              onChange={(e) => setCustomExpiry(e.target.value)}
              className="w-full rounded border p-2"
            />
          )}
        </div>


        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {shortUrl && (
          <div className="rounded border p-2 text-center">
            <p className="text-sm text-gray-600">Short URL</p>
            <a
              href={shortUrl}
              target="_blank"
              className="font-medium text-blue-600 underline"
            >
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
