// BLOXY LAND After Hours — Part 2 (Shorts 1080x1920), layar bersih, bayangan senter.
import { makeFilm } from "../inti/Shell";
import { World, T, FREEZE, COLD, coldFrame } from "./dunia";

const { S0, LINES, TOTAL } = T;
export const RBX6_FRAMES = TOTAL;
export const Rbx6 = makeFilm({
  make: () => new World(), lines: LINES, freeze: FREEZE, cold: COLD, coldFrame, shadows: true, tint: 0.1,
  bunyi: [
    { a: S0("g01"), b: S0("g01") + 26, text: "SLAM." },
    { a: S0("g03"), b: S0("g04"), text: "beep... beep..." },
  ],
  flashes: [S0("g09") + 8, S0("g11"), S0("g12")],
  pulse: { a: S0("g08"), strong: S0("g11"), b: S0("g14") },
  endAt: S0("g14"),
  pilihan: { A: { bg: "#1f8fff", icon: "📻", label: "FOLLOW MAX'S VOICE" }, B: { bg: "#d8302a", icon: "🎢", label: "RIDE THE CART OUT" } },
});
