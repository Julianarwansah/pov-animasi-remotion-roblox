// BLOXY LAND After Hours — Part 1 (Shorts 1080x1920), layar bersih, bayangan asli.
import { makeFilm } from "../f13/Shell";
import { World, T, FREEZE, COLD, coldFrame } from "./dunia";

const { S0, LINES, TOTAL } = T;
export const RBX5_FRAMES = TOTAL;
export const Rbx5 = makeFilm({
  make: () => new World(), lines: LINES, freeze: FREEZE, cold: COLD, coldFrame, shadows: true, tint: 0.12,
  bunyi: [
    { a: S0("g03") + 8, b: S0("g04"), text: "♪ ding-ding-ding ♪" },
    { a: S0("g10") + 2, b: S0("g10") + 24, text: "CLUNK." },
  ],
  flashes: [S0("g08") + 18, S0("g08") + 52, S0("g12") + 6],
  pulse: { a: S0("g08"), strong: S0("g12"), b: S0("g13") },
  endAt: S0("g13"),
  pilihan: { A: { bg: "#1f8fff", icon: "🏃", label: "RUN TO THE EXIT GATE" }, B: { bg: "#7a3cc8", icon: "🏚️", label: "HIDE IN THE HAUNTED HOUSE" } },
});
