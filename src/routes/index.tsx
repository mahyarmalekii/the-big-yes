import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Beer,
  Check,
  Clock,
  Copy,
  Heart,
  MapPin,
  RotateCcw,
  Share2,
  Sparkles,
  Wine,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { submitRsvp } from "@/lib/rsvp.functions";
import { Sketch3DCanvas } from "@/components/3d/Sketch3DCanvas";
import { Diorama3D } from "@/components/3d/Diorama3D";
import { TiltCard } from "@/components/3d/TiltCard";
import { FloatingDoodles } from "@/components/visual/FloatingDoodles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Big Yes — Personal Invitation" },
      { name: "description", content: "A personal invitation. Are you free this week?" },
      { property: "og:title", content: "The Big Yes" },
      { property: "og:description", content: "A personal invitation. Are you free this week?" },
    ],
  }),
  component: DatingApp,
});

type Step = "ask" | "sure1" | "sure2" | "rejected" | "vibe" | "drink" | "when" | "done";
type Vibe = "drink" | null;

type LocationPick = {
  label: string;
  url: string;
  category: "wine" | "beer";
};

const LOCATIONS: LocationPick[] = [
  {
    label: "Pandoras Natural Wine Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Pandoras+Zossener+Str.+65+10961+Berlin",
    category: "wine",
  },
  {
    label: "Windhorst Intimate Cocktail & Wine Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Windhorst+Bar+Dorotheenstra%C3%9Fe+65+10117+Berlin",
    category: "wine",
  },
  {
    label: "Ankerklause Waterfront Beer Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Ankerklause+Kottbusser+Damm+104+10967+Berlin",
    category: "beer",
  },
  {
    label: "Café am Neuen See (Lakeside Beer Garden)",
    url: "https://www.google.com/maps/search/?api=1&query=Caf%C3%A9+am+Neuen+See+Lichtensteinallee+2+10787+Berlin",
    category: "beer",
  },
];

const DRINK_OPTIONS = [
  {
    id: "wine",
    label: "Wine",
    sub: "A velvety red or crisp chilled white in a cozy corner",
    Icon: Wine,
    note: "Classy & unhurried",
  },
  {
    id: "beer",
    label: "Beer",
    sub: "Cold, crisp, casual Berlin canal-side energy",
    Icon: Beer,
    note: "Honest & refreshing",
  },
];

