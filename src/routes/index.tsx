import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Beer,
  Check,
  Coffee,
  Copy,
  Pizza,
  Sandwich,
  Share2,
  Soup,
  Sparkles,
  Wine,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { submitRsvp } from "@/lib/rsvp.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Big Yes" },
      { name: "description", content: "One question. One excellent date." },
      { property: "og:title", content: "The Big Yes" },
      { property: "og:description", content: "One question. One excellent date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskPage,
});

type Step = "ask" | "sure1" | "sure2" | "rejected" | "vibe" | "food" | "drink" | "when" | "done";
type Vibe = "food" | "drink" | null;

type LocationPick = {
  label: string;
  url: string;
};

const LOCATION_OPTIONS: LocationPick[] = [
  { label: "Pandoras", url: "https://www.google.com/maps/search/?api=1&query=Pandoras+Zossener+Str.+65+10961+Berlin" },
  { label: "Luna D'Oro", url: "https://www.google.com/maps/search/?api=1&query=Luna+D%27Oro+Auguststraße+24+10117+Berlin" },
  { label: "Mausi.", url: "https://www.google.com/maps/search/?api=1&query=Mausi.+Richardpl.+1+12055+Berlin" },
  { label: "Café Pilz", url: "https://www.google.com/maps/search/?api=1&query=Caf%C3%A9+Pilz+Weisestra%C3%9Fe+58+12049+Berlin" },
  { label: "Windhorst Bar", url: "https://www.google.com/maps/search/?api=1&query=Windhorst+Bar+Dorotheenstra%C3%9Fe+65+10117+Berlin" },
  { label: "Bar Milano", url: "https://www.google.com/maps/search/?api=1&query=Bar+Milano+Brunnenstra%C3%9Fe+11+10119+Berlin" },
  { label: "Bricks & Mortar", url: "https://www.google.com/maps/search/?api=1&query=Bricks+%26+Mortar+Voigtstra%C3%9Fe+42+10247+Berlin" },
  { label: "Nathanja & Heinrich Café / Bar Neukölln", url: "https://www.google.com/maps/search/?api=1&query=Nathanja+%26+Heinrich+Caf%C3%A9+Bar+Neuk%C3%B6lln+Weichselstra%C3%9Fe+44+12045+Berlin" },
  { label: "Ankerklause", url: "https://www.google.com/maps/search/?api=1&query=Ankerklause+Kottbusser+Damm+104+10967+Berlin" },
  { label: "Donau115", url: "https://www.google.com/maps/search/?api=1&query=Donau115+Donaustra%C3%9Fe+115+12043+Berlin" },
  { label: "Café am Neuen See", url: "https://www.google.com/maps/search/?api=1&query=Caf%C3%A9+am+Neuen+See+Lichtensteinallee+2+10787+Berlin" },
  { label: "Honey Lou Bar", url: "https://www.google.com/maps/search/?api=1&query=Honey+Lou+Bar+Anzengruberstra%C3%9Fe+3+12043+Berlin" },
  { label: "Bar39", url: "https://www.google.com/maps/search/?api=1&query=Bar39+Oranienstra%C3%9Fe+39+10999+Berlin" },
  { label: "Café Luzia", url: "https://www.google.com/maps/search/?api=1&query=Caf%C3%A9+Luzia+Oranienstra%C3%9Fe+34+10999+Berlin" },
  { label: "Brandi Espresso Bar", url: "https://www.google.com/maps/search/?api=1&query=Brandi+Espresso+Bar+Dieffenbachstra%C3%9Fe+63+10967+Berlin" },
  { label: "Concierge Coffee", url: "https://www.google.com/maps/search/?api=1&query=Concierge+Coffee+Paul-Lincke-Ufer+39-40+10999+Berlin" },
];

const FOOD = [
  { id: "doner", label: "Doner", sub: "messy, perfect, worth it", Icon: Sandwich },
  { id: "pizza", label: "Pizza", sub: "the trust exercise", Icon: Pizza },
  { id: "pasta", label: "Pasta", sub: "a little romance, extra parmesan", Icon: Soup },
];

const DRINK = [
  { id: "coffee", label: "Coffee", sub: "we're just talking, sure", Icon: Coffee },
  { id: "beer", label: "Beer", sub: "cheap, honest, correct", Icon: Beer },
  { id: "wine", label: "Wine or cocktails", sub: "so we're doing that tonight", Icon: Wine },
];

