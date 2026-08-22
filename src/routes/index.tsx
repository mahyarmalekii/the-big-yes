import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Beer,
  Check,
  Clock,
  Coffee,
  Copy,
  Droplets,
  GlassWater,
  Heart,
  MapPin,
  RotateCcw,
  Share2,
  Sparkles,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { submitRsvp, recordVisit } from "@/lib/rsvp.functions";
import { Sketch3DCanvas } from "@/components/3d/Sketch3DCanvas";
import { Diorama3D } from "@/components/3d/Diorama3D";
import { TiltCard } from "@/components/3d/TiltCard";
import { FloatingDoodles } from "@/components/visual/FloatingDoodles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Big Yes: Personal Invitation" },
      { name: "description", content: "A personal invitation. Are you free this week?" },
      { property: "og:title", content: "The Big Yes" },
      { property: "og:description", content: "A personal invitation. Are you free this week?" },
    ],
  }),
  component: DatingApp,
});

type Step = "ask" | "sure1" | "sure2" | "rejected" | "drink" | "when" | "done";
type DrinkPick = "coffee" | "beer" | "wine" | "cocktail" | "water" | null;

type LocationPick = {
  label: string;
  url: string;
  category: "coffee" | "beer" | "wine" | "cocktail" | "water";
};

const LOCATIONS: LocationPick[] = [
  // Coffee
  {
    label: "The Barn Coffee Roasters in Mitte",
    url: "https://www.google.com/maps/search/?api=1&query=The+Barn+Coffee+Roasters+Auguststra%C3%9Fe+58+10119+Berlin",
    category: "coffee",
  },
  {
    label: "Bonanza Coffee in Prenzlauer Berg",
    url: "https://www.google.com/maps/search/?api=1&query=Bonanza+Coffee+Oderberger+Str.+35+10435+Berlin",
    category: "coffee",
  },
  {
    label: "Five Elephant in Kreuzberg",
    url: "https://www.google.com/maps/search/?api=1&query=Five+Elephant+Reichenberger+Str.+101+10999+Berlin",
    category: "coffee",
  },
  // Beer
  {
    label: "Ankerklause Waterfront Beer Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Ankerklause+Kottbusser+Damm+104+10967+Berlin",
    category: "beer",
  },
  {
    label: "Cafe am Neuen See Lakeside Beer Garden",
    url: "https://www.google.com/maps/search/?api=1&query=Caf%C3%A9+am+Neuen+See+Lichtensteinallee+2+10787+Berlin",
    category: "beer",
  },
  {
    label: "Prater Garten Oldest Beer Garden in Berlin",
    url: "https://www.google.com/maps/search/?api=1&query=Prater+Garten+Kastanienallee+7+10435+Berlin",
    category: "beer",
  },
  // Wine
  {
    label: "Pandoras Natural Wine Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Pandoras+Zossener+Str.+65+10961+Berlin",
    category: "wine",
  },
  {
    label: "Windhorst Intimate Wine Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Windhorst+Bar+Dorotheenstra%C3%9Fe+65+10117+Berlin",
    category: "wine",
  },
  {
    label: "Rutz Weinbar in Mitte",
    url: "https://www.google.com/maps/search/?api=1&query=Rutz+Weinbar+Chausseestra%C3%9Fe+8+10115+Berlin",
    category: "wine",
  },
  // Cocktail
  {
    label: "Buck and Breck Craft Cocktail Bar",
    url: "https://www.google.com/maps/search/?api=1&query=Buck+and+Breck+Brunnenstra%C3%9Fe+177+10119+Berlin",
    category: "cocktail",
  },
  {
    label: "Velvet Bar Candlelit Classics",
    url: "https://www.google.com/maps/search/?api=1&query=Velvet+Bar+Oranienstra%C3%9Fe+2+10999+Berlin",
    category: "cocktail",
  },
  {
    label: "Ora Berlin Hidden Gem Cocktails",
    url: "https://www.google.com/maps/search/?api=1&query=Ora+Berlin+Oranienstra%C3%9Fe+168+10999+Berlin",
    category: "cocktail",
  },
  // Water at parks
  {
    label: "Tempelhofer Feld the old runway turned park",
    url: "https://www.google.com/maps/search/?api=1&query=Tempelhofer+Feld+Berlin",
    category: "water",
  },
  {
    label: "Volkspark Friedrichshain with a bottle of tap water",
    url: "https://www.google.com/maps/search/?api=1&query=Volkspark+Friedrichshain+Berlin",
    category: "water",
  },
  {
    label: "Treptower Park with spectacular river views and zero alcohol",
    url: "https://www.google.com/maps/search/?api=1&query=Treptower+Park+Berlin",
    category: "water",
  },
];

