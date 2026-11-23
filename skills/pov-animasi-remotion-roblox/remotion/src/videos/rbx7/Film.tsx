// BLOXY LAND After Hours — Part 3 FINAL (Shorts 1080x1920), layar bersih. Peralihan "THE NEXT MORNING", akhir THE END.
import React from "react";
import { AbsoluteFill } from "remotion";
import { makeFilm, txt } from "../f13/Shell";
import { World, T, FREEZE, COLD, coldFrame } from "./dunia";
import { FPS } from "../f13/kit";

const { S0, E0, LINES, TOTAL } = T;
export const RBX7_FRAMES = TOTAL;

/** gelap -> "THE NEXT MORNING..." -> terang, di antara malam dan pagi */
const Pagi: React.FC<{ f: number }> = ({ f }) => {
  const a = E0("g08"), b = S0("g09");
  if (f < a || f > b + 24) return null;
  const k = f < b ? Math.min(1, (f - a) / Math.max(1, b - a - 4)) : 1 - (f - b) / 24;
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${k})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...txt("#ffffff", 72), opacity: f < b ? Math.min(1, (f - a) / 8) : k }}>THE NEXT MORNING...</div>
    </AbsoluteFill>
  );
};
const Akhir: React.FC<{ f: number }> = ({ f }) => {
  const e = f / FPS, pop = (d: number) => Math.min(1, Math.max(0, (e - d) / 0.35));
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${Math.min(1, e / 0.5)})`, alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ ...txt("#ffd21f", 120), opacity: pop(0.4), letterSpacing: 3 }}>BLOXY LAND</div>
      <div style={{ ...txt("#ffffff", 96), opacity: pop(0.9) }}>THE END</div>
      <div style={{ ...txt("#ff9ed2", 56, true), opacity: pop(1.8), marginTop: 30 }}>...or is it?</div>
      <div style={{ ...txt("#7ae0ff", 44), opacity: pop(2.6), marginTop: 60 }}>Follow for more stories 🎡</div>
    </AbsoluteFill>
  );
};

export const Rbx7 = makeFilm({
  make: () => new World(), lines: LINES, freeze: FREEZE, cold: COLD, coldFrame, shadows: true, tint: 0.1,
  bunyi: [{ a: S0("g01"), b: S0("g01") + 24, text: "CRASH!" }],
  flashes: [S0("g01"), S0("g07") + 4],
  pulse: { a: S0("g06"), strong: S0("g07"), b: E0("g08") },
  endAt: S0("g14"),
  Ending: Akhir, extra: Pagi,
});
