// FLOOR 13 — Part 4 (FINAL, pilihan: RUN INTO ROOM 2007). Kamar 2007: kembaran "kamu" duduk di kasur menghadap
// jendela, kepalanya berputar penuh; tangan POV berubah abu-abu (kamu jadi Guest), cermin memantulkan Guest bermata
// putih, Lily mengetuk pintu, kembaran berdiri melambai. Sumbu: kamar x -2..2, z 0..5, pintu di z = 0 (kamera
// masuk lalu menghadap -z untuk menutup pintu). update(f, cam) murni fungsi frame.
import * as THREE from "three";
import TL from "./timeline.json";
import {
  FPS, V3, makeTL, ease, lerp, lerp3, hh, span, add, shake, breathe, box, plane, glow, canvasTex, signTex,
  makeNoob, Orang, PovArms, Pov, povLow, povUp, Cam, applyCam, RAMP, SKIN, GUEST_SKIN,
} from "../inti/kit";

export const T = makeTL(TL);
const { S0, E0, sceneAt, mouthAt } = T;
export const FREEZE = S0("g13") - 1;
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g09") + 20 + Math.floor(f * 0.5));

const RW = 2, RD = 5, RH = 2.8;
const MIR: V3 = [RW - 0.02, 1.5, 1.6];
const BED: V3 = [-1.05, 0, 3.4];
const SIT: V3 = [-0.55, 0, 3.3];

