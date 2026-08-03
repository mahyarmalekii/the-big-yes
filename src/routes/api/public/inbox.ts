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

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("rsvps")
          .select("id, created_at, vibe, choice, date_iso, time_slot")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return Response.json({ rsvps: data ?? [] });
      },
    },
  },
});