const DRINK_OPTIONS: {
  id: NonNullable<DrinkPick>;
  label: string;
  sub: string;
  Icon: LucideIcon;
  note: string;
  color: string;
}[] = [
  {
    id: "coffee",
    label: "Coffee",
    sub: "A quiet corner, a good flat white, and an excuse to talk for three hours straight",
    Icon: Coffee,
    note: "Low key and absolutely devastating",
    color: "bg-amber-100 text-amber-900",
  },
  {
    id: "beer",
    label: "Beer",
    sub: "Cold, crisp, and the only truly honest drink in Berlin",
    Icon: Beer,
    note: "No pretense whatsoever",
    color: "bg-yellow-100 text-yellow-900",
  },
  {
    id: "wine",
    label: "Wine",
    sub: "A glass of something that makes both of us seem significantly more interesting",
    Icon: Wine,
    note: "Classy until the second glass",
    color: "bg-purple-100 text-purple-900",
  },
  {
    id: "cocktail",
    label: "Cocktail",
    sub: "Something clever in a dimly lit room where we can pretend to be sophisticated adults",
    Icon: GlassWater,
    note: "Sophisticated until it is not",
    color: "bg-pink-100 text-pink-900",
  },
  {
    id: "water",
    label: "Water",
    sub: "We sit on a park bench, watch the joggers go by, and question all of our life choices together",
    Icon: Droplets,
    note: "Chaotic good energy and I love it",
    color: "bg-sky-100 text-sky-900",
  },
];

const COFFEE_TIME_SLOTS = ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"];
const EVENING_TIME_SLOTS = ["6:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"];

const NOTE_MAX = 500;

