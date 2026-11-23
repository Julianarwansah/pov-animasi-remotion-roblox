// usage: node scripts/pakai-kanal.mjs <nama-folder-kanal>
// Menjadikan kanal/<nama>/kanal.json sebagai channel aktif (disalin ke src/kanal.json). Teks kartu pilihan, kartu akhir,
// dan foto profil (src/entries/Profil.tsx) membaca file itu. Buat channel baru: salin kanal/_contoh ke kanal/<nama>.
import fs from "node:fs";
const nama = process.argv[2];
if (!nama) { console.log("usage: node scripts/pakai-kanal.mjs <nama-folder-kanal>\nkanal tersedia:", fs.readdirSync("kanal").filter((d) => !d.startsWith("_") && fs.existsSync(`kanal/${d}/kanal.json`)).join(", ")); process.exit(1); }
const src = `kanal/${nama}/kanal.json`;
if (!fs.existsSync(src)) { console.log("tidak ada", src); process.exit(1); }
const k = JSON.parse(fs.readFileSync(src, "utf8"));
fs.copyFileSync(src, "src/kanal.json");
console.log(`channel aktif: ${k.nama} (${k.handle})`);
