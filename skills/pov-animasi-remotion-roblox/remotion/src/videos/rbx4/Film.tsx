// FLOOR 13 — Part 4 FINAL (Shorts 1080x1920), layar bersih. Akhir: dialog "Disconnected" lalu THE END.
import React from "react";
import { AbsoluteFill } from "remotion";
import { makeFilm, KANAL, txt, FAMILY } from "../inti/Shell";
import { World, T, FREEZE, COLD, coldFrame } from "./dunia";
import { FPS, hh } from "../inti/kit";

const { S0, E0, LINES, TOTAL } = T;
export const RBX4_FRAMES = TOTAL;
const PUTUS = E0("g13") - S0("g13");

const Ending: React.FC<{ f: number }> = ({ f }) => {
  if (f < PUTUS) {
    // layar beku + glitch singkat, lalu dialog putus koneksi
    const g = f < 10 && hh(f, 3) > 0.4;
    const k = Math.min(1, Math.max(0, (f - 8) / 8));
    return (
      <AbsoluteFill style={{ background: `rgba(10,10,14,${0.25 + 0.45 * k})` }}>
        {g ? <AbsoluteFill style={{ background: "rgba(255,0,60,0.25)", transform: `translateX(${(hh(f, 7) - 0.5) * 60}px)` }} /> : null}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: k }}>
          <div style={{ width: 860, background: "#393b3d", borderRadius: 18, padding: "44px 48px 40px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)", transform: `scale(${0.9 + 0.1 * k})`, fontFamily: `${FAMILY}, Arial, sans-serif`, fontWeight: 700 }}>
            <div style={{ color: "#ffffff", fontSize: 60, textAlign: "center", marginBottom: 18 }}>Disconnected</div>
            <div style={{ height: 3, background: "#5a5c5f", marginBottom: 30 }} />
            <div style={{ color: "#d8d8da", fontSize: 40, lineHeight: 1.35, textAlign: "center" }}>
              You were kicked from this experience:<br />Room 2007 is now occupied.<br /><span style={{ color: "#ff8a8a" }}>(Error Code: 13)</span>
            </div>
            <div style={{ margin: "40px auto 0", width: 340, padding: "22px 0", borderRadius: 12, background: "#ffffff", color: "#393b3d", fontSize: 44, textAlign: "center" }}>Leave</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const e = (f - PUTUS) / FPS, pop = (d: number) => Math.min(1, Math.max(0, (e - d) / 0.35));
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ ...txt("#ff4a4a", 120), opacity: pop(0.2), letterSpacing: 4 }}>FLOOR 13</div>
      <div style={{ ...txt("#ffffff", 96), opacity: pop(0.7) }}>THE END</div>
      <div style={{ ...txt("#ff9ed2", 56, true), opacity: pop(1.6), marginTop: 30 }}>...or is it?</div>
      <div style={{ ...txt("#ffd84a", 44), opacity: pop(2.4), marginTop: 60 }}>{KANAL.ajakanFollow} 👻</div>
    </AbsoluteFill>
  );
};

export const Rbx4 = makeFilm({
  make: () => new World(), lines: LINES, freeze: FREEZE, cold: COLD, coldFrame,
  bunyi: [
    { a: S0("g01"), b: S0("g02"), text: "SLAM!" },
    { a: S0("g10"), b: S0("g11"), text: "KNOCK. KNOCK. KNOCK." },
  ],
  flashes: [S0("g05") + 2, S0("g09"), S0("g12") + 4],
  pulse: { a: S0("g05"), strong: S0("g10"), b: S0("g13") },
  endAt: S0("g13"),
  Ending,
});
