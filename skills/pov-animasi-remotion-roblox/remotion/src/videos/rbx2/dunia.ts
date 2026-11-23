// FLOOR 13 — Part 2 (pilihan: PRESS THE ALARM). Alarm + interkom resepsionis, Lily menyela lewat speaker,
// lift jatuh lalu berhenti lagi di lantai 13 yang kini kosong, catatan "FIND YOUR ROOM TO LEAVE", Lily di depan
// kamar 1313 di ujung lorong, palka atap lift terbuka. update(f, cam) murni fungsi frame.
import * as THREE from "three";
import TL from "./timeline.json";
import {
  FPS, V3, makeTL, ease, lerp, lerp3, hh, span, add, shake, breathe, box, plane, glow, canvasTex, signTex,
  buildLift, buildHall, makeLily, PovArms, Pov, povLow, povUp, btnWorld, LH, Cam, applyCam, Lift, Hall, Orang,
} from "../f13/kit";

export const T = makeTL(TL);
const { S0, E0, sceneAt, mouthAt } = T;
export const FREEZE = S0("g15") - 1;
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g12") + 40 + Math.floor(f * 0.5));

const HATCH: V3 = [0.45, LH, -0.45];
const NOTE: V3 = [1.46, 1.5, 2.3];
const LILY_END: V3 = [-0.5, 0, 16.25];

export class World {
  root = new THREE.Group();
  lift: Lift; hall: Hall; lily: Orang; pov: PovArms;
  lilyHand = new THREE.Group(); faceLight: THREE.PointLight; redLight: THREE.PointLight; shaftLight: THREE.PointLight;
  constructor() {
    const R = this.root;
    R.add(new THREE.AmbientLight("#8f96c0", 0.3));
    R.add(new THREE.HemisphereLight("#ffe6c8", "#302838", 0.3));
    this.lift = buildLift(R, true);
    this.hall = buildHall(R, { floor: 13, carpet: ["#5a1218", "#7a1c22"], paper: ["#3e4a3a", "#33402f"], lamp: "#ff6a4a" });
    // pintu kamar 1313 di ujung lorong + cahaya merah di bawahnya
    box(R, 0.95, 2.1, 0.06, "#3a1a12", LILY_END[0], 1.05, 16.95);
    plane(R, 0.3, 0.13, new THREE.MeshBasicMaterial({ map: signTex(["1313"], "#c79a3a", "#2a1a10", 256, 120, "bold 70px Arial Black, Arial", false) }), LILY_END[0], 1.65, 16.9, Math.PI);
    const ug = plane(R, 0.9, 0.4, new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3a2a").multiplyScalar(1.4), transparent: true, opacity: 0.8, depthWrite: false }), LILY_END[0], 0.004, 16.75);
    ug.rotation.x = -Math.PI / 2;
    // catatan tulisan tangan merah di dinding lorong
    plane(R, 0.46, 0.32, new THREE.MeshBasicMaterial({ map: canvasTex(460, 320, (g) => {
      g.fillStyle = "#f2ecd8"; g.fillRect(0, 0, 460, 320);
      g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, 300, 460, 20);
      g.fillStyle = "#b8141a"; g.font = "bold 62px Marker Felt, Comic Sans MS, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("FIND YOUR", 230, 80); g.fillText("ROOM", 230, 160); g.fillText("TO LEAVE", 230, 240);
      g.fillStyle = "#d8c870"; g.fillRect(190, 0, 80, 22);
    }) }), NOTE[0], NOTE[1], NOTE[2], -Math.PI / 2).rotation.z = 0.05;
    // Lily + tangannya di tepi pintu
    this.lily = makeLily(); R.add(this.lily.g);
    R.add(this.lilyHand);
    for (let i = 0; i < 4; i++) { const t = box(this.lilyHand, 0.16, 0.038, 0.035, "#ffd9b3", -0.06, i * 0.055, 0); t.name = "jari"; }
    this.faceLight = new THREE.PointLight("#ff8a6a", 0, 1.8, 1.2); this.faceLight.position.set(0, 1.75, 1.75); R.add(this.faceLight);
    this.redLight = new THREE.PointLight("#ff2a1a", 0, 4, 1.2); this.redLight.position.set(0, 2.3, 0.6); R.add(this.redLight);
    this.shaftLight = new THREE.PointLight("#dfe8ff", 0, 3, 1.3); this.shaftLight.position.set(HATCH[0], LH + 0.7, HATCH[2]); R.add(this.shaftLight);
    this.pov = new PovArms(R);
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    applyCam(cam, camAt(f));
    const t = f / FPS, Lf = this.lift;
    // ---- pintu ----
    const close5 = ease(span(f, S0("g05") + 20, E0("g05")));
    const open9 = ease(span(f, S0("g09") + 8, S0("g09") + 30));
    const doorOpen = f < S0("g09") ? 0.16 * (1 - close5) : open9;
    const dx = Lf.setDoors(doorOpen);
    // ---- layar lantai ----
    const a6 = S0("g06"), a8 = S0("g08");
    if (f < S0("g05")) Lf.setDisp("13", "#ff2a2a", "▲");
    else if (f < a6) Lf.setDisp(Math.floor(f / 3) % 3 === 0 ? "??" : "13", "#ff2a2a", "▼");
    else if (f < a8) { const n = 12 - Math.floor((f - a6) / 4); Lf.setDisp(n >= 1 ? String(n) : "B" + (1 - n), "#ff2a2a", "▼"); }
    else Lf.setDisp("13", "#ff2a2a", "");
    // ---- panel: alarm menyala berkedip saat ditekan & berdering ----
    const alarmOn = f < S0("g04") && Math.floor(f / 5) % 2 === 0;
    (Lf.panel.material as THREE.MeshBasicMaterial).map = alarmOn ? Lf.tx.alarm : Lf.tx.p20;
    // ---- lampu ----
    const falling = f >= a6 && f < a8;
    let lk = 0.35 + (hh(Math.floor(f / 3), 7) > 0.85 ? 0.4 : 0);
    if (falling) lk = Math.floor(f / 2) % 2 ? 0.03 : 0.45;
    if (f >= a8) lk = 0.5;
    if (f >= S0("g13")) lk = 0.35;
    Lf.setLight(lk);
    this.redLight.intensity = falling ? 1.8 : f >= a8 ? 1.2 : 0.6;
    this.hall.setLights((i) => (f >= S0("g09") ? (hh(Math.floor(f / 3) + i * 7, 5) > 0.93 ? 0.2 : 0.75) : i < 2 ? 0.6 : 0.15));
    // ---- palka atap ----
    const a13 = S0("g13");
    const jig = f >= a13 && f < a13 + 12 ? 0.08 * Math.abs(Math.sin(f * 1.7)) : 0;
    const hOpen = ease(span(f, a13 + 12, a13 + 30)) * 1.85;
    Lf.hatch.rotation.z = hOpen + jig;
    const sh = ease(span(f, a13 + 12, a13 + 30));
    this.shaftLight.intensity = 2.2 * sh;
    (Lf.hatchGlow.material as THREE.MeshBasicMaterial).color.set("#cfd8ff").multiplyScalar(1.6 * sh);
    // ---- Lily ----
    this.poseLily(f, t, dx);
    // ---- tangan POV ----
    const toLocal = this.pov.local(cam);
    this.pov.pose(povAt(f, t, toLocal));
  }

