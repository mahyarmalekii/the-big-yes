import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox as InboxIcon, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Inbox,
});

type Rsvp = {
  id: string;
  created_at: string;
  vibe: "food" | "drink";
  choice: string;
  date_iso: string;
  time_slot: string;
};

function Inbox() {
  const [key, setKey] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (k: string) => {
    if (!k) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/inbox?key=${encodeURIComponent(k)}`);
      if (!res.ok) {
        setError(res.status === 401 ? "Wrong key." : `Error ${res.status}`);
        setRsvps(null);
      } else {
        const j = await res.json();
        setRsvps(j.rsvps ?? []);
      }
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const k = p.get("key");
    if (k) {
      setKey(k);
      void load(k);
    }
  }, []);

  return (
    <main className="grain-overlay min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="poster-ink flex items-center justify-between px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">◆ inbox</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">private</span>
        </div>

        <div className="poster p-5">
          <div className="flex items-center gap-2">
            <InboxIcon className="h-5 w-5" />
            <h1 className="font-display text-3xl">RSVPS</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Every time she taps <em>Seal the deal</em>, it shows up here.
          </p>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void load(key);
            }}
          >
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="paste your inbox key"
              className="flex-1 min-w-0 rounded-full border-2 border-ink bg-cream px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground"
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "OPEN"}
            </button>
          </form>
          {error && <p className="mt-3 font-mono text-xs text-destructive">{error}</p>}
        </div>

        {rsvps && rsvps.length === 0 && (
          <div className="poster p-6 text-center">
            <p className="font-display text-xl">NOTHING YET.</p>
            <p className="mt-2 text-sm text-muted-foreground">The suspense is a whole vibe.</p>
          </div>
        )}

        {rsvps && rsvps.map((r) => {
          const d = new Date(r.date_iso);
          const when = isNaN(d.getTime())
            ? r.date_iso
            : d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
          const submitted = new Date(r.created_at).toLocaleString();
          return (
            <div key={r.id} className="poster overflow-hidden">
              <div className="bg-sage border-b-2 border-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                submitted · {submitted}
              </div>
              <div className="p-4 space-y-2">
                <RowKV k="vibe" v={r.vibe === "food" ? "food 🍽️" : "drinks 🥂"} />
                <RowKV k="pick" v={r.choice.toUpperCase()} />
                <RowKV k="when" v={when} />
                <RowKV k="time" v={r.time_slot} last />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function RowKV({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`grid grid-cols-[60px_1fr] items-baseline gap-3 py-1.5 ${!last ? "border-b border-dashed border-ink/30" : ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</span>
      <span className="font-display text-base text-right leading-tight">{v}</span>
    </div>
  );
}
