# pov-animasi-remotion-roblox

Skill Claude Code untuk membuat serial Shorts horor POV bergaya Roblox: tokoh balok R6, lensa fisheye, bayangan asli, dialog emosional VoxCPM2 berbahasa Inggris, layar bersih, efek suara & musik rekaman asli CC0 (aman dimonetisasi), kartu pilihan "What would you do?", dan audit tembus otomatis sebelum render. Visual dirender dengan three.js di dalam Remotion.

Contoh serial di dalamnya:
- **Floor 13** (4 episode): lift hotel balok berhenti di lantai yang tidak ada.
- **Bloxy Land After Hours** (3 episode): taman hiburan tutup dan maskot kelinci Hoppy.

## Pasang

```bash
git clone https://github.com/Julianarwansah/pov-animasi-remotion-roblox.git
cp -r pov-animasi-remotion-roblox/skills/pov-animasi-remotion-roblox ~/.claude/skills/
```

Lalu minta di Claude Code, misalnya: "buat animasi POV Roblox baru". Cara kerja lengkap ada di [SKILL.md](skills/pov-animasi-remotion-roblox/SKILL.md).

## Coba contohnya

```bash
cd skills/pov-animasi-remotion-roblox/remotion
npm install
npm run studio
```

Audit tembus untuk satu episode (harus 0 sebelum render):

```bash
node scripts/audit.mjs 5
```

## Lisensi pihak ketiga

- `ink.ts` dan `scripts/stills.mjs` berasal dari proyek cartoon-3d-short (MIT), lihat [LICENSE-cartoon-3d-short.txt](LICENSE-cartoon-3d-short.txt).
- Font Fredoka: SIL Open Font License, lihat `remotion/public/fonts/OFL-Fredoka.txt`.
- Efek suara dan musik tidak disertakan. `cari_sfx.py` hanya meloloskan rekaman CC0 (dicek di freesound.org) dan mencatat buktinya di `sfx_cache/lisensi.json`.
- Remotion punya lisensi sendiri; perusahaan tertentu perlu lisensi berbayar.
