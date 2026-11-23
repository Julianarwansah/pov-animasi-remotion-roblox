"""VoxCPM2: satu klip emosional per baris naskah.

    python vox_ep.py <naskah.json> <folder_vox>

naskah.json: "tokoh": {nama: {"desain": "(arahan suara)", "ref_teks": "..."}} atau {nama: {"pakai": "tokoh lain"}}
             "baris": [{"id", "who", "text", "arah": "(arahan emosi)", "seed": 11}, ...]
Tahap 1 merancang suara dasar tiap tokoh (ref_<tokoh>.wav); tahap 2 mengkloning ref itu per baris + arahan emosi.
File yang sudah ada dilewati: hapus satu klip (atau ganti seed) untuk mengulang baris itu saja.
"""
import json, os, random, sys, time
import numpy as np, soundfile as sf, torch
from voxcpm import VoxCPM

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
os.makedirs(out, exist_ok=True)
torch.set_num_threads(max(1, (os.cpu_count() or 2) - 1))
model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
sr = model.tts_model.sample_rate


def buat(nama, teks, seed, ref=None):
    p = os.path.join(out, nama + ".wav")
    if os.path.exists(p):
        return
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    t = time.time()
    kw = {"reference_wav_path": ref} if ref else {}
    wav = model.generate(text=teks, cfg_value=2.0, inference_timesteps=10, **kw)
    sf.write(p, np.asarray(wav, dtype=np.float32), sr)
    print(f"{nama}: {len(wav) / sr:.1f} dtk audio, {time.time() - t:.0f} dtk", flush=True)


for n, t in d["tokoh"].items():
    if not t.get("pakai"):
        buat(f"ref_{n}", t["desain"] + t["ref_teks"], 7)
for b in d["baris"]:
    if b.get("text"):
        dasar = d["tokoh"][b["who"]].get("pakai") or b["who"]
        buat(b["id"], b.get("arah", "") + b["text"], b.get("seed", 11), os.path.join(out, f"ref_{dasar}.wav"))
