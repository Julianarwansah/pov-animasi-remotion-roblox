// Foto profil channel aktif (src/kanal.json, ganti dengan scripts/pakai-kanal.mjs). 1024x1024, aman dipotong lingkaran.
// Varian: 1 = kepala balok menyeringai, 2 = Hoppy mengintip, 3 = kepala balok + teks channel, 4 = Hoppy + teks channel.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { registerRoot, Composition, AbsoluteFill, staticFile, delayRender, continueRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadFont } from "@remotion/fonts";
import { InkPass, noInkFallback } from "../videos/inti/ink";
import { Orang, box, ball, glow, toon } from "../videos/inti/kit";
import { Hoppy } from "../videos/taman/park";
import KANAL from "../kanal.json";

const S = 1024;
type V = { v: 1 | 2 | 3 | 4 };

const Scene: React.FC<V> = ({ v }) => {
  const { camera, scene } = useThree();
  const root = useMemo(() => {
    const R = new THREE.Group();
    R.add(new THREE.AmbientLight("#4a4278", 0.22));
    const rim = new THREE.PointLight("#b06aff", 10, 8, 1.2); rim.position.set(-1.7, 2.4, -1.3); R.add(rim);
    const rim2 = new THREE.PointLight("#7a8cff", 6, 7, 1.2); rim2.position.set(1.8, 1.6, -1.2); R.add(rim2);
    const key = new THREE.PointLight("#e8ecff", 3.0, 6, 1.4); key.position.set(-0.9, 2.6, 2.2); R.add(key);
    if (v === 2 || v === 4) {
      const h = new Hoppy(); h.face(true, 0); h.head.rotation.set(0.05, 0, 0.32); h.g.position.set(0, -1.6, 0); R.add(h.g);
      for (const x of [-0.2, 0.2]) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), glow("#ff2a2a", 2.5)); p.position.set(x + 0.02, 0.12, 0.38); h.head.add(p); }
      // dinding gelap tempat Hoppy mengintip
      box(R, 1.2, 4, 0.3, "#1a1024", -1.15, 0.6, 0.6);
    } else {
      const o = new Orang({ torso: "#0d69ac", legs: "#a4bd47", face: "none", eyeGlow: "#ffffff" });
      o.wajah(0, 0, true); o.grin.visible = true; o.head.rotation.set(-0.05, 0.12, 0.18);
      // rongga mata hitam + pupil menyala, seringai bergigi
      o.eyes.forEach((e) => { e.material = toon("#050308"); e.scale.set(0.05, 0.062, 0.01); });
      for (const x of [-0.068, 0.068]) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.012, 16), glow("#ffffff", 2.4)); p.position.set(x + 0.006, 0.04, 0.2035); o.head.add(p); }
      for (let i = 1; i < 8; i++) { const a = Math.PI + (i / 8) * Math.PI, gx = 0.11 * Math.cos(a), gy = -0.02 + 0.088 * Math.sin(a);
        const t = box(o.head, 0.016, 0.022, 0.008, glow("#f4f0e0", 1.0), gx, gy + 0.012, 0.198); t.rotation.z = a + Math.PI / 2; }
      o.g.scale.setScalar(2.3); o.g.position.set(0, v === 3 ? -2.75 : -2.95, 0); R.add(o.g);
    }
    return R;
  }, [v]);
  useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 32; const hop = v === 2 || v === 4; cam.position.set(0.15, hop ? 0.75 : 0.55, 3.6); cam.lookAt(0, v === 4 ? 0.5 : hop ? 0.6 : v === 3 ? 0.62 : 0.5, 0); cam.updateProjectionMatrix();
  }, [camera, v]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera, { color: "#0c0810", widthNear: 7, widthFar: 5, distNear: 2, distFar: 10 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
  }), [camera, scene]);
  noInkFallback(root);
  return (
    <>
      <primitive object={root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
      </EffectComposer>
    </>
  );
};

const Profil: React.FC<V> = ({ v }) => {
  const [h] = useState(() => delayRender("font"));
  useEffect(() => { loadFont({ family: "Fredoka", url: staticFile("fonts/Fredoka-Bold.ttf"), weight: "700" }).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const t = (c: string, s: number): React.CSSProperties => ({ fontFamily: "Fredoka, Arial Black, sans-serif", fontWeight: 700, fontSize: s, color: c, lineHeight: 0.95, textAlign: "center", WebkitTextStroke: "10px #0b0610", paintOrder: "stroke fill", textShadow: "0 8px 24px rgba(0,0,0,0.9)", letterSpacing: 2 });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #4a1a5a 0%, #1e0c2a 45%, #07040c 75%)" }}>
      <ThreeCanvas width={S} height={S} gl={{ antialias: false, alpha: true }} camera={{ fov: 32, near: 0.05, far: 50 }}>
        <Scene v={v} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 48%, rgba(120,0,10,0.55) 72%, rgba(0,0,0,0.85) 100%)" }} />
      {v === 3 || v === 4 ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: v === 3 ? 175 : 170 }}>
          {KANAL.teksProfil.map((w, i) => {
            const size = Math.min(108, Math.floor(820 / Math.max(4, w.length) * 1.2)); // kata panjang mengecil agar muat di lingkaran
            return <div key={i} style={{ ...t(KANAL.warnaProfil[i % KANAL.warnaProfil.length], size), marginTop: i ? 6 : 0 }}>{w}</div>;
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    {([1, 2, 3, 4] as const).map((v) => <Composition key={v} id={"Profil" + v} component={Profil} defaultProps={{ v }} durationInFrames={1} fps={30} width={S} height={S} />)}
  </>
);
registerRoot(Root);
