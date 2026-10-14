// Render the supplied design-tool markup for local visual comparison. No design files are modified.
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const name = process.argv[2] || "Main";
  const sourceName = name === "RoadmapDark" ? "Roadmap" : name;
  const source = fs.readFileSync(
    `milo-design/design/${sourceName}.dc.html`,
    "utf8",
  );
  const desktop = name.startsWith("Desktop");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: desktop ? 1440 : 390, height: desktop ? 960 : 844 },
    reducedMotion: "reduce",
  });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    const weight = url.match(/fonts\/(\d+)\.ttf/);
    if (weight) {
      const suffix = {
        400: "Regular",
        600: "SemiBold",
        700: "Bold",
        800: "ExtraBold",
        900: "Black",
      }[weight[1]];
      return route.fulfill({
        contentType: "font/ttf",
        body: fs.readFileSync(
          path.join(
            "node_modules/@expo-google-fonts/nunito",
            `${weight[1]}${suffix}`,
            `Nunito_${weight[1]}${suffix}.ttf`,
          ),
        ),
      });
    }
    return route.abort();
  });
  await page.setContent(
    source
      .replace(/<script src=[^>]+><\/script>/g, "")
      .replace(/<link[^>]+>/g, ""),
  );
  await page.evaluate(
    ({ dark }) => {
      const script = document.querySelector("[data-dc-script]").textContent;
      class Logic {
        constructor(props) {
          this.props = props;
          this.state = {};
        }
        setState() {}
      }
      const Component = new Function("DCLogic", `${script}; return Component`)(
        Logic,
      );
      const vals = new Component(
        dark ? { dark: true, theme: "sports_movement" } : {},
      ).renderVals();
      const read = (expr, scope) => {
        if (expr.trim() === "true") return true;
        if (expr.trim() === "false") return false;
        return expr
          .trim()
          .split(".")
          .reduce((v, key) => v?.[key], scope);
      };
      const walk = (node, scope) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = node.textContent.replace(
            /\{\{(.*?)\}\}/g,
            (_, expr) => read(expr, scope) ?? "",
          );
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.tagName === "SC-FOR") {
          const expression = node.getAttribute("list").slice(2, -2);
          for (const item of read(expression, scope) || []) {
            const childScope = { ...scope, [node.getAttribute("as")]: item };
            for (const child of [...node.childNodes]) {
              const clone = child.cloneNode(true);
              node.before(clone);
              walk(clone, childScope);
            }
          }
          node.remove();
          return;
        }
        if (node.tagName === "SC-IF") {
          if (!read(node.getAttribute("value").slice(2, -2), scope)) {
            node.remove();
            return;
          }
        }
        for (const attr of [...node.attributes]) {
          if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
          else
            node.setAttribute(
              attr.name,
              attr.value.replace(
                /\{\{(.*?)\}\}/g,
                (_, expr) => read(expr, scope) ?? "",
              ),
            );
        }
        for (const child of [...node.childNodes]) walk(child, scope);
        if (["SC-IF", "HELMET", "X-DC"].includes(node.tagName))
          node.replaceWith(...node.childNodes);
      };
      walk(document.body, vals);
    },
    { dark: name === "RoadmapDark" },
  );
  await page.addStyleTag({
    content: [400, 600, 700, 800, 900]
      .map(
        (w) =>
          `@font-face{font-family:Nunito;font-style:normal;font-weight:${w};src:url(https://milo.test/fonts/${w}.ttf)}`,
      )
      .join("\n"),
  });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(".artifacts/reference", { recursive: true });
  await page.screenshot({ path: `.artifacts/reference/${name}.png` });
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
