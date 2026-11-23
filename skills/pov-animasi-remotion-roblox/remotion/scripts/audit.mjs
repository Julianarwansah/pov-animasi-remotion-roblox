// usage: node scripts/audit.mjs <nomorEpisode> [kedalamanMin=0.03]
// Menjalankan komposisi AuditN di Chrome dan mencetak setiap benda yang menembus benda lain (pasangan, frame, kedalaman).
import fs from "node:fs";
import path from "node:path";
const TMP = process.env.REMOTION_TMP || (process.env.TMPDIR || "/tmp") + "/remotion_tmp";
fs.mkdirSync(TMP, { recursive: true });
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const [ep, minD = "0.03"] = process.argv.slice(2);
const browserExecutable = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/entries/Audit.tsx"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "Audit" + ep, browserExecutable, chromiumOptions });
let hits = null;
await renderStill({ composition, serveUrl, frame: 0, output: path.join(TMP, "audit.png"), browserExecutable, chromiumOptions, timeoutInMilliseconds: 600000,
  onBrowserLog: (l) => { if (l.text.startsWith("AUDIT_JSON ")) hits = JSON.parse(l.text.slice(11)); else if (l.type === "error") console.log("[error]", l.text.slice(0, 300)); } });
if (!hits) { console.log("audit gagal: tidak ada hasil"); process.exit(1); }
const list = hits.filter((h) => h.depth >= Number(minD));
console.log(`Episode ${ep}: ${list.length} pasangan tembus (>= ${minD} m)`);
for (const h of list) console.log(`${h.depth.toFixed(3)} m  ${h.a}  ⟷  ${h.b}  di ${h.at}${h.part ? "  bagian " + h.part : ""}  frame ${h.frames.map(([a, b]) => a === b ? a : a + "-" + b).join(", ")}`);
