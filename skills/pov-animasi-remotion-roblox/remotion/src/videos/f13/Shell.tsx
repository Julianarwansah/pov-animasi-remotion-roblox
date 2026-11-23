// FLOOR 13 — lapisan film bersama Part 2 dst. Layar BERSIH: tanpa chat/daftar pemain/judul di atas.
// Isi: dunia 3D (tinta tipis -> tone mapping -> fisheye), vinyet, kilat, denyut merah, caption tengah, teks bunyi,
// kartu pilihan A/B (atau komponen akhir sendiri untuk episode terakhir).
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadFont } from "@remotion/fonts";
import { InkPass, noInkFallback } from "../rbx1/ink";
import { FisheyeEffect } from "../rbx1/fisheye";
import { FPS, Line } from "./kit";

const W = 1080, H = 1920;
export const FAMILY = "Fredoka";
export type WorldLike = { root: THREE.Object3D; update: (f: number, cam: THREE.PerspectiveCamera) => void };

const Inner: React.FC<{ f: number; make: () => WorldLike }> = ({ f, make }) => {
  const { camera, scene } = useThree();
  const world = useMemo(() => make(), [make]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera, { color: "#15131c", widthNear: 3.2, widthFar: 2.0, distNear: 2, distFar: 40 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    fish: new FisheyeEffect(0.36, W / H),
  }), [camera, scene]);
  world.update(f, camera as THREE.PerspectiveCamera);
  noInkFallback(world.root);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
        <primitive object={fx.fish} dispose={null} />
      </EffectComposer>
    </>
  );
};

let fontP: Promise<void> | null = null;
const useFont = () => {
  const [h] = useState(() => delayRender("font"));
  useEffect(() => { fontP ??= loadFont({ family: FAMILY, url: staticFile("fonts/Fredoka-Bold.ttf"), weight: "700" }); fontP.then(() => continueRender(h), () => continueRender(h)); }, [h]);
};

const STYLE: Record<string, { color: string; italic?: boolean }> = {
  noob: { color: "#ffffff" }, lily: { color: "#ff9ed2" }, lift: { color: "#8fd3ff", italic: true }, desk: { color: "#ffd27a", italic: true }, tiruan: { color: "#ff6a6a", italic: true },
};
export const txt = (color: string, size: number, italic = false): React.CSSProperties => ({
  fontFamily: `${FAMILY}, Arial Black, sans-serif`, fontWeight: 700, fontSize: size, lineHeight: 1.12, color, fontStyle: italic ? "italic" : "normal",
  textAlign: "center", WebkitTextStroke: "3px #0b0710", paintOrder: "stroke fill", textShadow: "0 5px 14px rgba(0,0,0,0.85)",
});

const Caption: React.FC<{ f: number; lines: Line[] }> = ({ f, lines }) => {
  const l = lines.find((x) => x.text && f >= x.start && f < x.end + 4);
  if (!l || !l.text) return null;
  const words = l.text.split(/\s+/), chunks: string[][] = [];
  for (let i = 0; i < words.length; i += 4) chunks.push(words.slice(i, i + 4));
  const u = Math.min(0.999, (f - l.start) / Math.max(1, l.end - l.start));
  const total = l.text.length; let acc = 0, k = 0;
  for (let i = 0; i < chunks.length; i++) { const len = chunks[i].join(" ").length + 1; if (acc / total <= u) k = i; acc += len; }
  const st = STYLE[l.who ?? "noob"] ?? STYLE.noob;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: H * 0.2 }}>
      <div style={{ ...txt(st.color, 66, st.italic), maxWidth: W * 0.82 }}>{chunks[k].join(" ")}</div>
    </AbsoluteFill>
  );
};

export type Bunyi = { a: number; b: number; text: string };
const BunyiFx: React.FC<{ f: number; list: Bunyi[] }> = ({ f, list }) => {
  const b = list.find((x) => f >= x.a && f < x.b);
  if (!b) return null;
  const j = (f % 4) - 1.5;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: H * 0.2 }}>
      <div style={{ ...txt("#ff4a4a", 80, true), transform: `translate(${j * 2}px, ${-j * 1.5}px) rotate(-4deg)` }}>{b.text}</div>
    </AbsoluteFill>
  );
};

