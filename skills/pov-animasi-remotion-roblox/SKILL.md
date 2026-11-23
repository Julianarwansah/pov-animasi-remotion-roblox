---
name: pov-animasi-remotion-roblox
description: Membuat serial Shorts/Reels/TikTok horor POV (sudut pandang orang pertama, fisheye) bergaya Roblox — tokoh balok R6, plastik mulus, bayangan asli, dialog emosional VoxCPM2 bahasa Inggris USA, layar bersih, efek suara & musik rekaman asli CC0 yang aman dimonetisasi, kartu pilihan "What would you do?" — dirender dengan three.js di Remotion, lengkap dengan audit tembus otomatis sebelum render. Pakai saat user meminta animasi POV Roblox, serial horor balok, episode lanjutan Floor 13 / Bloxy Land, atau "konten Roblox seperti ini".
---

# Animasi POV gaya Roblox (Remotion + three.js + VoxCPM2)

Hasil: video 1080x1920, 30 fps, 35–50 detik per episode, -14 LUFS. Satu serial = 3–4 episode yang direncanakan dari awal sampai tamat.
Contoh lengkap: **Floor 13** (`rbx1`–`rbx4`, lift hotel) dan **Bloxy Land After Hours** (`rbx5`–`rbx7`, taman hiburan).

## Aturan wajib (dari user)
1. **Cerita orisinal, baru tiap serial.** Jangan memakai cerita yang sudah dipakai channel lain (misalnya pom bensin/kasir). Tawarkan 3–4 ide cerita dulu, minta user memilih, lalu rencanakan jumlah episode sampai tamat.
2. **Bahasa Inggris USA** untuk dialog, caption, dan kartu pilihan.
3. **Layar bersih:** tanpa chat game, daftar pemain, atau judul di bagian atas layar. Hanya caption tengah, teks bunyi, dan kartu pilihan / layar akhir (`makeFilm` di `f13/Shell.tsx`).
4. **Audio hanya rekaman asli yang aman dimonetisasi:** efek suara DAN musik latar harus rekaman asli berlisensi **CC0** (bukan buatan sintesis, bukan CC-BY-NC). Cari dengan `suara/cari_sfx.py`, cek semua dengan `--cek` sebelum mix.
5. **Tanpa suara statis/desis:** tidak ada desis radio, dengung neon/listrik, loop glitch, atau filter telepon (highpass/lowpass) pada suara tokoh. Kerataan spektrum tiap efek ≤ 0,15.
6. **Tidak ada yang menembus objek apa pun:** jalankan `node scripts/audit.mjs <N>` dengan timeline final; hasilnya harus **0 pasangan tembus** sebelum render.

## Isi
| Path | Fungsi |
|---|---|
| `remotion/src/videos/f13/kit.ts` | util, material plastik toon, tokoh balok R6 `Orang` (+`makeLily`, `makeNoob`), `buildLift`, `buildHall`, `PovArms`, `makeTL` |
| `remotion/src/videos/f13/Shell.tsx` | `makeFilm`: tinta tipis → tone mapping → fisheye, vinyet, kilat, denyut merah, caption, bunyi, kartu pilihan / `Ending`, opsi `shadows` |
| `remotion/src/videos/f13/audit.ts` | audit tembus: AABB + verifikasi OBB, kedalaman > 3 cm |
| `remotion/src/videos/bl/park.ts` | maskot `Hoppy`, `makeMax`, `Phone` (senter + bayangan), `buildPark` (gerbang, komidi putar, bianglala, lampu, kios, rumah hantu, siang/malam), `enableShadows`, `moonLight` |
| `remotion/src/videos/rbxN/` | satu episode = `dunia.ts` (set + kamera + tangan POV per adegan) + `Film.tsx` + `timeline.json`; entry `src/entries/RbxN.tsx` |
| `remotion/scripts/` | `stills.mjs` (gambar diam), `audit.mjs` (audit tembus) |
| `suara/` | `vox_ep.py`, `cek_vo.py`, `buat_timeline.py`, `mix.py`, `cari_sfx.py`, `cek_sfx.py` |
| `contoh/epN/` | naskah JSON + isyarat efek suara tiap episode contoh |