  poseLily(f: number, t: number, dx: number) {
    const Ly = this.lily;
    const atDoor = f < E0("g05");
    const atEnd = f >= S0("g09");
    Ly.g.visible = atDoor || atEnd;
    this.lilyHand.visible = f < S0("g05") + 18;
    this.lilyHand.position.set(-dx + 0.31 - 0.02, 1.25 - 0.4 * ease(span(f, S0("g05") + 4, S0("g05") + 18)), 0.99);
    this.faceLight.intensity = atDoor ? 2.2 : 0;
    if (atDoor) {
      const back = ease(span(f, S0("g05") + 10, E0("g05")));
      Ly.g.position.set(0, 0.28, 1.22 + 0.6 * back);
      Ly.g.rotation.set(0, Math.PI, 0);
      Ly.head.scale.set(1, 1.35, 1); Ly.head.rotation.set(0, 0, 0.25);
      Ly.armL.rotation.set(0, 0, 0); Ly.armR.rotation.set(-1.4, 0, 0);
      Ly.wajah(0, 0, true); // diam: suaranya datang dari speaker
      return;
    }
    // di ujung lorong, membelakangi, lalu kepala berputar penuh ke arah kamera
    Ly.g.position.set(LILY_END[0], 0.28 + 0.04 * Math.sin(t * 2), LILY_END[2]);
    Ly.g.rotation.set(0, 0, 0);
    Ly.head.scale.set(1, 1, 1);
    const turn = ease(span(f, S0("g12") + 6, S0("g12") + 40));
    Ly.head.rotation.set(0, Math.PI * turn, 0.15 * turn);
    Ly.armL.rotation.set(0, 0, 0); Ly.armR.rotation.set(0, 0, 0);
    Ly.wajah(mouthAt("lily", f) * 0.9, 0, true);
    if (Ly.tag) Ly.tag.visible = false;
  }
}