export type Opsi = { bg: string; icon: string; label: string };
const Tombol: React.FC<Opsi & { s: number }> = ({ bg, icon, label, s }) => (
  <div style={{ width: 880, padding: "34px 40px", borderRadius: 20, background: bg, display: "flex", alignItems: "center", gap: 30, transform: `scale(${s})`,
    boxShadow: "0 12px 0 rgba(0,0,0,0.35), inset 0 -8px 0 rgba(0,0,0,0.18), 0 0 0 5px rgba(255,255,255,0.85)" }}>
    <span style={{ fontSize: 76 }}>{icon}</span>
    <span style={{ ...txt("#ffffff", 64), textAlign: "left", WebkitTextStroke: "2px #0b0710" }}>{label}</span>
  </div>
);
const Pilihan: React.FC<{ f: number; a: number; A: Opsi; B: Opsi }> = ({ f, a, A, B }) => {
  if (f < a) return null;
  const k = (f - a) / FPS, pop = (d: number) => Math.min(1, Math.max(0, (k - d) / 0.25)), sc = (d: number) => 0.6 + 0.4 * pop(d) + 0.05 * Math.sin(Math.min(1, pop(d)) * Math.PI);
  return (
    <AbsoluteFill style={{ background: `rgba(8,6,14,${0.55 * Math.min(1, k / 0.4)})`, alignItems: "center", justifyContent: "center", gap: 34 }}>
      <div style={{ ...txt("#ffffff", 104), opacity: pop(0), transform: `scale(${sc(0)})` }}>WHAT WOULD<br />YOU DO?</div>
      <div style={{ opacity: pop(0.35) }}><Tombol {...A} s={sc(0.35)} /></div>
      <div style={{ ...txt("#ffd84a", 60), opacity: pop(0.6) }}>OR</div>
      <div style={{ opacity: pop(0.8) }}><Tombol {...B} s={sc(0.8)} /></div>
      <div style={{ ...txt("#ffffff", 48), opacity: pop(1.3), marginTop: 20 }}>Comment below 👇<br /><span style={{ color: "#ffd84a", fontSize: 40 }}>The next part follows your choice</span></div>
    </AbsoluteFill>
  );
};

export type FilmCfg = {
  make: () => WorldLike; lines: Line[]; freeze: number; cold: number; coldFrame: (f: number) => number;
  bunyi: Bunyi[]; flashes: number[]; pulse: { a: number; strong: number; b: number };
  /** frame mulai lapisan akhir (kartu pilihan / komponen akhir); caption & bunyi berhenti di sini */
  endAt: number; pilihan?: { A: Opsi; B: Opsi }; Ending?: React.FC<{ f: number }>;
  extra?: React.FC<{ f: number }>;
  /** bayangan asli (shadow map) */
  shadows?: boolean;
  /** lapisan warna dingin di atas gambar (0 = mati) */
  tint?: number;
};
export const makeFilm = (c: FilmCfg): React.FC => () => {
  const f = useCurrentFrame();
  useFont();
  const cold = f < c.cold;
  const f3 = cold ? c.coldFrame(f) : Math.min(f, c.freeze);
  const flash = (a: number) => (f >= a && f < a + 4 ? [0.8, 0.5, 0.25, 0.1][f - a] : 0);
  const fl = Math.max(flash(0), ...c.flashes.map(flash));
  const strong = f >= c.pulse.strong;
  const pulse = cold ? 0.6 : f >= c.pulse.a && f < c.pulse.b ? (strong ? 0.55 : 0.3) * Math.pow(Math.abs(Math.sin((f / FPS) * Math.PI * (strong ? 2.4 : 1.6))), 3) : 0;
  const Extra = c.extra;
  return (
    <AbsoluteFill style={{ background: "#05060c" }}>
      <ThreeCanvas shadows={c.shadows ? "soft" : false} width={W} height={H} gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 104, near: 0.03, far: 120 }}>
        <Inner f={f3} make={c.make} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "#1c2a55", mixBlendMode: "multiply", opacity: c.tint ?? 0.22 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 62% at 50% 50%, rgba(0,0,0,0) 55%, rgba(3,2,8,0.65) 100%)" }} />
      {pulse > 0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 58% at 50% 50%, rgba(0,0,0,0) 45%, rgba(150,8,14,0.9) 100%)", opacity: pulse }} /> : null}
      {fl > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: fl }} /> : null}
      {cold && f >= c.cold - 6 ? <AbsoluteFill style={{ background: "#000" }} /> : null}
      {Extra ? <Extra f={f} /> : null}
      {f < c.endAt ? <Caption f={f} lines={c.lines} /> : null}
      {f < c.endAt ? <BunyiFx f={f} list={c.bunyi} /> : null}
      {c.pilihan ? <Pilihan f={f} a={c.endAt} A={c.pilihan.A} B={c.pilihan.B} /> : null}
      {c.Ending && f >= c.endAt ? <c.Ending f={f - c.endAt} /> : null}
    </AbsoluteFill>
  );
};