## Pasang (sekali)
- Node 20+, ffmpeg, Google Chrome. `cd remotion && npm install`.
- Python 3.11: `uv venv -p 3.11 .venv-vox && UV_LINK_MODE=copy VIRTUAL_ENV=.venv-vox uv pip install voxcpm soundfile numpy faster-whisper librosa`.
- Model `openbmb/VoxCPM2` (±4,3 GB) diunduh sekali; set `HF_HOME` ke lokasinya dan `HF_HUB_OFFLINE=1` bila sudah ada. Di Mac M1 berjalan di MPS.
- ffmpeg Homebrew tidak punya `rubberband`; `mix.py` memakai asetrate + atempo untuk geser nada.

## Alur kerja per episode
1. **Naskah** `naskah/epN.json` (salin dari `contoh/`). Hook di 1,5 detik pertama (`awal: 1.5`), dialog pendek, ketegangan naik, akhir menggantung, baris pilihan 6 detik (episode terakhir: layar akhir tanpa pilihan). `fx` hanya gema (`aecho`, `apad`), jangan highpass/lowpass.
2. **Suara tokoh konsisten:** salin `vox_ep1/ref_*.wav` ke `vox_epN/` sebelum menjalankan
   `HF_HOME=... HF_HUB_OFFLINE=1 python suara/vox_ep.py naskah/epN.json vox_epN` (latar belakang). Cek: `python suara/cek_vo.py naskah/epN.json vox_epN` (whisper `small`). Semua kata harus terucap.
3. **Timeline:** `python suara/buat_timeline.py naskah/epN.json vox_epN epN` lalu salin `epN/timeline.json` ke `src/videos/rbxN/`. Selama suara dibuat, pakai timeline perkiraan: `... naskah/epN.json - epN`.
4. **Visual:** salin episode contoh terdekat ke `rbxN`, ubah `dunia.ts`. Semua gerak murni fungsi frame dan terikat ke baris lewat `S0("gNN")`/`E0("gNN")`. Tandai benda bergerak dengan `g.userData.dyn = "<nama>"` (Orang, Hoppy, PovArms sudah otomatis) supaya ikut diaudit.
5. **Gambar diam:** `node scripts/stills.mjs RbxN out/s 20,90,... 0.5` di awal, tengah, dan akhir setiap shot; baca sendiri gambarnya (gelap? terhalang? kamera menembus?).
6. **Audit tembus (wajib):** tambahkan episode ke `src/entries/Audit.tsx`, jalankan `node scripts/audit.mjs N` dengan timeline final. Perbaiki sampai 0. `node scripts/audit.mjs 0` = adegan uji (harus menemukan "A tembus" saja).
7. **Audio:** tulis `epN/sfx.py` (rekaman CC0 saja), lalu
   `python suara/cari_sfx.py --cek <semua id fs->` → semua LOLOS, lalu `python suara/mix.py epN epN/sfx.py --lufs -14`.
8. **Render:** `npx remotion render src/entries/RbxN.tsx RbxN out/vN.mp4 --gl=angle --concurrency=4 --crf=18`, lalu
   `ffmpeg -i out/vN.mp4 -i epN/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest Judul-PartN.mp4`. Cek durasi, frame, LUFS, lembar kontak.

