# Isyarat efek suara FLOOR 13 Part 1 (gaya Roblox), dipakai mix.py. Rekaman sampel gratis Lots of Sounds.
# [dibuang: statis] place("fs-250738", 0, -29, dur=t0("g04") + 1.0, loop=True, fin=0.5, fout=1.0, bus=bus_amb)                 # dengung lift berjalan
# [dibuang: statis] place("fs-626096", t0("g04"), -31, dur=TOTAL - t0("g04"), loop=True, fin=1.0, fout=1.5, bus=bus_amb)       # dengung lorong lantai 13
# [dibuang: statis] place("fs-141139", t0("g02"), -32, dur=t0("g14") - t0("g02"), loop=True, fin=3, fout=0.5, bus=bus_amb)     # dengung seram
place("fs-188388", 1.3, -19, dur=0.5)                                                                   # tekan tombol 20
# [dibuang: statis] place("fs-500693", t0("g02") + 0.3, -24, dur=1.0, fin=0.02, fout=0.2)                                     # lampu kabin berkedip
place("fs-11587", t0("g04"), -15, dur=1.6, fin=0.005, fout=0.5)                                         # DING
place("fs-176146", t0("g04") + 0.3, -17, dur=1.0, fin=0.02, fout=0.3)                                   # pintu lift terbuka
# [dibuang: statis] place("fs-500693", t0("g08"), -22, dur=t0("g10") - t0("g08"), loop=True, fin=0.2, fout=0.3)             # lampu lorong bzzzt
place("fs-21409", t0("g09"), -21, dur=t0("g14") - t0("g09"), loop=True, fin=1.5, fout=0.2)              # detak jantung
place("fs-814050", t0("g10") + 0.2, -14)                                                                # kepala menoleh serentak
place("fs-231562", t0("g11"), -24, dur=t0("g14") - t0("g11"), fin=0.6, fout=0.2)              # para pemain mendekat
for k in range(4):
    place("fs-188388", t0("g12") + 0.1 + k * 0.27, -17, dur=0.4)                                        # CLICK CLICK CLICK (tombol close)
place("fs-346884", t0("g12") + 0.33, -18, dur=0.7, fin=0.02, fout=0.2)                                  # pintu mulai menutup
place("fs-448393", t0("g12") + 1.0, -11, dur=1.0)                                                       # THUNK: tangan menahan pintu
place("fs-513330", t0("g12") + 1.0, -14, dur=3.5, fin=0.02, fout=0.8)                                   # stinger wajah di celah
# [dibuang: statis] place("fs-341611", t0("g12") + 1.0, -25, dur=1.5, fin=0.05, fout=0.5)                                   # listrik lampu padam
place("fs-112557", t0("g12") + 0.6, -20, dur=t0("g14") - t0("g12"), fin=0.3, fout=0.2)                 # napas ketakutan
place("fs-473558", t0("g14"), -14)                                                                      # beku -> kartu pilihan
# [dibuang: statis] place("fs-141139", t0("g14") + 0.1, -24, dur=TOTAL - t0("g14"), fin=0.3, fout=0.4, st=-3)                # dengung pelan di kartu
place("fs-513330", 0.0, -12, dur=1.4, fin=0.01, fout=0.3)                                                # cold open: wajah di celah
place("fs-473558", 1.15, -15)                                                                           # potong ke judul
place("fs-387221", 0, -27, dur=TOTAL, loop=True, fin=1.5, fout=2.0, bus=bus_amb)                 # musik latar: rekaman orkestra asli CC0
