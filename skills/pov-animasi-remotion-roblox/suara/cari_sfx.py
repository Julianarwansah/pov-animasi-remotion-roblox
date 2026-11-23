"""Cari rekaman ASLI yang aman dimonetisasi: hanya CC0 (domain publik) dan tidak mirip desis.

    python cari_sfx.py "<kata kunci>" [jumlah=12]          # cari + saring
    python cari_sfx.py --cek fs-123 fs-456 ...              # cek lisensi + kerataan id tertentu
Sumber: sampel Lots of Sounds (id "fs-N" = rekaman Freesound N). Lisensi dibaca dari halaman publik freesound.org/s/N/.
Lolos bila lisensi CC0 1.0 DAN kerataan spektrum <= 0.15. CC-BY/CC-BY-NC/Sampling+ ditolak (NC tidak boleh dimonetisasi,
BY wajib atribusi). Hasil yang lolos disimpan di sfx_cache/ dan dicatat di sfx_cache/lisensi.json.
"""
import json, os, re, sys, urllib.parse, urllib.request
import numpy as np, librosa

UA = {"User-Agent": "Mozilla/5.0"}
os.makedirs("sfx_cache", exist_ok=True)
DB = "sfx_cache/lisensi.json"
db = json.load(open(DB)) if os.path.exists(DB) else {}

def lisensi(fid):
    if fid in db and db[fid].get("lisensi"):
        return db[fid]["lisensi"]
    n = fid.split("-")[1]
    html = urllib.request.urlopen(urllib.request.Request(f"https://freesound.org/s/{n}/", headers=UA), timeout=30).read().decode("utf8", "ignore")
    m = re.search(r"creativecommons\.org/(publicdomain/zero|licenses/[a-z-]+)/([0-9.]+)", html)
    if not m:
        return "tidak diketahui"
    return "CC0" if "zero" in m.group(1) else "CC-" + m.group(1).split("/")[1].upper() + " " + m.group(2)

def unduh(fid):
    p = f"sfx_cache/{fid}.mp3"
    if not os.path.exists(p):
        with urllib.request.urlopen(f"https://api.lotsofsounds.com/api/v1/sounds/sample/{fid}/stream", timeout=30) as r:
            url = json.load(r)["data"]["stream_url"]
        urllib.request.urlretrieve(url, p)
    return p

def nilai(fid, nama=""):
    lic = lisensi(fid)
    fl = float("nan")
    if lic == "CC0":
        y, sr = librosa.load(unduh(fid), sr=22050, duration=10)
        fl = float(np.mean(librosa.feature.spectral_flatness(y=y)))
    ok = lic == "CC0" and fl <= 0.15
    db[fid] = {"nama": nama or db.get(fid, {}).get("nama", ""), "lisensi": lic, "kerataan": None if fl != fl else round(fl, 3), "lolos": ok,
               "sumber": f"https://freesound.org/s/{fid.split('-')[1]}/"}
    print(f"{fid:10s} {lic:16s} kerataan {'-' if fl != fl else f'{fl:.3f}'}  {'LOLOS' if ok else 'tolak'}  {nama}")
    return ok

if sys.argv[1] == "--cek":
    ids = sys.argv[2:]
    bad = sum(not nilai(i) for i in ids)
    json.dump(db, open(DB, "w"), indent=1, ensure_ascii=False)
    sys.exit(1 if bad else 0)
q, n = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 12
d = json.load(urllib.request.urlopen(f"https://api.lotsofsounds.com/api/v1/sounds/sample?q={urllib.parse.quote(q)}&limit={n}", timeout=30))
for s in d["data"]:
    try:
        nilai(s["id"], f'{s["name"]} ({s["duration"]:.1f} dtk)')
    except Exception as e:
        print(s["id"], "gagal:", e)
json.dump(db, open(DB, "w"), indent=1, ensure_ascii=False)
