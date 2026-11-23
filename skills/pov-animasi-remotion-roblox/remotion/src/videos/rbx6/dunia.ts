// BLOXY LAND After Hours — Part 2 (pilihan: HIDE IN THE HAUNTED HOUSE). Lorong rumah hantu (rel wahana, tengkorak,
// peti mati, hantu kain), walkie-talkie Max di lantai, suara Max memanggil ke labirin cermin, "Max" di balik kaca
// berubah jadi Hoppy, Hoppy di setiap cermin, kabur ke kereta wahana. Senter ponsel memberi bayangan.
// Sumbu: lorong x -1.6..1.6, z 0..14; labirin cermin x -4..4, z 14..26; rel di x 0.9.
import * as THREE from "three";
import TL from "./timeline.json";
import { FPS, V3, makeTL, ease, lerp, lerp3, hh, span, add, shake, breathe, box, ball, plane, glow, canvasTex, signTex, PovArms, Pov, povLow, povUp, Cam, applyCam, RAMP, CYLG } from "../f13/kit";
import { Hoppy, makeMax, Phone, enableShadows } from "../bl/park";

export const T = makeTL(TL);
const { S0, E0, sceneAt, mouthAt } = T;
export const FREEZE = S0("g14") - 1;
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g11") + 16 + Math.floor(f * 0.4));

const W = 1.6, H = 3, MZ0 = 14, MZ1 = 26, MW = 4, RAIL_X = 0.9;
const WALKIE: V3 = [-0.35, 0.05, 5.6];
const MAXP: V3 = [-0.6, 0, 19.6];
const CART: V3 = [RAIL_X, 0, 23.6];
const cartGo = (f: number) => (f >= S0("g13") + 20 ? 2.2 * Math.pow(ease(span(f, S0("g13") + 20, FREEZE)), 2) : 0);
// panel cermin: [x, z, rotY]
const PANELS: [number, number, number][] = [
  [-0.6, 18.8, 0], [-2.4, 17.2, 0], [-3.0, 20.6, Math.PI / 2], [-1.6, 22.2, 0], [0.0, 21.0, Math.PI / 2],
  [-2.8, 24.4, 0], [2.6, 17.6, Math.PI / 2], [2.9, 21.4, 0], [-0.8, 25.2, 0], [2.4, 24.0, Math.PI / 2],
];
const HOPS: V3[] = [[-2.4, 0, 18.0], [-2.0, 0, 20.4], [-1.6, 0, 23.1], [-0.7, 0, 20.9], [3.3, 0, 18.6], [3.1, 0, 22.6], [-2.8, 0, 25.4]];

