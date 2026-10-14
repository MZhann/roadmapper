// query-string 7 expects a CommonJS decoder. The security-fixed decoder 0.5
// is ESM; accept its default export in both Node 22 and Metro.
const fs = require("node:fs");
const target = require.resolve("query-string");
const original = "const decodeComponent = require('decode-uri-component');";
const patched =
  "const decodeModule = require('decode-uri-component');\nconst decodeComponent = decodeModule.default || decodeModule;";
const source = fs.readFileSync(target, "utf8");
if (source.includes(original))
  fs.writeFileSync(target, source.replace(original, patched));
else if (!source.includes(patched))
  throw new Error(
    "Review the decoder compatibility patch after updating query-string.",
  );
console.log("Applied query-string decoder compatibility patch.");
