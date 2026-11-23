# Isyarat efek suara FLOOR 13 Part 3 (dipakai mix.py). Sampel gratis Lots of Sounds.
# [dibuang: statis] place("fs-626096", 0, -29, dur=t0("g10"), loop=True, fin=0.5, fout=0.5, bus=bus_amb)                    # gema lubang lift
# [dibuang: statis] place("fs-141139", 0, -32, dur=t0("g14"), loop=True, fin=2, fout=0.5, bus=bus_amb)                      # dengung seram
# [dibuang: statis] place("fs-119910", t0("g10"), -31, dur=TOTAL - t0("g10"), loop=True, fin=0.3, fout=1.0, bus=bus_amb)    # lampu lorong 20
place("fs-398783", t0("g01") - 0.3, -20, dur=t0("g02") - t0("g01") + 0.3, loop=True, fin=0.1, fout=0.3) # memanjat pelan
place("fs-112557", t0("g01"), -24, dur=t0("g10"), fin=0.5, fout=0.5)                                    # napas berat
place("fs-169727", t0("g04") - 0.2, -18, dur=2.0, fin=0.05, fout=0.6)                                   # bisikan pintu 15
place("fs-233293", t0("g05"), -15, dur=1.5, fin=0.02, fout=0.4)                                         # palka berderit
place("fs-513330", t0("g05") + 0.6, -15, dur=3.0, fin=0.02, fout=0.8)                                   # wajah Lily di palka
place("fs-21409", t0("g05"), -21, dur=t0("g10") - t0("g05"), loop=True, fin=1.0, fout=0.3)              # detak jantung
place("fs-721462", t0("g07"), -16, dur=t0("g09") - t0("g07"), tempo=1.6, fin=0.05, fout=0.2)            # panjat cepat
place("fs-175113", t0("g08"), -15, dur=0.9)                                                             # CLANG
place("fs-175113", t0("g08") + 0.45, -15, dur=0.9)
place("fs-175113", t0("g08") + 0.9, -15, dur=0.9)
place("fs-231562", t0("g07"), -24, dur=t0("g09") - t0("g07"), fin=0.3, fout=0.3)              # erangan mengejar
place("fs-346884", t0("g09") + 0.2, -16, dur=1.2, fin=0.02, fout=0.3)                                   # pintu 20 dipaksa terbuka
# [dibuang: statis] place("fs-141139", t0("g11"), -26, dur=t0("g14") - t0("g11"), st=-4, fin=0.5, fout=0.3)                 # kamar merah
place("fs-814050", t0("g12"), -13)                                                                      # Lily di belakang
place("fs-137083", t0("g12"), -14, dur=1.0)                                                             # THUD
place("fs-21409", t0("g12"), -20, dur=t0("g14") - t0("g12"), loop=True, tempo=1.4, fin=0.2, fout=0.2)
place("fs-473558", t0("g14"), -14)                                                                      # beku -> kartu pilihan
# [dibuang: statis] place("fs-141139", t0("g14") + 0.1, -24, dur=TOTAL - t0("g14"), fin=0.3, fout=0.4, st=-3)
place("fs-513330", 0.0, -12, dur=1.3, fin=0.01, fout=0.3)                                                # cold open
place("fs-473558", 1.15, -15)
place("fs-387221", 0, -27, dur=TOTAL, loop=True, fin=1.5, fout=2.0, bus=bus_amb)                 # musik latar: rekaman orkestra asli CC0
