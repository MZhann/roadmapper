const fs = require("node:fs");
const name = process.argv[2] || "milo-planner";
const files = [
  `supabase/functions/${name}/index.ts`,
  "supabase/functions/_shared/ai.ts",
  "supabase/functions/_shared/http.ts",
  "supabase/functions/_shared/structured-schema.ts",
  "supabase/functions/deno.json",
  "src/domain/schema.ts",
].map((name) => ({ name, content: fs.readFileSync(name, "utf8") }));
fs.mkdirSync(".artifacts", { recursive: true });
fs.writeFileSync(
  `.artifacts/deploy-${name}.json`,
  JSON.stringify({
    name,
    entrypoint_path: `supabase/functions/${name}/index.ts`,
    import_map_path: "supabase/functions/deno.json",
    verify_jwt: false,
    files,
  }),
);
