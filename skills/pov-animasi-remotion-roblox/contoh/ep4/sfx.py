# Isyarat efek suara FLOOR 13 Part 4 FINAL (dipakai mix.py). Sampel gratis Lots of Sounds.
# [dibuang: statis] place("fs-119910", 0, -33, dur=t0("g13"), loop=True, fin=0.5, fout=0.2, bus=bus_amb)                    # dengung kamar
# [dibuang: statis] place("fs-141139", t0("g03"), -31, dur=t0("g13") - t0("g03"), loop=True, fin=2, fout=0.2, bus=bus_amb)  # dengung seram
place("fs-137083", t0("g01") + 0.2, -11, dur=1.2)                                                       # SLAM pintu
place("fs-422852", t0("g01") + 0.7, -17)                                                                # kunci diputar
place("fs-112557", t0("g01"), -21, dur=t1("g02") + 0.5 - t0("g01"), fin=0.2, fout=0.6)                  # napas lega
place("fs-21409", t0("g04"), -22, dur=t0("g13") - t0("g04"), loop=True, fin=1.5, fout=0.05)             # detak jantung
place("fs-169727", t0("g05") - 0.6, -15, dur=2.0, fin=0.05, fout=0.5)                                   # kepala berputar penuh
place("fs-513330", t0("g05") - 0.1, -16, dur=3.0, fin=0.02, fout=0.8)
# [dibuang: statis] place("fs-155135", t0("g07"), -22, dur=t1("g08") - t0("g07"), fin=0.2, fout=0.3)                        # glitch tangan
place("fs-814050", t0("g09"), -14)                                                                      # pantulan Guest
place("fs-104001", t0("g10"), -10, dur=t1("g11") - t0("g10"), fin=0.01, fout=0.2)                       # KNOCK KNOCK
place("fs-513330", t0("g12") + 0.1, -13, dur=3.0, fin=0.01, fout=0.3)                                   # teriak + kembaran melambai
# [dibuang: statis] place("fs-149890", t0("g13"), -16, dur=0.5, fin=0.005, fout=0.05)                                       # putus koneksi (glitch)
place("fs-473558", t0("g13") + 0.25, -15)
# [dibuang: statis] place("fs-141139", t0("g14"), -24, dur=TOTAL - t0("g14"), st=-5, fin=0.5, fout=1.5)                     # dengung pelan THE END
place("fs-473558", t0("g14") + 0.7, -16)
place("fs-513330", 0.0, -12, dur=1.3, fin=0.01, fout=0.3)                                                # cold open
place("fs-473558", 1.15, -15)
place("fs-387221", 0, -27, dur=TOTAL, loop=True, fin=1.5, fout=2.0, bus=bus_amb)                 # musik latar: rekaman orkestra asli CC0
