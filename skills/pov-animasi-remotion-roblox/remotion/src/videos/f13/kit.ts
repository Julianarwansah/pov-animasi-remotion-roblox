// FLOOR 13 — perkakas bersama semua episode: util, material plastik Roblox, tokoh balok R6 (Orang),
// pembangun kabin lift + lorong hotel, timeline per episode, kamera & tangan POV.
import * as THREE from "three";

export const FPS = 30;
export type V3 = [number, number, number];

// ---------------- util ----------------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const lerp3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const hh = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const span = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const shake = (f: number, amp: number, sp = 1): V3 => [amp * (hh(Math.floor(f * sp), 1) - 0.5), amp * (hh(Math.floor(f * sp), 2) - 0.5), amp * (hh(Math.floor(f * sp), 3) - 0.5)];
export const breathe = (t: number, k = 1): V3 => [0.012 * k * Math.sin(t * 1.3), 0.018 * k * Math.sin(t * 2.1), 0];

// ---------------- timeline per episode ----------------
export type Line = { id: string; scene: string; who: string | null; text: string | null; start: number; end: number; mulut: number[] };
export const makeTL = (TL: unknown) => {
  const LINES = (TL as { baris: Line[] }).baris, TOTAL = (TL as { total: number }).total;
  const L = (id: string) => { const l = LINES.find((x) => x.id === id); if (!l) throw new Error("baris " + id); return l; };
  const S0 = (id: string) => L(id).start, E0 = (id: string) => L(id).end;
  const sceneAt = (f: number) => { let s = LINES[0].scene; for (const l of LINES) if (f >= l.start - (l === LINES[0] ? 99 : 0)) s = l.scene; return s; };
  const mouthAt = (who: string, f: number) => { const l = LINES.find((x) => x.who === who && f >= x.start && f < x.end); return l ? l.mulut[f - l.start] ?? 0 : 0; };
  return { LINES, TOTAL, S0, E0, sceneAt, mouthAt };
};
export type TLx = ReturnType<typeof makeTL>;

// ---------------- material & bentuk ----------------
export const RAMP = (() => {
  const t = new THREE.DataTexture(new Uint8Array([110, 170, 225, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const MAT = new Map<string, THREE.Material>();
export const toon = (c: string) => {
  if (!MAT.has(c)) MAT.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: RAMP }));
  return MAT.get(c)!;
};
export const glow = (c: string, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: true });
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
export const BOXG = new THREE.BoxGeometry(1, 1, 1);
export const CYLG = new THREE.CylinderGeometry(1, 1, 1, 24);
export const SPHG = new THREE.SphereGeometry(1, 32, 20);
export const box = (p: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material | string, x: number, y: number, z: number) => {
  const o = new THREE.Mesh(BOXG, typeof m === "string" ? toon(m) : m);
  o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o;
};
export const ball = (p: THREE.Object3D, r: number, m: THREE.Material | string, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(SPHG, typeof m === "string" ? toon(m) : m);
  o.scale.setScalar(r); o.position.set(x, y, z); p.add(o); return o;
};
const UP = new THREE.Vector3(0, 1, 0);
export const tube = (p: THREE.Object3D, r: number, m: THREE.Material | string) => {
  const o = new THREE.Mesh(BOXG, typeof m === "string" ? toon(m) : m); o.userData.r = r; p.add(o); return o;
};
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
export const setTube = (o: THREE.Mesh, a: V3, b: V3) => {
  _a.set(...a); _b.set(...b);
  const len = _a.distanceTo(_b);
  o.position.copy(_a).add(_b).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(UP, _b.sub(_a).normalize());
  o.scale.set(o.userData.r * 2, len, o.userData.r * 2);
};
export const plane = (p: THREE.Object3D, w: number, h: number, m: THREE.Material, x: number, y: number, z: number, ry = 0) => {
  const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.y = ry; p.add(o); return o;
};
export const signTex = (lines: string[], bg: string, fg: string, w = 512, h = 256, font = "bold 84px Arial Black, Arial", border = true) => canvasTex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (border) { g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20); }
  g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (h / (lines.length + 0.6))));
});
export const tagTex = (name: string, color = "#ffffff") => canvasTex(512, 128, (g) => {
  g.font = "bold 64px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 10; g.strokeStyle = "rgba(0,0,0,0.85)"; g.strokeText(name, 256, 64);
  g.fillStyle = color; g.fillText(name, 256, 64);
});

