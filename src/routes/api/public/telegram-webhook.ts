import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token =
          process.env.TELEGRAM_BOT_TOKEN ||
          "7825219518:AAEeaButGxggsZ3SPA-cFCq1t579CCaBFVs";
        const ownerId = process.env.TELEGRAM_CHAT_ID || "1882519733";

        // Derive site URL from the incoming request URL itself —
        // works correctly regardless of Origin header or env vars.
        const reqUrl = new URL(request.url);
        const siteUrl = process.env.SITE_URL || `${reqUrl.protocol}//${reqUrl.host}`;

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
        // Format: name | nickname | message or joke
        // All fields after the first are optional.
        // "Layla || inside joke" skips nick but keeps msg.
        const parts = text.split("|").map((s) => s.trim());
        const name = parts[0] ?? "";
        const nickRaw = parts[1] ?? "";
        const msgRaw = parts.slice(2).join("|").trim();

        if (!name) {
          await sendTelegram(token, chatId, helpText());
          return new Response("ok");
        }

        const params = new URLSearchParams();
        params.set("n", name);
        if (nickRaw) params.set("nick", nickRaw);
        if (msgRaw) params.set("msg", msgRaw);
        const inviteUrl = `${siteUrl}?${params.toString()}`;

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
    `Examples:\n` +
    `  Layla\n` +
    `  Layla | Lay\n` +
    `  Layla | Lay | still think about that Sunday\n` +
    `  Layla || still think about that Sunday`
  );
}
