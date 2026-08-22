import { createServerFn } from "@tanstack/react-start";

type RsvpInput = {
  name?: string;
  context?: string;
  joke?: string;
  vibe: "food" | "drink";
  choice: string;
  date_iso: string;
  time_slot: string;
  location_url?: string;
  location_name?: string;
  user_note?: string;
};

type TrackOpenInput = {
  name?: string;
  context?: string;
  joke?: string;
};

export const trackOpen = createServerFn({ method: "POST" })
  .inputValidator((data: TrackOpenInput) => data)
  .handler(async ({ data }) => {
    const token =
      process.env.TELEGRAM_BOT_TOKEN || "7825219518:AAEeaButGxggsZ3SPA-cFCq1t579CCaBFVs";
    const chatId = process.env.TELEGRAM_CHAT_ID || "1882519733";
    if (token && chatId) {
      const nameStr = data.name && data.name !== "YOU" ? data.name : "Someone (Link opened)";
      const text =
        `👀 INVITATION OPENED\n\n` +
        `👤 Name: ${nameStr}\n` +
        (data.context ? `📌 Context: ${data.context}\n` : "") +
        (data.joke ? `😂 Joke: ${data.joke}\n` : "") +
        `⏰ Time: ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
        });
      } catch (e) {
        console.error("Telegram open track failed:", e);
      }
    }
    return { ok: true };
  });

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((data: RsvpInput) => {
    if (!data || (data.vibe !== "food" && data.vibe !== "drink")) {
      throw new Error("Invalid vibe");
    }
    if (typeof data.choice !== "string" || data.choice.length > 60)
      throw new Error("Invalid choice");
    if (typeof data.date_iso !== "string" || isNaN(Date.parse(data.date_iso)))
      throw new Error("Invalid date");
    if (typeof data.time_slot !== "string" || data.time_slot.length > 20)
      throw new Error("Invalid time");
    if (
      data.name !== undefined &&
      data.name !== null &&
      typeof data.name !== "string"
    )
      throw new Error("Invalid name");
    if (
      data.context !== undefined &&
      data.context !== null &&
      typeof data.context !== "string"
    )
      throw new Error("Invalid context");
    if (
      data.joke !== undefined &&
      data.joke !== null &&
      typeof data.joke !== "string"
    )
      throw new Error("Invalid joke");
    if (
      data.location_url !== undefined &&
      data.location_url !== null &&
      !/^https:\/\//.test(data.location_url)
    )
      throw new Error("Invalid location URL");
    if (
      data.location_name !== undefined &&
      data.location_name !== null &&
      typeof data.location_name !== "string"
    )
      throw new Error("Invalid location name");
    if (
      data.user_note !== undefined &&
      data.user_note !== null &&
      typeof data.user_note !== "string"
    )
      throw new Error("Invalid note");
    return data;
  })
  .handler(async ({ data }) => {
    const token =
      process.env.TELEGRAM_BOT_TOKEN || "7825219518:AAEeaButGxggsZ3SPA-cFCq1t579CCaBFVs";
    const chatId = process.env.TELEGRAM_CHAT_ID || "1882519733";
    if (token && chatId) {
      const when = new Date(data.date_iso);
      const pretty = when.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const nameStr = data.name && data.name !== "YOU" ? data.name : "She";
      const text =
        `💌 SHE SAID YES!\n\n` +
        `👤 Name: ${nameStr}\n` +
        (data.context ? `📌 Context: ${data.context}\n` : "") +
        (data.joke ? `😂 Joke: ${data.joke}\n` : "") +
        `🍸 Vibe: ${data.vibe === "food" ? "Food" : "Drinks"}\n` +
        `🍹 Pick: ${data.choice}\n` +
        `📅 Date: ${pretty}\n` +
        `⏰ Time: ${data.time_slot}\n` +
        (data.location_name ? `📍 Place: ${data.location_name}\n` : "") +
        (data.location_url ? `🗺 Maps: ${data.location_url}\n` : "") +
        (data.user_note ? `\n📝 Private Note to you:\n"${data.user_note}"\n\n` : "\n") +
        `Don't blow it.`;
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
        });
      } catch (e) {
        console.error("Telegram notify failed:", e);
      }
    }

    return { ok: true };
  });