export class World {
  root = new THREE.Group();
  max = makeMax(); maxHop = new Hoppy(); hops: Hoppy[] = []; pov: PovArms; phone: Phone; walkie = new THREE.Group(); walkieLed: THREE.Mesh;
  ghost = new THREE.Group(); cart = new THREE.Group(); cartLights: THREE.Mesh[] = []; mazeLights: THREE.PointLight[] = []; accents: THREE.PointLight[] = [];
  constructor() {
    const R = this.root;
    R.add(new THREE.AmbientLight("#7a6aaa", 0.42)); R.add(new THREE.HemisphereLight("#9a8aff", "#1a1020", 0.25));
    // ---- lorong ----
    const boards = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#3a2a24" : "#33241f"; g.fillRect(0, i * 32, 256, 32); } });
    boards.wrapS = boards.wrapT = THREE.RepeatWrapping; boards.repeat.set(2, 8);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(MW * 2, MZ1), new THREE.MeshToonMaterial({ map: boards, gradientMap: RAMP })); fl.rotation.x = -Math.PI / 2; fl.position.z = MZ1 / 2; R.add(fl);
    const paper = canvasTex(256, 256, (g) => { g.fillStyle = "#2c1a38"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#3a2448"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(i * 64 + 32, j * 64 + 32, 12, 0, 7); g.fill(); } });
    paper.wrapS = paper.wrapT = THREE.RepeatWrapping; paper.repeat.set(6, 1);
    const wm = new THREE.MeshToonMaterial({ map: paper, gradientMap: RAMP });
    for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(MZ0, H), wm); w.position.set(sx * W, H / 2, MZ0 / 2); w.rotation.y = -sx * Math.PI / 2; R.add(w); }
    box(R, W * 2, 0.1, MZ0, "#1a1020", 0, H, MZ0 / 2);
    box(R, W * 2, H, 0.1, "#1a1020", 0, H / 2, -0.05);
    // rel wahana
    for (const dx of [-0.3, 0.3]) box(R, 0.06, 0.06, MZ1 + 4, "#8a8f9c", RAIL_X + dx, 0.03, (MZ1 + 4) / 2);
    for (let z = 0.5; z < MZ1; z += 0.8) box(R, 0.8, 0.04, 0.12, "#4a3428", RAIL_X, 0.02, z);
    // properti seram
    const bone = "#efe8d8";
    const sk = new THREE.Group(); sk.position.set(-1.3, 0, 3.6); sk.rotation.y = Math.PI / 2; R.add(sk);
    box(sk, 0.36, 0.36, 0.34, bone, 0, 1.75, 0); for (const x of [-0.08, 0.08]) box(sk, 0.08, 0.09, 0.02, "#120a10", x, 1.78, 0.18);
    box(sk, 0.08, 0.7, 0.08, bone, 0, 1.2, 0); for (let i = 0; i < 4; i++) box(sk, 0.4, 0.04, 0.2, bone, 0, 1.45 - i * 0.12, 0);
    for (const x of [-0.26, 0.26]) box(sk, 0.06, 0.7, 0.06, bone, x, 1.2, 0); for (const x of [-0.1, 0.1]) box(sk, 0.07, 0.8, 0.07, bone, x, 0.45, 0);
    const cof = box(R, 0.7, 2.0, 0.35, "#4a2a1a", -1.35, 1.0, 7.4); cof.rotation.y = Math.PI / 2;
    box(R, 0.08, 0.6, 0.06, "#c79a3a", -1.15, 1.3, 7.4); box(R, 0.32, 0.08, 0.06, "#c79a3a", -1.15, 1.45, 7.4);
    this.ghost.position.set(-0.85, 2.45, 10.2); this.ghost.scale.setScalar(0.8); R.add(this.ghost);
    const sheet = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 10), new THREE.MeshToonMaterial({ color: "#f4f2ff", gradientMap: RAMP })); sheet.position.y = -0.5; this.ghost.add(sheet);
    ball(this.ghost, 0.3, "#f4f2ff", 0, 0.05, 0); for (const x of [-0.1, 0.1]) { const e = ball(this.ghost, 1, "#0a0a10", x, 0.08, 0.26); e.scale.set(0.05, 0.07, 0.02); }
    box(R, 0.02, 0.4, 0.02, "#222", -0.85, 2.8, 10.2);
    for (const z of [2.5, 6, 9.5, 12.5]) { box(R, 0.06, 0.7, 0.55, "#c79a3a", W - 0.04, 1.8, z); plane(R, 0.45, 0.6, new THREE.MeshBasicMaterial({ map: canvasTex(90, 120, (g) => { g.fillStyle = "#2a3a2a"; g.fillRect(0, 0, 90, 120); g.fillStyle = "#c8c0a8"; g.fillRect(28, 20, 34, 40); g.fillStyle = "#000"; g.fillRect(34, 32, 6, 8); g.fillRect(50, 32, 6, 8); g.fillStyle = "#4a2a3a"; g.fillRect(20, 60, 50, 60); }) }), W - 0.08, 1.8, z, -Math.PI / 2); }
    for (const [x, z, c] of [[-1.2, 2.0, "#9aff6a"], [1.2, 8.0, "#b06aff"], [-1.2, 12.0, "#9aff6a"]] as [number, number, string][]) {
      ball(R, 0.12, glow(c, 1.8), x, 2.6, z); const l = new THREE.PointLight(c, 3.5, 5, 1.4); l.position.set(x, 2.5, z); R.add(l); this.accents.push(l);
    }
    // jaring laba-laba sederhana
    for (const [x, z] of [[-1.5, 1.2], [1.5, 6.6], [-1.5, 11.0]]) for (let i = 0; i < 4; i++) { const s = box(R, 0.01, 0.01, 0.7, "#e8e8f0", x * 0.95, H - 0.2 - i * 0.05, z); s.rotation.x = -0.5 + i * 0.3; }
    // walkie-talkie Max (di lantai, lalu di tangan kiri)
    R.add(this.walkie);
    box(this.walkie, 0.08, 0.16, 0.04, "#2a2e26", 0, 0.08, 0); box(this.walkie, 0.015, 0.1, 0.015, "#1a1a1a", 0.025, 0.21, 0);
    box(this.walkie, 0.05, 0.05, 0.005, "#555", 0, 0.06, 0.022);
    this.walkieLed = box(this.walkie, 0.02, 0.02, 0.01, glow("#3aff5a", 2), -0.02, 0.135, 0.022);
    // ---- labirin cermin ----
    const mm = new THREE.MeshToonMaterial({ color: "#20182c", gradientMap: RAMP });
    for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(MZ1 - MZ0, H + 0.2), mm); w.position.set(sx * MW, (H + 0.2) / 2, (MZ0 + MZ1) / 2); w.rotation.y = -sx * Math.PI / 2; R.add(w); }
    box(R, MW * 2, 0.1, MZ1 - MZ0, "#140e1c", 0, H + 0.2, (MZ0 + MZ1) / 2);
    // dinding belakang dengan terowongan keluar kereta (x 0.2..1.6, tinggi 1.9)
    box(R, MW + 0.2, H + 0.2, 0.1, "#140e1c", (-MW + 0.2) / 2, (H + 0.2) / 2, MZ1); box(R, MW - 1.6, H + 0.2, 0.1, "#140e1c", (MW + 1.6) / 2, (H + 0.2) / 2, MZ1);
    box(R, 1.4, H + 0.2 - 1.9, 0.1, "#140e1c", RAIL_X, 1.9 + (H + 0.2 - 1.9) / 2, MZ1);
    { const k = glow("#030205"); box(R, 0.05, 1.9, 4, k, 0.18, 0.95, MZ1 + 2); box(R, 0.05, 1.9, 4, k, 1.62, 0.95, MZ1 + 2); box(R, 1.5, 0.05, 4, k, RAIL_X, 1.9, MZ1 + 2); box(R, 1.5, 1.9, 0.05, k, RAIL_X, 0.95, MZ1 + 4); }
    plane(R, 1.3, 0.3, new THREE.MeshBasicMaterial({ map: signTex(["EXIT →"], "#200608", "#ff4a3a", 512, 120, "bold 80px Arial Black, Arial", false) }), RAIL_X, 2.15, MZ1 - 0.06, Math.PI);
    box(R, MW - W, H + 0.2, 0.1, "#140e1c", -(MW + W) / 2, (H + 0.2) / 2, MZ0); box(R, MW - W, H + 0.2, 0.1, "#140e1c", (MW + W) / 2, (H + 0.2) / 2, MZ0);
    plane(R, 2.2, 0.5, new THREE.MeshBasicMaterial({ map: signTex(["MIRROR MAZE"], "#0a0612", "#7ae0ff", 1024, 220, "bold 130px Arial Black, Arial", false) }), 0, H - 0.3, MZ0 - 0.06, Math.PI);
    const glass = new THREE.MeshBasicMaterial({ color: "#a8d8ff", transparent: true, opacity: 0.16, depthWrite: false });
    for (const [x, z, ry] of PANELS) {
      const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = ry; R.add(p);
      plane(p, 1.3, 2.7, glass, 0, 1.4, 0); plane(p, 1.3, 2.7, glass, 0, 1.4, 0, Math.PI);
      for (const dx of [-0.66, 0.66]) box(p, 0.05, 2.8, 0.05, "#d8e0f0", dx, 1.4, 0);
      box(p, 1.36, 0.05, 0.05, "#d8e0f0", 0, 2.78, 0); box(p, 1.36, 0.05, 0.05, "#d8e0f0", 0, 0.02, 0);
    }
    for (let i = 0; i < 4; i++) { const z = 15.5 + i * 3; box(R, 0.2, 0.04, 2.4, glow("#9ad8ff", 1.4), 0, H + 0.14, z); const l = new THREE.PointLight("#8ac8ff", 1.6, 5, 1.4); l.position.set(0, H - 0.2, z); R.add(l); this.mazeLights.push(l); }
    // Max di balik kaca, Hoppy pengganti, Hoppy-Hoppy di cermin
    this.max.o.g.position.set(...MAXP); this.max.o.g.rotation.y = Math.PI; R.add(this.max.o.g);
    this.maxHop.g.userData.dyn = "Hoppy (Max)"; this.maxHop.g.position.set(...MAXP); this.maxHop.g.rotation.y = Math.PI; this.maxHop.g.scale.setScalar(0.82); R.add(this.maxHop.g);
    for (const p of HOPS) { const h = new Hoppy(); h.g.userData.dyn = "Hoppy cermin " + this.hops.length; h.g.position.set(...p); h.g.scale.setScalar(0.82); h.g.rotation.y = Math.atan2(0.2 - p[0], 16.5 - p[2]); R.add(h.g); this.hops.push(h); }
    // kereta wahana
    this.cart.position.set(...CART); R.add(this.cart);
    this.cart.userData.dyn = "kereta"; this.walkie.userData.dyn = "walkie";
    // bak berongga: lantai, dua sisi, depan, belakang rendah, kursi
    box(this.cart, 1.1, 0.1, 1.6, "#c4201c", 0, 0.2, 0);
    for (const sx of [-1, 1]) box(this.cart, 0.08, 0.55, 1.6, "#c4201c", sx * 0.51, 0.47, 0);
    box(this.cart, 1.1, 0.55, 0.08, "#c4201c", 0, 0.47, 0.76); box(this.cart, 1.1, 0.75, 0.08, "#c4201c", 0, 0.57, -0.76);
    box(this.cart, 0.9, 0.12, 0.6, "#2a1a14", 0, 0.42, -0.3);
    plane(this.cart, 1.0, 0.24, new THREE.MeshBasicMaterial({ map: signTex(["HAUNTED EXPRESS"], "#c4201c", "#ffd21f", 512, 120, "bold 52px Arial Black, Arial", false) }), 0, 0.5, 0.81);
    for (const x of [-0.42, 0.42]) this.cartLights.push(ball(this.cart, 0.07, glow("#ffd21f", 2), x, 0.78, 0.8));
    enableShadows(R);
    this.pov = new PovArms(R);
    this.phone = new Phone(this.pov.g);
    this.phone.spot.castShadow = true; this.phone.spot.shadow.mapSize.set(1024, 1024); this.phone.spot.shadow.bias = -0.002;
    this.phone.spot.intensity = 40; this.phone.spot.distance = 16; this.phone.spot.angle = 0.5;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    applyCam(cam, camAt(f));
    const t = f / FPS;
    this.ghost.rotation.z = 0.15 * Math.sin(t * 1.3); this.ghost.position.y = 2.45 + 0.05 * Math.sin(t * 2);
    // kedipan lampu saat Max berubah jadi Hoppy dan saat "Found you"
    const flick = (f >= S0("g09") && f < S0("g09") + 14 && Math.floor(f / 2) % 2 === 0) || (f >= S0("g11") && hh(Math.floor(f / 3), 4) > 0.7);
    this.mazeLights.forEach((l) => (l.intensity = flick ? 0.1 : 1.6));
    this.accents.forEach((l, i) => (l.intensity = 3.5 * (hh(Math.floor(f / 4) + i * 9, 2) > 0.93 ? 0.2 : 1)));
    // walkie: di lantai lalu diambil tangan kiri; LED berkedip saat Max bicara
    const talk = mouthAt("max", f);
    (this.walkieLed.material as THREE.MeshBasicMaterial).color.set(f >= S0("g05") && f < E0("g05") ? "#3aff5a" : Math.floor(f / 20) % 2 ? "#3aff5a" : "#0a3a10").multiplyScalar(f >= S0("g05") && f < E0("g05") ? 0.6 + 2.5 * talk : 1.6);
    // Max di cermin -> Hoppy
    const swap = f >= S0("g09") + 8;
    const maxVis = f >= S0("g07") && !swap;
    this.max.o.g.visible = maxVis; this.maxHop.g.visible = swap;
    if (maxVis) { this.max.o.armR.rotation.set(-1.6 + 0.4 * Math.sin(t * 5), 0, 0.2); this.max.o.wajah(f >= S0("g08") && f < E0("g08") ? talk * 0.9 : 0, 0); this.max.o.head.rotation.z = 0.08; }
    this.maxHop.face(true, 0); this.maxHop.head.rotation.z = 0.3; this.maxHop.wave(t);
    const many = f >= S0("g11") - 4;
    this.hops.forEach((h, i) => { h.g.visible = many; h.head.rotation.z = 0.35 * ease(span(f, S0("g11"), S0("g11") + 10)); h.face(true, mouthAt("hoppy", f)); h.armR.rotation.x = -0.4 - 0.1 * Math.sin(t * 2 + i); });
    // kereta: diam, lalu bergerak setelah naik
    this.cart.position.z = CART[2] + cartGo(f);
    this.cartLights.forEach((b, i) => (b.material as THREE.MeshBasicMaterial).color.set("#ffd21f").multiplyScalar(f >= S0("g12") && (Math.floor(f / 6) + i) % 2 ? 2.4 : 0.6));
    // ponsel & walkie di tangan
    const toLocal = this.pov.local(cam);
    const p = povAt(f, t, toLocal);
    this.pov.pose(p);
    this.phone.g.visible = !!p.R;
    if (p.R) { this.phone.g.position.set(p.R[0] - 0.02, p.R[1] + 0.1, p.R[2] - 0.03); this.phone.g.rotation.set(0.15, 0.1, -0.08); }
    const held = f >= S0("g04") + 18;
    if (held && p.L) {
      if (this.walkie.parent !== this.pov.g) this.pov.g.add(this.walkie);
      this.walkie.position.set(p.L[0] + 0.02, p.L[1] + 0.02, p.L[2] - 0.02); this.walkie.rotation.set(0.2, -0.3, 0.1); this.walkie.visible = true;
    } else if (!held) {
      if (this.walkie.parent !== this.root) this.root.add(this.walkie);
      this.walkie.position.set(...WALKIE); this.walkie.rotation.set(-Math.PI / 2, 0, 0.4); this.walkie.visible = true;
    } else this.walkie.visible = false;
  }
}