export class World {
  root = new THREE.Group();
  copy: Orang; refl: Orang; pov: PovArms;
  door = new THREE.Group(); lamp: THREE.PointLight; knockGlow: THREE.Mesh; feet: THREE.Mesh[] = [];
  constructor() {
    const R = this.root;
    R.add(new THREE.AmbientLight("#8a90c0", 0.4));
    R.add(new THREE.HemisphereLight("#ffd8c0", "#2a2030", 0.3));
    // lantai kayu
    const wood = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#7a4e2c" : "#6c4426"; g.fillRect(0, i * 32, 256, 32); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(((i * 97) % 200), i * 32, 3, 32); } });
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 3);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(RW * 2, RD), new THREE.MeshToonMaterial({ map: wood, gradientMap: RAMP })); fl.rotation.x = -Math.PI / 2; fl.position.z = RD / 2; R.add(fl);
    box(R, RW * 2, 0.06, RD, "#e8dccb", 0, RH, RD / 2);
    // dinding (kiri berlubang untuk cermin)
    const wc = "#c9b08e";
    box(R, 0.08, RH, RD, wc, -RW, RH / 2, RD / 2);
    box(R, 0.08, RH, 1.2, wc, RW, RH / 2, 0.6); box(R, 0.08, RH, RD - 2.0, wc, RW, RH / 2, 2.0 + (RD - 2.0) / 2);
    box(R, 0.08, 0.8, 0.8, wc, RW, 0.4, 1.6); box(R, 0.08, RH - 2.2, 0.8, wc, RW, 2.2 + (RH - 2.2) / 2, 1.6);
    box(R, RW * 2, RH, 0.08, wc, 0, RH / 2, RD);
    box(R, 0.9, RH, 0.08, wc, -1.55, RH / 2, 0); box(R, 2.15, RH, 0.08, wc, 0.925, RH / 2, 0); box(R, 0.95, RH - 2.1, 0.08, wc, -0.575, 2.1 + (RH - 2.1) / 2, 0);
    // pintu (engsel kiri x -1.05), menutup di z ≈ 0.04
    this.door.position.set(-1.05, 0, 0.04); R.add(this.door);
    box(this.door, 0.95, 2.1, 0.05, "#7a4a2a", 0.475, 1.05, 0);
    box(this.door, 0.1, 0.04, 0.06, "#d8b860", 0.82, 1.0, 0.05);
    plane(this.door, 0.3, 0.13, new THREE.MeshBasicMaterial({ map: signTex(["2007"], "#c79a3a", "#2a1a10", 256, 120, "bold 70px Arial Black, Arial", false) }), 0.475, 1.65, -0.03).rotation.y = Math.PI;
    // cahaya merah di bawah pintu + bayangan kaki Lily
    this.knockGlow = plane(R, 0.9, 0.35, new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3a2a").multiplyScalar(1.4), transparent: true, opacity: 0.8, depthWrite: false }), -0.575, 0.004, 0.2);
    this.knockGlow.rotation.x = -Math.PI / 2;
    for (const dx of [-0.13, 0.13]) { const s = plane(R, 0.2, 0.3, new THREE.MeshBasicMaterial({ color: "#100808", transparent: true, opacity: 0.9, depthWrite: false }), -0.575 + dx, 0.006, 0.18); s.rotation.x = -Math.PI / 2; this.feet.push(s); }
    // kasur, meja lampu, jendela kota malam
    box(R, 1.5, 0.45, 2.2, "#5a3a24", BED[0], 0.225, BED[2]);
    box(R, 1.45, 0.14, 2.15, "#f2f0ea", BED[0], 0.52, BED[2]);
    box(R, 1.45, 0.06, 1.3, "#b8222a", BED[0], 0.6, BED[2] - 0.35);
    box(R, 0.6, 0.14, 0.4, "#ffffff", BED[0], 0.66, BED[2] + 0.8);
    box(R, 1.6, 1.0, 0.1, "#5a3a24", BED[0], 0.9, RD - 0.06);
    box(R, 0.5, 0.55, 0.45, "#5a3a24", -1.7, 0.275, 4.6);
    box(R, 0.18, 0.3, 0.18, "#d8c8a8", -1.7, 0.7, 4.6); box(R, 0.3, 0.22, 0.3, glow("#ff6a4a", 1.6), -1.7, 0.95, 4.6);
    this.lamp = new THREE.PointLight("#ff5a3a", 2.4, 6, 1.2); this.lamp.position.set(-1.6, 1.1, 4.4); R.add(this.lamp);
    plane(R, 1.4, 1.2, new THREE.MeshBasicMaterial({ map: canvasTex(420, 360, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, "#0a1030"); gr.addColorStop(1, "#24305a"); g.fillStyle = gr; g.fillRect(0, 0, 420, 360);
      g.fillStyle = "#e8ecff"; g.fillRect(320, 40, 46, 46);
      for (let i = 0; i < 9; i++) { const w = 30 + hh(i, 1) * 30, h = 120 + hh(i, 2) * 180, x = i * 48; g.fillStyle = "#0c0f1e"; g.fillRect(x, 360 - h, w, h);
        for (let j = 0; j < 14; j++) if (hh(i * 31 + j, 3) > 0.55) { g.fillStyle = hh(j, i) > 0.5 ? "#ffd27a" : "#9fd0ff"; g.fillRect(x + 5 + (j % 2) * 14, 360 - h + 10 + Math.floor(j / 2) * 22, 8, 10); } }
    }) }), 0.7, 1.6, RD - 0.05, Math.PI);
    box(R, 1.5, 0.08, 0.1, "#e8e0d0", 0.7, 0.98, RD - 0.08); box(R, 1.5, 0.08, 0.1, "#e8e0d0", 0.7, 2.22, RD - 0.08);
    const moon = new THREE.PointLight("#8fa8ff", 1.6, 5, 1.3); moon.position.set(0.7, 1.8, RD - 0.5); R.add(moon);
    // lemari + TV di dinding kiri
    box(R, 0.5, 0.8, 1.2, "#5a3a24", RW - 0.3, 0.4, 3.6); box(R, 0.06, 0.5, 0.85, "#111116", RW - 0.32, 1.1, 3.6);
    // cermin: bingkai + kaca tipis, di baliknya "ruang pantulan" gelap berisi Guest
    box(R, 0.06, 1.5, 0.08, "#c79a3a", RW - 0.04, 1.5, 1.2); box(R, 0.06, 1.5, 0.08, "#c79a3a", RW - 0.04, 1.5, 2.0);
    box(R, 0.06, 0.08, 0.88, "#c79a3a", RW - 0.04, 2.24, 1.6); box(R, 0.06, 0.08, 0.88, "#c79a3a", RW - 0.04, 0.76, 1.6);
    plane(R, 0.8, 1.4, new THREE.MeshBasicMaterial({ color: "#b8c8ff", transparent: true, opacity: 0.12, depthWrite: false }), MIR[0], MIR[1], MIR[2], -Math.PI / 2);
    const k = "#2a2026";
    box(R, 2.4, 0.05, 1.2, k, RW + 1.2, 0, 1.6); box(R, 2.4, 0.05, 1.2, k, RW + 1.2, RH, 1.6);
    box(R, 2.4, RH, 0.05, k, RW + 1.2, RH / 2, 1.0); box(R, 2.4, RH, 0.05, k, RW + 1.2, RH / 2, 2.2); box(R, 0.05, RH, 1.2, k, RW + 2.4, RH / 2, 1.6);
    const rl = new THREE.PointLight("#ff4a3a", 1.4, 3, 1.3); rl.position.set(RW + 0.8, 2.2, 1.6); R.add(rl);
    this.refl = new Orang({ torso: "#0d69ac", legs: "#a4bd47", skin: GUEST_SKIN, face: "none", eyeGlow: "#ffffff" });
    this.refl.g.position.set(2 * MIR[0] - 0.6, 0, MIR[2]); this.refl.g.rotation.y = -Math.PI / 2; R.add(this.refl.g);
    // kembaran "kamu"
    this.copy = makeNoob(); R.add(this.copy.g);
    this.pov = new PovArms(R);
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    applyCam(cam, camAt(f));
    const t = f / FPS;
    // pintu ditutup di awal, bergetar saat diketuk
    const shut = ease(span(f, S0("g01") - 30, S0("g01") + 10));
    const knock = f >= S0("g10") && f < E0("g11") ? 0.015 * Math.abs(Math.sin(f * 1.6)) * (Math.floor((f - S0("g10")) / 10) % 3 !== 2 ? 1 : 0) : 0;
    this.door.rotation.y = lerp(-1.3, 0, shut) + knock;
    const lily = f >= S0("g10");
    this.knockGlow.visible = lily; this.feet.forEach((s) => (s.visible = lily));
    this.lamp.intensity = f >= S0("g07") ? (hh(Math.floor(f / 3), 4) > 0.85 ? 0.6 : 2.6) : 2.4;
    // kembaran
    const C = this.copy;
    const stand = f >= S0("g12");
    C.legL.rotation.x = C.legR.rotation.x = stand ? 0 : -Math.PI / 2;
    if (!stand) {
      C.g.position.set(SIT[0], 0.55 - 0.66, SIT[2]);
      C.g.rotation.set(0, 0, 0); // membelakangi kamera, menghadap jendela
      const turn = ease(span(f, S0("g05") - 14, S0("g05") + 2));
      C.head.rotation.set(0, Math.PI * turn, 0);
      C.armL.rotation.set(-0.3, 0, 0); C.armR.rotation.set(-0.3, 0, 0);
    } else {
      C.g.position.set(0.15, 0, 1.75);
      C.g.rotation.set(0, Math.PI, 0);
      C.head.rotation.set(0, 0, 0.15);
      C.armL.rotation.set(0, 0, 0);
      C.armR.rotation.set(-2.9, 0, 0.3 + 0.35 * Math.sin(t * 9)); // melambai "bye"
    }
    C.wajah(mouthAt("tiruan", f) * 0.9, 0, f >= S0("g09"));
    // pantulan Guest ikut "napas"
    this.refl.head.rotation.z = 0.04 * Math.sin(t * 2);
    // tangan POV berubah abu-abu
    const grey = ease(span(f, S0("g07") + 6, E0("g08")));
    const glitch = f >= S0("g07") && f < E0("g08") && hh(Math.floor(f / 2), 9) > 0.8;
    this.pov.setSkin(glitch ? "#ffffff" : new THREE.Color(SKIN).lerp(new THREE.Color(GUEST_SKIN), grey));
    const toLocal = this.pov.local(cam);
    this.pov.pose(povAt(f, t, toLocal));
  }
}

