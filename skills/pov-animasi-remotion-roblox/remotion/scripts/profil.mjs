// usage: node scripts/profil.mjs
// Render 4 varian foto profil (1024x1024 PNG) untuk channel aktif (src/kanal.json) ke kanal/<folder>/profil/,
// plus pratinjau potongan bulat. Ganti channel dulu dengan: node scripts/pakai-kanal.mjs <folder>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const k = JSON.parse(fs.readFileSync("src/kanal.json", "utf8"));
const folder = fs.readdirSync("kanal").find((d) => fs.existsSync(`kanal/${d}/kanal.json`) && fs.readFileSync(`kanal/${d}/kanal.json`, "utf8") === fs.readFileSync("src/kanal.json", "utf8"));
if (!folder) { console.log("src/kanal.json tidak cocok dengan kanal/*/kanal.json — jalankan scripts/pakai-kanal.mjs"); process.exit(1); }
const dir = `kanal/${folder}/profil`; fs.mkdirSync(dir, { recursive: true });
const slug = folder;
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const browserExecutable = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/entries/Profil.tsx"), publicDir: path.resolve("public") });
const bulat = [];
for (const v of [1, 2, 3, 4]) {
  const composition = await selectComposition({ serveUrl, id: "Profil" + v, browserExecutable, chromiumOptions });
  const out = `${dir}/${slug}-${v}.png`;
  await renderStill({ composition, serveUrl, frame: 0, output: out, imageFormat: "png", browserExecutable, chromiumOptions });
  const b = `out/_bulat${v}.png`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", out, "-vf", "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-512,Y-512),512),255,0)',scale=512:-1,format=rgba", b]);
  bulat.push(b); console.log("ok", out);
}
execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...bulat.flatMap((b) => ["-i", b]), "-filter_complex", "hstack=4,format=rgba", "-pix_fmt", "rgba", `${dir}/pratinjau-bulat.png`]);
bulat.forEach((b) => fs.unlinkSync(b));
console.log(`foto profil ${k.nama}: ${dir}/ (varian 1–4 + pratinjau-bulat.png)`);
