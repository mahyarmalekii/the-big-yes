import { createFileRoute } from "@tanstack/react-router";

/**
 * Telegram webhook — receives messages from Mahyar's bot and replies
 * with a personalized invite link.
 *
 * Message format (pipe-separated, all optional after the first):
 *   name | nickname | message or inside joke
 *
 * Examples:
 *   Layla
 *   Layla | Lay
 *   Layla | Lay | still think about that Sunday at Tempelhofer
 *   Layla || still think about that Sunday   (skip nick, keep msg)
 *
 * Security: only processes messages from the owner's chat ID.
 */

export const Route = createFileRoute("/api/public/telegram-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token =
          process.env.TELEGRAM_BOT_TOKEN ||
          "7825219518:AAEeaButGxggsZ3SPA-cFCq1t579CCaBFVs";
        const ownerId = process.env.TELEGRAM_CHAT_ID || "1882519733";
        const siteUrl =
          process.env.SITE_URL ||
          (request.headers.get("origin") ?? "https://the-big-yes.com");

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response("ok");
        }

        const message = body?.message;
        if (!message) return new Response("ok");

        const chatId = String(message.chat?.id ?? "");
        const text: string = message.text ?? "";

        // Only respond to the owner
        if (chatId !== ownerId) return new Response("ok");

        // --- Parse the message ---
        // Split on | allowing empty segments (e.g. "Layla || joke")
        const parts = text.split("|").map((s) => s.trim());
        const name = parts[0] ?? "";
        const nickRaw = parts[1] ?? "";
        const msgRaw = parts.slice(2).join("|").trim();

        // Need at least a name
        if (!name) {
          await sendTelegram(token, chatId, helpText());
          return new Response("ok");
        }

        // Build the URL
        const params = new URLSearchParams();
        if (name) params.set("n", name);
        if (nickRaw) params.set("nick", nickRaw);
        if (msgRaw) params.set("msg", msgRaw);
        const inviteUrl = `${siteUrl}?${params.toString()}`;

        // Reply with the link
        const reply =
          `✅ Link ready\n\n` +
          `👤 Name: ${name}\n` +
          (nickRaw ? `🏷 Nick: ${nickRaw}\n` : "") +
          (msgRaw ? `💬 Msg: ${msgRaw}\n` : "") +
          `\n🔗 ${inviteUrl}`;

        await sendTelegram(token, chatId, reply);
        return new Response("ok");
      },
    },
  },
});

async function sendTelegram(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

function helpText() {
  return (
    `📝 How to generate a link:\n\n` +
    `Send a message in this format:\n` +
    `  name | nickname | message or joke\n\n` +
    `All fields after the first are optional:\n` +
    `  Layla\n` +
    `  Layla | Lay\n` +
    `  Layla | Lay | still think about that Sunday\n` +
    `  Layla || still think about that Sunday\ (skip nick)`
  );
}