function AskPage() {
  const [step, setStep] = useState<Step>("ask");
  const [vibe, setVibe] = useState<Vibe>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationPick | null>(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0, n: 0 });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("rsvp") === "1") {
      const v = p.get("v") as Vibe;
      if (v) setVibe(v);
      if (p.get("k")) setPick(p.get("k"));
      if (p.get("d")) setDate(new Date(p.get("d")!));
      if (p.get("t")) setTime(p.get("t"));
      if (p.get("l"))
        setLocation(
          LOCATION_OPTIONS.find((item) => item.url === p.get("l")) ?? LOCATION_OPTIONS[0],
        );
      setStep("done");
    }
  }, []);

  const menu = vibe === "food" ? FOOD : DRINK;
  const pickLabel = menu.find((item) => item.id === pick)?.label ?? "";
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams({
      rsvp: "1",
      v: vibe ?? "",
      k: pick ?? "",
      d: date?.toISOString() ?? "",
      t: time ?? "",
      l: location?.url ?? "",
    });
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  }, [vibe, pick, date, time, location]);

  const dodge = () =>
    setNoPos({
      x: Math.round((Math.random() - 0.5) * 180),
      y: Math.round((Math.random() - 0.5) * 70),
      n: noPos.n + 1,
    });

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const confirm = async () => {
    if (!vibe || !pick || !date || !time || saving) return;
    setSaving(true);
    const assignedLocation = LOCATION_OPTIONS[Math.floor(Math.random() * LOCATION_OPTIONS.length)];
    setLocation(assignedLocation);
    try {
      await submitRsvp({
        data: {
          vibe,
          choice: pick,
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
    <main className="invite-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="invite-frame">
        <header className="topbar">
          <span className="brand-mark">
            <Sparkles size={14} /> The Big Yes
          </span>
          <span className="topbar-note">made for one person</span>
        </header>

        {step === "ask" && (
          <div className="flow enter-stagger">
            <section className="hero-card">
              <div className="hero-art" aria-hidden="true">
                <span className="hero-orbit orbit-a" />
                <span className="hero-orbit orbit-b" />
                <span className="hero-sun" />
                <span className="hero-line line-a" />
                <span className="hero-line line-b" />
                <span className="hero-caption">
                  a little courage
                  <br />
                  looks good on you
                </span>
              </div>
              <div className="hero-copy">
                <p className="kicker">A personal invitation</p>
                <h1>
                  Let’s make
                  <br />
                  <em>tonight</em> count.
                </h1>
                <p className="hero-lede">
                  I built a small corner of the internet to ask you one very important question.
                </p>
                <div className="hero-signature">
                  from me, with excellent intentions <span>↗</span>
                </div>
              </div>
            </section>

            <section className="message-card">
              <div className="profile-row">
                <div className="profile-avatar">M</div>
                <div>
                  <strong>Someone who likes you</strong>
                  <span>@probably_me</span>
                </div>
                <span className="verified">✓</span>
              </div>
              <p>
                I could have sent a text. Instead, I made this. That feels like a pretty good sign
                for the kind of effort I plan to bring to our date.
              </p>
              <div className="post-actions">
                <span>♡ 1</span>
                <span>↗ send</span>
                <span>save for later</span>
              </div>
            </section>

            <div className="ask-actions">
              <button className="button button-primary" onClick={() => setStep("vibe")}>
                Yes, obviously <ArrowUpRight size={17} />
              </button>
              <button
                className="button button-quiet"
                onMouseEnter={dodge}
                onFocus={dodge}
                onClick={() => setStep("sure1")}
                style={{ transform: noPos.n ? `translate(${noPos.x}px, ${noPos.y}px)` : undefined }}
              >
                no thanks
              </button>
              {noPos.n > 2 && (
                <p className="running-note">the button is running. read into that.</p>
              )}
            </div>
          </div>
        )}

        {step === "sure1" && (
          <SureCard
            title={
              <>
                Wait.
                <br />
                <em>Are you sure?</em>
              </>
            }
            body="Because I already told my mom. She is making a scrapbook. Do not do this to Linda."
            yes="Fine, one date"
            no="yes, I'm sure"
            onYes={() => setStep("vibe")}
            onNo={() => setStep("sure2")}
          />
        )}
        {step === "sure2" && (
          <SureCard
            title={
              <>
                Really
                <br />
                <em>sure sure?</em>
              </>
            }
            body="Last check. I will accept your answer with grace and roughly seven unnecessary sighs."
            yes="Alright, one date"
            no="okay, walking away"
            onYes={() => setStep("vibe")}
            onNo={() => setStep("rejected")}
          />
        )}
        {step === "rejected" && (
          <Rejected
            onTryAgain={() => {
              setStep("ask");
              setNoPos({ x: 0, y: 0, n: 0 });
            }}
          />
        )}

        {step === "vibe" && (
          <Step
            eyebrow="First things first"
            title={
              <>
                Feed you,
                <br />
                <em>or hydrate?</em>
              </>
            }
            sub="Pick one. Both end with me smiling at you across a small table."
          >
            <div className="choice-grid">
              <BigCard
                number="01"
                label="Drinks"
                sub="cozy corner, warm lighting, one good story"
                onClick={() => {
                  setVibe("drink");
                  setStep("drink");
                }}
              />
              <BigCard
                number="02"
                label="Food"
                sub="we eat, we vibe, I steal a fry"
                onClick={() => {
                  setVibe("food");
                  setStep("food");
                }}
              />
            </div>
          </Step>
        )}

        {(step === "food" || step === "drink") && (
          <Step
            eyebrow="Make it specific"
            title={
              step === "food" ? (
                <>
                  Pick your
                  <br />
                  <em>carbs.</em>
                </>
              ) : (
                <>
                  Your
                  <br />
                  <em>poison?</em>
                </>
              )
            }
            sub={
              step === "food"
                ? "Legally binding. Not really, but I will remember."
                : "No judgment. Except decaf. Decaf has explaining to do."
            }
          >
            <div className="option-list">
              {menu.map(({ id, label, sub, Icon }, index) => {
                const active = pick === id;
                return (
                  <button
                    key={id}
                    className={cn("option-row", active && "selected")}
                    onClick={() => setPick(id)}
                  >
                    <span className="option-number">0{index + 1}</span>
                    <Icon size={21} />
                    <span className="option-text">
                      <strong>{label}</strong>
                      <small>{sub}</small>
                    </span>
                    {active && <Check size={19} />}
                  </button>
                );
              })}
            </div>
            <div className="step-actions">
              <button className="back-button" onClick={() => setStep("vibe")}>
                Back
              </button>
              <button
                className="button button-primary"
                disabled={!pick}
                onClick={() => setStep("when")}
              >
                Lock it in <ArrowUpRight size={17} />
              </button>
            </div>
          </Step>
        )}

        {step === "when" && (
          <Step
            eyebrow="One last thing"
            title={
              <>
                When are
                <br />
                <em>we doing this?</em>
              </>
            }
            sub="Pick a day after the 17th, then choose a time."
          >
            <div className="calendar-panel">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => {
                  const minimum = new Date();
                  minimum.setHours(0, 0, 0, 0);
                  minimum.setDate(18);
                  return d < minimum;
                }}
                className="invite-calendar"
              />
            </div>
            {date && (
              <div className="time-panel">
                <p>Choose a time</p>
                <div className="time-grid">
                  {["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"].map((item) => (
                    <button
                      key={item}
                      className={cn("time-option", time === item && "selected")}
                      onClick={() => setTime(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="step-actions">
              <button
                className="back-button"
                onClick={() => setStep(vibe === "food" ? "food" : "drink")}
              >
                Back
              </button>
              <button
                className="button button-primary"
                disabled={!date || !time || saving}
                onClick={confirm}
              >
                {saving ? "Saving..." : "Seal the deal"}
              </button>
            </div>
          </Step>
        )}

        {step === "done" && (
          <Done
            vibe={vibe}
            pickLabel={pickLabel}
            date={date}
            time={time}
            location={location}
            shareUrl={shareUrl}
            copied={copied}
            copy={copy}
            onStartOver={() => {
              setStep("ask");
              setVibe(null);
              setPick(null);
              setDate(undefined);
              setTime(null);
              setLocation(null);
              window.history.replaceState({}, "", window.location.pathname);
            }}
          />
        )}
      </div>
    </main>
  );
}

function Step({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flow enter-stagger">
      <section className="intro-card">
        <p className="kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{sub}</p>
      </section>
      <div>{children}</div>
    </div>
  );
}

function BigCard({
  number,
  label,
  sub,
  onClick,
}: {
  number: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="big-choice">
      <span className="choice-number">{number}</span>
      <span className="big-choice-copy">
        <strong>{label}</strong>
        <small>{sub}</small>
        <span className="choose-link">
          Choose <ArrowUpRight size={15} />
        </span>
      </span>
    </button>
  );
}

function SureCard({
  title,
  body,
  yes,
  no,
  onYes,
  onNo,
}: {
  title: React.ReactNode;
  body: string;
  yes: string;
  no: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="flow enter-stagger">
      <section className="intro-card intro-card-red">
        <p className="kicker">Objection noted</p>
        <h2>{title}</h2>
      </section>
      <section className="message-card">
        <p>{body}</p>
      </section>
      <div className="ask-actions">
        <button className="button button-primary" onClick={onYes}>
          {yes} <ArrowUpRight size={17} />
        </button>
        <button className="button button-quiet" onClick={onNo}>
          {no}
        </button>
      </div>
    </div>
  );
}

function Rejected({ onTryAgain }: { onTryAgain: () => void }) {
  return (
    <div className="flow enter-stagger">
      <section className="intro-card intro-card-red">
        <p className="kicker">Official rejection</p>
        <h2>
          Okay.
          <br />
          <em>Cool.</em>
          <br />
          Cool cool cool.
        </h2>
      </section>
      <section className="message-card">
        <p>
          Wow. A whole website. For nothing. That is fine. I will just frame it and call it my
          villain origin story.
        </p>
        <div className="receipt-lines">
          <span>
            cause of death <b>“no thanks”</b>
          </span>
          <span>
            recovery time <b>3 to 5 business years</b>
          </span>
        </div>
      </section>
      <button className="button button-primary" onClick={onTryAgain}>
        Wait, let me try again
      </button>
    </div>
  );
}

function Done({
  vibe,
  pickLabel,
  date,
  time,
  location,
  shareUrl,
  copied,
  copy,
  onStartOver,
}: {
  vibe: Vibe;
  pickLabel: string;
  date?: Date;
  time: string | null;
  location: LocationPick | null;
  shareUrl: string;
  copied: boolean;
  copy: () => void;
  onStartOver: () => void;
}) {
  return (
    <div className="flow enter-stagger done-flow">
      <section className="intro-card intro-card-red confirmed-card">
        <span className="confirmed-stamp">Confirmed</span>
        <p className="kicker">The answer we were hoping for</p>
        <h2>
          Great news.
          <br />
          <em>We’re doing this.</em>
        </h2>
      </section>
      <section className="message-card">
        <p>
          I have cleared my schedule, warmed up three stories, and rehearsed pretending to let you
          win at rock-paper-scissors.
        </p>
      </section>
      <section className="receipt-card">
        <div className="receipt-header">
          Your date receipt <Check size={15} />
        </div>
        <div className="receipt-body">
          <Row k="what" v={`${pickLabel}${vibe === "food" ? " for dinner" : " for drinks"}`} />
          <Row
            k="when"
            v={
              date
                ? date.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : ""
            }
          />
          <Row k="time" v={time ?? ""} />
          <Row k="place" v={location?.label ?? "Random spot from your list"} />
          <Row k="dress" v="whatever makes you feel dangerous" />
          <Row k="vibe" v="butterflies, probably" last />
        </div>
        {location && (
          <a className="location-link" href={location.url} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        )}
      </section>
      <section className="share-card">
        <div className="share-heading">
          <Share2 size={15} /> Shareable RSVP
        </div>
        <code>{shareUrl}</code>
        <button className="button button-primary" onClick={copy}>
          {copied ? (
            <>
              <Check size={16} /> Copied
            </>
          ) : (
            <>
              <Copy size={16} /> Copy link
            </>
          )}
        </button>
      </section>
      <button className="start-over" onClick={onStartOver}>
        Start over
      </button>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={cn("receipt-row", !last && "has-line")}>
      <span>{k}</span>
      <strong>{v}</strong>
    </div>
  );
}

export default AskPage;
