// BLOXY LAND — perkakas serial taman hiburan: maskot Hoppy (kelinci balok, desain orisinal), Max bertopi merah,
// ponsel + senter di tangan POV, bayangan, dan pembangun taman (gerbang, jalan, komidi putar, bianglala,
// lampu jalan, kios, rumah hantu, pohon, pagar). Satuan meter; gerbang di z = 0, jalan utama ke +z.
import * as THREE from "three";
import { box, ball, plane, glow, toon, canvasTex, signTex, hh, lerp, Orang, CYLG, BOXG, RAMP, SKIN } from "../inti/kit";

/** semua mesh plastik memberi & menerima bayangan (yang bercahaya/transparan tidak) */
export const enableShadows = (root: THREE.Object3D) => root.traverse((o) => {
  const m = o as THREE.Mesh;
  if (!m.isMesh) return;
  const mat = m.material as THREE.Material;
  const basic = (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial || mat.transparent;
  m.castShadow = !basic; m.receiveShadow = !basic;
});

/** cahaya bulan dengan bayangan lembut */
export const moonLight = (R: THREE.Object3D, target: [number, number, number], k = 1.1, size = 26) => {
  const d = new THREE.DirectionalLight("#b8c4ff", k);
  d.position.set(target[0] - 12, 22, target[2] - 14); d.target.position.set(...target);
  d.castShadow = true; d.shadow.mapSize.set(2048, 2048); d.shadow.bias = -0.0006; d.shadow.normalBias = 0.03;
  const c = d.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 80;
  R.add(d); R.add(d.target); return d;
};

// ---------------- Max ----------------
export const makeMax = () => {
  const o = new Orang({ torso: "#d8302a", legs: "#2a3f6e", sleeve: "#d8302a", tag: undefined }); o.g.userData.dyn = "Max";
  const cap = new THREE.Group(); o.head.add(cap);
  const c = ball(cap, 1, "#c4201c", 0, 0.15, 0); c.scale.set(0.215, 0.11, 0.215);
  box(cap, 0.26, 0.025, 0.2, "#c4201c", 0, 0.14, 0.2);
  return { o, cap };
};
/** topi Max sendirian (tergeletak di tanah) */
export const capProp = (R: THREE.Object3D) => {
  const g = new THREE.Group(); R.add(g);
  const c = ball(g, 1, "#c4201c", 0, 0.05, 0); c.scale.set(0.2, 0.17, 0.2);
  box(g, 0.05, 0.05, 0.05, "#ffffff", 0, 0.21, 0); box(g, 0.12, 0.08, 0.01, "#ffffff", 0, 0.1, 0.2); // kancing + logo
  box(g, 0.26, 0.025, 0.2, "#c4201c", 0, 0.01, 0.2);
  return g;
};

// ---------------- Hoppy, maskot kelinci balok raksasa ----------------
export class Hoppy {
  g = new THREE.Group(); head = new THREE.Group(); armL = new THREE.Group(); armR = new THREE.Group(); legL = new THREE.Group(); legR = new THREE.Group();
  earL = new THREE.Group(); earR = new THREE.Group(); eyes: THREE.Mesh[] = []; pupils: THREE.Mesh[] = []; mouth: THREE.Mesh; grin: THREE.Mesh;
  constructor(fur = "#f4f1ea", accent = "#ff8fb8", bow = "#d8302a") {
    const g = this.g; g.userData.dyn = "Hoppy";
    for (const [leg, x] of [[this.legL, -0.24], [this.legR, 0.24]] as const) {
      leg.position.set(x, 0.8, 0); g.add(leg);
      box(leg, 0.4, 0.8, 0.42, fur, 0, -0.4, 0);
      box(leg, 0.46, 0.16, 0.62, fur, 0, -0.74, 0.08); // kaki besar
    }
    box(g, 0.95, 0.95, 0.62, fur, 0, 1.28, 0);
    box(g, 0.55, 0.6, 0.02, accent, 0, 1.22, 0.32); // perut
    box(g, 0.3, 0.16, 0.08, bow, 0, 1.72, 0.32); box(g, 0.12, 0.12, 0.1, bow, 0, 1.72, 0.34); // dasi kupu-kupu
    for (const [arm, x] of [[this.armL, -0.62], [this.armR, 0.62]] as const) {
      arm.position.set(x, 1.66, 0); g.add(arm);
      box(arm, 0.3, 0.85, 0.32, fur, 0, -0.38, 0);
      box(arm, 0.34, 0.2, 0.36, "#ffffff", 0, -0.86, 0); // sarung tangan
    }
    this.head.position.y = 2.15; g.add(this.head);
    box(this.head, 0.82, 0.68, 0.7, fur, 0, 0, 0);
    box(this.head, 0.5, 0.26, 0.12, "#ffffff", 0, -0.18, 0.37); // moncong
    box(this.head, 0.12, 0.08, 0.06, accent, 0, -0.08, 0.44); // hidung
    for (const x of [-0.05, 0.05]) box(this.head, 0.08, 0.12, 0.03, "#ffffff", x, -0.32, 0.43); // gigi
    for (const x of [-0.2, 0.2]) {
      const e = ball(this.head, 1, "#0a0a10", x, 0.1, 0.355); e.scale.set(0.12, 0.14, 0.02); this.eyes.push(e);
      const p = ball(this.head, 1, glow("#ffffff", 1.2), x + 0.04, 0.15, 0.37); p.scale.set(0.03, 0.035, 0.01); this.pupils.push(p);
    }
    this.mouth = box(this.head, 0.26, 0.03, 0.02, "#2a0c12", 0, -0.27, 0.43);
    this.grin = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 24, Math.PI), glow("#120408")); this.grin.position.set(0, -0.1, 0.43); this.grin.rotation.z = Math.PI; this.grin.visible = false; this.head.add(this.grin);
    for (const [ear, x] of [[this.earL, -0.2], [this.earR, 0.2]] as const) {
      ear.position.set(x, 0.32, 0); this.head.add(ear);
      box(ear, 0.18, 0.8, 0.1, fur, 0, 0.4, 0);
      box(ear, 0.1, 0.62, 0.02, accent, 0, 0.42, 0.055);
    }
    this.earR.rotation.z = -0.15; this.earL.rotation.z = 0.15;
  }
  /** seram: mata hitam membesar tanpa kilau + seringai lebar */
  face(scary: boolean, talk = 0) {
    this.pupils.forEach((p) => (p.visible = !scary));
    this.eyes.forEach((e) => e.scale.set(scary ? 0.15 : 0.12, scary ? 0.19 : 0.14, 0.02));
    this.grin.visible = scary; this.mouth.visible = !scary;
    this.mouth.scale.y = 0.03 * (1 + 4 * talk); // skala dasar 0.03 dari box()
  }
  wave(t: number) { this.armR.rotation.set(-2.7, 0, 0.35 + 0.35 * Math.sin(t * 7)); }
}

