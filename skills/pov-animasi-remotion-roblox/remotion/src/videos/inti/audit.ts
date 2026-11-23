// Pemeriksa "tembus" otomatis: jalankan dunia frame demi frame, ukur seberapa dalam benda bergerak (tokoh, tangan
// POV, ponsel, kereta, kamera) masuk ke benda lain. Benda bergerak ditandai `userData.dyn = "<nama>"` pada grup akarnya.
// Kedalaman dihitung dari kotak pembatas (AABB) tiap mesh; dinding tipis (bidang) dihitung dari seberapa jauh benda
// menyeberang ke kedua sisinya. Hasil = daftar pasangan + rentang frame + kedalaman maksimum.
import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";

export type Hit = { a: string; b: string; frames: [number, number][]; depth: number; at: string; part?: string };
type Item = { mesh: THREE.Object3D; box: THREE.Box3; label: string; obb?: OBB };

const visible = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (!p.visible) return false; return true; };
const dynRoot = (o: THREE.Object3D): THREE.Object3D | null => { let r: THREE.Object3D | null = null; for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData.dyn) r = p; return r; };
const hex = (m: THREE.Mesh) => { const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshBasicMaterial; return mat?.color ? "#" + mat.color.getHexString() : "?"; };
const fmt = (v: THREE.Vector3) => `(${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)})`;

/** kedalaman tembus a ke b (0 = tidak tembus/hanya menyentuh) */
const depthItem = (a: Item, b: Item) => (a.obb && b.obb && !a.obb.intersectsOBB(b.obb) ? 0 : depth(a.box, b.box));
const depth = (a: THREE.Box3, b: THREE.Box3) => {
  let d = Infinity;
  for (const k of ["x", "y", "z"] as const) {
    const lo = Math.max(a.min[k], b.min[k]), hi = Math.min(a.max[k], b.max[k]);
    if (hi < lo - 1e-4) return 0;
    const bt = b.max[k] - b.min[k], at = a.max[k] - a.min[k];
    let dk: number;
    if (bt < 0.012) dk = Math.min(a.max[k] - b.min[k], b.max[k] - a.min[k]); // b bidang tipis: menyeberang ke kedua sisi?
    else if (at < 0.012) dk = Math.min(b.max[k] - a.min[k], a.max[k] - b.min[k]);
    else dk = hi - lo;
    d = Math.min(d, dk);
  }
  return Math.max(0, d);
};

export const runAudit = (opt: {
  make: () => { root: THREE.Object3D; update: (f: number, cam: THREE.PerspectiveCamera) => void };
  total: number; step?: number; minDepth?: number; ignore?: (a: string, b: string) => boolean;
}): Hit[] => {
  const w = opt.make(), cam = new THREE.PerspectiveCamera(104, 1080 / 1920, 0.03, 120);
  const step = opt.step ?? 2, minD = opt.minDepth ?? 0.03;
  const found = new Map<string, Hit>();
  const camBox = new THREE.Box3();
  for (let f = 0; f < opt.total; f += step) {
    w.update(f, cam);
    w.root.updateMatrixWorld(true);
    const dyn = new Map<THREE.Object3D, Item[]>(), stat: Item[] = [];
    w.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !visible(m)) return;
      if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
      if (m.geometry.boundingSphere!.radius * Math.max(m.scale.x, m.scale.y, m.scale.z) > 60) return; // langit
      if ((m.material as THREE.Material).type === "ShaderMaterial") return;
      const box = new THREE.Box3().setFromObject(m);
      const r = dynRoot(m);
      const label = r ? String(r.userData.dyn) : `${hex(m)}@${fmt(box.getCenter(new THREE.Vector3()))}`;
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      const gb = m.geometry.boundingBox!, obb = new OBB();
      gb.getCenter(obb.center); gb.getSize(obb.halfSize).multiplyScalar(0.5); obb.applyMatrix4(m.matrixWorld);
      const sh = (opt.minDepth ?? 0.03) / 2;
      obb.halfSize.set(Math.max(obb.halfSize.x - sh, Math.min(obb.halfSize.x, 0.001)), Math.max(obb.halfSize.y - sh, Math.min(obb.halfSize.y, 0.001)), Math.max(obb.halfSize.z - sh, Math.min(obb.halfSize.z, 0.001)));
      const it = { mesh: m, box, label, obb };
      if (r) { if (!dyn.has(r)) dyn.set(r, []); dyn.get(r)!.push(it); } else stat.push(it);
    });
    // kamera sebagai kotak kecil di sekitar mata
    camBox.setFromCenterAndSize(cam.position, new THREE.Vector3(0.2, 0.2, 0.2));
    const groups: { label: string; items: Item[] }[] = [...dyn.values()].map((items) => ({ label: items[0].label, items }));
    groups.push({ label: "kamera", items: [{ mesh: cam, box: camBox.clone(), label: "kamera" }] });
    const note = (a: string, b: string, d: number, where: THREE.Box3, part?: string) => {
      if (d < minD || (opt.ignore && opt.ignore(a, b))) return;
      const key = a + " | " + b;
      const h = found.get(key) ?? { a, b, frames: [], depth: 0, at: fmt(where.getCenter(new THREE.Vector3())) };
      const last = h.frames[h.frames.length - 1];
      if (last && f - last[1] <= step * 2) last[1] = f; else h.frames.push([f, f]);
      if (d > h.depth) { h.depth = d; h.at = fmt(where.getCenter(new THREE.Vector3())); h.part = part; }
      found.set(key, h);
    };
    for (let gi = 0; gi < groups.length; gi++) {
      const G = groups[gi];
      const gb = new THREE.Box3(); G.items.forEach((i) => gb.union(i.box));
      for (const s of stat) {
        if (!gb.intersectsBox(s.box)) continue;
        let best = 0, part = "";
        for (const i of G.items) { const d = depthItem(i, s); if (d > best) { best = d; part = (i.mesh as THREE.Mesh).isMesh ? hex(i.mesh as THREE.Mesh) + "@" + fmt(i.box.getCenter(new THREE.Vector3())) : ""; } }
        note(G.label, s.label, best, s.box, part);
      }
      for (let gj = gi + 1; gj < groups.length; gj++) {
        const H = groups[gj];
        if ((G.label === "kamera" || H.label === "kamera") && (G.label.startsWith("tangan") || H.label.startsWith("tangan"))) continue;
        let best = 0, where = new THREE.Box3(), part = "";
        for (const i of G.items) for (const j of H.items) { const d = depthItem(i, j); if (d > best) { best = d; where = j.box; part = (i.mesh as THREE.Mesh).isMesh ? hex(i.mesh as THREE.Mesh) + "@" + fmt(i.box.getCenter(new THREE.Vector3())) : ""; } }
        note(G.label, H.label, best, where, part);
      }
    }
  }
  return [...found.values()].sort((x, y) => y.depth - x.depth);
};
