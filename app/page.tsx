"use client"
import { useState } from "react";

const ALIAS_REGEX = /^[a-zA-Z0-9-]{3,30}$/;

const RESERVED_ALIASES = [
  "api",
  "admin",
  "login",
  "logout",
  "signup",
  "register",
  "dashboard",
  "settings",
  "favicon.ico",
  "robots.txt",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiryOption, setExpiryOption] = useState("3d");
  const [customExpiry, setCustomExpiry] = useState("");
  const [alias, setAlias] = useState("");

  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  async function handleShorten() {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    if (alias && !isAliasValid) {
      setError("Invalid alias. Use 3–30 characters: letters, numbers, dashes only. Don't use reserved alias.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          ...(alias && { alias }),
          ...(expiresAt && { expiresAt }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setShortUrl(data.shortUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleShorten();
    }
  };

  const isAliasReserved = alias.length > 0 && RESERVED_ALIASES.includes(alias.toLowerCase());

  const isAliasValid = alias.length === 0 || (ALIAS_REGEX.test(alias) && !isAliasReserved);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[20px_20px] opacity-50" />
      
      <div className="relative w-full max-w-lg">
        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Shorten your link</h1>
            <p className="text-slate-500 text-sm mt-1">Create short, memorable URLs in seconds</p>
          </div>

          {/* URL Input */}
          <div className="space-y-5">
            <div className="relative">
              <input
                type="url"
                placeholder="Paste your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
              />
              {url && (
                <button
                  onClick={() => setUrl("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Options Toggle */}
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showOptions ? 'Hide options' : 'Show options'}
            </button>

            {/* Collapsible Options */}
            <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${showOptions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              {/* Custom Alias */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom alias
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    yoursite.co/
                  </span>
                  <input
                    type="text"
                    placeholder="my-link"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.replace(/\s/g, ""))}
                    className={`w-full pl-24 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 ${
                      alias && !isAliasValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {alias && !isAliasValid && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    3–30 characters, letters, numbers, or dashes only. 
                  </p>
                )}
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link expires in
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: "1d", label: "1d" },
                    { value: "3d", label: "3d" },
                    { value: "7d", label: "7d" },
                    { value: "30d", label: "30d" },
                    { value: "custom", label: "Custom" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExpiryOption(option.value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        expiryOption === option.value
                          ? "bg-violet-100 text-violet-700 ring-2 ring-violet-500/20"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {expiryOption === "custom" && (
                  <input
                    type="datetime-local"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className="mt-3 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200"
                  />
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Shorten Button */}
            <button
              onClick={handleShorten}
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Shortening...</span>
                </>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Result */}
            {shortUrl && (
              <div className="mt-6 p-5 bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-700">Your link is ready!</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-white rounded-xl border border-emerald-200">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-800 font-medium hover:text-violet-600 transition-colors break-all"
                    >
                      {shortUrl}
                    </a>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      copied 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white border border-emerald-200 text-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                    }`}
                  >
                    {copied ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Fast, free, and secure URL shortening
        </p>
      </div>
    </main>
  );
}