// ---------------- tokoh balok R6 ----------------
export const SKIN = "#f5cd30";
export const GUEST_SKIN = "#9a9ea8";
const FACE = "#111014";
export type Rupa = { torso: string | THREE.Material; legs: string; skin?: string; sleeve?: string; hair?: string; hairLong?: boolean; skirt?: string; face?: "smile" | "none"; eyeGlow?: string; tag?: string; tagColor?: string; s?: number };
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
    g.userData.dyn = r.tag ?? "orang";
  }
  /** wajah: buka mulut 0..1, takut 0..1, seram (seringai lebar, mata membesar) */
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
export const makeLily = () => new Orang({ torso: "#ff7eb6", legs: "#f4f0ea", skin: "#ffd9b3", skirt: "#ffffff", hair: "#6b3a1e", hairLong: true, tag: "Lily_xo", s: 0.92 });
/** avatar pemain sendiri (noob klasik) */
export const makeNoob = (tag?: string) => { const o = new Orang({ torso: "#0d69ac", legs: "#a4bd47", tag }); o.g.userData.dyn = "kembaran"; return o; };

// ---------------- kabin lift ----------------
export const LH = 2.6;
export const DOOR_X_CLOSED = 0.31, DOOR_X_OPEN = 0.93;
export const PANEL = { x: 0.965, y: 1.15, z: 0.55, w: 0.26, h: 0.66 };
const PW = 260, PH = 660;
const NUMS = [20, 19, 18, 17, 16, 15, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
type Btn = number | "open" | "close" | "alarm";
const btnPx = (n: Btn): [number, number] => {
  if (n === "open") return [85, 560];
  if (n === "close") return [175, 560];
  if (n === "alarm") return [130, 622];
  const i = NUMS.indexOf(n);
  return [i % 2 ? 175 : 85, 50 + Math.floor(i / 2) * 50];
};
export const btnWorld = (n: Btn): V3 => {
  const [cx, cy] = btnPx(n);
  return [PANEL.x - 0.012, PANEL.y + PANEL.h / 2 - (cy / PH) * PANEL.h, PANEL.z - PANEL.w / 2 + (cx / PW) * PANEL.w];
};
const panelTex = (lit: Btn[]) => canvasTex(PW, PH, (g) => {
  g.fillStyle = "#b8bcc6"; g.fillRect(0, 0, PW, PH);
  g.strokeStyle = "#6f737d"; g.lineWidth = 6; g.strokeRect(3, 3, PW - 6, PH - 6);
  const drawBtn = (n: Btn, label: string) => {
    const [cx, cy] = btnPx(n), on = lit.includes(n);
    if (on && n === "alarm") { g.fillStyle = "rgba(255,80,60,0.5)"; g.beginPath(); g.arc(cx, cy, 30, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#4a4d55"; g.beginPath(); g.arc(cx, cy, 21, 0, Math.PI * 2); g.fill();
    g.fillStyle = n === "alarm" ? (on ? "#ff8a70" : "#e0302a") : on ? "#ffd84a" : "#e8e9ee"; g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2); g.fill();
    g.fillStyle = on && n !== "alarm" ? "#5a3a00" : "#24262c"; g.font = `bold ${label.length > 2 ? 15 : 20}px Arial Black, Arial`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, cx, cy + 1);
  };
  NUMS.forEach((n) => drawBtn(n, String(n)));
  drawBtn("open", "<|>"); drawBtn("close", ">|<"); drawBtn("alarm", "🔔");
  // kisi speaker interkom
  g.fillStyle = "#3a3d45"; for (let i = 0; i < 5; i++) g.fillRect(40, 588 + i * 6, 30, 3);
});
const DISP = new Map<string, THREE.Texture>();
export const dispTex = (key: string, color: string, arrow: string) => {
  const k = key + color + arrow;
  if (!DISP.has(k)) DISP.set(k, canvasTex(256, 128, (g) => {
    g.fillStyle = "#0b0a0e"; g.fillRect(0, 0, 256, 128);
    g.fillStyle = color; g.font = "bold 86px Courier New, monospace"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(arrow + key, 128, 68);
  }));
  return DISP.get(k)!;
};
export type Lift = {
  doorL: THREE.Mesh; doorR: THREE.Mesh; panel: THREE.Mesh; tx: { base: THREE.Texture; p20: THREE.Texture; close: THREE.Texture; alarm: THREE.Texture };
  disp: THREE.Mesh; light: THREE.PointLight; glowPanel: THREE.Mesh; hatch: THREE.Group; hatchGlow: THREE.Mesh;
  setDoors: (open: number) => number; setLight: (k: number) => void; setDisp: (key: string, color?: string, arrow?: string) => void;
};
/** kabin lift di titik asal, pintu menghadap +z. chimney: lubang gelap di atas palka (tanpa lubang lift penuh) */
export const buildLift = (R: THREE.Object3D, chimney = true): Lift => {
  const metal = "#a7adb8", wood = "#b98652";
  const floorT = canvasTex(256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#1e1e24" : "#e8e4da"; g.fillRect(i * 64, j * 64, 64, 64); } });
  floorT.magFilter = THREE.NearestFilter;
  const lf = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshToonMaterial({ map: floorT, gradientMap: RAMP })); lf.rotation.x = -Math.PI / 2; R.add(lf);
  // plafon dengan lubang palka (x 0.15..0.75, z -0.75..-0.15)
  const cy = LH + 0.04, cc = "#d9d6cf";
  box(R, 1.15, 0.08, 2, cc, -0.425, cy, 0); box(R, 0.25, 0.08, 2, cc, 0.875, cy, 0);
  box(R, 0.6, 0.08, 0.25, cc, 0.45, cy, -0.875); box(R, 0.6, 0.08, 1.15, cc, 0.45, cy, 0.425);
  const glowPanel = box(R, 0.7, 0.03, 0.7, glow("#fff6dc", 2.0), -0.3, LH - 0.01, 0.25);
  const light = new THREE.PointLight("#fff1d8", 3.2, 6, 1.2); light.position.set(0, LH - 0.2, 0); R.add(light);
  const hatch = new THREE.Group(); hatch.position.set(0.15, LH + 0.01, -0.45); R.add(hatch);
  box(hatch, 0.6, 0.04, 0.6, "#8f949e", 0.3, 0, 0);
  box(hatch, 0.04, 0.03, 0.2, "#3a3d45", 0.5, -0.03, 0);
  const hatchGlow = box(R, 0.58, 0.02, 0.58, glow("#ffffff", 0), 0.45, LH + 0.9, -0.45);
  if (chimney) {
    const k = glow("#040406");
    box(R, 0.04, 1.0, 0.64, k, 0.13, LH + 0.5, -0.45); box(R, 0.04, 1.0, 0.64, k, 0.77, LH + 0.5, -0.45);
    box(R, 0.64, 1.0, 0.04, k, 0.45, LH + 0.5, -0.77); box(R, 0.64, 1.0, 0.04, k, 0.45, LH + 0.5, -0.13);
    box(R, 0.64, 0.04, 0.64, k, 0.45, LH + 1.0, -0.45);
  }
  for (const sx of [-1, 1]) {
    box(R, 0.06, LH, 2, metal, sx * 1.0, LH / 2, 0);
    box(R, 0.03, 1.0, 1.9, wood, sx * 0.97, 0.5, 0);
    box(R, 0.05, 0.05, 1.6, "#d8d8dc", sx * 0.92, 0.95, -0.05);
  }
  box(R, 2, LH, 0.06, metal, 0, LH / 2, -1.0);
  box(R, 1.9, 1.0, 0.03, wood, 0, 0.5, -0.97);
  box(R, 1.6, 0.05, 0.05, "#d8d8dc", 0, 0.95, -0.92);
  box(R, 0.4, LH, 0.06, metal, -0.8, LH / 2, 0.97); box(R, 0.4, LH, 0.06, metal, 0.8, LH / 2, 0.97);
  box(R, 1.2, LH - 2.2, 0.06, metal, 0, 2.2 + (LH - 2.2) / 2, 0.97);
  const doorL = box(R, 0.62, 2.2, 0.04, "#c9ced8", -DOOR_X_CLOSED, 1.1, 1.03);
  const doorR = box(R, 0.62, 2.2, 0.04, "#c9ced8", DOOR_X_CLOSED, 1.1, 1.03);
  const tx = { base: panelTex([]), p20: panelTex([20]), close: panelTex([20, "close"]), alarm: panelTex([20, "alarm"]) };
  box(R, 0.02, PANEL.h + 0.04, PANEL.w + 0.04, "#6f737d", PANEL.x + 0.012, PANEL.y, PANEL.z);
  const panel = plane(R, PANEL.w, PANEL.h, new THREE.MeshBasicMaterial({ map: tx.p20 }), PANEL.x, PANEL.y, PANEL.z, -Math.PI / 2);
  plane(R, 0.22, 0.08, new THREE.MeshBasicMaterial({ map: signTex(["BLOCKY INN"], "#2a2c34", "#ffd84a", 256, 90, "bold 40px Arial Black, Arial", false) }), PANEL.x, PANEL.y + 0.42, PANEL.z, -Math.PI / 2);
  const disp = plane(R, 0.36, 0.18, new THREE.MeshBasicMaterial({ map: dispTex("13", "#ff2a2a", "▲") }), 0, 2.4, 0.935, Math.PI);
  plane(R, 0.5, 0.36, new THREE.MeshBasicMaterial({ map: signTex(["ROOFTOP POOL", "FLOOR 20"], "#1f8fff", "#ffffff", 512, 360, "bold 60px Arial Black, Arial") }), -0.95, 1.6, -0.4, Math.PI / 2);
  return {
    doorL, doorR, panel, tx, disp, light, glowPanel, hatch, hatchGlow,
    setDoors: (open: number) => { const dx = lerp(DOOR_X_CLOSED, DOOR_X_OPEN, open); doorL.position.x = -dx; doorR.position.x = dx; return dx; },
    setLight: (k: number) => { light.intensity = 3.2 * k; (glowPanel.material as THREE.MeshBasicMaterial).color.set("#fff6dc").multiplyScalar(0.1 + 1.9 * k); },
    setDisp: (key: string, color = "#ff2a2a", arrow = "▲") => { (disp.material as THREE.MeshBasicMaterial).map = dispTex(key, color, arrow); },
  };
};

// ---------------- lorong hotel ----------------
export type HallOpt = { y?: number; floor: number; carpet: [string, string]; paper: [string, string]; lamp: string; lampK?: number; ceil?: string; plint?: string; door?: string };
export type Hall = { lights: { l: THREE.PointLight; bulb: THREE.Mesh }[]; setLights: (fn: (i: number) => number) => void; doors: Map<number, THREE.Mesh>; g: THREE.Group };
export const HALL_W = 1.5, HALL_H = 2.8, HALL_END = 17;
/** lorong x -1.5..1.5, z 1.1..17 di ketinggian y; pintu kamar <floor>01.. di kedua sisi */
export const buildHall = (R: THREE.Object3D, o: HallOpt): Hall => {
  const g = new THREE.Group(); g.position.y = o.y ?? 0; R.add(g);
  const carpet = canvasTex(256, 256, (c) => {
    c.fillStyle = o.carpet[0]; c.fillRect(0, 0, 256, 256); c.fillStyle = o.carpet[1];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillRect(i * 64 + 16, j * 64 + 16, 32, 32);
    c.fillStyle = "#c79a3a"; c.fillRect(0, 0, 10, 256); c.fillRect(246, 0, 10, 256);
  });
  carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(1, 6);
  const hf = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W * 2, HALL_END - 1.1), new THREE.MeshToonMaterial({ map: carpet, gradientMap: RAMP }));
  hf.rotation.x = -Math.PI / 2; hf.position.set(0, -0.001, (HALL_END + 1.1) / 2); g.add(hf);
  const paper = canvasTex(256, 256, (c) => { c.fillStyle = o.paper[0]; c.fillRect(0, 0, 256, 256); c.fillStyle = o.paper[1]; for (let i = 0; i < 8; i += 2) c.fillRect(i * 32, 0, 32, 256); });
  paper.wrapS = paper.wrapT = THREE.RepeatWrapping; paper.repeat.set(8, 1);
  const wallM = new THREE.MeshToonMaterial({ map: paper, gradientMap: RAMP });
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(HALL_END - 1.1, HALL_H), wallM);
    w.position.set(sx * HALL_W, HALL_H / 2, (HALL_END + 1.1) / 2); w.rotation.y = -sx * Math.PI / 2; g.add(w);
    box(g, 0.04, 0.2, HALL_END - 1.1, o.plint ?? "#2a1a14", sx * (HALL_W - 0.02), 0.1, (HALL_END + 1.1) / 2);
  }
  box(g, HALL_W * 2, 0.06, HALL_END - 1.1, o.ceil ?? "#2a2420", 0, HALL_H, (HALL_END + 1.1) / 2);
  box(g, HALL_W * 2, HALL_H, 0.06, o.paper[0], 0, HALL_H / 2, HALL_END);
  plane(g, 0.6, 0.24, new THREE.MeshBasicMaterial({ map: signTex(["EXIT"], "#200608", "#ff3030", 256, 100, "bold 70px Arial Black, Arial") }), 0, 2.4, HALL_END - 0.04, Math.PI);
  box(g, 0.9, HALL_H, 0.08, o.paper[0], -1.05, HALL_H / 2, 1.1); box(g, 0.9, HALL_H, 0.08, o.paper[0], 1.05, HALL_H / 2, 1.1);
  box(g, 1.2, HALL_H - 2.2, 0.08, o.paper[0], 0, 2.2 + (HALL_H - 2.2) / 2, 1.1);
  plane(g, 0.5, 0.36, new THREE.MeshBasicMaterial({ map: signTex([String(o.floor)], "#1a0c0c", "#d8c08a", 256, 180, "bold 130px Arial Black, Arial", false) }), 1.05, 1.6, 1.15);
  const doors = new Map<number, THREE.Mesh>();
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) {
    const z = 3.4 + i * 3.6 + (sx > 0 ? 1.2 : 0);
    const num = o.floor * 100 + 1 + i * 2 + (sx > 0 ? 1 : 0);
    const d = box(g, 0.06, 2.1, 0.95, o.door ?? "#4a2c1c", sx * (HALL_W - 0.03), 1.05, z); doors.set(num, d);
    plane(g, 0.26, 0.12, new THREE.MeshBasicMaterial({ map: signTex([String(num)], "#c79a3a", "#2a1a10", 256, 120, "bold 70px Arial Black, Arial", false) }), sx * (HALL_W - 0.07), 1.65, z, -sx * Math.PI / 2);
    box(g, 0.05, 0.04, 0.1, "#d8b860", sx * (HALL_W - 0.07), 1.0, z - 0.32);
  }
  const lights: Hall["lights"] = [];
  const K = o.lampK ?? 1.6;
  for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) {
    const z = 2.0 + i * 3.4, x = sx * (HALL_W - 0.08);
    const bulb = box(g, 0.1, 0.16, 0.1, glow("#ffd0a0", 2.0), x, 2.0, z);
    const l = new THREE.PointLight(o.lamp, K, 4.5, 1.4); l.position.set(sx * (HALL_W - 0.3), 2.0, z); g.add(l);
    lights.push({ l, bulb });
  }
  return {
    lights, doors, g,
    setLights: (fn) => lights.forEach((h, i) => { const k = fn(i); h.l.intensity = K * k; (h.bulb.material as THREE.MeshBasicMaterial).color.set("#ffd0a0").multiplyScalar(0.2 + 1.8 * k); }),
  };
};