## Mencari efek suara & musik (CC0, rekaman asli)
- `python suara/cari_sfx.py "music box" 12` → daftar id + lisensi (dibaca dari halaman freesound.org/s/N) + kerataan; hanya **CC0** dan kerataan ≤ 0,15 yang LOLOS. Hasil tercatat di `sfx_cache/lisensi.json` (bukti lisensi).
- Musik latar yang sudah terbukti: `fs-387221` & `fs-387222` (Suspense Orchestral Loop), kotak musik `fs-150025`, piano `fs-231562` / `fs-636194`, kejutan `fs-814050` / `fs-513330`, detak jantung `fs-21409`, langkah `fs-166509` / `fs-155345`.
- Ditolak (desis/statis): `fs-17804`, `fs-119910`, `fs-500693`, `fs-341611`, `fs-626096`, `fs-250738`, `fs-141139`, `fs-155135`, `fs-149890`, `fs-271945`, `fs-351407`, `fs-393749`, `fs-868548`.

## Gaya visual
- Tokoh R6: kepala silinder membulat + wajah decal datar (mata oval, senyum busur, seringai lebar saat seram), badan 0,66×0,66×0,33, lengan & kaki kotak 0,32×0,66×0,32, kulit kuning klasik `#f5cd30`. Bedakan tokoh lewat baju, rambut, topi.
- Maskot / monster dibuat orisinal (contoh: Hoppy, kelinci balok raksasa). Jangan meniru karakter dari game/film lain.
- Bayangan asli: `shadows: true` di `makeFilm`, `moonLight()` + `enableShadows(root)`; senter ponsel (`Phone`) memberi cahaya utama di tempat gelap.
- Tinta tipis (`widthNear 3.2`), toon 4 tingkat yang terang, lantai berstud, warna plastik cerah. Adegan gelap tetap harus terbaca: tambah lampu aksen/lampu kerja, jangan hitam total.
- Kamera POV fisheye 104°, gerak napas/langkah halus, sentakan saat kejutan, belokan kamera lewat sudut (bukan interpolasi titik yang lewat dekat kamera).

## Pelajaran (jangan diulang)
- `COLD` (adegan pembuka) = `S0("g01") - 4`, supaya tidak menutupi baris pertama yang tanpa teks.
- Jangan menimpa skala mesh yang dibuat lewat `box()` (skala = ukuran). Bug nyata: `mouth.scale.y = 1 + 4*talk` membuat mulut Hoppy setinggi beberapa meter; benar: `0.03 * (1 + 4*talk)`.
- Benda yang diduduki/ditumpangi harus berongga (kereta = lantai + 4 dinding), kamera ikut bergerak bersama kendaraan.
- Tokoh yang berjalan diberi lajur tetap dengan jarak tetap; jangan melintas rel/pagar/pintu putar.
- Cermin palsu: panel kaca transparan + "ruang pantulan" di baliknya berisi tokoh pantulan.
- Kotak AABB membengkak untuk benda yang diputar (tikungan) → audit memakai verifikasi OBB; tetap periksa temuan dengan gambar diam.
- Bola langit harus lebih kecil dari jarak pandang kamera (`far` 120 → langit 100 m, bulan/bintang ≤ 95 m); kalau tidak, langit tidak tergambar (hitam polos).
- Di kamera yang menghadap +z, sumbu **+x tampil di kiri layar**. Target tangan kanan POV di dunia harus di sisi -x, kalau tidak tangan bersilang.
- Adegan pembuka episode terakhir jangan memperlihatkan twist akhir (pakai momen tegang di tengah).
- Suara tokoh: VoxCPM2 rancang suara dasar sekali, kloning per baris + arahan emosi bahasa Inggris. Baris kurang pas: ganti `seed`/`arah`, hapus klipnya, jalankan lagi.

## Lisensi pihak ketiga
`ink.ts` & `stills.mjs` berasal dari cartoon-3d-short (MIT, lihat `LICENSE-cartoon-3d-short.txt`). Font Fredoka: SIL OFL. Efek suara tidak disertakan; diunduh dari sampel Lots of Sounds (rekaman Freesound CC0) — simpan `sfx_cache/lisensi.json` sebagai bukti. Remotion punya lisensi sendiri (perusahaan tertentu perlu lisensi berbayar).
