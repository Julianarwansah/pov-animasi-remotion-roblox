// FLOOR 13 — Part 1 (Shorts 1080x1920). Dunia 3D balok (dunia.ts) -> tinta tipis -> tone mapping -> fisheye,
// lalu lapisan 2D: HUD game (chat + daftar pemain), vinyet, kilat, caption per penutur, teks bunyi, judul, kartu pilihan.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadFont } from "@remotion/fonts";
import { World, LINES, TOTAL, FREEZE, S0, FPS, COLD, coldFrame } from "./dunia";
import { InkPass, noInkFallback } from "./ink";
import { FisheyeEffect } from "./fisheye";

export const RBX1_FRAMES = TOTAL;
const W = 1080, H = 1920;

const Inner: React.FC<{ f: number }> = ({ f }) => {
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(), []);
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

const FAMILY = "Fredoka";
let fontP: Promise<void> | null = null;
const useFont = () => {
  const [h] = useState(() => delayRender("font"));
  useEffect(() => { fontP ??= loadFont({ family: FAMILY, url: staticFile("fonts/Fredoka-Bold.ttf"), weight: "700" }); fontP.then(() => continueRender(h), () => continueRender(h)); }, [h]);
};

const STYLE: Record<string, { color: string; italic?: boolean }> = {
  noob: { color: "#ffffff" }, lily: { color: "#ff9ed2" }, lift: { color: "#8fd3ff", italic: true }, tiruan: { color: "#ff6a6a", italic: true },
};
const txt = (color: string, size: number, italic = false): React.CSSProperties => ({
  fontFamily: `${FAMILY}, Arial Black, sans-serif`, fontWeight: 700, fontSize: size, lineHeight: 1.12, color, fontStyle: italic ? "italic" : "normal",
  textAlign: "center", WebkitTextStroke: "3px #0b0710", paintOrder: "stroke fill", textShadow: "0 5px 14px rgba(0,0,0,0.85)",
});

/** caption: potongan ≤ 4 kata yang sedang diucapkan, warna per penutur */
const Caption: React.FC<{ f: number }> = ({ f }) => {
  const l = LINES.find((x) => x.text && f >= x.start && f < x.end + 4);
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

/** teks bunyi (merah, miring, bergetar) */
const BUNYI: { a: number; b: number; text: string }[] = [
  { a: S0("g04"), b: S0("g04") + 30, text: "DING!" },
  { a: S0("g08"), b: S0("g09"), text: "bzzzt... bzzzt..." },
  { a: S0("g12") + 4, b: S0("g12") + 30, text: "CLICK! CLICK! CLICK!" },
  { a: S0("g12") + 30, b: S0("g13"), text: "THUNK." },
];
const Bunyi: React.FC<{ f: number }> = ({ f }) => {
  const b = BUNYI.find((x) => f >= x.a && f < x.b);
  if (!b) return null;
  const j = (f % 4) - 1.5;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: H * 0.2 }}>
      <div style={{ ...txt("#ff4a4a", 80, true), transform: `translate(${j * 2}px, ${-j * 1.5}px) rotate(-4deg)` }}>{b.text}</div>
    </AbsoluteFill>
  );
};

// ---------------- HUD game: chat kiri atas + daftar pemain kanan atas ----------------
type Chat = { at: number; who: string; color: string; text: string };
const CHAT: Chat[] = [
  { at: 0, who: "[Server]", color: "#7fd0ff", text: "Welcome to Blocky Inn Hotel!" },
  { at: 30, who: "[Server]", color: "#7fd0ff", text: "Your room: 2007 (Floor 20)" },
  { at: S0("g02") + 12, who: "[Server]", color: "#ff5a5a", text: "Floor 13 does not exist." },
  { at: S0("g05"), who: "Lily_xo", color: "#ff9ed2", text: "hold the door pls!!" },
  { at: S0("g07"), who: "Lily_xo", color: "#ff9ed2", text: "LET ME IN" },
  { at: S0("g10"), who: "???", color: "#ff6a6a", text: "floor twenty. finally, my room." },
  { at: S0("g11"), who: "[Server]", color: "#ff5a5a", text: "14 players are looking at you." },
];
const HUD: React.FC<{ f: number }> = ({ f }) => {
  const shown = CHAT.filter((c) => f >= c.at).slice(-4);
  const players = ["You"];
  if (f >= S0("g05")) players.push(f >= S0("g07") && Math.floor(f / 4) % 2 ? "L1ly_??" : "Lily_xo");
  const many = f >= S0("g10");
  const glitch = f >= S0("g12") && Math.floor(f / 3) % 5 === 0;
  const panel: React.CSSProperties = { background: "rgba(20,22,30,0.55)", borderRadius: 14, padding: "14px 18px", fontFamily: `${FAMILY}, Arial, sans-serif`, fontWeight: 700 };
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: glitch ? 0.35 : 1, transform: glitch ? "translateX(6px)" : undefined }}>
      <div style={{ ...panel, position: "absolute", left: 28, top: 70, width: 560 }}>
        {shown.map((c, i) => (
          <div key={i} style={{ fontSize: 28, color: "#ffffff", lineHeight: 1.3, textShadow: "0 2px 3px rgba(0,0,0,0.8)", opacity: Math.min(1, (f - c.at) / 5) }}>
            <span style={{ color: c.color }}>{c.who}:</span> {c.text}
          </div>
        ))}
      </div>
      <div style={{ ...panel, position: "absolute", right: 28, top: 70, width: 270 }}>
        <div style={{ fontSize: 24, color: "#cfd6e6", marginBottom: 6 }}>PLAYERS {many ? "16" : players.length}/20</div>
        {players.map((p) => (
          <div key={p} style={{ fontSize: 28, color: p.startsWith("Guest") || p.includes("?") ? "#ff5a5a" : "#ffffff", lineHeight: 1.3 }}>{p}</div>
        ))}
        {many ? <div style={{ fontSize: 28, color: "#ff5a5a", lineHeight: 1.3 }}>Guest ×14</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const Judul: React.FC<{ f: number }> = ({ f }) => {
  if (f > 105) return null;
  const o = Math.min(1, f / 6) * Math.min(1, (105 - f) / 10);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 330, opacity: o }}>
      <div style={{ ...txt("#ffffff", 92), letterSpacing: 2 }}>FLOOR 13</div>
      <div style={{ ...txt("#ff5a4a", 52), marginTop: 8 }}>PART 1</div>
    </AbsoluteFill>
  );
};

