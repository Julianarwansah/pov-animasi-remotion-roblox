// FLOOR 13 — Part 1. Dunia 3D bergaya Roblox: lift hotel "Blocky Inn" yang berhenti di lantai 13 (yang tidak ada),
// lorong merah gelap berisi pemain yang berdiri menghadap tembok, dan Lily yang melayang di depan pintu lift.
// Tokoh balok R6: kepala silinder membulat + wajah decal datar, badan kotak 2x2x1, lengan & kaki kotak 1x2x1,
// warna plastik mulus, papan nama di atas kepala. update(f, cam) murni fungsi frame.
// Sumbu: lift x -1..1, z -1..1 (pintu di z = +1); lorong lantai 13 x -1.5..1.5, z 1.1..17. Satuan meter.
import * as THREE from "three";
import TL from "./timeline.json";

export const FPS = 30;
type V3 = [number, number, number];
type Line = { id: string; scene: string; who: string | null; text: string | null; start: number; end: number; mulut: number[] };
export const LINES = (TL as unknown as { baris: Line[] }).baris;
export const TOTAL = (TL as unknown as { total: number }).total;
const L = (id: string) => LINES.find((l) => l.id === id)!;
export const S0 = (id: string) => L(id).start;
export const E0 = (id: string) => L(id).end;
export const FREEZE = S0("g14") - 1;
/** cold open (sebelum baris pertama): kilasan wajah Lily di celah pintu lift */
export const COLD = Math.max(0, S0("g01") - 4);
export const coldFrame = (f: number) => Math.min(FREEZE - 1, S0("g13") + 8 + Math.floor(f * 0.4));

// ---------------- util ----------------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const hh = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const span = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));

// plastik Roblox: toon 4 tingkat yang terang
const RAMP = (() => {
  const t = new THREE.DataTexture(new Uint8Array([110, 170, 225, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const MAT = new Map<string, THREE.Material>();
const toon = (c: string) => {
  if (!MAT.has(c)) MAT.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: RAMP }));
  return MAT.get(c)!;
};
const glow = (c: string, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: true });
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const BOXG = new THREE.BoxGeometry(1, 1, 1);
const CYLG = new THREE.CylinderGeometry(1, 1, 1, 24);
const SPHG = new THREE.SphereGeometry(1, 32, 20);
const box = (p: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material | string, x: number, y: number, z: number) => {
  const o = new THREE.Mesh(BOXG, typeof m === "string" ? toon(m) : m);
  o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o;
};
const ball = (p: THREE.Object3D, r: number, m: THREE.Material | string, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(SPHG, typeof m === "string" ? toon(m) : m);
  o.scale.setScalar(r); o.position.set(x, y, z); p.add(o); return o;
};
const UP = new THREE.Vector3(0, 1, 0);
/** balok panjang dari titik a ke b (lengan POV gaya Roblox) */
const tube = (p: THREE.Object3D, r: number, m: THREE.Material | string) => {
  const o = new THREE.Mesh(BOXG, typeof m === "string" ? toon(m) : m); o.userData.r = r; p.add(o); return o;
};
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
const setTube = (o: THREE.Mesh, a: V3, b: V3) => {
  _a.set(...a); _b.set(...b);
  const len = _a.distanceTo(_b);
  o.position.copy(_a).add(_b).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(UP, _b.sub(_a).normalize());
  o.scale.set(o.userData.r * 2, len, o.userData.r * 2);
};
const plane = (p: THREE.Object3D, w: number, h: number, m: THREE.Material, x: number, y: number, z: number, ry = 0) => {
  const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.y = ry; p.add(o); return o;
};
const signTex = (lines: string[], bg: string, fg: string, w = 512, h = 256, font = "bold 84px Arial Black, Arial", border = true) => canvasTex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (border) { g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20); }
  g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (h / (lines.length + 0.6))));
});
/** papan nama di atas kepala (seperti nama pemain di game) */
const tagTex = (name: string, color = "#ffffff") => canvasTex(512, 128, (g) => {
  g.font = "bold 64px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 10; g.strokeStyle = "rgba(0,0,0,0.85)"; g.strokeText(name, 256, 64);
  g.fillStyle = color; g.fillText(name, 256, 64);
});

