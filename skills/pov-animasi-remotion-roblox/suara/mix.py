"""Dialog + efek suara + suasana -> <ep>/mix.wav (48 kHz stereo).

    python mix.py <folder_ep> <isyarat_sfx.py> [--lufs -14]

Isyarat memakai: t0(id, frac=0), t1(id), TOTAL, bus_amb, place(src, at, db, dur, offset, fin, fout, bus, loop, st, tempo).
src = id Lots of Sounds ("fs-21409", diunduh sekali ke ./sfx_cache) atau path file audio. db = keras RMS tujuan (dBFS).
"""
import argparse, json, os, re, subprocess, urllib.request
import numpy as np, soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument("ep"); ap.add_argument("isyarat"); ap.add_argument("--lufs", type=float, default=-14)
A = ap.parse_args()
SR, CACHE = 48000, "sfx_cache"
tl = json.load(open(os.path.join(A.ep, "timeline.json"), encoding="utf-8"))
L, TOTAL = {b["id"]: b for b in tl["baris"]}, tl["total"] / tl["fps"]
N = int(TOTAL * SR)
bus_fx, bus_amb = np.zeros(N, np.float32), np.zeros(N, np.float32)


def t0(i, frac=0.0):
    return (L[i]["start"] + frac * (L[i]["end"] - L[i]["start"])) / tl["fps"]


def t1(i):
    return L[i]["end"] / tl["fps"]


def ambil(src):
    if os.path.exists(src):
        return src
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, src + ".mp3")
    if not os.path.exists(p):
        with urllib.request.urlopen(f"https://api.lotsofsounds.com/api/v1/sounds/sample/{src}/stream") as r:
            url = json.load(r)["data"]["stream_url"]
        urllib.request.urlretrieve(url, p + ".part")
        os.replace(p + ".part", p)
    return p


def place(src, at, db, dur=None, offset=0.0, fin=0.03, fout=0.25, bus=None, loop=False, st=0.0, tempo=1.0):
    # tanpa rubberband (ffmpeg Homebrew tidak menyertakannya): asetrate menggeser nada, atempo mengembalikan tempo
    p = 2 ** (st / 12)
    af = [f"aresample={SR}", f"asetrate={int(SR * p)}", f"aresample={SR}", f"atempo={max(0.5, min(2.0, tempo / p)):.5f}"] if st or tempo != 1 else []
    cmd = ["ffmpeg", "-loglevel", "error", "-ss", str(offset), "-i", ambil(src), "-af", ",".join(af + [f"aresample={SR}"]), "-ac", "1", "-f", "f32le", "-"]
    a = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()
    if not len(a):
        return
    if dur and loop and len(a) < dur * SR:
        a = np.tile(a, int(np.ceil(dur * SR / len(a))))
    if dur:
        a = a[:int(dur * SR)]
    s = max(0, int(at * SR))
    a = a[:max(0, N - s)]
    if not len(a):
        return
    a *= 10 ** (db / 20) / (np.sqrt(np.mean(a ** 2)) + 1e-9)
    i, o = min(len(a), int(fin * SR)), min(len(a), int(fout * SR))
    if i:
        a[:i] *= np.linspace(0, 1, i)
    if o:
        a[-o:] *= np.linspace(1, 0, o)
    (bus_fx if bus is None else bus)[s:s + len(a)] += a


exec(compile(open(A.isyarat, encoding="utf-8").read(), A.isyarat, "exec"))
vo, _ = sf.read(os.path.join(A.ep, "suara_vo.wav"), dtype="float32")
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
# suasana turun 5 dB dan efek 2 dB selama ada dialog (rata-rata bergerak 0,2 dtk)
w = SR // 5
c = np.cumsum(np.pad(np.abs(vo).astype(np.float64), (w // 2 + 1, w - w // 2)))
k = np.clip((c[w:w + N] - c[:N]) / w / 0.02, 0, 1)
mix = vo + bus_fx * 10 ** (-2 * k / 20) + bus_amb * 10 ** (-5 * k / 20)
raw = os.path.join(A.ep, "_mix.wav")
sf.write(raw, mix, SR, subtype="FLOAT")
# ukur keras, naikkan ke target, batasi puncak; diulang karena limiter sedikit menurunkan keras
gain, out = 0.0, os.path.join(A.ep, "mix.wav")
for _ in range(4):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:level=false,aresample={SR}", "-ac", "2", out], check=True)
    log = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", out, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", log)[-1])
    if abs(A.lufs - lufs) < 0.2:
        break
    gain += A.lufs - lufs
os.remove(raw)
print(f"mix.wav {TOTAL:.1f} dtk, {lufs:.1f} LUFS")
