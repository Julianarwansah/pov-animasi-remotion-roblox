"""Klip dialog -> <ep>/vo/*.wav, <ep>/timeline.json (frame + gerak mulut), <ep>/suara_vo.wav.

    python buat_timeline.py <naskah.json> <folder_vox> <folder_ep>
    python buat_timeline.py <naskah.json> - <folder_ep>      # perkiraan tanpa suara (untuk mulai menata adegan)

Field baris opsional: "fx" (filter ffmpeg, mis. radio/gema), "jeda" (detik hening sesudahnya), "dur" (baris tanpa teks).
"""
import json, os, subprocess, sys
import numpy as np

FPS, SR, GAP = 30, 48000, 0.35
DB = {"teriak": 2.0, "bisik": -3.0}
# potong hening di ujung. TANPA geser nada / vibrato (membuat suara aneh).
SISI = "silenceremove=start_periods=1:start_threshold=-45dB"
TRIM = f"{SISI},areverse,{SISI},areverse"


def mulut(a, n):
    if not n:
        return []
    r = np.array([np.sqrt(np.mean(s ** 2)) if len(s) else 0.0 for s in (a[int(i * SR / FPS):int((i + 1) * SR / FPS)] for i in range(n))])
    return [round(float(x), 2) for x in np.clip(r / (np.percentile(r, 90) + 1e-6), 0, 1)]


src, vox, ep = sys.argv[1:4]
d = json.load(open(src, encoding="utf-8"))
os.makedirs(os.path.join(ep, "vo"), exist_ok=True)
t, baris, klip = float(d.get("awal", 1.5)), [], []
for b in d["baris"]:
    it = {k: b.get(k) for k in ("id", "scene", "who", "emo", "text")}
    if b.get("text") and vox != "-":
        import soundfile as sf
        wp = os.path.join(ep, "vo", b["id"] + ".wav")
        af = [TRIM, "loudnorm=I=-19:TP=-3:LRA=11", f"volume={DB.get(b.get('emo'), 0)}dB"]
        af += ([b["fx"]] if b.get("fx") else []) + ["alimiter=limit=0.89:level=false", f"aresample={SR}"]
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", os.path.join(vox, b["id"] + ".wav"), "-af", ",".join(af), "-ac", "1", wp], check=True)
        a, _ = sf.read(wp, dtype="float32")
        dur = len(a) / SR
        klip.append((t, a))
        env = mulut(a, round(dur * FPS))
    else:
        dur = len(b["text"].split()) / 2.3 + 0.3 if b.get("text") else b["dur"]
        env = [1.0 if i % 6 < 3 else 0.5 for i in range(round(dur * FPS))] if b.get("text") else []
    it.update(start=round(t * FPS), end=round((t + dur) * FPS), dur=round(dur, 3), mulut=env)
    baris.append(it)
    t += dur + (GAP if b.get("text") else 0) + b.get("jeda", 0)
total = round((t + d.get("akhir", 0.3)) * FPS)
with open(os.path.join(ep, "timeline.json"), "w", encoding="utf-8") as fo:
    json.dump({"fps": FPS, "total": total, "judul": d.get("judul"), "baris": baris}, fo, ensure_ascii=False)
if klip:
    vo = np.zeros(int(total / FPS * SR) + SR, dtype=np.float32)
    for s, a in klip:
        vo[int(s * SR):int(s * SR) + len(a)] += a
    sf.write(os.path.join(ep, "suara_vo.wav"), np.clip(vo, -1, 1), SR)
print(f"{len(baris)} baris, {total} frame = {total / FPS:.1f} dtk")
