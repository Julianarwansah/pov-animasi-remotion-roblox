# Isyarat efek suara BLOXY LAND Part 1 (dipakai mix.py). Rekaman asli CC0 (dicek cari_sfx.py --cek) (dicek cek_sfx.py).
place("fs-387222", 0, -27, dur=TOTAL, loop=True, fin=1.5, fout=2.0, bus=bus_amb)                  # musik latar
_t = t0("g01") - 1.2
while _t < t1("g02") - 0.2:                                                                               # langkah kaki di jalan batu
    place("fs-166509", _t, -24, dur=0.45, fin=0.003, fout=0.1); _t += 0.52
place("fs-233293", 0.6, -22, dur=1.6, fin=0.05, fout=0.4)                                               # derit gerbang
place("fs-150025", t0("g03") + 0.3, -21, dur=t0("g10") - t0("g03"), loop=True, fin=0.4, fout=0.6, bus=bus_amb)  # komidi putar
place("fs-243701", t0("g04") - 0.5, -16, dur=0.6)                                                       # bel pengumuman
dark = [(t0("g08") + 8 / 30), (t0("g08") + 42 / 30), (t0("g09") + 26 / 30), (t0("g10") + 2 / 30)]
for d in dark:
    place("fs-448393", d, -15, dur=0.8)                                                                 # CLUNK lampu padam
for d in [t0("g08") + 18 / 30, t0("g08") + 52 / 30, t0("g09") + 34 / 30]:
    place("fs-636194", d, -17, dur=2.2, fin=0.005, fout=0.6)                                    # Hoppy makin dekat (piano rendah)
place("fs-21409", t0("g08"), -22, dur=t0("g13") - t0("g08"), loop=True, fin=1.0, fout=0.2)              # detak jantung
place("fs-231562", t0("g10"), -21, dur=t0("g12") - t0("g10"), fin=0.3, fout=0.2)                  # Max hilang
place("fs-814050", t0("g12") - 0.1, -12, dur=2.4, fin=0.005, fout=0.8)                          # Hoppy di belakang
place("fs-473558", t0("g13"), -14)                                                                      # beku -> kartu pilihan
place("fs-814050", 0.0, -13, dur=1.3, fin=0.005, fout=0.3)                                      # cold open
place("fs-473558", 1.15, -15)
