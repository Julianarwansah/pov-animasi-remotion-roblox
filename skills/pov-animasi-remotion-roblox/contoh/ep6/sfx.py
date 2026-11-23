# Isyarat efek suara BLOXY LAND Part 2 (dipakai mix.py). Semua rekaman asli CC0 (dicek cari_sfx.py --cek).
place("fs-274379", 0, -27, dur=TOTAL, loop=True, fin=1.5, fout=2.0, bus=bus_amb)                        # musik latar: kotak musik seram
place("fs-137083", t0("g01") + 0.1, -12, dur=1.2)                                                       # pintu rumah hantu terbanting
place("fs-155345", t0("g01") + 0.6, -22, dur=t0("g03") - t0("g01") - 0.6, loop=True, fin=0.2, fout=0.3) # langkah di lantai kayu
place("fs-701326", t0("g03"), -19, dur=0.6)                                                             # beep walkie di lantai
place("fs-701326", t0("g03") + 0.9, -21, dur=0.6)
place("fs-701314", t0("g05") - 0.25, -17, dur=0.3)                                                      # tombol walkie (Max mulai bicara)
place("fs-321906", t1("g05"), -18, dur=0.7)                                                             # roger beep
place("fs-155345", t0("g06"), -22, dur=t0("g08") - t0("g06") - 0.2, loop=True, fin=0.2, fout=0.3)       # berjalan ke labirin cermin
place("fs-21409", t0("g08"), -22, dur=t0("g14") - t0("g08"), loop=True, fin=1.0, fout=0.2)              # detak jantung
place("fs-814050", t0("g09") + 0.25, -13, dur=3.0, fin=0.005, fout=0.8)                                 # Max berubah jadi Hoppy
place("fs-513330", t0("g11") - 0.1, -13, dur=3.0, fin=0.005, fout=0.8)                                  # Hoppy di setiap cermin
place("fs-134991", t0("g12"), -18, dur=t0("g13") - t0("g12") + 0.5, fin=0.05, fout=0.3)                 # lari ke kereta
place("fs-530307", t0("g13") + 0.7, -16, dur=TOTAL - t0("g13") - 0.7, offset=2, fin=0.2, fout=0.6)      # kereta mulai melaju
place("fs-473558", t0("g14"), -14)                                                                      # beku -> kartu pilihan
place("fs-513330", 0.0, -13, dur=1.3, fin=0.005, fout=0.3)                   # cold open
place("fs-473558", 1.15, -15)