// ---------------- kamera ----------------
const GAP: V3 = [0, 1.62, 1.1];
export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f);
  switch (sc) {
    case "alarm": {
      const a = S0("g01"), k = f >= a + 8 ? 0.02 : 0;
      return { pos: add([0.35, 1.55, 0.25], shake(f, k)), look: btnWorld("alarm"), fov: 96, roll: 0.03 };
    }
    case "interkom": {
      const g3 = S0("g03"), side = f >= g3 + 20 ? ease(span(f, g3 + 20, g3 + 34)) : 0;
      return { pos: add([0.35, 1.55, 0.2], breathe(t, 1.5)), look: lerp3(add(btnWorld("alarm"), [0, 0.12, 0]), GAP, side * 0.95), fov: 98, roll: 0 };
    }
    case "interkom_diam": {
      const a = S0("g04"), u = ease(span(f, a, E0("g04")));
      return { pos: add(lerp3([0.35, 1.55, 0.2], [0.05, 1.58, -0.2], u), breathe(t)), look: lerp3(lerp3(btnWorld("alarm"), GAP, 0.5), GAP, u), fov, roll: 0 };
    }
    case "lepas": {
      const a = S0("g05"), u = ease(span(f, a, a + 20));
      return { pos: add(lerp3([0.05, 1.58, -0.2], [0.0, 1.6, 0.25], u), breathe(t, 0.6)), look: GAP, fov: lerp(104, 90, u), roll: 0 };
    }
    case "jatuh": {
      const a = S0("g06"), up = ease(span(f, S0("g07"), S0("g07") + 10));
      return { pos: add([0, 1.5, 0], shake(f, 0.09)), look: add(lerp3([0, 1.4, 1.2], [0, 2.4, 0.95], up), shake(f + 5, 0.25)), fov, roll: 0.08 * Math.sin(f * 0.9) };
    }
    case "rem": {
      const a = S0("g08"), k = Math.max(0, 1 - (f - a) / 8);
      return { pos: add([0, lerp(1.35, 1.52, ease(span(f, a, a + 15))), 0], shake(f, 0.12 * k)), look: [0, 2.38, 0.95], fov, roll: 0 };
    }
    case "buka": {
      const a = S0("g09"), u = ease(span(f, a, a + 20));
      return { pos: add([0, 1.55, 0], breathe(t)), look: lerp3([0, 2.3, 0.95], [0, 1.5, 6], u), fov, roll: 0 };
    }
    case "lorong_kosong": {
      const a = S0("g10"), u = ease(span(f, a, E0("g10") + 10));
      return { pos: add(lerp3([0, 1.55, 0], [0.1, 1.58, 0.75], u), breathe(t, 1.3)), look: [0.0, 1.45, 12], fov, roll: 0.01 * Math.sin(t) };
    }
    case "catatan": {
      const a = S0("g11"), u = ease(span(f, a, a + 18));
      return { pos: add(lerp3([0.1, 1.58, 0.75], [0.3, 1.55, 1.05], u), breathe(t)), look: lerp3([0, 1.45, 12], NOTE, u), fov: lerp(104, 84, u), roll: 0 };
    }
    case "lily_jauh": {
      const a = S0("g12"), u = ease(span(f, a, a + 12)), z = ease(span(f, a + 30, E0("g12")));
      return { pos: add([0.15, 1.58, 0.95], breathe(t, 0.6)), look: lerp3(NOTE, [LILY_END[0], 1.5, LILY_END[2]], u), fov: lerp(lerp(84, 70, u), 52, z), roll: 0 };
    }
    case "palka": {
      const a = S0("g13"), u = ease(span(f, a, a + 7)), back = ease(span(f, a, a + 20));
      return { pos: add(lerp3([0.15, 1.58, 0.95], [-0.1, 1.45, 0.05], back), shake(f, 0.02)), look: lerp3([LILY_END[0], 1.5, LILY_END[2]], [HATCH[0], HATCH[1] + 0.3, HATCH[2]], u), fov: lerp(52, 104, u), roll: 0 };
    }
    default: return { pos: [-0.1, 1.45, 0.05], look: [HATCH[0], HATCH[1] + 0.3, HATCH[2]], fov, roll: 0 };
  }
};

// ---------------- tangan POV ----------------
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f);
  const at = (w: V3, back: number): V3 => toLocal([w[0] - back, w[1], w[2]]);
  switch (sc) {
    case "alarm": {
      const press = Math.abs(Math.sin((f / 4) * Math.PI / 2)), reach = ease(span(f, 2, 10));
      return { R: lerp3([0.26, -0.5, -0.5], at(btnWorld("alarm"), 0.04 + 0.06 * press), reach), L: povLow(t, 2).L };
    }
    case "interkom": {
      const hold = 1 - ease(span(f, S0("g03"), S0("g03") + 10));
      return { R: lerp3(povLow(t, 1.5).R, at(btnWorld("alarm"), 0.05), hold), L: povLow(t, 2).L };
    }
    case "interkom_diam": case "lepas": return povLow(t, 2);
    case "jatuh": case "rem": return povUp(t, 4);
    case "palka": return povUp(t, 1.5);
    default: return povLow(t, 1.2);
  }
};