// ---------------- tokoh balok R6 (bentuk tetap) ----------------
export const SKIN = "#f5cd30"; // kuning klasik
const FACE = "#111014";
type Rupa = { torso: string | THREE.Material; legs: string; skin?: string; sleeve?: string; hair?: string; hairLong?: boolean; skirt?: string; face?: "smile" | "none"; eyeGlow?: string; tag?: string; tagColor?: string; s?: number };
export class Orang {
  g = new THREE.Group();
  head: THREE.Group; mouth: THREE.Mesh; smile: THREE.Mesh | null = null; grin: THREE.Mesh; eyes: THREE.Mesh[] = []; brows: THREE.Mesh[] = [];
  armL = new THREE.Group(); armR = new THREE.Group(); legL = new THREE.Group(); legR = new THREE.Group();
  tag: THREE.Sprite | null = null;
  constructor(r: Rupa) {
    const g = this.g, skin = r.skin ?? SKIN;
    const torso = typeof r.torso === "string" ? toon(r.torso) : r.torso;
    for (const [leg, x] of [[this.legL, -0.165], [this.legR, 0.165]] as const) {
      leg.position.set(x, 0.66, 0); g.add(leg);
      box(leg, 0.32, 0.66, 0.32, r.legs, 0, -0.33, 0);
    }
    box(g, 0.66, 0.66, 0.33, torso, 0, 0.99, 0);
    if (r.skirt) box(g, 0.7, 0.2, 0.37, r.skirt, 0, 0.62, 0);
    this.head = new THREE.Group(); this.head.position.y = 1.53; g.add(this.head);
    const hm = new THREE.Mesh(CYLG, toon(skin)); hm.scale.set(0.2, 0.26, 0.2); this.head.add(hm);
    for (const y of [-0.13, 0.13]) { const c = ball(this.head, 1, skin, 0, y, 0); c.scale.set(0.2, 0.06, 0.2); }
    const eyeM = r.eyeGlow ? glow(r.eyeGlow, 1.6) : toon(FACE);
    for (const x of [-0.068, 0.068]) {
      const e = ball(this.head, 1, eyeM, x, 0.035, 0.193); e.scale.set(0.024, 0.042, 0.01); this.eyes.push(e);
      const b = box(this.head, 0.06, 0.012, 0.008, FACE, x, 0.095, 0.193); b.visible = false; this.brows.push(b);
    }
    this.mouth = ball(this.head, 1, "#2a0c12", 0, -0.07, 0.195); this.mouth.scale.set(0.045, 0.01, 0.008);
    // seringai lebar (dipakai saat menyeramkan)
    this.grin = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 24, Math.PI), glow("#000000"));
    this.grin.position.set(0, -0.02, 0.19); this.grin.rotation.z = Math.PI; this.grin.scale.set(1, 0.8, 1); this.grin.visible = false; this.head.add(this.grin);
    if (r.face !== "none") {
      this.smile = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 6, 18, Math.PI), toon(FACE));
      this.smile.position.set(0, -0.035, 0.196); this.smile.rotation.z = Math.PI; this.head.add(this.smile);
    } else { this.mouth.visible = false; }
    if (r.hair) {
      box(this.head, 0.44, 0.12, 0.44, r.hair, 0, 0.17, -0.02);
      box(this.head, 0.44, 0.2, 0.08, r.hair, 0, 0.06, -0.21);
      if (r.hairLong) { box(this.head, 0.46, 0.5, 0.1, r.hair, 0, -0.12, -0.2); for (const x of [-0.215, 0.215]) box(this.head, 0.06, 0.42, 0.3, r.hair, x, -0.06, -0.06); }
    }
    for (const [arm, x] of [[this.armL, -0.495], [this.armR, 0.495]] as const) {
      arm.position.set(x, 1.24, 0); g.add(arm);
      if (r.sleeve) { box(arm, 0.325, 0.26, 0.325, r.sleeve, 0, -0.06, 0); box(arm, 0.32, 0.42, 0.32, skin, 0, -0.39, 0); }
      else box(arm, 0.32, 0.66, 0.32, skin, 0, -0.27, 0);
    }
    if (r.tag) {
      this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex(r.tag, r.tagColor), depthWrite: false, transparent: true }));
      this.tag.scale.set(0.9, 0.225, 1); this.tag.position.y = 2.05; g.add(this.tag);
    }
    g.scale.setScalar(r.s ?? 1);
  }
  /** wajah: buka mulut 0..1, takut 0..1, seram 0/1 (seringai lebar, mata hitam membesar) */
  wajah(open: number, takut = 0, seram = false) {
    const talk = open > 0.12;
    this.grin.visible = seram;
    this.grin.scale.set(1, 0.8 + 0.6 * open, 1);
    if (this.smile) this.smile.visible = !talk && !seram;
    this.mouth.visible = talk && !!this.smile && !seram;
    this.mouth.scale.set(0.045 - 0.01 * open, 0.01 + 0.045 * open, 0.008);
    const k = seram ? 1.6 : 1;
    this.eyes.forEach((e) => e.scale.set((0.024 + 0.008 * takut) * k, (0.042 + 0.014 * takut) * k, 0.01));
    this.brows.forEach((b, i) => { b.visible = takut > 0.05 && !seram; b.rotation.z = (i ? -1 : 1) * 0.45 * takut; b.position.y = 0.095 + 0.015 * takut; });
  }
}

