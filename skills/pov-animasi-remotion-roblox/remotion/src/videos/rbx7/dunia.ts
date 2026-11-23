// BLOXY LAND After Hours — Part 3 FINAL (pilihan: RIDE THE CART OUT). Kereta wahana keluar dari rumah hantu,
// melaju di depan bianglala yang berputar kencang, berhenti di jalan utama; lari ke gerbang melewati Hoppy yang
// memegang topi Max; besok paginya taman ramai, maskot baru biru memakai topi merah Max melambai ke kamera.
import * as THREE from "three";
import TL from "./timeline.json";
import { FPS, V3, makeTL, ease, lerp, lerp3, hh, span, add, shake, breathe, box, ball, plane, glow, PovArms, Pov, povLow, povUp, Cam, applyCam, Orang } from "../f13/kit";
import { buildPark, Park, Hoppy, Phone, enableShadows, moonLight, WHEEL, HAUNT } from "../bl/park";

export const T = makeTL(TL);
const { S0, E0, sceneAt, mouthAt } = T;
export const FREEZE = S0("g14") - 1;
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g07") + 20 + Math.floor(f * 0.4)); // Hoppy di gerbang (tanpa bocoran akhir)

// lintasan kereta: keluar pintu rumah hantu (+x), di depan bianglala, belok ke -z di samping jalan utama
const TRACK = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-4.9, 0, 28.0), new THREE.Vector3(-2, 0, 28.0), new THREE.Vector3(0.6, 0, 28.0),
  new THREE.Vector3(1.4, 0, 26.8), new THREE.Vector3(1.4, 0, 20), new THREE.Vector3(1.4, 0, 9.5),
], false, "catmullrom", 0.2);
const RIDE_END = () => S0("g05");
const rideU = (f: number) => { const u = span(f, S0("g01") - 10, RIDE_END()); return 1 - Math.pow(1 - u, 1.8); };
const HOP_GATE: V3 = [-2.1, 0, 1.2];
const NEWM: V3 = [0.9, 0, 7.0];
const morning = (f: number) => f >= S0("g09");
const runZ = (f: number) => lerp(9.3, -3.6, ease(span(f, S0("g05"), E0("g08") - 6)));

