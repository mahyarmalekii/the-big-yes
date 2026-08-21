import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Share2 } from "lucide-react";

export const Route = createFileRoute("/compose")({
  head: () => ({
    meta: [
      { title: "Compose Invite" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Compose,
});

function Compose() {
  const [baseUrl, setBaseUrl] = useState("");
  const [name, setName] = useState("");
  const [joke, setJoke] = useState("");
  const [nick, setNick] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const finalUrl = (() => {
    const p = new URLSearchParams();
    if (name.trim()) p.set("n", name.trim());
    if (joke.trim()) p.set("joke", joke.trim());
    if (nick.trim()) p.set("nick", nick.trim());
    const query = p.toString();
    return `${baseUrl}${query ? `?${query}` : ""}`;
  })();

  const copy = async () => {
    await navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    try {
      await navigator.share({ url: finalUrl, title: "The Big Yes" });
    } catch {
      // dismissed
    }
  };

  const Field = ({
    label,
    hint,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    hint: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => (
    <div className="space-y-1.5">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-black">
          {label}
        </p>
        <p className="font-mono text-[10px] text-black/40 mt-0.5">{hint}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 font-mono text-sm text-black placeholder:text-black/25 outline-none focus:border-black transition-colors"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">

        {/* Header */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            The Big Yes
          </p>
          <h1 className="font-mono text-2xl font-black tracking-tight text-black mt-1">
            Compose Invite
          </h1>
          <p className="font-mono text-xs text-black/50 mt-1">
            Fill in what you want. Everything is optional.
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Field
            label="Her name"
            hint="Shown on the first screen header (FOR: Ani)"
            value={name}
            onChange={setName}
            placeholder="Ani"
          />
          <Field
            label="Inside joke / Topic / Context"
            hint="Weaved naturally into the later steps & Date Receipt (e.g. Agenda / Dress code)"
            value={joke}
            onChange={setJoke}
            placeholder="Research assistant job"
          />
          <Field
            label="Nickname (optional)"
            hint="Casual name for footer"
            value={nick}
            onChange={setNick}
            placeholder="Anni"
          />
        </div>

        {/* Live URL preview */}
        <div className="rounded-xl border-2 border-black/10 bg-white p-4 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            Your link
          </p>
          <p className="font-mono text-xs text-black/70 break-all leading-relaxed">
            {finalUrl}
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={copy}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-black py-3 font-mono text-xs font-bold text-white active:opacity-80 transition-opacity"
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>

            {canShare && (
              <button
                onClick={share}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-black py-3 font-mono text-xs font-bold text-black active:opacity-80 transition-opacity"
              >
                <Share2 size={14} /> Share
              </button>
            )}

            <a
              href={finalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 rounded-lg border-2 border-black/20 px-3 py-3 font-mono text-xs text-black/50 active:opacity-80 transition-opacity"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <p className="font-mono text-[10px] text-black/30 text-center">
          This page is not indexed. Only you know it exists.
        </p>
      </div>
    </main>
  );
}
