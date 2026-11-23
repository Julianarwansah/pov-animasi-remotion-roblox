// Komposisi audit "tembus": satu frame yang menjalankan seluruh dunia episode dan mencetak hasil ke konsol.
import React, { useState } from "react";
import { registerRoot, Composition, AbsoluteFill, delayRender, continueRender } from "remotion";
import { runAudit } from "../videos/inti/audit";
import * as E5 from "../videos/rbx5/dunia";
import * as E6 from "../videos/rbx6/dunia";
import * as E7 from "../videos/rbx7/dunia";
import * as THREE from "three";
import { Orang, box } from "../videos/inti/kit";
// adegan uji: A tembus 30 cm ke dinding (harus terdeteksi), B hanya menempel (tidak boleh terdeteksi), C diputar 45° dekat dinding miring
class Uji { root = new THREE.Group(); constructor() {
  box(this.root, 0.1, 3, 4, "#888888", 0, 1.5, 0);
  const a = new Orang({ torso: "#f00", legs: "#00f", tag: "A tembus" }); a.g.position.set(0.25, 0, -1.2); this.root.add(a.g);
  const b = new Orang({ torso: "#0f0", legs: "#00f", tag: "B menempel" }); b.g.position.set(0.05 + 0.165 + 0.66, 0, 1.2); this.root.add(b.g);
  const w = box(this.root, 0.1, 3, 2, "#888888", 3, 1.5, 0); w.rotation.y = Math.PI / 4;
  const c = new Orang({ torso: "#ff0", legs: "#00f", tag: "C dekat miring" }); c.g.position.set(3.0 + 0.9, 0, -0.9); c.g.rotation.y = Math.PI / 4; this.root.add(c.g);
} update() {} }

type Ep = { World: new () => any; T: { TOTAL: number } };
const EPS: Record<string, Ep> = { "0": { World: Uji, T: { TOTAL: 1 } }, "5": E5 as unknown as Ep, "6": E6 as unknown as Ep, "7": E7 as unknown as Ep };

const Audit: React.FC<{ ep: string }> = ({ ep }) => {
  const [h] = useState(() => delayRender("audit"));
  const [n, setN] = useState(-1);
  React.useEffect(() => {
    const E = EPS[ep];
    const hits = runAudit({ make: () => new E.World(), total: E.T.TOTAL, step: 2 });
    console.error("AUDIT_JSON " + JSON.stringify(hits));
    setN(hits.length); continueRender(h);
  }, [ep, h]);
  return <AbsoluteFill style={{ background: "#111", color: "#fff", fontSize: 60, justifyContent: "center", alignItems: "center" }}>{n} temuan</AbsoluteFill>;
};
const Root: React.FC = () => (
  <>
    {Object.keys(EPS).map((k) => <Composition key={k} id={"Audit" + k} component={Audit} defaultProps={{ ep: k }} durationInFrames={1} fps={30} width={200} height={200} />)}
  </>
);
registerRoot(Root);