// ---------------- tangan POV ----------------
export type Pov = { R: V3 | null; L: V3 | null; watch?: boolean };
export class PovArms {
  g = new THREE.Group();
  arms: { up: THREE.Mesh; fo: THREE.Mesh; hand: THREE.Mesh }[] = [];
  skinMat = new THREE.MeshToonMaterial({ color: SKIN, gradientMap: RAMP });
  constructor(R: THREE.Object3D) {
    R.add(this.g); this.g.userData.dyn = "tangan POV";
    for (let i = 0; i < 2; i++) {
      const up = tube(this.g, 0.055, "#0d69ac"), fo = tube(this.g, 0.05, this.skinMat), hand = box(this.g, 0.1, 0.1, 0.1, this.skinMat, 0, 0, 0);
      this.arms.push({ up, fo, hand });
    }
  }
  /** warna kulit tangan (untuk berubah jadi Guest) */
  setSkin(c: THREE.ColorRepresentation) { this.skinMat.color.set(c); }
  local(cam: THREE.Camera) {
    this.g.position.copy(cam.position); this.g.quaternion.copy(cam.quaternion); this.g.updateMatrixWorld();
    return (v: V3): V3 => { const w = new THREE.Vector3(...v); this.g.worldToLocal(w); return [w.x, w.y, w.z]; };
  }
  pose(p: Pov) {
    const sh: V3[] = [[0.3, -0.5, 0.05], [-0.3, -0.5, 0.05]];
    [p.R, p.L].forEach((h, i) => {
      const A = this.arms[i];
      A.up.visible = A.fo.visible = A.hand.visible = !!h;
      if (!h) return;
      const el = lerp3(sh[i], h, 0.4);
      setTube(A.up, sh[i], el); setTube(A.fo, el, h);
      A.hand.position.set(...h); A.hand.quaternion.copy(A.fo.quaternion);
    });
  }
}
export const povLow = (t: number, k = 0): { R: V3; L: V3 } => {
  const tr: V3 = [0.006 * k * Math.sin(t * 23), 0.006 * k * Math.sin(t * 19 + 1), 0];
  return { R: add([0.26, -0.52, -0.56], tr), L: add([-0.26, -0.52, -0.56], tr) };
};
export const povUp = (t: number, k = 1): { R: V3; L: V3 } => {
  const tr: V3 = [0.006 * k * Math.sin(t * 23), 0.006 * k * Math.sin(t * 19 + 1), 0];
  return { R: add([0.2, -0.26, -0.58], tr), L: add([-0.2, -0.28, -0.58], tr) };
};

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export const applyCam = (cam: THREE.PerspectiveCamera, c: Cam) => {
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
  cam.fov = c.fov; cam.near = 0.03; cam.far = 120; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
};
