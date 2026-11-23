// BLOXY LAND After Hours — Part 1. Menyelinap ke taman hiburan balok yang sudah tutup bersama Max; komidi putar
// menyala sendiri, speaker mengumumkan taman "buka", maskot Hoppy makin dekat tiap lampu padam, Max hilang
// (topinya tertinggal), Hoppy tepat di belakangmu. Bayangan asli dari cahaya bulan, senter ponsel di tangan.
import * as THREE from "three";
import TL from "./timeline.json";
import { FPS, V3, makeTL, ease, lerp, lerp3, hh, span, add, shake, breathe, PovArms, Pov, povLow, povUp, Cam, applyCam } from "../inti/kit";
import { buildPark, Park, Hoppy, makeMax, capProp, Phone, enableShadows, moonLight, CARO } from "../taman/park";

export const T = makeTL(TL);
const { S0, E0, sceneAt, mouthAt } = T;
export const FREEZE = S0("g13") - 1;
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g12") + 14 + Math.floor(f * 0.4));

const MAX_END: V3 = [-1.3, 0, 5.2];
/** jalur Max: lewat celah antara pintu putar (x -1.45) dan tiang gerbang (x -2.85), lalu ke samping kamera */
const maxPath = (w: number): V3 => { const z = lerp(-2.6, MAX_END[2], w); const x = z < 1.0 ? -2.15 : lerp(-2.15, MAX_END[0], (z - 1.0) / (MAX_END[2] - 1.0)); return [x, 0, z]; };
const HOP_BEHIND: V3 = [0.55, 0, 2.7];
// jendela padam (frame relatif) dan posisi Hoppy sesudah tiap padam
const dark = (f: number) => {
  const a8 = S0("g08"), a9 = S0("g09"), a10 = S0("g10");
  const wins: [number, number][] = [[a8 + 8, a8 + 18], [a8 + 42, a8 + 52], [a9 + 26, a9 + 34], [a10 + 2, a10 + 24]];
  return wins.some(([a, b]) => f >= a && f < b);
};
const hopZ = (f: number) => {
  const a8 = S0("g08"), a9 = S0("g09");
  if (f < a8 + 13) return 28.4; if (f < a8 + 47) return 22; if (f < a9 + 30) return 14; return 10;
};

export class World {
  root = new THREE.Group();
  park: Park; hoppy = new Hoppy(); max = makeMax(); cap: THREE.Group; pov: PovArms; phone: Phone; moon: THREE.DirectionalLight;
  constructor() {
    const R = this.root;
    R.add(new THREE.AmbientLight("#7d86c4", 0.35));
    R.add(new THREE.HemisphereLight("#b8c0ff", "#1a2418", 0.3));
    this.moon = moonLight(R, [0, 0, 12], 1.0, 24);
    this.park = buildPark(R);
    R.add(this.hoppy.g); R.add(this.max.o.g);
    this.cap = capProp(R); this.cap.position.set(MAX_END[0] + 0.1, 0, MAX_END[2]); this.cap.rotation.set(0.2, 0.8, 0.15);
    enableShadows(R);
    this.pov = new PovArms(R);
    this.phone = new Phone(this.pov.g);
    const sky = R.getObjectByName("langit"); if (sky) sky.receiveShadow = sky.castShadow = false;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    applyCam(cam, camAt(f));
    const t = f / FPS, P = this.park;
    const off = dark(f);
    const open = f >= S0("g04") + 6;
    P.setLamps((i) => (off ? 0 : open ? 1 : 0.55) * (f >= S0("g12") && hh(Math.floor(f / 2) + i, 3) > 0.7 ? 0.3 : 1));
    const caroOn = f >= S0("g03") + 10 ? ease(span(f, S0("g03") + 10, S0("g03") + 20)) : 0;
    const caroAng = caroOn > 0 ? 0.45 * Math.pow(Math.max(0, t - (S0("g03") + 10) / FPS), 1.3) : 0;
    P.setCarousel(off ? 0 : caroOn, caroAng, t);
    P.setWheel(off ? 0 : open ? 1 : 0, open ? 0.08 * (t - S0("g04") / FPS) : 0);
    this.moon.intensity = off ? 0.25 : 1.0;
    this.phone.spot.intensity = off ? 3 : 9;
    this.poseMax(f, t);
    this.poseHoppy(f, t);
    const toLocal = this.pov.local(cam);
    const p = povAt(f, t, toLocal);
    this.pov.pose(p);
    this.phone.g.visible = !!p.R;
    if (p.R) { this.phone.g.position.set(p.R[0] - 0.02, p.R[1] + 0.1, p.R[2] - 0.03); this.phone.g.rotation.set(0.15, 0.1, -0.08); }
  }

