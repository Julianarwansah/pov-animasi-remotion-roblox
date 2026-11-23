// FLOOR 13 — Part 3 (Shorts 1080x1920), layar bersih tanpa HUD atas.
import { makeFilm } from "../f13/Shell";
import { World, T, FREEZE, COLD, coldFrame } from "./dunia";

const { S0, LINES, TOTAL } = T;
export const RBX3_FRAMES = TOTAL;
export const Rbx3 = makeFilm({
  make: () => new World(), lines: LINES, freeze: FREEZE, cold: COLD, coldFrame,
  bunyi: [
    { a: S0("g05"), b: S0("g06"), text: "creak..." },
    { a: S0("g08"), b: S0("g09"), text: "CLANG! CLANG! CLANG!" },
    { a: S0("g12"), b: S0("g13"), text: "THUD." },
  ],
  flashes: [S0("g05") + 20, S0("g12") + 6],
  pulse: { a: S0("g05"), strong: S0("g07"), b: S0("g14") },
  endAt: S0("g14"),
  pilihan: { A: { bg: "#1f8fff", icon: "🚪", label: "RUN INTO ROOM 2007" }, B: { bg: "#e0302a", icon: "✋", label: "SLAM THE ELEVATOR DOORS" } },
});
