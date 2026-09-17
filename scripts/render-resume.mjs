#!/usr/bin/env node
/**
 * render-resume.mjs
 * -----------------------------------------------------------------------------
 * Universal resume renderer.
 *
 * Supports any jsonresume-theme-* npm package and the built-in "weasyprint"
 * custom theme (delegates to render-resume.py for that one).
 *
 * Usage:
 *   node scripts/render-resume.mjs [options]
 *
 * Options:
 *   --resume   <path>   Input JSON Resume file (default: resume.json)
 *   --output   <path>   Output PDF path (default: public/resume.pdf)
 *   --theme    <name>   Theme name from themes.config.json (default: weasyprint)
 *   --html              Output HTML instead of PDF
 *   --lang     <lang>   Language hint (en|fr) for default output path
 *   --install           Auto-install missing npm theme packages
 *   --list              List available themes from themes.config.json
 *
 * Theme resolution:
 *   1. Look up <name> in scripts/themes.config.json "available" registry.
 *   2. If renderer = "weasyprint": delegate to render-resume.py.
 *   3. If renderer = "node": load npm package, call theme.render(data) → HTML,
 *      then convert HTML → PDF via Puppeteer + Chromium (auto-detected).
 *
 * Chromium auto-detection order:
 *   PUPPETEER_EXECUTABLE_PATH env > CHROME_PATH env > PATH search >
 *   nix-shell -p chromium (NixOS fallback).
 * -----------------------------------------------------------------------------
 */

import { parseArgs } from "node:util";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

const { values: opts } = parseArgs({
  options: {
    resume:  { type: "string",  short: "r" },
    output:  { type: "string",  short: "o" },
    theme:   { type: "string",  short: "t" },
    lang:    { type: "string",  short: "l" },
    html:    { type: "boolean", short: "H", default: false },
    install: { type: "boolean", short: "i", default: false },
    list:    { type: "boolean", default: false },
  },
  strict: false,
});

// ---------------------------------------------------------------------------
// Load themes config
// ---------------------------------------------------------------------------

const THEMES_CONFIG_PATH = join(__dirname, "themes.config.json");
const themesConfig = JSON.parse(readFileSync(THEMES_CONFIG_PATH, "utf8"));

