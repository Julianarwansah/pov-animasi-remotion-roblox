"""Cek efek suara sebelum mix: unduh yang belum ada, ukur kerataan spektrum (mirip desis/statis bila > 0.15).

    python cek_sfx.py <isyarat_sfx.py> [batas=0.15]
Keluar dengan kode 1 bila ada efek yang mirip desis (jangan di-mix sebelum diganti).
"""
import json, os, re, sys, urllib.request
import numpy as np, librosa

src = sys.argv[1]; lim = float(sys.argv[2]) if len(sys.argv) > 2 else 0.15
os.makedirs("sfx_cache", exist_ok=True)
paths = []
for ln in open(src, encoding="utf-8"):
    if ln.lstrip().startswith("#"):
        continue
    for m in re.findall(r'place\("([^"]+)"', ln):
        paths.append(m)
bad = 0
for p in sorted(set(paths)):
    f = p
    if not os.path.exists(p):
        f = f"sfx_cache/{p}.mp3"
        if not os.path.exists(f):
            with urllib.request.urlopen(f"https://api.lotsofsounds.com/api/v1/sounds/sample/{p}/stream") as r:
                url = json.load(r)["data"]["stream_url"]
            urllib.request.urlretrieve(url, f)
    y, sr = librosa.load(f, sr=22050, duration=10)
    fl = float(np.mean(librosa.feature.spectral_flatness(y=y)))
    flag = fl > lim
    bad += flag
    print(f"{p:28s} kerataan {fl:.3f} {'<-- MIRIP DESIS, ganti' if flag else 'ok'}")
print("semua bersih" if not bad else f"{bad} efek mirip desis")
sys.exit(1 if bad else 0)