// ---------------- dunia ----------------
const LH = 2.6; // tinggi kabin lift
const HALL_W = 1.5, HALL_H = 2.8, HALL_END = 17;
const DOOR_X_CLOSED = 0.31, DOOR_X_OPEN = 0.93;
// panel tombol di dinding kanan kabin (menghadap -x). Kanvas 260x660 px = 0,26 x 0,66 m
const PANEL = { x: 0.965, y: 1.15, z: 0.55, w: 0.26, h: 0.66 };
const PW = 260, PH = 660;
const NUMS = [20, 19, 18, 17, 16, 15, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // tidak ada 13
const btnPx = (n: number | "open" | "close" | "alarm"): [number, number] => {
  if (n === "open") return [85, 560];
  if (n === "close") return [175, 560];
  if (n === "alarm") return [130, 622];
  const i = NUMS.indexOf(n);
  return [i % 2 ? 175 : 85, 50 + Math.floor(i / 2) * 50];
};
export const btnWorld = (n: Parameters<typeof btnPx>[0]): V3 => {
  const [cx, cy] = btnPx(n);
  return [PANEL.x - 0.012, PANEL.y + PANEL.h / 2 - (cy / PH) * PANEL.h, PANEL.z - PANEL.w / 2 + (cx / PW) * PANEL.w];
};
const panelTex = (lit: (string | number)[]) => canvasTex(PW, PH, (g) => {
  g.fillStyle = "#b8bcc6"; g.fillRect(0, 0, PW, PH);
  g.strokeStyle = "#6f737d"; g.lineWidth = 6; g.strokeRect(3, 3, PW - 6, PH - 6);
  const drawBtn = (n: number | "open" | "close" | "alarm", label: string) => {
    const [cx, cy] = btnPx(n), on = lit.includes(n);
    g.fillStyle = "#4a4d55"; g.beginPath(); g.arc(cx, cy, 21, 0, Math.PI * 2); g.fill();
    g.fillStyle = n === "alarm" ? "#e0302a" : on ? "#ffd84a" : "#e8e9ee"; g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2); g.fill();
    g.fillStyle = on && n !== "alarm" ? "#5a3a00" : "#24262c"; g.font = `bold ${label.length > 2 ? 15 : 20}px Arial Black, Arial`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, cx, cy + 1);
  };
  NUMS.forEach((n) => drawBtn(n, String(n)));
  drawBtn("open", "<|>"); drawBtn("close", ">|<"); drawBtn("alarm", "🔔");
});
const DISP = new Map<string, THREE.Texture>();
const dispTex = (key: string, color: string, arrow: string) => {
  if (!DISP.has(key)) DISP.set(key, canvasTex(256, 128, (g) => {
    g.fillStyle = "#0b0a0e"; g.fillRect(0, 0, 256, 128);
    g.fillStyle = color; g.font = "bold 86px Courier New, monospace"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(arrow + key, 128, 68);
  }));
  return DISP.get(key)!;
};

export class World {
  root = new THREE.Group();
  lily: Orang;
  guests: { o: Orang; side: number; x: number; z: number; ph: number; cx: number; cz: number }[] = [];
  pov = new THREE.Group();
  povArm: { up: THREE.Mesh; fo: THREE.Mesh; hand: THREE.Mesh }[] = [];
  watch: THREE.Mesh; card: THREE.Mesh;
  doorL: THREE.Mesh; doorR: THREE.Mesh;
  panel: THREE.Mesh; panelTx: { base: THREE.Texture; p20: THREE.Texture; close: THREE.Texture };
  disp: THREE.Mesh;
  liftLight: THREE.PointLight; liftPanelGlow: THREE.Mesh;
  hallLights: { l: THREE.PointLight; bulb: THREE.Mesh }[] = [];
  lilyHand = new THREE.Group();
  faceLight: THREE.PointLight;