export class World {
  root = new THREE.Group();
  park: Park; hoppy = new Hoppy(); maxy = new Hoppy("#6aaeff", "#ffd21f", "#d8302a"); crowd: { o: Orang; p: V3; ph: number; r: number }[] = [];
  cart = new THREE.Group(); pov: PovArms; phone: Phone; moon: THREE.DirectionalLight; amb: THREE.AmbientLight; hemi: THREE.HemisphereLight; capHand = new THREE.Group();
  constructor() {
    const R = this.root;
    this.amb = new THREE.AmbientLight("#7d86c4", 0.35); R.add(this.amb);
    this.hemi = new THREE.HemisphereLight("#b8c0ff", "#1a2418", 0.3); R.add(this.hemi);
    this.moon = moonLight(R, [0, 0, 14], 1.0, 26);
    this.park = buildPark(R);
    // rel kereta
    const pts = TRACK.getSpacedPoints(120);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], d = b.clone().sub(a), len = d.length(), ang = Math.atan2(d.x, d.z);
      const n = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
      for (const s of [-0.3, 0.3]) { const r = box(R, 0.06, 0.06, len + 0.02, "#8a8f9c", (a.x + b.x) / 2 + n.x * s, 0.03, (a.z + b.z) / 2 + n.z * s); r.rotation.y = ang; }
      if (i % 2 === 0) { const t = box(R, 0.8, 0.04, 0.12, "#4a3428", a.x, 0.02, a.z); t.rotation.y = ang; }
    }
    // kereta (bak berongga)
    R.add(this.cart); this.cart.userData.dyn = "kereta";
    box(this.cart, 1.1, 0.1, 1.6, "#c4201c", 0, 0.2, 0);
    for (const sx of [-1, 1]) box(this.cart, 0.08, 0.55, 1.6, "#c4201c", sx * 0.51, 0.47, 0);
    box(this.cart, 1.1, 0.55, 0.08, "#c4201c", 0, 0.47, 0.76); box(this.cart, 1.1, 0.75, 0.08, "#c4201c", 0, 0.57, -0.76);
    box(this.cart, 0.9, 0.12, 0.6, "#2a1a14", 0, 0.42, -0.3);
    for (const x of [-0.42, 0.42]) ball(this.cart, 0.07, glow("#ffd21f", 2), x, 0.78, 0.8);
    // Hoppy di gerbang memegang topi Max
    R.add(this.hoppy.g);
    this.hoppy.armL.add(this.capHand); this.capHand.position.set(0, -1.0, 0.15);
    { const c = ball(this.capHand, 1, "#c4201c", 0, 0, 0); c.scale.set(0.2, 0.15, 0.2); box(this.capHand, 0.26, 0.025, 0.2, "#c4201c", 0, -0.08, 0.18); }
    // maskot baru (biru) + topi Max di kepala
    this.maxy.g.userData.dyn = "maskot baru"; R.add(this.maxy.g);
    { const cap = new THREE.Group(); this.maxy.head.add(cap); cap.position.set(0, 0.36, 0.02);
      const c = ball(cap, 1, "#c4201c", 0, 0, 0); c.scale.set(0.3, 0.16, 0.3); box(cap, 0.4, 0.035, 0.3, "#c4201c", 0, -0.06, 0.28); }
    // pengunjung pagi
    const shirts = ["#ff8a1f", "#3fbf4a", "#a050e0", "#ff4fa0", "#1f8fff", "#f5cd30", "#e0302a", "#2ac0c0", "#ffffff", "#8a5a3a"];
    for (let i = 0; i < 12; i++) {
      const o = new Orang({ torso: shirts[i % shirts.length], legs: i % 2 ? "#2a3f6e" : "#3a3a44", hair: i % 3 ? ["#2a1a10", "#e8c060", "#6b3a1e"][i % 3] : undefined, s: i < 6 ? 0.72 : 0.95 });
      o.g.userData.dyn = "pengunjung " + i; R.add(o.g);
      const ring = i < 6; // anak-anak mengelilingi maskot
      const a = (i / 6) * Math.PI * 2;
      const k = i - 6;
      const p: V3 = ring ? [NEWM[0] + Math.sin(a) * 1.8, 0, NEWM[2] + Math.cos(a) * 1.8] : [k % 2 ? 0.25 : -1.15, 0, 12 + Math.floor(k / 2) * 4 + (k % 2) * 2];
      this.crowd.push({ o, p, ph: hh(i, 5) * 6, r: ring ? a : 0 });
    }
    enableShadows(R);
    this.pov = new PovArms(R);
    this.phone = new Phone(this.pov.g);
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / FPS, P = this.park, day = morning(f);
    // kereta di lintasan
    const u = rideU(f), p = TRACK.getPointAt(u), tan = TRACK.getTangentAt(u);
    this.cart.position.set(p.x, 0, p.z); this.cart.rotation.y = Math.atan2(tan.x, tan.z);
    this.cart.visible = !day;
    applyCam(cam, camAt(f));
    // pintu rumah hantu terbuka saat kereta keluar
    P.hauntedDoor.rotation.y = -1.7; // sudah terbuka lebar, menjauh dari jalur kereta
    // lampu: malam penuh lalu padam satu-satu saat kabur; pagi semua mati
    const fade = (i: number) => (f >= S0("g08") ? (i / 14 < span(f, S0("g08"), E0("g08") + 8) ? 0 : 1) : 1);
    P.setLamps((i) => (day ? 0 : fade(i) * (hh(Math.floor(f / 3) + i, 2) > 0.92 ? 0.3 : 1)));
    P.setCarousel(day ? 0.8 : f < S0("g08") ? 1 : 0, 0.3 * t, t);
    const fast = f >= S0("g03") && f < S0("g05") ? 1 : 0;
    P.setWheel(day ? 0.15 : f < S0("g08") ? 1 : 0, (0.12 + 0.5 * fast) * t);
    P.setDay(day ? 1 : 0);
    this.moon.color.set(day ? "#fff2d8" : "#b8c4ff"); this.moon.intensity = day ? 2.4 : 1.0;
    this.amb.intensity = day ? 0.7 : 0.35; this.hemi.intensity = day ? 0.6 : 0.3;
    this.hemi.color.set(day ? "#dfeeff" : "#b8c0ff");
    this.phone.spot.intensity = day ? 0 : 9;
    // Hoppy di gerbang
    const H = this.hoppy;
    H.g.visible = !day && f >= S0("g06") - 4;
    H.g.position.set(...HOP_GATE); H.g.rotation.set(0, 0.6, 0);
    H.wave(t * 0.6); H.head.rotation.set(0, 0, 0.3); H.face(f >= S0("g07"), mouthAt("hoppy", f));
    H.armL.rotation.set(-1.2, 0, 0);
    // maskot baru + pengunjung (pagi)
    const M = this.maxy;
    M.g.visible = day; this.crowd.forEach((c) => (c.o.g.visible = day));
    if (day) {
      M.g.position.set(...NEWM);
      const turn = ease(span(f, S0("g13") - 10, S0("g13") + 6));
      M.g.rotation.set(0, lerp(0.9, Math.PI + 0.1, turn), 0);
      M.wave(f >= S0("g13") ? t * 0.45 : t);
      M.head.rotation.set(0, 0, f >= S0("g13") ? 0.35 * turn : 0.1 * Math.sin(t * 2));
      M.face(f >= S0("g13") + 30 && f < S0("g13") + 60, mouthAt("max", f));
      this.crowd.forEach((c, i) => {
        if (c.r || i < 6) {
          c.o.g.position.set(...c.p); c.o.g.rotation.set(0, Math.atan2(NEWM[0] - c.p[0], NEWM[2] - c.p[2]), 0);
          c.o.armR.rotation.x = -2.6 + 0.3 * Math.sin(t * 6 + c.ph); c.o.wajah(0, 0);
          c.o.g.position.y = 0.04 * Math.abs(Math.sin(t * 5 + c.ph));
        } else {
          const z = 12 + ((c.p[2] - 12 + t * 0.9) % 12); // berjalan di lajur sendiri, jarak antarpejalan tetap
          c.o.g.position.set(c.p[0], 0.02 * Math.abs(Math.sin(t * 7 + c.ph)), z); c.o.g.rotation.set(0, 0, 0);
          const s = Math.sin(t * 7 + c.ph); c.o.legL.rotation.x = 0.45 * s; c.o.legR.rotation.x = -0.45 * s; c.o.armL.rotation.x = -0.35 * s; c.o.armR.rotation.x = 0.35 * s;
        }
      });
    }
    // tangan POV
    const toLocal = this.pov.local(cam);
    const pv = povAt(f, t, toLocal, this.cart);
    this.pov.pose(pv);
    this.phone.g.visible = !!pv.R && !day;
    if (pv.R && !day) { this.phone.g.position.set(pv.R[0] - 0.02, pv.R[1] + 0.1, pv.R[2] - 0.03); this.phone.g.rotation.set(0.15, 0.1, -0.08); }
  }
}

