import { createClient } from "@supabase/supabase-js";
import { authenticate, preflight, reply } from "../_shared/http.ts";
import { readBody, serviceFailure, ServiceError } from "../_shared/ai.ts";
Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;
  try {
    const { user } = await authenticate(request);
    const body = await readBody(request, 1000);
    if (body.confirmation !== "DELETE")
      throw new ServiceError("Confirm account deletion first.", 400);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const bucket = admin.storage.from("milo-stories");
    async function clearFolder(prefix: string, depth = 0): Promise<void> {
      if (depth > 3 || !prefix.startsWith(`${user.id}`))
        throw new Error("Invalid storage prefix");
      for (let batch = 0; batch < 100; batch++) {
        const { data, error } = await bucket.list(prefix, { limit: 100 });
        if (error) throw error;
        if (!data?.length) return;
        for (const item of data.filter((item) => !item.id))
          await clearFolder(`${prefix}/${item.name}`, depth + 1);
        const files = data
          .filter((item) => !!item.id)
          .map((item) => `${prefix}/${item.name}`);
        if (files.length) {
          const removed = await bucket.remove(files);
          if (removed.error) throw removed.error;
        }
      }
      throw new ServiceError(
        "Photo cleanup needs another attempt. Please retry deletion.",
        503,
      );
    }
    await clearFolder(user.id);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return reply(request, { deleted: true });
  } catch (error) {
    const failure = serviceFailure(error);
    return reply(request, { error: failure.error }, failure.status);
  }
});