  constructor() {
    const R = this.root;
    R.add(new THREE.AmbientLight("#8f96c0", 0.3));
    R.add(new THREE.HemisphereLight("#ffe6c8", "#302838", 0.3));
    // ---------- kabin lift ----------
    const metal = "#a7adb8", wood = "#b98652";
    const floorT = canvasTex(256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#1e1e24" : "#e8e4da"; g.fillRect(i * 64, j * 64, 64, 64); } });
    floorT.magFilter = THREE.NearestFilter;
    const lf = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshToonMaterial({ map: floorT, gradientMap: RAMP })); lf.rotation.x = -Math.PI / 2; R.add(lf);
    box(R, 2, 0.08, 2, "#d9d6cf", 0, LH + 0.04, 0); // plafon
    this.liftPanelGlow = box(R, 1.0, 0.03, 1.0, glow("#fff6dc", 2.0), 0, LH - 0.01, 0);
    this.liftLight = new THREE.PointLight("#fff1d8", 3.2, 6, 1.2); this.liftLight.position.set(0, LH - 0.2, 0); R.add(this.liftLight);
    // dinding samping & belakang: atas logam, bawah kayu, pegangan
    for (const sx of [-1, 1]) {
      box(R, 0.06, LH, 2, metal, sx * 1.0, LH / 2, 0);
      box(R, 0.03, 1.0, 1.9, wood, sx * 0.97, 0.5, 0);
      box(R, 0.05, 0.05, 1.6, "#d8d8dc", sx * 0.92, 0.95, -0.05);
    }
    box(R, 2, LH, 0.06, metal, 0, LH / 2, -1.0);
    box(R, 1.9, 1.0, 0.03, wood, 0, 0.5, -0.97);
    box(R, 1.6, 0.05, 0.05, "#d8d8dc", 0, 0.95, -0.92);
    // dinding depan (di depan saku pintu) + ambang atas
    box(R, 0.4, LH, 0.06, metal, -0.8, LH / 2, 0.97); box(R, 0.4, LH, 0.06, metal, 0.8, LH / 2, 0.97);
    box(R, 1.2, LH - 2.2, 0.06, metal, 0, 2.2 + (LH - 2.2) / 2, 0.97);
    // pintu geser (di belakang dinding depan)
    this.doorL = box(R, 0.62, 2.2, 0.04, "#c9ced8", -DOOR_X_CLOSED, 1.1, 1.03);
    this.doorR = box(R, 0.62, 2.2, 0.04, "#c9ced8", DOOR_X_CLOSED, 1.1, 1.03);
    // panel tombol
    this.panelTx = { base: panelTex([]), p20: panelTex([20]), close: panelTex([20, "close"]) };
    box(R, 0.02, PANEL.h + 0.04, PANEL.w + 0.04, "#6f737d", PANEL.x + 0.012, PANEL.y, PANEL.z);
    this.panel = plane(R, PANEL.w, PANEL.h, new THREE.MeshBasicMaterial({ map: this.panelTx.base }), PANEL.x, PANEL.y, PANEL.z, -Math.PI / 2);
    plane(R, 0.22, 0.08, new THREE.MeshBasicMaterial({ map: signTex(["BLOCKY INN"], "#2a2c34", "#ffd84a", 256, 90, "bold 40px Arial Black, Arial", false) }), PANEL.x, PANEL.y + 0.42, PANEL.z, -Math.PI / 2);
    // layar lantai di atas pintu (menghadap ke dalam, -z)
    this.disp = plane(R, 0.36, 0.18, new THREE.MeshBasicMaterial({ map: dispTex("8", "#ff9a2a", "▲") }), 0, 2.4, 0.935, Math.PI);
    // poster di dinding belakang (kelihatan saat mundur)
    plane(R, 0.5, 0.36, new THREE.MeshBasicMaterial({ map: signTex(["ROOFTOP POOL", "FLOOR 20"], "#1f8fff", "#ffffff", 512, 360, "bold 60px Arial Black, Arial") }), -0.95, 1.6, -0.4, Math.PI / 2);

    // ---------- lorong lantai 13 ----------
    const carpet = canvasTex(256, 256, (g) => {
      g.fillStyle = "#5a1218"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#7a1c22";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) g.fillRect(i * 64 + 16, j * 64 + 16, 32, 32);
      g.fillStyle = "#c79a3a"; g.fillRect(0, 0, 10, 256); g.fillRect(246, 0, 10, 256);
    });
    carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(1, 6);
    const hf = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W * 2, HALL_END - 1.1), new THREE.MeshToonMaterial({ map: carpet, gradientMap: RAMP }));
    hf.rotation.x = -Math.PI / 2; hf.position.set(0, -0.001, (HALL_END + 1.1) / 2); R.add(hf);
    const paper = canvasTex(256, 256, (g) => { g.fillStyle = "#3e4a3a"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#33402f"; for (let i = 0; i < 8; i += 2) g.fillRect(i * 32, 0, 32, 256); });
    paper.wrapS = paper.wrapT = THREE.RepeatWrapping; paper.repeat.set(8, 1);
    const wallM = new THREE.MeshToonMaterial({ map: paper, gradientMap: RAMP });
    for (const sx of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(HALL_END - 1.1, HALL_H), wallM);
      w.position.set(sx * HALL_W, HALL_H / 2, (HALL_END + 1.1) / 2); w.rotation.y = -sx * Math.PI / 2; R.add(w);
      box(R, 0.04, 0.2, HALL_END - 1.1, "#2a1a14", sx * (HALL_W - 0.02), 0.1, (HALL_END + 1.1) / 2); // plint
    }
    box(R, HALL_W * 2, 0.06, HALL_END - 1.1, "#2a2420", 0, HALL_H, (HALL_END + 1.1) / 2);
    box(R, HALL_W * 2, HALL_H, 0.06, "#2c3528", 0, HALL_H / 2, HALL_END);
    plane(R, 0.6, 0.24, new THREE.MeshBasicMaterial({ map: signTex(["EXIT"], "#200608", "#ff3030", 256, 100, "bold 70px Arial Black, Arial") }), 0, 2.4, HALL_END - 0.04, Math.PI);
    // dinding sekitar pintu lift (sisi lorong) + angka 13 besar
    box(R, 0.9, HALL_H, 0.08, "#2c3528", -1.05, HALL_H / 2, 1.1); box(R, 0.9, HALL_H, 0.08, "#2c3528", 1.05, HALL_H / 2, 1.1);
    box(R, 1.2, HALL_H - 2.2, 0.08, "#2c3528", 0, 2.2 + (HALL_H - 2.2) / 2, 1.1);
    plane(R, 0.5, 0.36, new THREE.MeshBasicMaterial({ map: signTex(["13"], "#1a0c0c", "#d8c08a", 256, 180, "bold 130px Arial Black, Arial", false) }), 1.05, 1.6, 1.15);
    // pintu kamar 1301.. di kedua sisi
    for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) {
      const z = 3.4 + i * 3.6 + (sx > 0 ? 1.2 : 0);
      box(R, 0.06, 2.1, 0.95, "#4a2c1c", sx * (HALL_W - 0.03), 1.05, z);
      const num = 1301 + i * 2 + (sx > 0 ? 1 : 0);
      plane(R, 0.26, 0.12, new THREE.MeshBasicMaterial({ map: signTex([String(num)], "#c79a3a", "#2a1a10", 256, 120, "bold 70px Arial Black, Arial", false) }), sx * (HALL_W - 0.07), 1.65, z, -sx * Math.PI / 2);
      box(R, 0.05, 0.04, 0.1, "#d8b860", sx * (HALL_W - 0.07), 1.0, z - 0.32);
    }
    // lampu dinding merah redup
    for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) {
      const z = 2.0 + i * 3.4, x = sx * (HALL_W - 0.08);
      const bulb = box(R, 0.1, 0.16, 0.1, glow("#ffb08a", 2.0), x, 2.0, z);
      const l = new THREE.PointLight("#ff6a4a", 1.6, 4.5, 1.4); l.position.set(sx * (HALL_W - 0.3), 2.0, z); R.add(l);
      this.hallLights.push({ l, bulb });
    }
    // ---------- Lily ----------
    this.lily = new Orang({ torso: "#ff7eb6", legs: "#f4f0ea", skin: "#ffd9b3", skirt: "#ffffff", hair: "#6b3a1e", hairLong: true, tag: "Lily_xo", s: 0.92 });
    R.add(this.lily.g);
    // tangan Lily yang mencengkeram tepi pintu (muncul di shot tombol)
    R.add(this.lilyHand);
    for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(BOXG, toon("#ffd9b3")); t.scale.set(0.16, 0.038, 0.035); t.position.set(-0.06, i * 0.055, 0); this.lilyHand.add(t); }
    this.lilyHand.visible = false;
    this.faceLight = new THREE.PointLight("#ff8a6a", 0, 1.8, 1.2); this.faceLight.position.set(0, 1.75, 1.75); R.add(this.faceLight);
    // ---------- pemain yang berdiri menghadap tembok ----------
    const shirts = ["#2b2b33", "#3a2a30", "#262e3e", "#33302a", "#3d3d48", "#2e3a30"];
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1, z = 4.2 + Math.floor(i / 2) * 1.5 + (side > 0 ? 0.6 : 0);
      const o = new Orang({ torso: shirts[i % shirts.length], legs: "#1a1a20", skin: "#9a9ea8", face: "none", eyeGlow: "#ffffff", tag: i % 4 === 1 ? "Guest" : undefined, tagColor: "#ff4a4a", s: 0.95 + hh(i, 9) * 0.12 });
      R.add(o.g);
      // titik kumpul di belakang Lily (shot mundur)
      const cx = ((i % 5) - 2) * 0.55 + (hh(i, 3) - 0.5) * 0.15, cz = 2.6 + Math.floor(i / 5) * 0.75 + hh(i, 4) * 0.2;
      this.guests.push({ o, side, x: side * (HALL_W - 0.42), z, ph: hh(i, 2), cx, cz });
    }
    // ---------- tangan POV ----------
    R.add(this.pov);
    for (let i = 0; i < 2; i++) {
      const up = tube(this.pov, 0.055, "#0d69ac"), fo = tube(this.pov, 0.05, SKIN), hand = box(this.pov, 0.1, 0.1, 0.1, SKIN, 0, 0, 0);
      this.povArm.push({ up, fo, hand });
    }
    this.watch = plane(this.pov, 0.1, 0.07, new THREE.MeshBasicMaterial({ map: canvasTex(256, 180, (g) => {
      g.fillStyle = "#1b1d22"; g.fillRect(0, 0, 256, 180); g.fillStyle = "#7dff9a"; g.font = "bold 92px Courier New, monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("3:13", 128, 78);
      g.font = "bold 40px Courier New, monospace"; g.fillText("AM", 128, 148);
    }) }), 0, 0, 0);
    this.card = box(this.pov, 0.15, 0.1, 0.012, "#ffffff", 0, 0, 0);
    this.card.material = new THREE.MeshBasicMaterial({ map: signTex(["BLOCKY INN", "ROOM 2007"], "#1f6fd1", "#ffffff", 300, 200, "bold 40px Arial Black, Arial", false) });
  }

  // ---------------- per frame ----------------
  update(f: number, cam: THREE.PerspectiveCamera) {
    const c = camAt(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.03; cam.far = 100; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const t = f / FPS;
    // layar lantai: naik 8 -> 12, lalu lompat ke 13 merah
    const a2 = S0("g02");
    let key: string, col = "#ff9a2a", arr = "▲";
    if (f < a2 + 12) key = String(Math.min(12, 8 + Math.floor((f / Math.max(1, a2 + 12)) * 5)));
    else { key = "13"; col = "#ff2a2a"; arr = Math.floor(f / 8) % 2 ? "▼" : "▲"; if (f >= S0("g12") && Math.floor(f / 3) % 3 === 0) key = "??"; }
    (this.disp.material as THREE.MeshBasicMaterial).map = dispTex(key, col, arr);
    // panel: 20 menyala setelah ditekan, close menyala saat ditekan berulang
    const pressed20 = f >= 40;
    const closeOn = f >= S0("g12") && Math.floor((f - S0("g12")) / 4) % 2 === 0;
    (this.panel.material as THREE.MeshBasicMaterial).map = closeOn ? this.panelTx.close : pressed20 ? this.panelTx.p20 : this.panelTx.base;
    // lampu kabin: berkedip saat tiba di lantai 13, padam di shot tombol
    let lk = 1;
    if (f >= a2 + 8 && f < a2 + 30) lk = hh(Math.floor(f / 2), 3) > 0.5 ? 1 : 0.2;
    if (f >= S0("g12") + 30) lk = hh(Math.floor(f / 3), 7) > 0.85 ? 0.7 : 0.22;
    this.liftLight.intensity = 3.2 * lk;
    (this.liftPanelGlow.material as THREE.MeshBasicMaterial).color.set("#fff6dc").multiplyScalar(0.1 + 1.9 * lk);
    // lampu lorong: berkedip mulai shot lorong
    this.hallLights.forEach((h, i) => {
      let k = 1;
      if (f >= S0("g08")) k = hh(Math.floor(f / 2) + i * 13, 5) > 0.8 ? 0.15 : 1;
      if (f >= S0("g10") && f < S0("g10") + 6) k = 0.05;
      if (f >= S0("g12") + 30) k = i < 2 ? 0.7 : 0.1;
      h.l.intensity = 1.6 * k; (h.bulb.material as THREE.MeshBasicMaterial).color.set("#ffb08a").multiplyScalar(0.2 + 1.8 * k);
    });
    // pintu lift: terbuka di shot ding, menutup di shot tombol lalu tertahan tangan Lily
    const o4 = ease(span(f, S0("g04") + 8, S0("g04") + 30));
    const a12 = S0("g12");
    const shut = f >= a12 + 10 ? ease(span(f, a12 + 10, a12 + 34)) * 0.84 : 0;
    const open = o4 * (1 - shut);
    const dx = lerp(DOOR_X_CLOSED, DOOR_X_OPEN, open);
    this.doorL.position.x = -dx; this.doorR.position.x = dx;
    this.lilyHand.visible = f >= a12 + 30;
    if (this.lilyHand.visible) this.lilyHand.position.set(-dx + 0.31 - 0.02, 1.25, 0.99);
    this.faceLight.intensity = f >= a12 + 30 ? 2.2 : 0;
    this.poseLily(f, t, dx);
    this.poseGuests(f, t);
    this.posePov(f, t, cam);
  }

  poseLily(f: number, t: number, dx: number) {
    const Ly = this.lily;
    Ly.g.visible = f >= S0("g04") + 10 && f < FREEZE + 1;
    if (!Ly.g.visible) return;
    const near = f >= S0("g11") ? ease(span(f, S0("g11"), S0("g11") + 30)) : 0;
    const peek = f >= S0("g13") ? 1 : 0;
    const float = 0.28 + 0.04 * Math.sin(t * 2.2);
    const aside = ease(span(f, S0("g08"), S0("g08") + 20)) * (1 - ease(span(f, S0("g11"), S0("g11") + 10)));
    let z = lerp(1.85, 1.4, near), x = lerp(-0.15, -0.62, aside);
    if (f >= S0("g12") + 30) { z = 1.22; x = 0; }
    Ly.g.position.set(x, float, z);
    Ly.g.rotation.set(0, Math.PI, 0);
    const scary = f >= S0("g11");
    Ly.armL.rotation.set(scary ? 0 : -0.5 - 0.15 * Math.sin(t * 6), 0, 0);
    Ly.armR.rotation.set(scary ? 0 : -1.6 - 0.2 * Math.abs(Math.sin(t * 7)), 0, 0); // melambai minta pintu ditahan
    Ly.head.rotation.set(0, 0, scary ? 0.25 + 0.05 * Math.sin(t * 3) : 0.05 * Math.sin(t * 4));
    Ly.head.scale.set(1, peek ? 1.35 : 1, 1);
    Ly.legL.rotation.x = 0.1; Ly.legR.rotation.x = -0.05; // kaki menggantung
    Ly.wajah(mouthAt("lily", f) * 0.9, scary ? 0 : 0.7, scary);
    Ly.g.scale.setScalar(0.92);
    if (Ly.tag) {
      const m = Ly.tag.material as THREE.SpriteMaterial;
      m.opacity = f >= S0("g07") && hh(Math.floor(f / 2), 4) > 0.6 ? 0.25 : 1;
    }
  }

  poseGuests(f: number, t: number) {
    const turned = f >= S0("g10") + 6;
    const walk = f >= S0("g11") ? ease(span(f, S0("g11"), S0("g13") + 10)) : 0;
    this.guests.forEach((G, i) => {
      const o = G.o;
      o.g.visible = f >= S0("g04") + 10;
      const x = lerp(G.x, G.cx, walk), z = lerp(G.z, G.cz, walk);
      const moving = walk > 0 && walk < 1;
      o.g.position.set(x, moving ? 0.02 * Math.abs(Math.sin(t * 6 + G.ph * 6)) : 0, z);
      const bodyYaw = walk > 0.05 ? Math.PI : G.side * Math.PI / 2; // menghadap tembok, lalu berbalik ke lift
      o.g.rotation.set(0, lerp(G.side * Math.PI / 2, bodyYaw, ease(span(walk, 0, 0.25))), 0);
      // kepala menoleh serentak ke arah lift
      const snap = turned ? ease(span(f, S0("g10") + 6, S0("g10") + 9)) : 0;
      o.head.rotation.y = walk > 0.05 ? 0 : G.side * (Math.PI / 2) * snap;
      o.eyes.forEach((e) => (e.visible = turned));
      o.legL.rotation.x = moving ? 0.35 * Math.sin(t * 6 + G.ph * 6) : 0; o.legR.rotation.x = -o.legL.rotation.x;
      o.armL.rotation.x = moving ? -0.3 * Math.sin(t * 6 + G.ph * 6) : 0; o.armR.rotation.x = -o.armL.rotation.x;
    });
  }

  posePov(f: number, t: number, cam: THREE.PerspectiveCamera) {
    this.pov.position.copy(cam.position); this.pov.quaternion.copy(cam.quaternion); this.pov.updateMatrixWorld();
    const p = povAt(f, t, (v) => { const w = new THREE.Vector3(...v); this.pov.worldToLocal(w); return [w.x, w.y, w.z]; });
    const sh: V3[] = [[0.3, -0.5, 0.05], [-0.3, -0.5, 0.05]];
    [p.R, p.L].forEach((h, i) => {
      const A = this.povArm[i];
      const on = !!h;
      A.up.visible = A.fo.visible = A.hand.visible = on;
      if (!h) return;
      const el = lerp3(sh[i], h, 0.4);
      setTube(A.up, sh[i], el); setTube(A.fo, el, h);
      A.hand.position.set(...h); A.hand.quaternion.copy(A.fo.quaternion);
    });
    this.watch.visible = !!p.L && !!p.watch;
    if (p.L && p.watch) { const w = lerp3(lerp3(sh[1], p.L, 0.4), p.L, 0.72); this.watch.position.set(w[0], w[1] + 0.055, w[2] + 0.02); this.watch.rotation.set(-1.2, 0, 0); }
    this.card.visible = !!p.L && !!p.card;
    if (p.L && p.card) { this.card.position.set(p.L[0] + 0.04, p.L[1] + 0.07, p.L[2] - 0.03); this.card.rotation.set(-0.2, 0.3, -0.15); }
  }
}