if (opts.list) {
  console.log("\nAvailable themes (from scripts/themes.config.json):\n");
  for (const [name, config] of Object.entries(themesConfig.available)) {
    const marker = name === themesConfig.en ? " [EN default]" : name === themesConfig.fr ? " [FR default]" : "";
    const pkg = config.package ? `  pkg: ${config.package}` : "  renderer: weasyprint";
    console.log(`  ${name}${marker}`);
    console.log(`    ${config.description}`);
    console.log(pkg);
  }
  console.log("\nEdit scripts/themes.config.json to change defaults.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Resolve paths & theme
// ---------------------------------------------------------------------------

const resumePath = opts.resume
  ? (resolve(opts.resume).startsWith("/") ? opts.resume : join(ROOT, opts.resume))
  : join(ROOT, "resume.json");

const absResumePath = resolve(resumePath);

if (!existsSync(absResumePath)) {
  console.error(`✗ Resume file not found: ${absResumePath}`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(absResumePath, "utf8"));
const lang = opts.lang ?? data?.meta?.lang ?? (absResumePath.includes("fr") ? "fr" : "en");
const themeName = opts.theme ?? themesConfig[lang] ?? "weasyprint";
const themeConfig = themesConfig.available[themeName];

if (!themeConfig) {
  console.error(`✗ Unknown theme "${themeName}". Run --list to see available themes.`);
  console.error(`  Or add it to scripts/themes.config.json.`);
  process.exit(1);
}

// Determine output path
let outputPath = opts.output;
if (!outputPath) {
  const suffix = lang === "fr" ? "-fr" : "";
  const ext = opts.html ? ".html" : ".pdf";
  outputPath = join(ROOT, "public", `resume${suffix}${ext}`);
} else if (!outputPath.startsWith("/")) {
  outputPath = join(ROOT, outputPath);
}

mkdirSync(dirname(outputPath), { recursive: true });

console.log(`  theme:  ${themeName} (${themeConfig.renderer})`);
console.log(`  resume: ${absResumePath}`);
console.log(`  output: ${outputPath}`);

// ---------------------------------------------------------------------------
// Route to renderer
// ---------------------------------------------------------------------------

if (themeConfig.renderer === "weasyprint") {
  runWeasyprintRenderer(absResumePath, outputPath, lang, opts);
} else {
  await runNodeThemeRenderer(themeConfig, data, outputPath, opts);
}

// ---------------------------------------------------------------------------
// WeasyPrint renderer (delegates to render-resume.py)
// ---------------------------------------------------------------------------

function runWeasyprintRenderer(resumePath, outputPath, lang, opts) {
  const pyScript = join(__dirname, "render-resume.py");

  // Find Python with WeasyPrint (same logic as generate-resume.sh)
  function findPython() {
    const candidates = [
      process.env.VIRTUAL_ENV ? `${process.env.VIRTUAL_ENV}/bin/python` : null,
      join(ROOT, ".venv", "bin", "python"),
    ].filter(Boolean);

    for (const py of candidates) {
      try {
        execSync(`"${py}" -c "import weasyprint"`, { stdio: "ignore" });
        return py;
      } catch {}
    }

    for (const py of ["python3", "python"]) {
      try {
        const path = execSync(`command -v ${py}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
        execSync(`"${path}" -c "import weasyprint"`, { stdio: "ignore" });
        return path;
      } catch {}
    }

    // NixOS fallback
    try {
      execSync("command -v nix-shell", { stdio: "ignore" });
      return "__nix-shell__";
    } catch {}

    return null;
  }

  const py = findPython();
  if (!py) {
    console.error("✗ WeasyPrint not found. Install it: pip install weasyprint");
    console.error("  Or on NixOS: nix-shell -p python3Packages.weasyprint");
    process.exit(1);
  }

  const pageFlag = lang === "fr" ? "--a4" : "--letter";
  const cmdArgs = [pyScript, absResumePath, outputPath, pageFlag, "--lang", lang];

  let result;
  if (py === "__nix-shell__") {
    result = spawnSync(
      "nix-shell",
      ["-p", "python3Packages.weasyprint", "--run",
       `python3 ${cmdArgs.map(a => JSON.stringify(a)).join(" ")}`],
      { stdio: "inherit" }
    );
  } else {
    result = spawnSync(py, cmdArgs, { stdio: "inherit" });
  }

  if (result.status !== 0) {
    console.error("✗ WeasyPrint renderer failed.");
    process.exit(result.status ?? 1);
  }
}

// ---------------------------------------------------------------------------
// Node.js theme renderer (jsonresume-theme-* npm packages)
// ---------------------------------------------------------------------------

async function runNodeThemeRenderer(themeConfig, data, outputPath, opts) {
  const packageName = themeConfig.package;

  // Auto-install theme if missing
  let themeModule;
  try {
    themeModule = await import(packageName);
  } catch {
    if (opts.install) {
      console.log(`  Installing theme package: ${packageName}…`);
      const result = spawnSync("npm", ["install", "--save-dev", packageName], {
        cwd: ROOT,
        stdio: "inherit",
      });
      if (result.status !== 0) {
        console.error(`✗ Failed to install ${packageName}`);
        process.exit(1);
      }
      themeModule = await import(packageName);
    } else {
      console.error(`✗ Theme package not installed: ${packageName}`);
      console.error(`  Install it: npm install --save-dev ${packageName}`);
      console.error(`  Or re-run with --install flag.`);
      process.exit(1);
    }
  }

  // Call theme.render(data) — handle both sync and async, both ESM default and named exports
  const theme = themeModule.default ?? themeModule;
  const renderFn = theme.render ?? theme;

  if (typeof renderFn !== "function") {
    console.error(`✗ Theme "${packageName}" does not export a render() function.`);
    console.error(`  Exported keys: ${Object.keys(theme).join(", ")}`);
    process.exit(1);
  }

  let html = renderFn(data);
  if (html && typeof html.then === "function") {
    html = await html;
  }

  if (typeof html !== "string") {
    console.error(`✗ Theme render() did not return an HTML string.`);
    process.exit(1);
  }

  // Output HTML if requested
  if (opts.html || extname(outputPath) === ".html") {
    writeFileSync(outputPath, html, "utf8");
    console.log(`✓ wrote ${outputPath} (HTML)`);
    return;
  }

  // Convert HTML → PDF via Puppeteer
  await htmlToPdf(html, outputPath);
  console.log(`✓ wrote ${outputPath} (PDF via Puppeteer)`);
}

// ---------------------------------------------------------------------------
// HTML → PDF via Puppeteer
// ---------------------------------------------------------------------------

async function htmlToPdf(html, outputPath) {
  // Find Chromium executable
  function findChromium() {
    const envPaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.CHROME_PATH,
      process.env.CHROMIUM_PATH,
    ].filter(Boolean);

    for (const p of envPaths) {
      if (existsSync(p)) return p;
    }

    const names = ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"];
    for (const name of names) {
      try {
        const path = execSync(`command -v ${name}`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
        }).trim();
        if (path) return path;
      } catch {}
    }

    // NixOS: resolve via nix-shell
    try {
      execSync("command -v nix-shell", { stdio: "ignore" });
      const path = execSync(
        'nix-shell -p chromium --run "which chromium"',
        { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
      ).trim();
      if (path) return path;
    } catch {}

    return null;
  }

  const chromiumPath = findChromium();
  if (!chromiumPath) {
    console.error("✗ Chromium not found. Cannot render PDF.");
    console.error("  Options:");
    console.error("  - Set PUPPETEER_EXECUTABLE_PATH=/path/to/chromium");
    console.error("  - On NixOS: nix-shell -p chromium should auto-detect");
    console.error("  - Use --html flag to output HTML instead");
    process.exit(1);
  }

  // Import puppeteer dynamically
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer-core")).default;
  } catch {
    try {
      puppeteer = (await import("puppeteer")).default;
    } catch {
      console.error("✗ puppeteer not installed. Run:");
      console.error("  npm install --save-dev puppeteer-core");
      console.error("  or: npm install --save-dev puppeteer");
      process.exit(1);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();

    // Write HTML to a temp file so relative assets resolve correctly
    const tmpHtml = join(tmpdir(), `resume-${createHash("md5").update(html).digest("hex").slice(0, 8)}.html`);
    writeFileSync(tmpHtml, html, "utf8");

    await page.goto(`file://${tmpHtml}`, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  } finally {
    await browser.close();
  }
}