// ---------------- kamera ----------------
const zAt = (f: number) => {
  if (f < S0("g03")) return lerp(0.8, 4.6, ease(span(f, 0, S0("g03"))));
  if (f < S0("g06")) return 4.6;
  if (f < S0("g08")) return lerp(4.6, 16.4, ease(span(f, S0("g06"), S0("g08") - 4)));
  if (f < S0("g12")) return 16.4;
  return lerp(16.4, CART[2] - 0.1, ease(span(f, S0("g12") + 10, S0("g13") + 14))) + cartGo(f);
};
export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f), z = zAt(f);
  const walking = (f < S0("g03")) || (f >= S0("g06") && f < S0("g08") - 4) || (f >= S0("g12") && f < S0("g13") + 14);
  const step: V3 = [0, walking ? 0.03 * Math.abs(Math.sin(t * 6)) : 0, 0];
  const x = f >= S0("g12") ? lerp(0.0, RAIL_X, ease(span(f, S0("g12"), S0("g12") + 10))) : 0.0;
  const P: V3 = add([x, f >= S0("g13") + 14 ? lerp(1.6, 1.25, ease(span(f, S0("g13") + 14, S0("g13") + 22))) : 1.6, z], step);
  switch (sc) {
    case "masuk": return { pos: add(P, breathe(t, 1.5)), look: [0.1, 1.3, z + 6], fov, roll: 0.02 * Math.sin(t) };
    case "walkie": case "walkie_bunyi": {
      const down = ease(span(f, S0("g03"), S0("g03") + 12)), up = f >= S0("g04") + 16 ? ease(span(f, S0("g04") + 16, S0("g04") + 28)) : 0;
      return { pos: add(P, breathe(t)), look: lerp3(lerp3([0.1, 1.3, z + 6], WALKIE, down), [-0.1, 1.15, z + 0.8], up), fov, roll: 0 };
    }
    case "lorong_cermin": {
      const u = ease(span(f, S0("g06"), S0("g06") + 12));
      return { pos: add(P, breathe(t, 1.2)), look: lerp3([-0.1, 1.15, z + 0.8], [0, 1.5, z + 8], u), fov, roll: 0 };
    }
    case "cermin_max": case "cermin_hoppy": {
      const u = ease(span(f, S0("g08"), S0("g08") + 12)), zz = sc === "cermin_hoppy" ? ease(span(f, S0("g09") + 8, S0("g09") + 14)) : 0;
      return { pos: add(P, shake(f, 0.01 + 0.04 * zz)), look: lerp3([0, 1.5, z + 8], [MAXP[0], 1.5, MAXP[2]], u), fov: lerp(lerp(104, 82, u), 70, zz), roll: 0 };
    }
    case "banyak_hoppy": {
      const a = S0("g11"), yaw = lerp(Math.atan2(MAXP[0], MAXP[2] - z), -1.9, ease(span(f, a - 4, E0("g11") + 6)));
      return { pos: add(P, shake(f, 0.015)), look: [P[0] + Math.sin(yaw) * 3, 1.6, z + Math.cos(yaw) * 3], fov: 100, roll: 0 };
    }
    case "kereta": {
      const u = ease(span(f, S0("g12"), S0("g12") + 8));
      return { pos: add(P, shake(f, 0.02)), look: lerp3([-3, 1.6, z - 1], [RAIL_X, 0.9, CART[2] + 0.6], u), fov, roll: 0 };
    }
    default: return { pos: add(P, shake(f, 0.012)), look: [RAIL_X, 1.0, z + 5], fov, roll: 0 };
  }
};