const TIME_SLOTS = ["6:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

function DatingApp() {
  const [name, setName] = useState("YOU");
  const [step, setStep] = useState<Step>("ask");
  const [vibe, setVibe] = useState<Vibe>(null);
  const [hoverVibe, setHoverVibe] = useState<"drink" | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationPick | null>(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0, n: 0 });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get("n");
    if (n) setName(n);

    if (params.get("rsvp") === "1") {
      const v = params.get("v") as Vibe;
      if (v) setVibe(v);
      if (params.get("k")) setPick(params.get("k"));
      if (params.get("d")) setDate(new Date(params.get("d")!));
      if (params.get("t")) setTime(params.get("t"));
      if (params.get("l")) {
        const found = LOCATIONS.find((item) => item.url === params.get("l"));
        if (found) setLocation(found);
      }
      setStep("done");
    }
  }, []);

  const options = DRINK_OPTIONS;
  const currentPickObj = options.find((item) => item.id === pick);
  const pickLabel = currentPickObj?.label ?? "";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams({
      rsvp: "1",
      n: name,
      v: vibe ?? "",
      k: pick ?? "",
      d: date?.toISOString() ?? "",
      t: time ?? "",
      l: location?.url ?? "",
    });
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  }, [name, vibe, pick, date, time, location]);

  const dodge = () => {
    setNoPos({
      x: Math.round((Math.random() - 0.5) * 150),
      y: Math.round((Math.random() - 0.5) * 50),
      n: noPos.n + 1,
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const confirm = async () => {
    if (!vibe || !pick || !date || !time || saving) return;
    setSaving(true);

    const filteredLocations = LOCATIONS.filter((l) => l.category === pick);
    const assignedLocation =
      filteredLocations.length > 0
        ? filteredLocations[Math.floor(Math.random() * filteredLocations.length)]
        : LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    setLocation(assignedLocation);

    try {
      await submitRsvp({
        data: {
          vibe,
          choice: pickLabel,
          date_iso: date.toISOString(),
          time_slot: time,
          location_url: assignedLocation.url,
          location_name: assignedLocation.label,
        },
      });
    } catch (error) {
      console.error("RSVP submit failed:", error);
    } finally {
      setSaving(false);
      setStep("done");
    }
  };

  return (
    <div className="legal-pad relative">
      {/* Floating Parallax Doodles Layer */}
      <FloatingDoodles />

      {/* Legal Pad Top Binding Header */}
      <div className="legal-pad-header z-10 relative">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow inline-block shadow-sm" />
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-yellow-300">
            THE BIG YES &bull; PERSONAL INVITATION
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
          Berlin 2026
        </span>
      </div>

      <div className="legal-pad-content z-10">
        {/* Left red margin annotations */}
        <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between pointer-events-none select-none font-handwriting text-red-600/75 text-base leading-tight w-10 text-right pr-2">
          <span>note</span>
          <span className="rotate-[-90deg] my-auto">urgent</span>
          <span>yes</span>
        </div>

        {/* STEP 1: THE FAST ASK — HAS VIDEO 1 */}
        {step === "ask" && (
          <div className="enter-fade space-y-5">
            <div className="flex items-center justify-between border-b border-black/15 pb-2">
              <div className="font-mono text-xs text-black/70">
                FOR: <span className="font-bold text-black border-b border-black px-1">{name}</span>
              </div>
              <span className="status-stamp">INVITATION</span>
            </div>

            <div className="relative">
              <span className="font-handwriting text-2xl text-blue-700 block -rotate-1 mb-0.5">
                a question with great potential:
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl leading-[1.1] tracking-tight text-black">
                Are you free <br />
                <span className="font-serif-italic text-4xl sm:text-5xl text-blue-900 underline decoration-yellow-400 decoration-4 underline-offset-4">
                  for a date this week?
                </span>
              </h1>
            </div>

            <p className="text-sm text-black/80 leading-relaxed font-medium">
              I could have sent a regular text. Instead, I built this entire handwritten legal pad webpage. That should tell you something about my commitment to a great evening.
            </p>

            {/* Framed Video */}
            <div className="note-card p-2 bg-white rotate-[-1deg] my-2 relative">
              <div className="tape-strip -top-2.5 left-1/3 -rotate-2" />
              <div className="video-frame-box">
                <video autoPlay loop muted playsInline className="w-full h-auto max-h-52 object-cover">
                  <source src="/assets/video1.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="font-handwriting text-sm text-black/60 text-center mt-1">
                my honest reaction if you say yes
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => setStep("vibe")}
                className="btn-primary-action w-full py-3.5 text-lg"
              >
                YES, OBVIOUSLY <ArrowRight size={20} />
              </button>

              <div className="relative">
                <button
                  onMouseEnter={dodge}
                  onFocus={dodge}
                  onClick={() => setStep("sure1")}
                  style={{
                    transform: noPos.n ? `translate(${noPos.x}px, ${noPos.y}px)` : undefined,
                  }}
                  className="btn-secondary-action w-full py-2.5 text-xs text-black/60 font-mono uppercase"
                >
                  no thanks
                </button>
              </div>

              {noPos.n > 2 && (
                <p className="text-center font-handwriting text-lg text-red-600 font-bold -rotate-1">
                  * the "no" button is running away. Take the hint.
                </p>
              )}
            </div>
          </div>
        )}

        {/* OBJECTION 1 — WITH 3D THREE.JS PAPER AIRPLANE */}
        {step === "sure1" && (
          <div className="enter-fade space-y-5">
            <div className="note-card p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="font-mono text-xs font-bold text-red-600 uppercase flex items-center gap-1.5">
                  <Sparkles size={15} /> Objection Noted
                </span>
                <span className="font-handwriting text-lg text-black/50">are you sure?</span>
              </div>

              <Sketch3DCanvas type="objection" height={120} />

              <h2 className="font-heading text-2xl leading-tight">
                Wait. <br />
                <span className="font-serif-italic text-3xl text-red-600">Are you sure?</span>
              </h2>
              <p className="text-sm text-black/80 leading-relaxed font-medium">
                Because I already told my mom. She is making a scrapbook. Please do not do this to Linda.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setStep("vibe")}
                  className="btn-primary-action w-full py-3 text-base"
                >
                  Fine, one date <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setStep("sure2")}
                  className="btn-secondary-action w-full py-2.5 text-xs text-black/60 font-mono uppercase"
                >
                  Yes, I am sure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OBJECTION 2 */}
        {step === "sure2" && (
          <div className="enter-fade space-y-5">
            <div className="note-card p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="font-mono text-xs font-bold text-red-600 uppercase flex items-center gap-1.5">
                  <Heart size={15} /> Second Thoughts?
                </span>
                <span className="font-handwriting text-lg text-black/50">think carefully</span>
              </div>

              <Sketch3DCanvas type="objection" height={120} />

              <h2 className="font-heading text-2xl leading-tight">
                Really <br />
                <span className="font-serif-italic text-3xl text-red-600">sure sure?</span>
              </h2>
              <p className="text-sm text-black/80 leading-relaxed font-medium">
                Last check. I will accept your answer with grace and roughly seven unnecessary sighs.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setStep("vibe")}
                  className="btn-primary-action w-full py-3 text-base"
                >
                  Alright, one date <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setStep("rejected")}
                  className="btn-secondary-action w-full py-2.5 text-xs text-black/60 font-mono uppercase"
                >
                  Walking away
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECTED */}
        {step === "rejected" && (
          <div className="enter-fade space-y-5">
            <div className="note-card p-5 bg-white space-y-4">
              <span className="status-stamp status-stamp-red">OFFICIAL RESULT</span>
              <h2 className="font-heading text-2xl">
                Cool. <br />
                <span className="font-serif-italic text-3xl text-black/60">Cool cool cool.</span>
              </h2>
              <p className="text-sm text-black/80 leading-relaxed font-medium">
                A whole legal pad website. For nothing. That is fine. I will just frame it and call it my villain origin story.
              </p>
              <div className="border border-black/20 rounded-lg p-3 font-mono text-xs space-y-1 bg-yellow-50">
                <div className="flex justify-between">
                  <span>Cause of death:</span>
                  <span className="font-bold text-red-600">"no thanks"</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery time:</span>
                  <span className="font-bold">3 to 5 business years</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setStep("ask");
                  setNoPos({ x: 0, y: 0, n: 0 });
                }}
                className="btn-primary-action w-full py-3 text-base"
              >
                Wait, let me try again <RotateCcw size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VIBE CHECK — FEATURES 3D BLENDER MINIATURE DIORAMA */}
        {step === "vibe" && (
          <div className="enter-fade space-y-5">
            <div>
              <span className="font-mono text-xs text-blue-900 font-bold uppercase tracking-wider">
                STEP 01 / 02: THE VIBE
              </span>
              <h2 className="font-heading text-3xl tracking-tight text-black mt-1">
                What are we <br />
                <span className="font-serif-italic text-4xl text-blue-800">drinking tonight?</span>
              </h2>
              <p className="font-handwriting text-xl text-black/70 mt-0.5 -rotate-1">
                pick one. Both options end with a great time.
              </p>
            </div>

            {/* 3D Blender Diorama Scene with Interactive Highlighting */}
            <div className="note-card p-1 bg-white/75 backdrop-blur-xs relative overflow-hidden">
              <div className="tape-strip -top-2 right-8 rotate-2" />
              <Diorama3D highlight={hoverVibe} height={230} />
              <p className="text-center font-mono text-[10px] uppercase text-black/40 pb-1">
                [ 3D Date Diorama &bull; Drag to Orbit ]
              </p>
            </div>

            <div className="grid gap-3.5">
              <TiltCard
                onClick={() => {
                  setVibe("drink");
                  setStep("drink");
                }}
                className="option-card-interactive group"
              >
                <div
                  onMouseEnter={() => setHoverVibe("drink")}
                  onMouseLeave={() => setHoverVibe(null)}
                  className="flex items-start gap-3.5"
                >
                  <div className="p-3 rounded-lg border-2 border-black bg-purple-100 text-purple-800 shadow-sm">
                    <Wine size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-lg">Drinks</span>
                      <span className="font-mono text-xs font-bold text-black/40">01</span>
                    </div>
                    <p className="text-xs text-black/70 mt-0.5">Wine or beer in a cozy warm-lit spot.</p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        )}


        {/* STEP 3: DRINK SPECIFIC CHOICE */}
        {step === "drink" && (
          <div className="enter-fade space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-900 font-bold uppercase tracking-wider">
                  STEP 02 / 02: DRINK
                </span>
                <button
                  onClick={() => setStep("vibe")}
                  className="text-xs font-mono font-bold flex items-center gap-1 text-black/60 hover:text-black"
                >
                  <ArrowLeft size={14} /> Change Vibe
                </button>
              </div>
              <h2 className="font-heading text-3xl tracking-tight text-black mt-1">
                Choose your <br />
                <span className="font-serif-italic text-4xl text-purple-800">drink preference</span>
              </h2>
              <p className="font-handwriting text-xl text-black/70 mt-0.5 -rotate-1">
                Classy wine or cold honest beer.
              </p>
            </div>

            {/* 3D Interactive Sketches for Drink */}
            <div className="note-card p-1 bg-white/70 backdrop-blur-xs relative overflow-hidden">
              <div className="tape-strip -top-2 left-8 -rotate-2" />
              <Sketch3DCanvas type="drink" height={140} />
              <p className="text-center font-mono text-[10px] uppercase text-black/40 pb-1">
                [ Interactive 3D Wireframe Sketch ]
              </p>
            </div>

            <div className="grid gap-3">
              {options.map(({ id, label, sub, Icon, note }, idx) => {
                const selected = pick === id;
                return (
                  <TiltCard
                    key={id}
                    onClick={() => setPick(id)}
                    selected={selected}
                    className={cn("option-card-interactive", selected && "selected")}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          "p-3 rounded-lg border-2 border-black shadow-sm",
                          selected ? "bg-yellow-300 text-black" : "bg-black/5 text-black/80",
                        )}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-base">{label}</span>
                          <span className="font-mono text-xs font-bold text-black/40">0{idx + 1}</span>
                        </div>
                        <p className="text-xs text-black/70 mt-0.5">{sub}</p>
                        <p className="font-handwriting text-sm text-blue-700 mt-1 font-semibold">
                          * {note}
                        </p>
                      </div>
                      {selected && (
                        <div className="self-center p-1 rounded-full bg-black text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                  </TiltCard>
                );
              })}
            </div>

            <button
              disabled={!pick}
              onClick={() => setStep("when")}
              className="btn-primary-action w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lock Choice & Pick Date <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 4: CALENDAR & TIME */}
        {step === "when" && (
          <div className="enter-fade space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-green-900 font-bold uppercase tracking-wider">
                  STEP 03 / 03: DATE & TIME
                </span>
                <button
                  onClick={() => setStep("drink")}
                  className="text-xs font-mono font-bold flex items-center gap-1 text-black/60 hover:text-black"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
              <h2 className="font-heading text-3xl tracking-tight text-black mt-1">
                When are we <br />
                <span className="font-serif-italic text-4xl text-green-800">doing this?</span>
              </h2>
              <p className="font-handwriting text-xl text-black/70 mt-0.5 -rotate-1">
                select any day starting tomorrow, then choose a time.
              </p>
            </div>

            {/* 3D Timepiece Scene */}
            <div className="note-card p-1 bg-white/70 backdrop-blur-xs relative overflow-hidden">
              <div className="tape-strip -top-2 right-12 rotate-3" />
              <Sketch3DCanvas type="when" height={130} />
              <p className="text-center font-mono text-[10px] uppercase text-black/40 pb-1">
                [ 3D Timepiece &bull; Parallax Orbit ]
              </p>
            </div>

            {/* Calendar with 3D Tilt */}
            <TiltCard maxTilt={5} className="note-card p-3.5 bg-white flex flex-col items-center relative">
              <div className="tape-strip -top-2 right-6 rotate-3" />
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => {
                  const tomorrow = new Date();
                  tomorrow.setHours(0, 0, 0, 0);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return d < tomorrow;
                }}
                className="w-full"
              />
            </TiltCard>

            {/* Time Slot Selection + Dress Message */}
            {date && (
              <div className="space-y-2.5 enter-fade">
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-black/70" />
                  <span className="font-heading text-xs uppercase tracking-wider">Select an Evening Time</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={cn("time-slot-btn", time === slot && "selected")}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {/* Dress Message */}
                <div className="note-card p-3 bg-yellow-50 border border-yellow-300 rotate-[-0.5deg] relative mt-1">
                  <div className="tape-strip -top-2.5 left-1/2 -rotate-1" />
                  <p className="font-handwriting text-lg text-blue-800 font-semibold text-center">
                    ✨ oh, and — dress something nice
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={!date || !time || saving}
              onClick={confirm}
              className="btn-primary-action w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Locking it in..." : "Seal the Deal"} <Sparkles size={18} />
            </button>
          </div>
        )}

        {/* STEP 5: CONFIRMATION / OFFICIAL RECEIPT — HAS CELEBRATION VIDEO 2 */}
        {step === "done" && (
          <div className="enter-fade space-y-5">
            <div className="note-card p-5 bg-white space-y-4 relative">
              <div className="tape-strip -top-2.5 left-8 -rotate-3" />
              
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="status-stamp status-stamp-green">CONFIRMED</span>
                <span className="font-mono text-xs font-bold text-black/50">DATE RECEIPT</span>
              </div>

              <div className="space-y-1">
                <h2 className="font-heading text-2xl sm:text-3xl leading-tight">
                  Great news. <br />
                  <span className="font-serif-italic text-3xl sm:text-4xl text-green-800">
                    We are doing this.
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-black/75 font-medium">
                  I have cleared my calendar, selected an exceptional spot, and look forward to our date.
                </p>
              </div>

              {/* Celebratory Video 2 */}
              <div className="video-frame-box my-2">
                <video autoPlay loop muted playsInline className="w-full h-auto max-h-48 object-cover">
                  <source src="/assets/video2.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Receipt Breakdown */}
              <div className="border-2 border-black rounded-lg p-3.5 bg-yellow-50/70 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                  <span className="text-black/50 uppercase">Plan</span>
                  <span className="font-bold">
                    {pickLabel} {vibe === "food" ? "(Dinner)" : "(Drinks)"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                  <span className="text-black/50 uppercase">Date</span>
                  <span className="font-bold">
                    {date
                      ? date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                  <span className="text-black/50 uppercase">Time</span>
                  <span className="font-bold">{time ?? "TBD"}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                  <span className="text-black/50 uppercase">Spot</span>
                  <span className="font-bold text-right truncate max-w-[190px]">
                    {location?.label ?? "Curated Spot"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/50 uppercase">Dress Code</span>
                  <span className="font-bold text-blue-900">Casual & cute</span>
                </div>
              </div>

              {location && (
                <a
                  href={location.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary-action w-full py-2.5 text-xs font-mono font-bold"
                >
                  <MapPin size={14} /> Open Venue on Google Maps
                </a>
              )}

              {/* Shareable Link Box */}
              <div className="border border-black/20 rounded-lg p-3 bg-yellow-100/50 space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-black/70 font-semibold uppercase">
                  <Share2 size={13} /> Shareable RSVP Link
                </div>
                <button
                  onClick={copy}
                  className="btn-primary-action w-full py-2.5 text-xs font-mono font-bold"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy RSVP Link
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  setStep("ask");
                  setVibe(null);
                  setPick(null);
                  setDate(undefined);
                  setTime(null);
                  setLocation(null);
                  window.history.replaceState({}, "", window.location.pathname);
                }}
                className="text-center w-full font-mono text-xs text-black/40 hover:text-black py-1"
              >
                Reset / Start over
              </button>
            </div>
          </div>
        )}

        {/* Legal Pad Footer */}
        <footer className="mt-auto pt-6 pb-2 text-center border-t border-black/10">
          <p className="font-mono text-[10px] uppercase tracking-wider text-black/40">
            The Big Yes &bull; Made with good intentions &bull; 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
