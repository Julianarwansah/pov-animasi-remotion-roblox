"""Cek klip dialog: transkripsi vs naskah + variasi nada (semiton).

    python cek_vo.py <naskah.json> <folder_vox>
"""
import json, os, sys
import librosa, numpy as np
from faster_whisper import WhisperModel

d = json.load(open(sys.argv[1], encoding="utf-8"))
m = WhisperModel("small", device="cpu", compute_type="int8")
for b in d["baris"]:
    if not b.get("text"):
        continue
    a, _ = librosa.load(os.path.join(sys.argv[2], b["id"] + ".wav"), sr=16000)
    teks = " ".join(s.text.strip() for s in m.transcribe(a, language="en")[0])
    f0 = librosa.pyin(a, fmin=70, fmax=600, sr=16000)[0]
    f0 = f0[~np.isnan(f0)]
    st = np.std(12 * np.log2(f0 / np.median(f0))) if len(f0) else 0
    print(f"{b['id']} {b['who']:8s} {len(a) / 16000:4.1f}s std {st:.1f}st | {b['text']} => {teks}", flush=True)