// ---------------- tangan POV ----------------
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f);
  const R = add([0.2, -0.3, -0.5], [0.006 * Math.sin(t * 23), 0.006 * Math.sin(t * 19), 0]);
  switch (sc) {
    case "walkie": {
      const reach = ease(span(f, S0("g04"), S0("g04") + 12)) * (1 - ease(span(f, S0("g04") + 16, S0("g04") + 28)));
      const hold: V3 = [-0.14, -0.22, -0.42];
      return { R, L: f >= S0("g04") + 16 ? lerp3(toLocal([WALKIE[0], 0.12, WALKIE[2]]), hold, ease(span(f, S0("g04") + 16, S0("g04") + 28))) : lerp3(povLow(t).L, toLocal([WALKIE[0], 0.12, WALKIE[2]]), reach) };
    }
    case "walkie_bunyi": return { R, L: [-0.12, -0.2, -0.4] };
    case "masuk": return { R, L: null };
    case "lorong_cermin": case "cermin_max": return { R, L: [-0.22, -0.4, -0.5] };
    case "cermin_hoppy": case "banyak_hoppy": return { R: add(R, [0, 0, 0.0]), L: [-0.22, -0.36, -0.5] };
    case "kereta": {
      const seated = f >= S0("g13") + 14;
      if (!seated) return povUp(t, 3);
      const cz = CART[2] + cartGo(f) + 0.7;
      return { R: toLocal([RAIL_X + 0.28, 0.9, cz - 0.2]), L: toLocal([RAIL_X - 0.28, 0.9, cz - 0.2]) };
    }
    default: return povUp(t, 3);
  }
};
