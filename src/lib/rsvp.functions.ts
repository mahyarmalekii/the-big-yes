import { createServerFn } from "@tanstack/react-start";

type RsvpInput = {
  vibe: "food" | "drink";
  choice: string;
  date_iso: string;
  time_slot: string;
  location_url?: string;
  location_name?: string;
  personal_note?: string;
  guest_name?: string;
  agenda?: string;
};

type VisitInput = {
  guest_name?: string;
  agenda?: string;
  is_rsvp_view?: boolean;
};

function getCalendarTimes(dateIso: string, timeSlot: string) {
  const d = new Date(dateIso);
  const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hours = 18;
  let mins = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    mins = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  const start = new Date(d);
  start.setHours(hours, mins, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatGCal = (dt: Date) => dt.toISOString().replace(/[-:]|\.\d{3}/g, "");

  return {
    startStr: formatGCal(start),
    endStr: formatGCal(end),
  };
}

export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((data: VisitInput) => {
    if (
      data.guest_name !== undefined &&
      (typeof data.guest_name !== "string" || data.guest_name.length > 60)
    ) {
      throw new Error("Invalid guest name");
    }
    if (
      data.agenda !== undefined &&
      (typeof data.agenda !== "string" || data.agenda.length > 200)
    ) {
      throw new Error("Invalid agenda");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const token =
      process.env.TELEGRAM_BOT_TOKEN || "7825219518:AAEeaButGxggsZ3SPA-cFCq1t579CCaBFVs";
    const chatId = process.env.TELEGRAM_CHAT_ID || "1882519733";
    if (token && chatId) {
      const guestLine = data.guest_name ? `Guest: ${data.guest_name}\n` : `Guest: Unnamed\n`;
      const agendaLine = data.agenda ? `Agenda: ${data.agenda}\n` : "";
      const statusLine = data.is_rsvp_view
        ? "Status: Viewing confirmed receipt link."
        : "Status: Just opened the invitation link.";

      const text =
        `LINK OPENED\n\n` +
        guestLine +
        agendaLine +
        statusLine;

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
        });
      } catch (e) {
        console.error("Telegram visit notify failed:", e);
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
    if (
      data.guest_name !== undefined &&
      (typeof data.guest_name !== "string" || data.guest_name.length > 60)
    )
      throw new Error("Invalid guest name");
    if (
      data.agenda !== undefined &&
      data.agenda !== null &&
      typeof data.agenda !== "string"
    )
      throw new Error("Invalid agenda");
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
        ? `\n\nHer note:\n"${data.personal_note.trim()}"`
        : "";
      const guestLine = data.guest_name ? `Guest: ${data.guest_name}\n` : `Guest: Unnamed\n`;
      const agendaLine = data.agenda ? `Agenda: ${data.agenda}\n` : "";

      // Generate 1-click Google Calendar Add Link
      const { startStr, endStr } = getCalendarTimes(data.date_iso, data.time_slot);
      const eventTitle = `Date with ${data.guest_name || "Her"}`;
      const eventDetails =
        `Plan: ${data.choice}\n` +
        (data.agenda ? `Agenda: ${data.agenda}\n` : "") +
        (data.personal_note ? `Her note: ${data.personal_note}\n` : "") +
        (data.location_url ? `Maps: ${data.location_url}\n` : "");
      const eventLocation = [data.location_name, data.location_url].filter(Boolean).join(" ");

      const calParams = new URLSearchParams({
        action: "TEMPLATE",
        text: eventTitle,
        dates: `${startStr}/${endStr}`,
        details: eventDetails,
        location: eventLocation,
      });
      const gcalUrl = `https://calendar.google.com/calendar/render?${calParams.toString()}`;

      const text =
        `SHE SAID YES\n\n` +
        guestLine +
        agendaLine +
        `Vibe: ${data.vibe === "food" ? "Food" : "Drinks"}\n` +
        `Pick: ${data.choice}\n` +
        `Date: ${pretty}\n` +
        `Time: ${data.time_slot}\n` +
        (data.location_name ? `Place: ${data.location_name}\n` : "") +
        (data.location_url ? `Maps: ${data.location_url}\n` : "") +
        `Calendar: ${gcalUrl}` +
        noteSection +
        `\n\nDo not blow it.`;

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Add to Google Calendar",
                    url: gcalUrl,
                  },
                ],
              ],
            },
          }),
        });
      } catch (e) {
        console.error("Telegram notify failed:", e);
      }
    }

    return { ok: true };
  });
