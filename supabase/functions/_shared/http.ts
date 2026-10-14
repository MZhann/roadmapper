import { createClient } from "@supabase/supabase-js";

export function headers(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:8081")
    .split(",")
    .map((v) => v.trim());
  return {
    "Content-Type": "application/json",
    Vary: "Origin",
    ...(origin && allowed.includes(origin)
      ? { "Access-Control-Allow-Origin": origin }
      : {}),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
export function reply(request: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: headers(request),
  });
}
export function preflight(request: Request) {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: headers(request) });
  if (request.method !== "POST")
    return reply(request, { error: "Use POST for this endpoint." }, 405);
  const origin = request.headers.get("Origin");
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:8081")
    .split(",")
    .map((v) => v.trim());
  if (origin && !allowed.includes(origin))
    return reply(request, { error: "This origin is not enabled." }, 403);
  return null;
}
export async function authenticate(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    },
  );
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new Error("UNAUTHORIZED");
  return { client, user: data.user };
}
