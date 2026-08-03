import { createServerFn } from "@tanstack/react-start";

type RsvpInput = {
  vibe: "food" | "drink";
  choice: string;
  date_iso: string;
  time_slot: string;
  location_url?: string;
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
    if (data.location_url !== undefined && !/^https:\/\//.test(data.location_url))
      throw new Error("Invalid location");
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("rsvps").insert({
      vibe: data.vibe,
      choice: data.choice,
      date_iso: data.date_iso,
      time_slot: data.time_slot,
    });
    if (error) console.error("RSVP insert failed:", error);

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const when = new Date(data.date_iso);
      const pretty = when.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const text =
        `💌 SHE SAID YES\n\n` +
        `Vibe: ${data.vibe === "food" ? "🍽 Food" : "🍹 Drinks"}\n` +
        `Pick: ${data.choice}\n` +
        `Date: ${pretty}\n` +
        `Time: ${data.time_slot}\n` +
        (data.location_url ? `Location: ${data.location_url}\n\n` : "\n") +
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
