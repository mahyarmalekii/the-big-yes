import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/inbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key");
        const expected = process.env.INBOX_KEY;

        if (!expected || !key || key !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Supabase has been removed. We return an empty list for the inbox.
        return Response.json({ rsvps: [] });
      },
    },
  },
});