// ---------------- ponsel + senter POV ----------------
export class Phone {
  g = new THREE.Group(); spot: THREE.SpotLight; screen: THREE.Mesh;
  constructor(R: THREE.Object3D) {
    R.add(this.g);
    box(this.g, 0.075, 0.15, 0.012, "#16161c", 0, 0, 0);
    this.screen = plane(this.g, 0.066, 0.135, new THREE.MeshBasicMaterial({ map: canvasTex(132, 270, (g) => {
      g.fillStyle = "#1a2a3a"; g.fillRect(0, 0, 132, 270);
      g.fillStyle = "#ff3030"; g.beginPath(); g.arc(22, 22, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.font = "bold 22px Arial"; g.fillText("REC", 38, 30);
      g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 2; g.strokeRect(14, 60, 104, 150);
    }) }), 0, 0, -0.007);
    this.screen.rotation.y = Math.PI;
    this.spot = new THREE.SpotLight("#fff4e0", 9, 18, 0.42, 0.55, 1.2);
    this.spot.position.set(0, 0.05, -0.01); this.g.add(this.spot); this.g.add(this.spot.target); this.spot.target.position.set(0, 0.05, -5);
  }
}

// ---------------- taman ----------------
export type Park = {
  carousel: THREE.Group; horses: THREE.Group[]; caroBulbs: THREE.Mesh[]; wheel: THREE.Group; gondolas: THREE.Group[]; wheelBulbs: THREE.Mesh[];
  lamps: { l: THREE.PointLight; bulb: THREE.Mesh }[]; setLamps: (fn: (i: number) => number) => void; setCarousel: (on: number, ang: number, t: number) => void;
  setWheel: (on: number, ang: number) => void; hauntedDoor: THREE.Group; speaker: [number, number, number];
  /** 0 = malam, 1 = siang (langit, bulan, bintang) */
  setDay: (k: number) => void;
};
const BULB_ON = "#ffe9a8";
export const CARO: [number, number, number] = [-6.5, 0, 12];
export const WHEEL: [number, number, number] = [8, 9.5, 30];
export const HAUNT: [number, number, number] = [-8, 0, 28];
export const buildPark = (R: THREE.Object3D): Park => {
  // langit + bulan + bintang
  const sky = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), new THREE.ShaderMaterial({ // radius harus < jarak pandang kamera (120)
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform float uDay; varying vec3 vP; void main(){ float e = clamp(vP.y, 0.0, 1.0); vec3 n = mix(vec3(0.16,0.12,0.30), vec3(0.03,0.04,0.12), pow(e, 0.45)); vec3 d = mix(vec3(0.78,0.90,1.0), vec3(0.36,0.62,0.98), pow(e, 0.6)); gl_FragColor = vec4(mix(n, d, uDay), 1.0); }",
    uniforms: { uDay: { value: 0 } }, side: THREE.BackSide, depthWrite: false,
  }));
  sky.name = "langit"; R.add(sky);
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 2.0, 2.2), depthWrite: false }));
  moon.position.set(-24, 36, 86); moon.lookAt(0, 0, 0); R.add(moon);
  const stars: THREE.Mesh[] = [];
  for (let i = 0; i < 80; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ color: "#e8ecff", depthWrite: false }));
    const a = (hh(i, 1) - 0.5) * 2.6, e = 0.2 + hh(i, 2) * 1.0;
    s.position.set(Math.sin(a) * Math.cos(e) * 95, Math.sin(e) * 95, Math.cos(a) * Math.cos(e) * 95); s.lookAt(0, 0, 0); R.add(s); stars.push(s);
  }
  // tanah: rumput berstud + jalan batu
  const stud = (base: string, rep: number) => { const t = canvasTex(256, 256, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx = i * 64 + 32, cy = j * 64 + 32; g.fillStyle = "rgba(0,0,0,0.14)"; g.beginPath(); g.arc(cx + 2, cy + 3, 19, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.14)"; g.beginPath(); g.arc(cx - 1, cy - 1, 19, 0, 7); g.fill(); }
  }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return new THREE.MeshToonMaterial({ map: t, gradientMap: RAMP }); };
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), stud("#2f7a36", 60)); grass.rotation.x = -Math.PI / 2; grass.position.set(0, -0.01, 25); R.add(grass);
  const tiles = canvasTex(256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#b9a88e" : "#a8977c"; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } });
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(2, 24);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 48), new THREE.MeshToonMaterial({ map: tiles, gradientMap: RAMP })); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.002, 20); R.add(path);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(5.5, 40), new THREE.MeshToonMaterial({ map: tiles, gradientMap: RAMP })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(CARO[0], 0.003, CARO[2]); R.add(plaza);
  // gerbang masuk
  for (const sx of [-1, 1]) {
    box(R, 0.7, 5.2, 0.7, "#7a3cc8", sx * 3.2, 2.6, 0); box(R, 0.9, 0.5, 0.9, "#ffd21f", sx * 3.2, 5.45, 0);
    ball(R, 0.35, "#ff4fa0", sx * 3.2, 5.95, 0);
    box(R, 0.5, 1.1, 0.5, "#8a8f9c", sx * 1.2, 0.55, 0); // pintu putar
  }
  box(R, 7.1, 1.1, 0.4, "#7a3cc8", 0, 4.6, 0);
  plane(R, 6.2, 0.9, new THREE.MeshBasicMaterial({ map: signTex(["BLOXY LAND"], "#2a1050", "#ffd21f", 1024, 150, "bold 110px Arial Black, Arial", false) }), 0, 4.6, -0.21, Math.PI);
  plane(R, 6.2, 0.9, new THREE.MeshBasicMaterial({ map: signTex(["BLOXY LAND"], "#2a1050", "#ffd21f", 1024, 150, "bold 110px Arial Black, Arial", false) }), 0, 4.6, 0.21);
  // loket tiket
  box(R, 2.0, 2.4, 1.6, "#ffd21f", 5.4, 1.2, -1.2); box(R, 2.3, 0.3, 1.9, "#d8302a", 5.4, 2.55, -1.2);
  plane(R, 1.2, 0.35, new THREE.MeshBasicMaterial({ map: signTex(["CLOSED"], "#d8302a", "#ffffff", 512, 150, "bold 100px Arial Black, Arial", false) }), 5.4, 1.8, -2.01, Math.PI);
  // pagar keliling
  for (let z = 2; z < 46; z += 2) for (const sx of [-1, 1]) { box(R, 0.12, 1.0, 0.12, "#5a3a24", sx * 16, 0.5, z); box(R, 0.06, 0.08, 2.0, "#6b4a30", sx * 16, 0.8, z + 1); }
  // lampu jalan (tiang bergaya, bohlam, cahaya hangat)
  const lamps: Park["lamps"] = [];
  for (let i = 0; i < 7; i++) for (const sx of [-1, 1]) {
    const z = 3 + i * 6, x = sx * 2.8;
    box(R, 0.14, 3.4, 0.14, "#2a2a32", x, 1.7, z); box(R, 0.5, 0.08, 0.08, "#2a2a32", x - sx * 0.2, 3.4, z);
    const bulb = ball(R, 0.16, glow("#ffd9a0", 2.2), x - sx * 0.42, 3.25, z);
    const l = new THREE.PointLight("#ffcf8a", 6, 9, 1.4); l.position.set(x - sx * 0.42, 3.1, z); R.add(l);
    lamps.push({ l, bulb });
  }
  const speaker: [number, number, number] = [2.4, 3.9, 9];
  box(R, 0.14, 4.2, 0.14, "#2a2a32", 2.8, 2.1, 9); const horn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 12, 1, true), toon("#c8ccd6")); horn.rotation.z = Math.PI / 2; horn.position.set(2.45, 3.95, 9); R.add(horn);
  // komidi putar
  const carousel = new THREE.Group(); carousel.position.set(...CARO); R.add(carousel);
  const base = new THREE.Mesh(CYLG, toon("#e8e0f0")); base.scale.set(3.6, 0.35, 3.6); base.position.y = 0.17; carousel.add(base);
  const rot = new THREE.Group(); carousel.add(rot); rot.name = "putar";
  const pole = new THREE.Mesh(CYLG, toon("#ffd21f")); pole.scale.set(0.25, 4.2, 0.25); pole.position.y = 2.1; rot.add(pole);
  const roofT = canvasTex(512, 64, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#ff4fa0" : "#ffffff"; g.fillRect(i * 32, 0, 32, 64); } });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.6, 16), new THREE.MeshToonMaterial({ map: roofT, gradientMap: RAMP })); roof.position.y = 4.8; rot.add(roof);
  const rim = new THREE.Mesh(CYLG, toon("#7a3cc8")); rim.scale.set(4.0, 0.35, 4.0); rim.position.y = 3.95; rot.add(rim);
  ball(rot, 0.3, "#ffd21f", 0, 5.75, 0);
  const caroBulbs: THREE.Mesh[] = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; caroBulbs.push(ball(rot, 0.09, glow(BULB_ON, 2), Math.sin(a) * 4.02, 3.8, Math.cos(a) * 4.02)); }
  const horses: THREE.Group[] = [];
  const hc = ["#ffffff", "#ffd8e8", "#d8e8ff", "#fff0c0"];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, r = 2.6;
    const hp = new THREE.Mesh(CYLG, toon("#ffd21f")); hp.scale.set(0.05, 3.6, 0.05); hp.position.set(Math.sin(a) * r, 2.1, Math.cos(a) * r); rot.add(hp);
    const h = new THREE.Group(); h.position.set(Math.sin(a) * r, 1.3, Math.cos(a) * r); h.rotation.y = a + Math.PI / 2; rot.add(h);
    const c = hc[i % 4];
    box(h, 1.0, 0.45, 0.32, c, 0, 0, 0); box(h, 0.28, 0.5, 0.26, c, 0.55, 0.28, 0); box(h, 0.4, 0.22, 0.22, c, 0.72, 0.5, 0);
    box(h, 0.06, 0.3, 0.3, "#7a3cc8", 0.42, 0.36, 0); // surai
    for (const [x, z] of [[-0.38, -0.1], [-0.38, 0.1], [0.38, -0.1], [0.38, 0.1]]) box(h, 0.1, 0.5, 0.1, c, x, -0.42, z);
    box(h, 0.5, 0.06, 0.36, "#d8302a", -0.05, 0.25, 0); // pelana
    horses.push(h);
  }
  // bianglala
  const wheel = new THREE.Group(); wheel.position.set(...WHEEL); R.add(wheel);
  for (const sz of [-1, 1]) {
    const leg1 = box(R, 0.3, 11, 0.3, "#d8dce6", WHEEL[0] - 2.5, 5.2, WHEEL[2] + sz * 0.9); leg1.rotation.z = -0.22;
    const leg2 = box(R, 0.3, 11, 0.3, "#d8dce6", WHEEL[0] + 2.5, 5.2, WHEEL[2] + sz * 0.9); leg2.rotation.z = 0.22;
  }
  const spin = new THREE.Group(); spin.name = "roda"; wheel.add(spin);
  for (const dz of [-0.5, 0.5]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.12, 8, 48), toon("#d8dce6")); ring.position.z = dz; spin.add(ring); }
  const wheelBulbs: THREE.Mesh[] = [], gondolas: THREE.Group[] = [];
  const gc = ["#d8302a", "#ffd21f", "#1f8fff", "#3fbf4a", "#ff4fa0", "#7a3cc8"];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const sp = box(spin, 0.1, 8, 0.1, "#c8ccd6", Math.sin(a) * 4, Math.cos(a) * 4, 0); sp.rotation.z = -a;
    const gd = new THREE.Group(); gd.position.set(Math.sin(a) * 8, Math.cos(a) * 8, 0); spin.add(gd);
    box(gd, 1.0, 0.9, 1.2, gc[i % 6], 0, -0.7, 0); box(gd, 1.1, 0.12, 1.3, "#ffffff", 0, -0.2, 0); box(gd, 0.06, 0.5, 0.06, "#c8ccd6", 0, -0.05, 0);
    gondolas.push(gd);
  }
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; wheelBulbs.push(ball(spin, 0.1, glow(BULB_ON, 2), Math.sin(a) * 8, Math.cos(a) * 8, 0.62)); }
  // kios makanan bergaris
  const stall = (x: number, z: number, c: string, name: string, ry: number) => {
    const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; R.add(s);
    box(s, 2.4, 1.1, 1.4, "#f2ece0", 0, 0.55, 0);
    const roofT2 = canvasTex(256, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? c : "#ffffff"; g.fillRect(i * 32, 0, 32, 64); } });
    const rf = box(s, 2.7, 0.12, 1.8, new THREE.MeshToonMaterial({ map: roofT2, gradientMap: RAMP }), 0, 2.5, 0.1); rf.rotation.x = 0.15;
    for (const sx of [-1, 1]) box(s, 0.1, 1.4, 0.1, "#f2ece0", sx * 1.15, 1.8, 0.6);
    plane(s, 1.6, 0.4, new THREE.MeshBasicMaterial({ map: signTex([name], c, "#ffffff", 512, 128, "bold 70px Arial Black, Arial", false) }), 0, 2.1, 0.72);
  };
  stall(6.5, 14, "#d8302a", "POPCORN", -Math.PI / 2); stall(6.5, 19, "#1f8fff", "COTTON CANDY", -Math.PI / 2); stall(-5.5, 21, "#3fbf4a", "SODA", Math.PI / 2);
  // rumah hantu
  const hs = new THREE.Group(); hs.position.set(...HAUNT); hs.rotation.y = Math.PI / 2; R.add(hs);
  box(hs, 7, 5, 4, "#3a2a40", 0, 2.5, 0); box(hs, 7.4, 0.3, 4.4, "#1e1424", 0, 5.1, 0);
  const rf2 = box(hs, 5.2, 0.25, 4.4, "#1e1424", -1.6, 6.0, 0); rf2.rotation.z = 0.5; const rf3 = box(hs, 5.2, 0.25, 4.4, "#1e1424", 1.6, 6.0, 0); rf3.rotation.z = -0.5;
  box(hs, 1.2, 7.5, 1.2, "#2e2034", 2.8, 3.75, 0); box(hs, 1.6, 0.25, 1.6, "#1e1424", 2.8, 7.6, 0);
  for (const x of [-2.2, 0, 2.2]) for (const y of [1.6, 3.6]) if (!(x === 0 && y === 1.6)) box(hs, 0.8, 0.9, 0.05, glow("#7a5aff", 0.9), x, y, 2.03);
  plane(hs, 3.4, 0.7, new THREE.MeshBasicMaterial({ map: signTex(["HAUNTED MANOR"], "#120818", "#9aff6a", 1024, 200, "bold 120px Arial Black, Arial", false) }), 0, 4.55, 2.04);
  const hauntedDoor = new THREE.Group(); hauntedDoor.position.set(-0.6, 0, 2.03); hs.add(hauntedDoor);
  box(hauntedDoor, 1.2, 2.2, 0.08, "#5a2a1a", 0.6, 1.1, 0);
  // pohon balok di pinggir
  for (let i = 0; i < 26; i++) {
    const sx = i % 2 ? 1 : -1, x = sx * (11 + hh(i, 4) * 4), z = 2 + i * 1.7 + hh(i, 5) * 1.2, h = 3 + hh(i, 6) * 2.5;
    if (Math.abs(x - HAUNT[0]) < 4 && Math.abs(z - HAUNT[2]) < 5) continue;
    box(R, 0.5, h * 0.5, 0.5, "#6b4426", x, h * 0.25, z); box(R, h * 0.5, h * 0.45, h * 0.5, "#24703a", x, h * 0.65, z); box(R, h * 0.32, h * 0.28, h * 0.32, "#2f8a46", x, h * 0.98, z);
  }
  return {
    carousel, horses, caroBulbs, wheel, gondolas, wheelBulbs, lamps, hauntedDoor, speaker,
    setDay: (k) => { (sky.material as THREE.ShaderMaterial).uniforms.uDay.value = k; moon.visible = k < 0.5; stars.forEach((x) => (x.visible = k < 0.5)); },
    setLamps: (fn) => lamps.forEach((h, i) => { const k = fn(i); h.l.intensity = 6 * k; (h.bulb.material as THREE.MeshBasicMaterial).color.set("#ffd9a0").multiplyScalar(0.15 + 2.05 * k); }),
    setCarousel: (on, ang, t) => {
      rot.rotation.y = ang;
      horses.forEach((h, i) => (h.position.y = 1.3 + on * 0.25 * Math.sin(t * 3 + i * 1.3)));
      caroBulbs.forEach((b, i) => (b.material as THREE.MeshBasicMaterial).color.set(BULB_ON).multiplyScalar(on > 0 ? (0.4 + 1.8 * on * ((Math.floor(t * 4) + i) % 3 ? 1 : 0.5)) : 0.1));
    },
    setWheel: (on, ang) => {
      spin.rotation.z = ang; gondolas.forEach((gd) => (gd.rotation.z = -ang));
      wheelBulbs.forEach((b, i) => (b.material as THREE.MeshBasicMaterial).color.set(i % 2 ? "#ff8fd0" : BULB_ON).multiplyScalar(0.12 + 1.9 * on));
    },
  };
};
export { lerp, SKIN, BOXG };
