# pov-roblox — pabrik Shorts horor POV gaya Roblox

Proyek kerja untuk membuat serial Shorts/Reels/TikTok horor POV bergaya balok (Remotion + three.js + VoxCPM2).
Bisa dipakai untuk channel YouTube mana pun: semua teks yang terikat channel ada di `kanal/<nama>/kanal.json`.

## Susunan folder

| Folder / file | Isi |
|---|---|
| `kanal/<nama>/` | identitas channel: `kanal.json`, `profil/` (foto profil), `judul-deskripsi.md` |
| `kanal/_contoh/` | templat untuk channel baru |
| `src/kanal.json` | channel **aktif** (disalin oleh `npm run kanal <nama>`, jangan diedit langsung) |
| `daftar-episode.json` | peta nomor episode → serial, part, id komposisi, file hasil |
| `naskah/epN.json` | naskah episode N (dialog, arahan emosi, adegan) |
| `vox_epN/` | klip suara VoxCPM2 mentah (`ref_*.wav` = suara dasar tokoh) |
| `epN/` | `timeline.json`, `vo/`, `sfx.py` (isyarat efek), `mix.wav` |
| `src/videos/inti/` | kode bersama: tokoh balok, lift, lorong, lapisan film, audit tembus, tinta, fisheye |
| `src/videos/taman/` | set taman hiburan + maskot Hoppy + ponsel/senter |
| `src/videos/rbxN/` | dunia 3D + kamera episode N |
| `src/entries/` | `RbxN.tsx` (render), `Audit.tsx` (audit tembus), `Profil.tsx` (foto profil) |
| `suara/` | `vox_ep.py`, `cek_vo.py`, `buat_timeline.py`, `mix.py`, `cari_sfx.py`, `cek_sfx.py` |
| `sfx_cache/` | rekaman efek/musik CC0 + `lisensi.json` (bukti lisensi, jangan dihapus) |
| `hasil/<serial>/` | video siap unggah; `tanpa-audio/` = render tanpa suara (untuk mix ulang tanpa render ulang) |
| `out/` | file sementara (gambar uji) — boleh dikosongkan kapan saja |

## Memakai untuk channel lain

```bash
cp -r kanal/_contoh kanal/nama-channel
```
Edit `kanal/nama-channel/kanal.json` (nama, handle, teks & warna foto profil, ajakan komentar/follow, tagar), lalu:

```bash
npm run kanal nama-channel
```

```bash
npm run profil
```
Hasil: 4 varian foto profil + `pratinjau-bulat.png` di `kanal/nama-channel/profil/`. Kartu pilihan & kartu akhir episode baru otomatis memakai teks channel ini.

## Membuat episode baru (ringkas)
1. Tambahkan episode di `daftar-episode.json`; tulis `naskah/epN.json`.
2. Salin `vox_ep1/ref_noob.wav` dkk. ke `vox_epN/` (suara tokoh tetap sama), lalu buat suara:
   `HF_HOME=... HF_HUB_OFFLINE=1 ../.venv-vox/bin/python suara/vox_ep.py naskah/epN.json vox_epN`
3. `../.venv-vox/bin/python suara/cek_vo.py naskah/epN.json vox_epN` → semua kata terucap.
4. `../.venv-vox/bin/python suara/buat_timeline.py naskah/epN.json vox_epN epN` → salin `epN/timeline.json` ke `src/videos/rbxN/`.
5. Bangun `src/videos/rbxN/` (salin episode contoh terdekat) + `src/entries/RbxN.tsx`; cek gambar: `npm run stills RbxN out/s 20,90,... 0.5`.
6. Tambahkan ke `src/entries/Audit.tsx`, jalankan `npm run audit N` → harus **0 pasangan tembus**.
7. Efek & musik hanya rekaman asli CC0: `../.venv-vox/bin/python suara/cari_sfx.py "kata kunci"`, tulis `epN/sfx.py`, cek `cari_sfx.py --cek <id...>`, lalu `../.venv-vox/bin/python suara/mix.py epN epN/sfx.py --lufs -14`.
8. Render `npx remotion render src/entries/RbxN.tsx RbxN out/vN.mp4 --gl=angle --concurrency=4 --crf=18`, lalu `npm run gabung N` → file siap unggah di `hasil/<serial>/`.

Mix ulang audio saja (gambar tetap): ubah `epN/sfx.py` → `mix.py` → `npm run gabung N`.

## Aturan tetap
- Cerita orisinal tiap serial, bahasa Inggris USA, layar bersih (tanpa HUD/judul di atas).
- Audio hanya rekaman asli CC0, tanpa desis/statis, tanpa filter telepon di suara tokoh.
- Audit tembus 0 sebelum render.
- Panduan lengkap: skill `pov-animasi-remotion-roblox` (repo github.com/Julianarwansah/pov-animasi-remotion-roblox).
