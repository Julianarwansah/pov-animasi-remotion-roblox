# Isyarat efek suara BLOXY LAND Part 3 FINAL (dipakai mix.py). Semua rekaman asli CC0 (dicek cari_sfx.py --cek).
malam_akhir = t1("g08") + 0.3
place("fs-846363", 0, -26, dur=malam_akhir, loop=True, fin=0.8, fout=1.2, bus=bus_amb)                  # musik latar: karnaval berhantu
place("fs-218890", t0("g01") - 0.05, -12, dur=1.5, fin=0.005, fout=0.4)                                 # CRASH kereta menerobos keluar
place("fs-530307", t0("g01"), -15, dur=t0("g05") - t0("g01"), offset=2, fin=0.05, fout=0.4)              # kereta melaju di rel
place("fs-150025", t0("g03"), -22, dur=t0("g05") - t0("g03"), fin=0.5, fout=0.6, bus=bus_amb)           # kotak musik bianglala
place("fs-243701", t0("g04") - 0.5, -16, dur=0.6)                                                       # bel pengumuman
place("fs-134991", t0("g05"), -17, dur=t1("g08") - t0("g05"), fin=0.05, fout=0.3)                       # berlari ke gerbang
place("fs-21409", t0("g05"), -21, dur=malam_akhir - t0("g05"), loop=True, fin=0.6, fout=0.4)            # detak jantung
place("fs-636194", t0("g06") + 0.1, -15, dur=2.4, fin=0.005, fout=0.6)                                  # Hoppy di gerbang
place("fs-814050", t0("g07") + 0.1, -16, dur=2.5, fin=0.005, fout=0.8)                                  # "tinggal selamanya"
place("fs-214233", t1("g08") - 0.6, -13, dur=2.0, fin=0.01, fout=0.8)                                   # gerbang tertutup
# pagi: burung, keramaian, musik sirkus ceria
place("fs-152989", t0("g09"), -27, dur=TOTAL - t0("g09"), loop=True, fin=1.0, fout=1.5, bus=bus_amb)    # suasana pagi + burung
place("fs-337636", t0("g09") + 0.5, -29, dur=TOTAL - t0("g09") - 0.5, loop=True, fin=1.5, fout=1.5, bus=bus_amb)  # anak-anak bermain
place("fs-342153", t0("g09") + 0.3, -26, dur=t0("g13") - t0("g09"), loop=True, fin=1.0, fout=0.8, bus=bus_amb)  # musik sirkus
place("fs-243701", t0("g10") - 0.5, -16, dur=0.6)                                                       # bel pengumuman pagi
place("fs-636194", t0("g12") - 0.1, -18, dur=2.4, fin=0.01, fout=0.6)                                   # sadar: topi Max
place("fs-814050", t0("g13") + 0.1, -14, dur=3.0, fin=0.005, fout=0.8)                                  # maskot melambai
place("fs-473558", t0("g14"), -14)                                                                      # THE END
place("fs-513330", 0.0, -13, dur=1.3, fin=0.005, fout=0.3)                                              # cold open
place("fs-473558", 1.15, -15)