// ---------------- kamera ----------------
const C0: V3 = [0.15, 1.6, 0.85];
const DOOR: V3 = [-0.55, 1.4, 0];
const HEAD_SIT: V3 = [SIT[0], 1.05, SIT[2]];
export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f);
  switch (sc) {
    case "masuk": {
      const lean = ease(span(f, S0("g02"), E0("g02")));
      return { pos: add(lerp3([-0.4, 1.6, 0.6], [-0.35, 1.5, 0.45], lean), add(breathe(t, 3), [0, 0.03 * Math.sin(t * 5), 0])), look: DOOR, fov, roll: 0.04 * lean };
    }
    case "kasur": {
      const u = ease(span(f, S0("g03"), S0("g03") + 26));
      const p = lerp3([-0.35, 1.5, 0.45], C0, u);
      // berputar lewat kanan (-x): dari arah pintu ke kepala kembaran
      const aDoor = Math.atan2(DOOR[0] - p[0], DOOR[2] - p[2]), aHead = Math.atan2(HEAD_SIT[0] - p[0], HEAD_SIT[2] - p[2]);
      const ang = lerp(aDoor, aHead, u), y = lerp(1.4, HEAD_SIT[1], u);
      return { pos: add(p, breathe(t)), look: [p[0] + Math.sin(ang) * 2.5, y, p[2] + Math.cos(ang) * 2.5], fov, roll: 0 };
    }
    case "noleh": {
      const a = S0("g06"), back = f >= a ? ease(span(f, a, a + 20)) : 0, z = ease(span(f, S0("g05") - 14, S0("g05") + 4));
      return { pos: add(lerp3(C0, [0.3, 1.6, 0.4], back), breathe(t, 1.2)), look: [HEAD_SIT[0], HEAD_SIT[1] + 0.05, HEAD_SIT[2]], fov: lerp(104, 80, z * (1 - back)), roll: 0 };
    }
    case "tangan_abu": {
      const u = ease(span(f, S0("g07"), S0("g07") + 10));
      return { pos: add([0.3, 1.6, 0.4], shake(f, 0.01 + (hh(Math.floor(f / 2), 9) > 0.8 ? 0.04 : 0))), look: lerp3(HEAD_SIT, [0.3, 0.9, 1.2], u), fov, roll: 0 };
    }
    case "cermin": {
      const u = ease(span(f, S0("g09"), S0("g09") + 16));
      return { pos: add(lerp3([0.3, 1.6, 0.4], [0.6, 1.6, MIR[2]], u), breathe(t, 0.8)), look: lerp3([0.3, 0.9, 1.2], MIR, u), fov: lerp(104, 90, u), roll: 0 };
    }
    case "ketuk": {
      const u = ease(span(f, S0("g10"), S0("g10") + 6));
      return { pos: add([0.6, 1.6, MIR[2]], shake(f, 0.015)), look: lerp3(MIR, [-0.55, 0.9, 0], u), fov, roll: 0 };
    }
    default: { // teriak: kembaran berdiri tepat di depan
      const u = ease(span(f, S0("g12"), S0("g12") + 5));
      return { pos: add([0.6, 1.6, MIR[2] - 0.4], shake(f, 0.04)), look: lerp3([-0.55, 0.9, 0], [0.15, 1.5, 1.75], u), fov, roll: 0.05 * Math.sin(t * 9) };
    }
  }
};

// ---------------- tangan POV ----------------
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f);
  switch (sc) {
    case "masuk": {
      // kedua tangan mendorong pintu
      const u = 1 - ease(span(f, S0("g02") + 10, S0("g02") + 30));
      const R: V3 = toLocal([-0.3, 1.25, 0.12]), L: V3 = toLocal([-0.75, 1.35, 0.12]);
      return { R: lerp3(povLow(t, 2).R, R, u), L: lerp3(povLow(t, 2).L, L, u) };
    }
    case "tangan_abu": {
      // tangan diangkat ke depan wajah, gemetar
      const u = ease(span(f, S0("g07"), S0("g07") + 12));
      const tr: V3 = [0.008 * Math.sin(t * 31), 0.008 * Math.sin(t * 27), 0];
      return { R: lerp3(povLow(t).R, add([0.11, -0.08, -0.4], tr), u), L: lerp3(povLow(t).L, add([-0.11, -0.1, -0.4], tr), u) };
    }
    case "cermin": case "ketuk": return povLow(t, 2);
    case "teriak": return povUp(t, 4);
    default: return povLow(t, 1);
  }
};