  poseMax(f: number, t: number) {
    const M = this.max.o;
    const gone = f >= S0("g10") + 12;
    M.g.visible = !gone; this.cap.visible = gone;
    if (gone) return;
    const walk = ease(span(f, 0, E0("g02")));
    const moving = f < E0("g02") - 6;
    const pos = maxPath(walk);
    M.g.position.set(pos[0], moving ? 0.03 * Math.abs(Math.sin(t * 7)) : 0, pos[2]);
    const faceCam = f >= S0("g05") - 6;
    M.g.rotation.set(0, faceCam ? lerp(0, 1.9, ease(span(f, S0("g05") - 6, S0("g05") + 6))) : 0, 0);
    const s = moving ? Math.sin(t * 7) : 0;
    M.legL.rotation.x = 0.5 * s; M.legR.rotation.x = -0.5 * s;
    M.armL.rotation.x = -0.4 * s; M.armR.rotation.x = f >= S0("g05") ? -0.6 : 0.4 * s;
    // menoleh ke kamera saat bicara di gerbang
    M.head.rotation.y = f < E0("g01") ? 0.9 * ease(span(f, S0("g01") - 4, S0("g01") + 8)) : f >= S0("g03") && f < S0("g05") ? -1.0 : 0;
    M.wajah(mouthAt("max", f) * 0.9, f >= S0("g04") ? 0.8 : 0);
  }

  poseHoppy(f: number, t: number) {
    const H = this.hoppy;
    const vis = (f >= S0("g06") && f < S0("g10") + 14) || f >= S0("g12") - 2;
    H.g.visible = vis && !dark(f);
    if (!vis) return;
    if (f >= S0("g12") - 2) {
      H.g.position.set(...HOP_BEHIND); H.g.rotation.set(0, 0, 0);
      H.head.rotation.set(0.25, 0, 0.3); H.armR.rotation.set(-1.2, 0, 0); H.armL.rotation.set(-1.0, 0, 0);
      H.face(true, mouthAt("hoppy", f));
      return;
    }
    H.g.position.set(1.4, 0, hopZ(f)); H.g.rotation.set(0, Math.PI, 0);
    if (f < S0("g08")) { H.wave(t); H.armL.rotation.set(0, 0, 0); H.head.rotation.set(0, 0, 0.12 * Math.sin(t * 2)); H.face(false, mouthAt("hoppy", f)); }
    else { H.armR.rotation.set(0, 0, 0); H.armL.rotation.set(0, 0, 0); H.head.rotation.set(0.1, 0, 0.35); H.face(hopZ(f) < 20, 0); }
  }
}

