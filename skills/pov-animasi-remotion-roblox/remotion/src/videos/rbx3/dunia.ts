// FLOOR 13 — Part 3 (pilihan: CLIMB THROUGH THE HATCH). Lubang lift: tangga di dinding depan, pintu lantai 14–20,
// bisikan suara lift, Lily naik lewat palka lalu memanjat tangga mengejar, pintu lantai 20 dibuka paksa, lorong
// lantai 20 yang terang, kamar 2007 menyala merah, Lily muncul di ambang pintu lubang lift.
// Sumbu: kabin lift di asal (lantai 13), lubang x -1.35..1.35, z -1.3..1.07, lantai n di y = (n - 13) * 2.8.
import * as THREE from "three";
import TL from "./timeline.json";
import {
  FPS, V3, makeTL, ease, lerp, lerp3, hh, span, add, shake, breathe, box, plane, glow, canvasTex, signTex,
  buildLift, buildHall, makeLily, PovArms, Pov, povLow, povUp, LH, Cam, applyCam, Lift, Hall, Orang, RAMP,
} from "../inti/kit";

export const T = makeTL(TL);
const { S0, E0, sceneAt, mouthAt } = T;
export const FREEZE = S0("g14") - 1;
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g08") + 10 + Math.floor(f * 0.5));

const FH = 2.8, Y20 = 7 * FH, TOP = 25, FZ = 1.07; // tinggi lantai, lantai 20, puncak lubang, dinding depan
const LAD_X = 0.95, LAD_Z = 0.98; // tangga di dinding depan, di kanan pintu
const CAM_Z = 0.55;
const R2007: V3 = [-1.47, Y20 + 1.05, 14.2];
const climbY = (f: number) => {
  // ketinggian mata saat memanjat (pelan -> cepat -> sampai lantai 20)
  const a1 = S0("g01"), a7 = S0("g07"), a9 = S0("g09");
  if (f < a7) return 3.5 + 1.6 * ease(span(f, a1 - 20, S0("g02"))) + 0.4 * span(f, S0("g02"), a7);
  return lerp(5.5, Y20 + 1.55, ease(span(f, a7, a9 - 6)));
};