export const mouthAt = (who: string, f: number) => {
  const l = LINES.find((x) => x.who === who && f >= x.start && f < x.end);
  return l ? l.mulut[f - l.start] ?? 0 : 0;
};

// ---------------- kamera per shot ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
const shake = (f: number, amp: number, sp = 1): V3 => [amp * (hh(Math.floor(f * sp), 1) - 0.5), amp * (hh(Math.floor(f * sp), 2) - 0.5), amp * (hh(Math.floor(f * sp), 3) - 0.5)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const breathe = (t: number, k = 1): V3 => [0.012 * k * Math.sin(t * 1.3), 0.018 * k * Math.sin(t * 2.1), 0];
const PANEL_C: V3 = [PANEL.x, PANEL.y, PANEL.z];

export const camAt = (fIn: number): Cam => {
  const f = Math.min(fIn, FREEZE), t = f / FPS, fov = 104;
  const sc = sceneAt(f);
  const face: V3 = [-0.15, 1.62, 1.75];
  switch (sc) {
    case "lift": {
      const u = ease(span(f, 60, 120));
      return { pos: add([-0.15, 1.6, -0.45], breathe(t)), look: lerp3(add(btnWorld(20), [0, 0.05, 0]), [0, 1.9, 1.0], u), fov, roll: 0.02 };
    }
    case "speaker": {
      const a = S0("g02"), u = ease(span(f, a, a + 20)), k = f >= a + 8 && f < a + 20 ? 1 : 0;
      return { pos: add([0, 1.55, -0.5], add(breathe(t), shake(f, 0.04 * k))), look: lerp3([0, 1.9, 1.0], [0, 2.35, 0.95], u), fov, roll: 0 };
    }
    case "panel": {
      const a = S0("g03"), u = ease(span(f, a, E0("g03")));
      return { pos: add(lerp3([0.0, 1.55, 0.0], [0.45, 1.5, 0.35], u), breathe(t)), look: lerp3([PANEL.x, 1.25, PANEL.z], btnWorld(12), u), fov: lerp(104, 88, u), roll: 0 };
    }
    case "ding": {
      const a = S0("g04"), k = Math.max(0, 1 - (f - a) / 14);
      return { pos: add([0, 1.6, -0.5], shake(f, 0.05 * k)), look: [0, 1.5, 4], fov, roll: 0 };
    }
    case "lily": {
      const a = S0("g05"), u = ease(span(f, a, E0("g05")));
      return { pos: add(lerp3([0, 1.6, -0.5], [0, 1.6, -0.1], u), breathe(t, 1.5)), look: face, fov, roll: 0 };
    }
    case "lily_tanya": {
      return { pos: add([0.1, 1.58, 0.0], breathe(t)), look: face, fov, roll: -0.04 };
    }
    case "kaki": {
      const a = S0("g07"), d = ease(span(f, a + 6, a + 26)), b = ease(span(f, E0("g07") - 10, E0("g07") + 6));
      return { pos: add(lerp3([0.05, 1.6, 0.1], [0.05, 1.3, 0.3], d), breathe(t)), look: lerp3(face, [-0.15, 0.25, 1.85], d * (1 - b * 0.6)), fov, roll: 0 };
    }
    case "lorong": {
      const a = S0("g08"), u = ease(span(f, a, a + 30));
      return { pos: add([0.25, 1.6, 0.3], breathe(t)), look: lerp3(face, [0.3, 1.4, 14], u), fov, roll: 0 };
    }
    case "tembok": {
      const a = S0("g09"), u = ease(span(f, a, S0("g10")));
      return { pos: add(lerp3([0.2, 1.6, 0.3], [0.3, 1.58, 0.8], u), breathe(t, 1.4)), look: [0.4, 1.45, 10], fov: lerp(104, 78, u), roll: 0.015 * Math.sin(t) };
    }
    case "menoleh": {
      const a = S0("g10"), p = ease(span(f, a + 6, a + 12));
      return { pos: add([0.3, 1.58, 0.8], shake(f, 0.03 * p * Math.max(0, 1 - (f - a - 12) / 20))), look: [0.4, 1.5, 10], fov: lerp(78, 62, p), roll: 0 };
    }
    case "tutup": {
      const a = S0("g11"), u = ease(span(f, a, a + 6));
      return { pos: add([0.1, 1.6, 0.1], breathe(t, 0.5)), look: lerp3([0.4, 1.5, 10], [-0.15, 1.65, 1.4], u), fov: lerp(62, 96, u), roll: 0 };
    }
    case "tombol": {
      const a = S0("g12"), u = ease(span(f, a, a + 6)), back = ease(span(f, a + 28, a + 36));
      return { pos: add(lerp3([0.35, 1.55, 0.3], [0.1, 1.6, -0.2], back), shake(f, 0.02 + 0.02 * back)), look: lerp3(lerp3([-0.15, 1.65, 1.4], btnWorld("close"), u), [0.0, 1.5, 1.3], back), fov, roll: 0 };
    }
    default: { // mundur
      const a = S0("g13");
      const p = lerp3([0.1, 1.6, -0.2], [-0.62, 1.5, -0.72], ease(span(f, a, a + 22)));
      return { pos: add(p, shake(f, 0.03)), look: [0.0, 1.55, 1.3], fov, roll: 0.03 * Math.sin(t * 3) };
    }
  }
};

export const sceneAt = (f: number) => {
  let s = LINES[0].scene;
  for (const l of LINES) if (f >= l.start - (l === LINES[0] ? 99 : 0)) s = l.scene;
  return s;
};

// ---------------- tangan POV per shot (ruang kamera: -z ke depan) ----------------
type Pov = { R: V3 | null; L: V3 | null; watch?: boolean; card?: boolean };
const povAt = (fIn: number, t: number, toLocal: (v: V3) => V3): Pov => {
  const f = Math.min(fIn, FREEZE), sc = sceneAt(f);
  const tr = (k: number): V3 => [0.006 * k * Math.sin(t * 23), 0.006 * k * Math.sin(t * 19 + 1), 0];
  const low = (k = 0): { R: V3; L: V3 } => ({ R: add([0.26, -0.52, -0.56], tr(k)), L: add([-0.26, -0.52, -0.56], tr(k)) });
  const up = (k = 1): { R: V3; L: V3 } => ({ R: add([0.2, -0.26, -0.58], tr(k)), L: add([-0.2, -0.28, -0.58], tr(k)) });
  const at = (w: V3, back = 0.06): V3 => { const p = toLocal([w[0] - back, w[1], w[2]]); return p; };
  switch (sc) {
    case "lift": {
      // tekan tombol 20, lalu tangan turun; tangan kiri memegang kartu kamar & jam
      const u = ease(span(f, 18, 36)) * (1 - ease(span(f, 46, 66)));
      return { R: lerp3([0.26, -0.5, -0.5], at(btnWorld(20)), u), L: [-0.24, -0.4, -0.55], watch: true, card: true };
    }
    case "speaker": case "panel": return { R: low(0.5).R, L: [-0.24, -0.42, -0.55], card: true };
    case "ding": case "lily": case "lily_tanya": case "kaki": return low(0.8);
    case "lorong": case "tembok": case "menoleh": return low(1.5);
    case "tutup": return up(1.5);
    case "tombol": {
      // menekan CLOSE berulang-ulang
      const a = S0("g12");
      if (f >= a + 30) return up(2.5);
      const press = Math.abs(Math.sin(((f - a) / 4) * Math.PI / 2));
      const reach = ease(span(f, a + 2, a + 8));
      return { R: lerp3([0.26, -0.5, -0.5], at(btnWorld("close"), 0.04 + 0.06 * press), reach), L: low(2).L };
    }
    default: return up(2.5);
  }
};
