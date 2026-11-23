# Isyarat efek suara FLOOR 13 Part 2 (dipakai mix.py). Sampel gratis Lots of Sounds.
# [dibuang: statis] place("fs-250738", 0, -30, dur=t0("g06"), loop=True, fin=0.5, fout=0.3, bus=bus_amb)                    # dengung lift diam
# [dibuang: statis] place("fs-141139", 0, -32, dur=t0("g15"), loop=True, fin=2, fout=0.5, bus=bus_amb)                      # dengung seram
# [dibuang: statis] place("fs-626096", t0("g09"), -31, dur=TOTAL - t0("g09"), loop=True, fin=1.0, fout=1.5, bus=bus_amb)    # dengung lorong 13
place("fs-14262", t0("g01"), -17, dur=t0("g02") - t0("g01") + 0.4, fin=0.01, fout=0.3)                  # RIIING alarm
for k in range(4):
    place("fs-188388", t0("g01") + 0.1 + k * 0.27, -19, dur=0.4)                                        # tombol alarm ditekan
# [dibuang: statis] place("fs-17804", t0("g02") - 0.2, -30, dur=t1("g02") - t0("g02") + 0.3, fin=0.05, fout=0.1)            # desis interkom
# [dibuang: statis] place("fs-17804", t0("g04") - 0.2, -30, dur=t1("g05") - t0("g04") + 0.3, fin=0.05, fout=0.2)            # desis interkom
place("fs-814050", t0("g05") + 0.1, -17)                                                                # Lily menyela di speaker
place("fs-176146", t1("g05") - 0.6, -18, dur=0.9)                                                       # pintu menutup rapat
place("fs-530307", t0("g06"), -14, dur=t0("g08") - t0("g06") + 0.1, offset=2, fin=0.02, fout=0.05)     # lift jatuh
# [dibuang: statis] place("fs-341611", t0("g06"), -22, dur=t0("g08") - t0("g06"), fin=0.05, fout=0.05)                      # listrik berkedip
place("fs-513330", t0("g06"), -16, dur=1.5, fin=0.01, fout=0.4)                                         # stinger jatuh
place("fs-448393", t0("g08") - 0.05, -9, dur=1.0)                                                       # BRAK berhenti
place("fs-473558", t0("g08") - 0.05, -14)
place("fs-11587", t0("g09"), -15, dur=1.6, fin=0.005, fout=0.5)                                         # DING
place("fs-176146", t0("g09") + 0.3, -17, dur=1.0, fin=0.02, fout=0.3)                                   # pintu terbuka
place("fs-21409", t0("g10"), -22, dur=t0("g15") - t0("g10"), loop=True, fin=1.5, fout=0.2)              # detak jantung
place("fs-513330", t0("g12") + 1.0, -16, dur=3.0, fin=0.05, fout=0.8)                                   # kepala Lily berputar
place("fs-233293", t0("g13") + 0.3, -14, dur=1.6, fin=0.02, fout=0.4)                                   # palka berderit terbuka
place("fs-112557", t0("g13"), -21, dur=t0("g15") - t0("g13"), fin=0.3, fout=0.2)                        # napas
place("fs-473558", t0("g15"), -14)                                                                      # beku -> kartu pilihan
# [dibuang: statis] place("fs-141139", t0("g15") + 0.1, -24, dur=TOTAL - t0("g15"), fin=0.3, fout=0.4, st=-3)
place("fs-513330", 0.0, -12, dur=1.3, fin=0.01, fout=0.3)                                                # cold open
place("fs-473558", 1.15, -15)
place("fs-387221", 0, -27, dur=TOTAL, loop=True, fin=1.5, fout=2.0, bus=bus_amb)                 # musik latar: rekaman orkestra asli CC0