// ---------------- kamera ----------------
const HOP_FACE = (f: number): V3 => [1.4, 2.3, hopZ(f)];
export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f);
  const walk = ease(span(f, 0, E0("g02")));
  const P0 = lerp3([0.4, 1.6, -4.2], [0.6, 1.6, 4.3], walk);
  const step: V3 = [0, f < E0("g02") ? 0.035 * Math.abs(Math.sin(t * 7)) : 0, 0];
  const maxHead = (): V3 => { const p = maxPath(ease(span(f, 0, E0("g02")))); return [p[0], 1.55, p[2]]; };
  switch (sc) {
    case "gerbang": {
      const toMax = 1 - ease(span(f, E0("g01") - 6, E0("g01") + 10));
      const ahead: V3 = [P0[0], 2.4, P0[2] + 10];
      return { pos: add(P0, add(step, breathe(t))), look: lerp3(ahead, maxHead(), toMax * 0.85), fov, roll: 0 };
    }
    case "komidi": {
      const u = ease(span(f, S0("g03"), S0("g03") + 16));
      return { pos: add(P0, breathe(t)), look: lerp3([P0[0], 2.4, P0[2] + 10], [CARO[0], 2.6, CARO[2]], u), fov, roll: 0 };
    }
    case "speaker": {
      const u = ease(span(f, S0("g04"), S0("g04") + 12));
      return { pos: add(P0, breathe(t)), look: lerp3([CARO[0], 2.6, CARO[2]], [2.45, 3.9, 9], u), fov, roll: 0 };
    }
    case "max_takut": {
      const u = ease(span(f, S0("g05"), S0("g05") + 10));
      return { pos: add(P0, breathe(t, 1.3)), look: lerp3([2.45, 3.9, 9], [MAX_END[0], 1.55, MAX_END[2]], u), fov, roll: 0 };
    }
    case "hoppy_jauh": {
      const u = ease(span(f, S0("g06"), S0("g06") + 14)), z = ease(span(f, S0("g07"), E0("g07")));
      return { pos: add(P0, breathe(t, 0.8)), look: lerp3([MAX_END[0], 1.55, MAX_END[2]], HOP_FACE(f), u), fov: lerp(104, 66, z), roll: 0 };
    }
    case "lampu": {
      const jump = f >= S0("g08") && (Math.abs(f - (S0("g08") + 18)) < 4 || Math.abs(f - (S0("g08") + 52)) < 4 || Math.abs(f - (S0("g09") + 34)) < 4);
      return { pos: add(P0, shake(f, jump ? 0.06 : 0.008)), look: lerp3(HOP_FACE(f), [1.4, 1.8, hopZ(f)], 0.3), fov: lerp(66, 86, ease(span(f, S0("g08"), S0("g08") + 20))), roll: 0 };
    }
    case "hilang": {
      const u = ease(span(f, S0("g10") + 24, S0("g10") + 40));
      return { pos: add(P0, breathe(t, 2)), look: lerp3([1.4, 1.8, 10], [MAX_END[0] + 0.1, 0.2, MAX_END[2]], u), fov, roll: 0 };
    }
    default: { // belakang
      const a = S0("g12"), u = ease(span(f, a - 2, a + 8));
      const yaw = lerp(Math.atan2(MAX_END[0] - P0[0], MAX_END[2] - P0[2]), Math.atan2(HOP_BEHIND[0] - P0[0], HOP_BEHIND[2] - P0[2]) - 2 * Math.PI, u);
      const y = lerp(0.6, 2.35, u);
      const look: V3 = [P0[0] + Math.sin(yaw) * 2, y, P0[2] + Math.cos(yaw) * 2];
      return { pos: add(P0, shake(f, 0.01 + 0.04 * u * Math.max(0, 1 - (f - a - 8) / 20))), look, fov, roll: 0.03 * u };
    }
  }
};

// ---------------- tangan POV: ponsel di kanan ----------------
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f);
  const hold = (k: number): Pov => ({ R: add([0.2, -0.3, -0.5], [0.006 * k * Math.sin(t * 23), 0.006 * k * Math.sin(t * 19), 0]), L: povLow(t, k).L });
  switch (sc) {
    case "gerbang": case "komidi": case "speaker": case "max_takut": return hold(0.5);
    case "hoppy_jauh": case "lampu": return hold(1.8);
    case "hilang": return hold(2.5);
    default: return { R: povUp(t, 4).R, L: povUp(t, 4).L };
  }
};
