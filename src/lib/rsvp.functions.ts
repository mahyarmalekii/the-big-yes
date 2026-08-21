import { createServerFn } from "@tanstack/react-start";

type RsvpInput = {
  vibe: "food" | "drink";
  choice: string;
  date_iso: string;
  time_slot: string;
  location_url?: string;
  location_name?: string;
  personal_note?: string;
};

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
      data.personal_note !== undefined &&
      (typeof data.personal_note !== "string" || data.personal_note.length > 500)
    )
      throw new Error("Note too long");
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
      const noteSection = data.personal_note?.trim()
        ? `\n\n📝 Her note:\n"${data.personal_note.trim()}"`
        : "";
      const text =
        `💌 SHE SAID YES\n\n` +
        `Vibe: ${data.vibe === "food" ? "🍽 Food" : "🍹 Drinks"}\n` +
        `Pick: ${data.choice}\n` +
        `Date: ${pretty}\n` +
        `Time: ${data.time_slot}\n` +
        (data.location_name ? `Place: ${data.location_name}\n` : "") +
        (data.location_url ? `Maps: ${data.location_url}` : "") +
        noteSection +
        `\n\nDon't blow it.`;
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