const Tombol: React.FC<{ bg: string; icon: string; label: string; s: number }> = ({ bg, icon, label, s }) => (
  <div style={{ width: 880, padding: "34px 40px", borderRadius: 20, background: bg, display: "flex", alignItems: "center", gap: 30, transform: `scale(${s})`,
    boxShadow: "0 12px 0 rgba(0,0,0,0.35), inset 0 -8px 0 rgba(0,0,0,0.18), 0 0 0 5px rgba(255,255,255,0.85)" }}>
    <span style={{ fontSize: 76 }}>{icon}</span>
    <span style={{ ...txt("#ffffff", 64), textAlign: "left", WebkitTextStroke: "2px #0b0710" }}>{label}</span>
  </div>
);
const Pilihan: React.FC<{ f: number }> = ({ f }) => {
  const a = S0("g14");
  if (f < a) return null;
  const k = (f - a) / FPS, pop = (d: number) => Math.min(1, Math.max(0, (k - d) / 0.25)), sc = (d: number) => 0.6 + 0.4 * pop(d) + 0.05 * Math.sin(Math.min(1, pop(d)) * Math.PI);
  return (
    <AbsoluteFill style={{ background: `rgba(8,6,14,${0.55 * Math.min(1, k / 0.4)})`, alignItems: "center", justifyContent: "center", gap: 34 }}>
      <div style={{ ...txt("#ffffff", 104), opacity: pop(0), transform: `scale(${sc(0)})` }}>WHAT WOULD<br />YOU DO?</div>
      <div style={{ opacity: pop(0.35) }}><Tombol bg="#1f8fff" icon="🔔" label="PRESS THE ALARM" s={sc(0.35)} /></div>
      <div style={{ ...txt("#ffd84a", 60), opacity: pop(0.6) }}>OR</div>
      <div style={{ opacity: pop(0.8) }}><Tombol bg="#e0302a" icon="🏃" label="RUN INTO THE HALLWAY" s={sc(0.8)} /></div>
      <div style={{ ...txt("#ffffff", 48), opacity: pop(1.3), marginTop: 20 }}>Comment below 👇<br /><span style={{ color: "#ffd84a", fontSize: 40 }}>Part 2 follows your choice</span></div>
    </AbsoluteFill>
  );
};

export const Rbx1: React.FC = () => {
  const f = useCurrentFrame();
  useFont();
  const cold = f < COLD;
  const f3 = cold ? coldFrame(f) : Math.min(f, FREEZE);
  const flash = (a: number) => (f >= a && f < a + 4 ? [0.8, 0.5, 0.25, 0.1][f - a] : 0);
  const fl = Math.max(flash(0), flash(S0("g10") + 6), flash(S0("g12") + 30));
  const pulse = cold ? 0.6 : f >= S0("g08") && f < S0("g14") ? (f >= S0("g12") ? 0.55 : 0.3) * Math.pow(Math.abs(Math.sin((f / FPS) * Math.PI * (f >= S0("g12") ? 2.4 : 1.6))), 3) : 0;
  return (
    <AbsoluteFill style={{ background: "#05060c" }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 104, near: 0.04, far: 600 }}>
        <Inner f={f3} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "#1c2a55", mixBlendMode: "multiply", opacity: 0.22 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 62% at 50% 50%, rgba(0,0,0,0) 55%, rgba(3,2,8,0.65) 100%)" }} />
      {pulse > 0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 58% at 50% 50%, rgba(0,0,0,0) 45%, rgba(150,8,14,0.9) 100%)", opacity: pulse }} /> : null}
      {fl > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: fl }} /> : null}
      {cold && f >= COLD - 6 ? <AbsoluteFill style={{ background: "#000" }} /> : null}
      {!cold && f < S0("g14") ? <HUD f={f} /> : null}
      {cold ? null : <Judul f={f - COLD} />}
      {f < S0("g14") ? <Caption f={f} /> : null}
      {f < S0("g14") ? <Bunyi f={f} /> : null}
      <Pilihan f={f} />
    </AbsoluteFill>
  );
};
