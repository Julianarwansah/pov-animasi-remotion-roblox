// usage: node scripts/gabung.mjs <N>
// Menggabungkan video tanpa audio (hasil/<serial>/tanpa-audio/) dengan epN/mix.wav menjadi file unggah di hasil/<serial>/.
// Dipakai sesudah render (`npx remotion render ... out/vN.mp4` lalu pindahkan) atau setelah mix ulang audio saja.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const n = process.argv[2];
const d = JSON.parse(fs.readFileSync("daftar-episode.json", "utf8"));
const e = d.episode[n];
if (!e) { console.log("usage: node scripts/gabung.mjs <N>  (N ada di daftar-episode.json)"); process.exit(1); }
const out = e.hasil, video = path.join(path.dirname(out), "tanpa-audio", path.basename(out));
const fresh = `out/v${n}.mp4`;
if (fs.existsSync(fresh)) { fs.mkdirSync(path.dirname(video), { recursive: true }); fs.renameSync(fresh, video); console.log("render baru dipindah ke", video); }
if (!fs.existsSync(video)) { console.log("belum ada video:", video, "— render dulu ke", fresh); process.exit(1); }
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", video, "-i", `ep${n}/mix.wav`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], { stdio: "inherit" });
console.log("siap unggah:", out);
