import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token =
          process.env.TELEGRAM_BOT_TOKEN ||
          "7825219518:AAEeaButGxggsZ3SPA-cFCq1t579CCaBFVs";
        const ownerId = process.env.TELEGRAM_CHAT_ID || "1882519733";

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
        const rawText: string = (message.text ?? "").trim();

        // Only respond to the owner
        if (chatId !== ownerId) return new Response("ok");

        if (!rawText) {
          await sendTelegram(token, chatId, helpText());
          return new Response("ok");
        }

        // Parse smartly: support newlines or pipes
        let name = "";
        let joke = "";
        let nick = "";

        if (rawText.includes("\n")) {
          const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
          name = lines[0] || "";
          joke = lines[1] || "";
          nick = lines[2] || "";
        } else if (rawText.includes("|")) {
          const parts = rawText.split("|").map((s) => s.trim()).filter(Boolean);
          name = parts[0] || "";
          joke = parts[1] || "";
          nick = parts[2] || "";
        } else {
          name = rawText;
        }

        if (!name) {
          await sendTelegram(token, chatId, helpText());
          return new Response("ok");
        }

        const params = new URLSearchParams();
        params.set("n", name);
        if (joke) params.set("joke", joke);
        if (nick) params.set("nick", nick);

        const inviteUrl = `${siteUrl}?${params.toString()}`;

        const reply =
          `✅ Link ready\n\n` +
          `👤 Name: ${name}\n` +
          (joke ? `💡 Context / Joke: ${joke}\n` : "") +
          (nick ? `🏷 Nick: ${nick}\n` : "") +
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
    `Simply send:\n` +
    `  Ani\n` +
    `  Research assistant job\n\n` +
    `Or using pipes:\n` +
    `  Ani | Research assistant job`
  );
}