export class World {
  root = new THREE.Group();
  lift: Lift; hall: Hall; lily: Orang; pov: PovArms;
  d15: THREE.Mesh[] = []; d20: THREE.Mesh[] = []; crack20: THREE.Mesh; redRoom: THREE.PointLight; carLight: THREE.PointLight;
  constructor() {
    const R = this.root;
    R.add(new THREE.AmbientLight("#8a94c8", 0.55));
    R.add(new THREE.HemisphereLight("#c8d0ff", "#201820", 0.25));
    this.lift = buildLift(R, false);
    this.lift.hatch.rotation.z = 1.85;
    this.carLight = new THREE.PointLight("#fff1d8", 2.2, 3.5, 1.2); this.carLight.position.set(0.45, LH + 0.4, -0.45); R.add(this.carLight);
    (this.lift.hatchGlow.material as THREE.MeshBasicMaterial).color.set("#000000"); this.lift.hatchGlow.visible = false;
    // ---- dinding lubang lift (beton) ----
    const conc = canvasTex(256, 256, (g) => {
      g.fillStyle = "#4a4c54"; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${hh(i, 1) > 0.5 ? 255 : 0},${hh(i, 1) > 0.5 ? 255 : 0},${hh(i, 1) > 0.5 ? 255 : 0},0.05)`; g.fillRect(hh(i, 2) * 256, hh(i, 3) * 256, 6, 6); }
      g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, 124, 256, 8);
    });
    conc.wrapS = conc.wrapT = THREE.RepeatWrapping; conc.repeat.set(2, 12);
    const cm = new THREE.MeshToonMaterial({ map: conc, gradientMap: RAMP });
    const wall = (w: number, h: number, x: number, y: number, z: number, ry: number) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cm); o.position.set(x, y, z); o.rotation.y = ry; R.add(o); return o; };
    wall(2.6, TOP, 0, TOP / 2, -1.3, 0); wall(2.4, TOP, -1.35, TOP / 2, -0.12, Math.PI / 2); wall(2.4, TOP, 1.35, TOP / 2, -0.12, -Math.PI / 2);
    // dinding depan dengan lubang di lantai 20 (x -0.6..0.6, y Y20..Y20+2.2)
    wall(2.7, Y20, 0, Y20 / 2, FZ, Math.PI);
    wall(0.75, TOP - Y20, -0.975, Y20 + (TOP - Y20) / 2, FZ, Math.PI); wall(0.75, TOP - Y20, 0.975, Y20 + (TOP - Y20) / 2, FZ, Math.PI);
    wall(1.2, TOP - Y20 - 2.2, 0, Y20 + 2.2 + (TOP - Y20 - 2.2) / 2, FZ, Math.PI);
    box(R, 2.7, 0.1, 2.4, "#2a2b30", 0, TOP, -0.12);
    // ---- pintu tiap lantai + angka di atasnya ----
    for (let n = 14; n <= 20; n++) {
      const y = (n - 13) * FH;
      const ds = [-1, 1].map((sx) => box(R, 0.62, 2.2, 0.04, "#7d828c", sx * 0.31, y + 1.1, FZ - 0.03));
      box(R, 1.3, 0.12, 0.08, "#5a5d66", 0, y + 0.04, FZ - 0.05); // ambang
      plane(R, 0.5, 0.36, new THREE.MeshBasicMaterial({ map: signTex([String(n)], "#2a2b30", n === 20 ? "#ffd84a" : "#e8e4da", 256, 180, "bold 140px Arial Black, Arial", false) }), 0, y + 2.55, FZ - 0.02, Math.PI);
      if (n === 15) this.d15 = ds;
      if (n === 20) this.d20 = ds;
      // lampu darurat merah kecil
      { box(R, 0.18, 0.06, 0.1, glow("#dfe6ff", 2.2), 1.2, y + 2.2, 0.8); const w = new THREE.PointLight("#b8c6ff", 2.2, 4.5, 1.3); w.position.set(1.0, y + 2.1, 0.6); R.add(w); }
      if (n % 2) { box(R, 0.08, 0.08, 0.08, glow("#ff3a2a", 2), -1.3, y + 1.6, 0.3); const l = new THREE.PointLight("#ff3a2a", 0.9, 3, 1.5); l.position.set(-1.15, y + 1.6, 0.3); R.add(l); }
    }
    // celah cahaya hangat di pintu lantai 20
    this.crack20 = box(R, 0.02, 2.1, 0.01, glow("#ffe6b0", 2.5), 0, Y20 + 1.1, FZ - 0.06);
    // ---- tangga ----
    for (const x of [LAD_X - 0.16, LAD_X + 0.16]) box(R, 0.05, TOP - 2.7, 0.05, "#c9a03a", x, 2.7 + (TOP - 2.7) / 2, LAD_Z);
    for (let y = 2.9; y < TOP; y += 0.3) box(R, 0.34, 0.035, 0.035, "#d8b04a", LAD_X, y, LAD_Z);
    // ---- kabel & rel ----
    for (const x of [-0.2, 0, 0.2]) box(R, 0.025, TOP - 2.7, 0.025, "#1a1a1e", x, 2.7 + (TOP - 2.7) / 2, -0.1);
    for (const sx of [-1, 1]) box(R, 0.08, TOP, 0.12, "#6a6c74", sx * 1.28, TOP / 2, -0.6);
    // ---- lorong lantai 20 (terang, hangat) ----
    this.hall = buildHall(R, { y: Y20, floor: 20, carpet: ["#1d3f7a", "#2a5298"], paper: ["#e8dcc0", "#d8c8a0"], lamp: "#ffe0b0", lampK: 2.6, ceil: "#f2ead8", plint: "#7a5a3a", door: "#7a4a2a" });
    // kamar 2007 terbuka: ambang merah dengan sosok duduk
    const d07 = this.hall.doors.get(2007); if (d07) d07.visible = false;
    plane(R, 0.95, 2.1, new THREE.MeshBasicMaterial({ map: canvasTex(190, 420, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 420); gr.addColorStop(0, "#5a0608"); gr.addColorStop(1, "#c81a14"); g.fillStyle = gr; g.fillRect(0, 0, 190, 420);
      g.fillStyle = "#120406"; g.fillRect(55, 170, 80, 60); g.fillRect(62, 230, 66, 70); g.fillRect(48, 238, 18, 60); g.fillRect(124, 238, 18, 60); g.fillRect(64, 300, 62, 22); // sosok balok duduk
      g.fillStyle = "#ffffff"; g.fillRect(80, 192, 8, 12); g.fillRect(102, 192, 8, 12); // mata
    }) }), R2007[0] + 0.02, R2007[1], R2007[2], Math.PI / 2);
    this.redRoom = new THREE.PointLight("#ff2a1a", 2.6, 4, 1.3); this.redRoom.position.set(-1.1, Y20 + 1.4, R2007[2]); R.add(this.redRoom);
    // ---- Lily ----
    this.lily = makeLily(); R.add(this.lily.g); if (this.lily.tag) this.lily.tag.visible = false;
    this.pov = new PovArms(R);
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    applyCam(cam, camAt(f));
    const t = f / FPS;
    // pintu lantai 15 terbuka sedikit saat bisikan
    const c15 = f >= S0("g04") ? ease(span(f, S0("g04"), S0("g04") + 15)) * 0.12 * (1 - ease(span(f, E0("g04") + 10, E0("g04") + 20))) : 0;
    this.d15.forEach((d, i) => (d.position.x = (i ? 1 : -1) * (0.31 + c15)));
    // pintu lantai 20 dibuka paksa
    const o20 = f >= S0("g09") ? ease(span(f, S0("g09") + 6, E0("g09") + 4)) : 0;
    this.d20.forEach((d, i) => (d.position.x = (i ? 1 : -1) * (0.31 + 0.6 * o20)));
    this.crack20.visible = o20 < 0.02;
    this.hall.setLights((i) => (f >= S0("g11") && i % 3 === 0 && hh(Math.floor(f / 3) + i, 2) > 0.8 ? 0.3 : 1));
    this.redRoom.intensity = f >= S0("g10") ? 2.6 + 0.8 * Math.sin(t * 5) : 2.0;
    this.poseLily(f, t, cam);
    const toLocal = this.pov.local(cam);
    this.pov.pose(povAt(f, t, toLocal));
  }

  poseLily(f: number, t: number, cam: THREE.PerspectiveCamera) {
    const Ly = this.lily;
    Ly.wajah(mouthAt("lily", f) * 0.9, 0, true);
    if (f < S0("g05")) { Ly.g.visible = false; return; }
    Ly.g.visible = true;
    Ly.legL.rotation.x = 0; Ly.legR.rotation.x = 0;
    if (f < S0("g07")) {
      // kepala muncul lewat palka, menatap ke atas
      const rise = ease(span(f, S0("g05") + 4, S0("g05") + 30));
      Ly.g.position.set(0.45, LH + 0.08 - 1.42 + 0.05 + 0.32 * rise, -0.45);
      Ly.g.rotation.set(0, Math.PI * 0.75, 0);
      Ly.head.rotation.set(-0.9, 0, 0.2);
      Ly.armL.rotation.set(-2.9, 0, 0); Ly.armR.rotation.set(-2.9, 0, 0);
      return;
    }
    if (f < S0("g09")) {
      // memanjat tangga, makin dekat
      const camY = climbY(f) - 1.55;
      const gap = lerp(3.4, 1.9, span(f, S0("g07"), S0("g09")));
      Ly.g.position.set(LAD_X, Math.max(LH + 0.1, camY - gap), LAD_Z - 0.32);
      Ly.g.rotation.set(0, 0, 0);
      const s = Math.sin(t * 14);
      Ly.armL.rotation.set(-2.8 + 0.35 * s, 0, 0); Ly.armR.rotation.set(-2.8 - 0.35 * s, 0, 0);
      Ly.legL.rotation.x = -0.6 - 0.4 * s; Ly.legR.rotation.x = -0.6 + 0.4 * s;
      Ly.head.rotation.set(-0.95, 0, 0);
      return;
    }
    if (f < S0("g12")) { Ly.g.visible = false; return; }
    // berdiri melayang tepat di belakang, menyeringai
    const near = ease(span(f, S0("g12") + 6, FREEZE));
    Ly.g.position.set(0.1, Y20 + 0.28 + 0.03 * Math.sin(t * 2), lerp(9.6, 10.5, near));
    Ly.g.rotation.set(0, 0, 0);
    Ly.head.rotation.set(0, 0, 0.25);
    Ly.armL.rotation.set(-1.5, 0, 0); Ly.armR.rotation.set(-1.5, 0, 0);
  }
}

// ---------------- kamera ----------------
export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f);
  const y = climbY(f);
  const bob: V3 = [0, 0.03 * Math.sin(t * 6), 0];
  switch (sc) {
    case "naik": return { pos: add([LAD_X - 0.1, y, CAM_Z], add(bob, breathe(t, 1.5))), look: [LAD_X - 0.25, y + 0.25, FZ + 1], fov, roll: 0.02 };
    case "atas": {
      const u = ease(span(f, S0("g02"), S0("g02") + 18));
      return { pos: add([LAD_X - 0.1, y, CAM_Z], breathe(t)), look: lerp3([LAD_X - 0.25, y + 0.25, FZ + 1], [0.3, y + 14, 0.75], u), fov, roll: 0 };
    }
    case "bisik": {
      const u = ease(span(f, S0("g04"), S0("g04") + 12));
      return { pos: add([LAD_X - 0.1, y, CAM_Z], breathe(t, 0.6)), look: lerp3([0.3, y + 14, 0.75], [0, 1 * FH + 1.3, FZ], u), fov: lerp(104, 88, u), roll: 0 };
    }
    case "bawah": {
      const u = ease(span(f, S0("g05"), S0("g05") + 8));
      return { pos: add([LAD_X - 0.15, y, CAM_Z - 0.1], breathe(t, 0.8)), look: lerp3([0, FH + 1.3, FZ], [0.45, LH + 0.2, -0.45], u), fov, roll: 0 };
    }
    case "panjat_cepat": {
      const down = f >= S0("g08") ? ease(span(f, S0("g08"), S0("g08") + 6)) : 0;
      return { pos: add([LAD_X - 0.1, y, CAM_Z], shake(f, 0.04)), look: lerp3([0.4, y + 8, 0.9], [LAD_X - 0.05, y - 4, LAD_Z - 0.5], down), fov, roll: 0.03 * Math.sin(t * 7) };
    }
    case "pintu20": {
      const u = ease(span(f, S0("g09"), S0("g09") + 8));
      return { pos: add(lerp3([LAD_X - 0.1, Y20 + 1.55, CAM_Z], [0.45, Y20 + 1.55, CAM_Z], u), shake(f, 0.015)), look: lerp3([0.4, Y20 + 6, 0.9], [0, Y20 + 1.3, FZ + 1], u), fov, roll: 0 };
    }
    case "lorong20": {
      const u = ease(span(f, S0("g10"), E0("g10") + 10));
      return { pos: add(lerp3([0.45, Y20 + 1.55, CAM_Z], [0.15, Y20 + 1.6, 5.5], u), add(breathe(t, 1.5), [0, 0.025 * Math.sin(t * 7), 0])), look: [0, Y20 + 1.4, 14], fov, roll: 0 };
    }
    case "kamar_merah": {
      const u = ease(span(f, S0("g11"), S0("g11") + 14)), w = ease(span(f, S0("g11") - 10, E0("g11")));
      return { pos: add(lerp3([0.15, Y20 + 1.6, 5.5], [0.45, Y20 + 1.6, 11.6], w), breathe(t, 0.6)), look: lerp3([0, Y20 + 1.4, 14], R2007, u), fov: lerp(104, 78, u), roll: 0 };
    }
    default: { // tangan: menoleh ke belakang, Lily di ambang pintu lubang lift
      const u = ease(span(f, S0("g12"), S0("g12") + 7));
      return { pos: add([0.45, Y20 + 1.6, 11.6], shake(f, 0.02 + 0.03 * u)), look: lerp3(R2007, [0.05, Y20 + 1.5, 10.2], u), fov: lerp(78, 104, u), roll: 0 };
    }
  }
};

// ---------------- tangan POV ----------------
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f), y = climbY(f);
  const climb = (sp: number): Pov => {
    const s = Math.sin(t * sp);
    return { R: toLocal([LAD_X - 0.12, y + 0.05 + 0.14 * s, LAD_Z - 0.03]), L: toLocal([LAD_X + 0.12, y + 0.05 - 0.14 * s, LAD_Z - 0.03]) };
  };
  switch (sc) {
    case "naik": return climb(5);
    case "atas": case "bisik": case "bawah": { const s = 0; return { R: toLocal([LAD_X - 0.12, y + 0.1 + s, LAD_Z - 0.03]), L: toLocal([LAD_X + 0.12, y - 0.05, LAD_Z - 0.03]) }; }
    case "panjat_cepat": return climb(13);
    case "pintu20": {
      // kedua tangan di tepi pintu, menarik ke samping
      const o = ease(span(f, S0("g09") + 6, E0("g09") + 4));
      const pull = (sx: number): V3 => toLocal([sx * (0.02 + 0.6 * o), Y20 + 1.25, FZ - 0.08]);
      const u = ease(span(f, S0("g09"), S0("g09") + 6));
      return { R: lerp3(povLow(t, 2).R, pull(-1), u), L: lerp3(povLow(t, 2).L, pull(1), u) };
    }
    case "lorong20": case "kamar_merah": return povLow(t, 1);
    default: return povUp(t, 3);
  }
};