// ---------------- kamera ----------------
const cartEye = (f: number): { pos: V3; fwd: V3 } => {
  const u = rideU(f), p = TRACK.getPointAt(u), tan = TRACK.getTangentAt(u);
  return { pos: [p.x - tan.x * 0.12, 1.36, p.z - tan.z * 0.12], fwd: [tan.x, 0, tan.z] };
};
export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f);
  switch (sc) {
    case "kereta_keluar": {
      const e = cartEye(f), a = TRACK.getPointAt(Math.min(1, rideU(f) + 0.06));
      return { pos: add(e.pos, shake(f, 0.025)), look: [a.x, 1.15, a.z], fov, roll: 0.03 * Math.sin(t * 5) };
    }
    case "bianglala": {
      const e = cartEye(f), a = TRACK.getPointAt(Math.min(1, rideU(f) + 0.06)), up = ease(span(f, S0("g03"), S0("g03") + 14)) * (1 - ease(span(f, E0("g04") - 10, E0("g04") + 6)));
      return { pos: add(e.pos, shake(f, 0.02)), look: lerp3([a.x, 1.15, a.z], [WHEEL[0], WHEEL[1] - 1, WHEEL[2]], up * 0.8), fov, roll: 0 };
    }
    case "gerbang_lari": case "hoppy_gerbang": case "keluar": {
      // turun dari kereta lalu berlari ke gerbang; menoleh ke Hoppy; menoleh ke belakang setelah keluar
      const out = ease(span(f, S0("g05"), S0("g05") + 14));
      const x = lerp(1.4, 0.2, out), z = runZ(f);
      const run: V3 = [0, 0.05 * Math.abs(Math.sin(t * 9)), 0];
      const pos: V3 = add([x, lerp(1.36, 1.6, out), z], f < E0("g08") - 6 ? run : [0, 0, 0]);
      const toHop = sc === "hoppy_gerbang" ? ease(span(f, S0("g06"), S0("g06") + 10)) : sc === "keluar" ? 1 - ease(span(f, S0("g08"), S0("g08") + 6)) : 0;
      const back = sc === "keluar" ? ease(span(f, E0("g08") - 10, E0("g08") + 8)) : 0;
      const ahead: V3 = [0.2, 1.7, z - 6];
      const look = back > 0 ? lerp3(ahead, [0.4, 2.6, 10], back) : lerp3(ahead, [HOP_GATE[0], 2.3, HOP_GATE[2]], toHop * 0.9);
      return { pos: add(pos, shake(f, 0.012)), look, fov, roll: 0.02 * Math.sin(t * 9) };
    }
    case "pagi": {
      const u = ease(span(f, S0("g09"), E0("g10")));
      return { pos: add(lerp3([0.3, 1.6, -4.5], [0.3, 1.6, -1.6], u), breathe(t)), look: [0.4, 2.6, 14], fov, roll: 0 };
    }
    case "maskot_baru": {
      const u = ease(span(f, S0("g11"), S0("g11") + 16));
      return { pos: add([0.3, 1.6, -1.6], breathe(t)), look: lerp3([0.4, 2.6, 14], [NEWM[0], 2.2, NEWM[2]], u), fov: lerp(104, 72, u), roll: 0 };
    }
    default: { // lambai
      const z = ease(span(f, S0("g13"), E0("g13")));
      return { pos: add([0.3, 1.6, -1.6], breathe(t, 0.6)), look: [NEWM[0], 2.3, NEWM[2]], fov: lerp(72, 50, z), roll: 0 };
    }
  }
};

// ---------------- tangan POV ----------------
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3, cart: THREE.Group): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f);
  const grip = (): Pov => {
    const r = cart.localToWorld(new THREE.Vector3(-0.26, 1.04, 0.36)), l = cart.localToWorld(new THREE.Vector3(0.26, 1.04, 0.36)); // +x lokal tampil di kiri
    return { R: toLocal([r.x, r.y, r.z]), L: toLocal([l.x, l.y, l.z]) };
  };
  switch (sc) {
    case "kereta_keluar": case "bianglala": return grip();
    case "gerbang_lari": case "hoppy_gerbang": case "keluar": {
      if (f < S0("g05") + 8) return grip();
      const s = Math.sin(t * 9);
      return { R: add([0.24, -0.42 + 0.08 * s, -0.48], [0, 0, 0]), L: add([-0.24, -0.42 - 0.08 * s, -0.48], [0, 0, 0]) };
    }
    case "pagi": case "maskot_baru": return povLow(t, 0.5);
    default: return { R: povLow(t, 1).R, L: null };
  }
};
