// FLOOR 13 — Part 2 (Shorts 1080x1920), layar bersih tanpa HUD atas.
import { makeFilm } from "../inti/Shell";
import { World, T, FREEZE, COLD, coldFrame } from "./dunia";

const { S0, LINES, TOTAL } = T;
export const RBX2_FRAMES = TOTAL;
export const Rbx2 = makeFilm({
  make: () => new World(), lines: LINES, freeze: FREEZE, cold: COLD, coldFrame,
  bunyi: [
    { a: S0("g01"), b: S0("g02"), text: "RIIIIING!" },
    { a: S0("g06"), b: S0("g07"), text: "CRRREEEAAK—" },
    { a: S0("g09"), b: S0("g09") + 28, text: "DING!" },
    { a: S0("g13") + 4, b: S0("g14"), text: "CREEEAK..." },
  ],
  flashes: [S0("g06"), S0("g08"), S0("g12") + 40],
  pulse: { a: S0("g04"), strong: S0("g12"), b: S0("g15") },
  endAt: S0("g15"),
  pilihan: { A: { bg: "#1f8fff", icon: "🚪", label: "WALK TO ROOM 1313" }, B: { bg: "#e0302a", icon: "🪜", label: "CLIMB THROUGH THE HATCH" } },
});