function DatingApp() {
  const [name, setName] = useState("YOU");
  const [nick, setNick] = useState<string | null>(null);
  const [joke, setJoke] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("ask");
  const [pick, setPick] = useState<DrinkPick>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationPick | null>(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0, n: 0 });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [personalNote, setPersonalNote] = useState("");

  const displayName = name !== "YOU" && name.trim().length > 0 ? name.trim() : null;
  const displayNick = nick?.trim() || displayName;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawN = params.get("n");
    const rawJoke = params.get("joke") || params.get("msg") || params.get("topic");

    let parsedName = "YOU";
    let parsedJoke = rawJoke ? rawJoke.trim() : null;

    if (rawN) {
      if (rawN.includes("\n")) {
        const lines = rawN.split("\n").map((l) => l.trim()).filter(Boolean);
        parsedName = lines[0] || "YOU";
        if (!parsedJoke && lines.length > 1) {
          parsedJoke = lines.slice(1).join(" ");
        }
      } else {
        parsedName = rawN.trim();
      }
      setName(parsedName);
    }

    if (parsedJoke) setJoke(parsedJoke);

    const nk = params.get("nick");
    if (nk) setNick(nk.trim());

    const isRsvp = params.get("rsvp") === "1";

    if (isRsvp) {
      if (params.get("k")) setPick(params.get("k") as DrinkPick);
      if (params.get("d")) setDate(new Date(params.get("d")!));
      if (params.get("t")) setTime(params.get("t"));
      if (params.get("l")) {
        const found = LOCATIONS.find((item) => item.url === params.get("l"));
        if (found) setLocation(found);
      }
      setStep("done");
    }

    // Notify on Telegram when the link is opened (deduplicated per session)
    const sessionKey = `visit_notified_${parsedName}_${isRsvp ? "rsvp" : "ask"}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      const guestForNotify = parsedName !== "YOU" ? parsedName : undefined;
      recordVisit({
        data: {
          guest_name: guestForNotify,
          agenda: parsedJoke || undefined,
          is_rsvp_view: isRsvp,
        },
      }).catch((err) => console.error("Visit recording failed:", err));
    }
  }, []);

  const currentPickObj = DRINK_OPTIONS.find((item) => item.id === pick);
  const pickLabel = currentPickObj?.label ?? "";
  const isCoffee = pick === "coffee";
  const timeSlots = isCoffee ? COFFEE_TIME_SLOTS : EVENING_TIME_SLOTS;

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams({
      rsvp: "1",
      n: name,
      k: pick ?? "",
      d: date?.toISOString() ?? "",
      t: time ?? "",
      l: location?.url ?? "",
    });
    if (joke) p.set("joke", joke);
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  }, [name, pick, date, time, location, joke]);

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

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    setTime(null);
  };

  const confirm = async () => {
    if (!pick || !date || !time || saving) return;
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
          vibe: "drink",
          choice: pickLabel,
          date_iso: date.toISOString(),
          time_slot: time,
          location_url: assignedLocation.url,
          location_name: assignedLocation.label,
          personal_note: personalNote.trim() || undefined,
          guest_name: displayName || (name !== "YOU" ? name : undefined),
          agenda: joke || undefined,
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
      <FloatingDoodles />

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
        <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between pointer-events-none select-none font-handwriting text-red-600/75 text-base leading-tight w-10 text-right pr-2">
          <span>note</span>
          <span className="rotate-[-90deg] my-auto">urgent</span>
          <span>yes</span>
        </div>

        {/* STEP 1: ASK */}
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
                  {displayNick ? `for a date this week, ${displayNick}?` : "for a date this week?"}
                </span>
              </h1>
            </div>

            <p className="text-sm text-black/80 leading-relaxed font-medium">
              I could have sent a regular text. Instead, I built this entire handwritten legal pad webpage. That should tell you something about my commitment to a great evening.
            </p>

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
                onClick={() => setStep("drink")}
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
                  the no button is running away. Take the hint.
                </p>
              )}
            </div>
          </div>
        )}

        {/* OBJECTION 1 */}
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
                Because I already told my mom{displayNick ? ` about you, ${displayNick}` : ""}. She is making a scrapbook. Please do not do this to Linda.
              </p>
              <div className="space-y-2.5 pt-2">
                <button onClick={() => setStep("drink")} className="btn-primary-action w-full py-3 text-base">
                  Fine, one date <ArrowRight size={18} />
                </button>
                <button onClick={() => setStep("sure2")} className="btn-secondary-action w-full py-2.5 text-xs text-black/60 font-mono uppercase">
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
                <button onClick={() => setStep("drink")} className="btn-primary-action w-full py-3 text-base">
                  Alright, one date <ArrowRight size={18} />
                </button>
                <button onClick={() => setStep("rejected")} className="btn-secondary-action w-full py-2.5 text-xs text-black/60 font-mono uppercase">
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
                  <span className="font-bold text-red-600">no thanks</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery time:</span>
                  <span className="font-bold">3 to 5 business years</span>
                </div>
              </div>
              <button
                onClick={() => { setStep("ask"); setNoPos({ x: 0, y: 0, n: 0 }); }}
                className="btn-primary-action w-full py-3 text-base"
              >
                Wait, let me try again <RotateCcw size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DRINK PICKER */}
        {step === "drink" && (
          <div className="enter-fade space-y-5">
            <div>
              <span className="font-mono text-xs text-blue-900 font-bold uppercase tracking-wider">
                STEP 01 OF 02: THE DRINK
              </span>
              <h2 className="font-heading text-3xl tracking-tight text-black mt-1">
                What are we <br />
                <span className="font-serif-italic text-4xl text-blue-800">
                  {displayNick ? `having, ${displayNick}?` : "having?"}
                </span>
              </h2>
              <p className="font-handwriting text-xl text-black/70 mt-0.5 -rotate-1">
                pick one. I will find the perfect spot for it.
              </p>
            </div>

            <div className="note-card p-1 bg-white/75 backdrop-blur-xs relative overflow-hidden">
              <div className="tape-strip -top-2 right-8 rotate-2" />
              <Diorama3D highlight={null} height={200} />
              <p className="text-center font-mono text-[10px] uppercase text-black/40 pb-1">
                [ 3D Date Diorama &bull; Drag to Orbit ]
              </p>
            </div>

            <div className="grid gap-3">
              {DRINK_OPTIONS.map(({ id, label, sub, Icon, note, color }, idx) => {
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
                          selected ? "bg-yellow-300 text-black" : color,
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
                          {note}
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
              onClick={() => { setTime(null); setStep("when"); }}
              className="btn-primary-action w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lock Choice and Pick Date <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 3: CALENDAR and TIME */}
        {step === "when" && (
          <div className="enter-fade space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-green-900 font-bold uppercase tracking-wider">
                  STEP 02 OF 02: DATE AND TIME
                </span>
                <button
                  onClick={() => setStep("drink")}
                  className="text-xs font-mono font-bold flex items-center gap-1 text-black/60 hover:text-black"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
              <h2 className="font-heading text-3xl tracking-tight text-black mt-1">
                When are you <br />
                <span className="font-serif-italic text-4xl text-green-800">
                  {displayNick ? `free, ${displayNick}?` : "free?"}
                </span>
              </h2>
              <p className="font-handwriting text-xl text-black/70 mt-0.5 -rotate-1">
                {isCoffee
                  ? "coffee hours only: pick any day from tomorrow, between 4 PM and 7 PM."
                  : "select any day from tomorrow, then pick an evening time."}
              </p>
            </div>

            <div className="note-card p-1 bg-white/70 backdrop-blur-xs relative overflow-hidden">
              <div className="tape-strip -top-2 right-12 rotate-3" />
              <Sketch3DCanvas type="when" height={130} />
              <p className="text-center font-mono text-[10px] uppercase text-black/40 pb-1">
                [ 3D Timepiece &bull; Parallax Orbit ]
              </p>
            </div>

            <TiltCard maxTilt={5} className="note-card p-3.5 bg-white flex flex-col items-center relative">
              <div className="tape-strip -top-2 right-6 rotate-3" />
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(d) => {
                  const tomorrow = new Date();
                  tomorrow.setHours(0, 0, 0, 0);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return d < tomorrow;
                }}
                className="w-full"
              />
            </TiltCard>

            {date && (
              <div className="space-y-2.5 enter-fade">
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-black/70" />
                  <span className="font-heading text-xs uppercase tracking-wider">
                    {isCoffee ? "Select an Afternoon Time" : "Select an Evening Time"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={cn("time-slot-btn", time === slot && "selected")}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <div className="note-card p-3 bg-yellow-50 border border-yellow-300 rotate-[-0.5deg] relative mt-1">
                  <div className="tape-strip -top-2.5 left-1/2 -rotate-1" />
                  <p className="font-handwriting text-lg text-blue-800 font-semibold text-center">
                    {joke ? `oh and dress something nice (${joke} approved)` : "oh and dress something nice"}
                  </p>
                </div>

                {/* Personal note textarea for her */}
                {time && (
                  <div className="note-card p-3 bg-white rotate-[0.5deg] relative enter-fade">
                    <div className="tape-strip -top-2.5 left-1/4 rotate-1" />
                    <p className="font-handwriting text-lg text-black/60 mb-2">
                      leave a note{" "}
                      <span className="font-mono text-[10px] text-black/30">(optional)</span>
                    </p>
                    <textarea
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value.slice(0, NOTE_MAX))}
                      placeholder="anything you want to say before the big day..."
                      rows={3}
                      className="w-full resize-none bg-transparent border-b-2 border-dashed border-black/20 font-handwriting text-base text-black/80 placeholder:text-black/30 outline-none focus:border-black/40 transition-colors leading-relaxed"
                    />
                    <p className="font-mono text-[10px] text-black/30 text-right mt-1">
                      {personalNote.length} / {NOTE_MAX}
                    </p>
                  </div>
                )}
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

        {/* STEP 4: CONFIRMATION RECEIPT */}
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
                  Great news{displayNick ? `, ${displayNick}` : ""}. <br />
                  <span className="font-serif-italic text-3xl sm:text-4xl text-green-800">
                    We are doing this.
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-black/75 font-medium">
                  I have cleared my calendar, selected an exceptional spot, and look forward to our date.
                </p>
              </div>

              <div className="video-frame-box my-2">
                <video autoPlay loop muted playsInline className="w-full h-auto max-h-48 object-cover">
                  <source src="/assets/video2.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="border-2 border-black rounded-lg p-3.5 bg-yellow-50/70 space-y-2.5 font-mono text-xs">
                {displayName && (
                  <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                    <span className="text-black/50 uppercase">Guest</span>
                    <span className="font-bold">{displayName.toUpperCase()}</span>
                  </div>
                )}
                {joke && (
                  <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                    <span className="text-black/50 uppercase">Agenda</span>
                    <span className="font-bold text-blue-900">{joke}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                  <span className="text-black/50 uppercase">Plan</span>
                  <span className="font-bold">{pickLabel}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                  <span className="text-black/50 uppercase">Date</span>
                  <span className="font-bold">
                    {date
                      ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
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
                <div className={cn("flex justify-between items-center", personalNote.trim() && "pb-1.5 border-b border-black/10")}>
                  <span className="text-black/50 uppercase">Dress Code</span>
                  <span className="font-bold text-blue-900">Something nice</span>
                </div>
                {personalNote.trim() && (
                  <div>
                    <span className="text-black/50 uppercase block mb-1">Your note</span>
                    <p className="font-handwriting text-sm text-black/75 leading-snug">
                      &ldquo;{personalNote.trim()}&rdquo;
                    </p>
                  </div>
                )}
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

              <div className="border border-black/20 rounded-lg p-3 bg-yellow-100/50 space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-black/70 font-semibold uppercase">
                  <Share2 size={13} /> Shareable RSVP Link
                </div>
                <button onClick={copy} className="btn-primary-action w-full py-2.5 text-xs font-mono font-bold">
                  {copied ? (
                    <><Check size={14} /> Copied to Clipboard</>
                  ) : (
                    <><Copy size={14} /> Copy RSVP Link</>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  setStep("ask");
                  setPick(null);
                  setDate(undefined);
                  setTime(null);
                  setLocation(null);
                  setPersonalNote("");
                  window.history.replaceState({}, "", window.location.pathname);
                }}
                className="text-center w-full font-mono text-xs text-black/40 hover:text-black py-1"
              >
                Reset and start over
              </button>
            </div>
          </div>
        )}

        <footer className="mt-auto pt-6 pb-2 text-center border-t border-black/10">
          <p className="font-mono text-[10px] uppercase tracking-wider text-black/40">
            The Big Yes &bull; Made with good intentions{displayNick ? ` for ${displayNick}` : ""} &bull; 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
