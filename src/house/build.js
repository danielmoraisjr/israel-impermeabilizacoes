// A casa, o quintal e a plataforma de terreno (tudo procedural).
import {
  Group, Mesh, BoxGeometry, CylinderGeometry, IcosahedronGeometry, PlaneGeometry, ShapeGeometry, Shape, SphereGeometry,
  MeshStandardMaterial, MeshBasicMaterial, DoubleSide, PointLight, Sprite, SpriteMaterial, AdditiveBlending, InstancedMesh, Object3D, Color, RepeatWrapping,
} from 'three';
import * as T from './textures.js';

const MAIN = { x: 1.4, w: 6.4, d: 5.2, h: 3.0, rise: 1.8, ovz: 0.55, ovx: 0.4, z: 0 };
const GAR = { x: -3.55, w: 3.6, d: 4.6, h: 2.6, rise: 1.3, ovz: 0.5, ovx: 0.35, z: -0.3 };

/** altura do telhado em (x,z); -Infinity fora dele */
export function roofY(x, z) {
  let y = -Infinity;
  for (const b of [MAIN, GAR]) {
    const dx = Math.abs(x - b.x), dz = Math.abs(z - b.z);
    if (dx <= b.w / 2 + b.ovx && dz <= b.d / 2 + b.ovz) y = Math.max(y, b.h + b.rise * (1 - dz / (b.d / 2)) + 0.07);
  }
  return y;
}

function mat(o) { return new MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...o }); }

export function buildScene({ shadows }) {
  const root = new Group();
  const refs = { roofMats: [], stains: [], windows: [], glows: [], lights: [], drips: [], root };
  const cast = (m, c = true, r = true) => { m.castShadow = shadows && c; m.receiveShadow = shadows && r; return m; };
  const add = (g, m) => { g.add(m); return m; };

  // ---------- materiais ----------
  const plaster = T.plaster(); const plasterM = mat({ map: plaster });
  const trim = mat({ color: 0x2a3036, roughness: 0.6 });
  const conc = mat({ map: T.concrete() });
  const [tileMap, tileBump] = T.roofTiles();

  // ---------- plataforma de terreno ----------
  const grass = T.grass(), soil = T.soilSide();
  const base = new Mesh(new CylinderGeometry(12.5, 12.5, 1.5, 72, 1), [mat({ map: soil, roughness: 1 }), mat({ map: grass, roughness: 1, color: 0xa3cc9c }), mat({ color: 0x1a1612 })]);
  base.position.y = -0.75; base.receiveShadow = shadows; root.add(base);
  const rim = new Mesh(new CylinderGeometry(12.62, 12.62, 0.14, 72, 1, true), mat({ color: 0x0d2233, roughness: 0.5, metalness: 0.3, side: DoubleSide }));
  rim.position.y = 0.0; root.add(rim);

  // ---------- volumes ----------
  function block(b, withDoor) {
    const g = new Group();
    const wall = cast(new Mesh(new BoxGeometry(b.w, b.h, b.d), plasterM));
    wall.position.set(b.x, b.h / 2, b.z); g.add(wall);
    const plinth = cast(new Mesh(new BoxGeometry(b.w + 0.1, 0.35, b.d + 0.1), conc));
    plinth.position.set(b.x, 0.175, b.z); g.add(plinth);
    // empenas (triângulos laterais)
    const sh = new Shape(); sh.moveTo(-b.d / 2, 0); sh.lineTo(b.d / 2, 0); sh.lineTo(0, b.rise); sh.closePath();
    for (const s of [-1, 1]) {
      const gable = new Mesh(new ShapeGeometry(sh), new MeshStandardMaterial({ map: plaster, roughness: 0.9, side: DoubleSide }));
      gable.rotation.y = Math.PI / 2; gable.position.set(b.x + s * (b.w / 2 + 0.002), b.h, b.z); gable.castShadow = shadows; g.add(gable);
    }
    // telhado: duas águas
    const half = b.d / 2 + b.ovz, drop = b.rise + (b.rise * b.ovz) / (b.d / 2);
    const len = Math.hypot(half, drop), ang = Math.atan2(drop, half), width = b.w + 2 * b.ovx;
    const rm = mat({ map: tileMap.clone(), bumpMap: tileBump.clone(), bumpScale: 2.2, roughness: 0.82, color: 0xffffff });
    rm.map.repeat.set(width / 0.9, len / 0.9); rm.bumpMap.repeat.copy(rm.map.repeat); rm.map.needsUpdate = rm.bumpMap.needsUpdate = true;
    refs.roofMats.push(rm);
    for (const s of [-1, 1]) {
      const slab = cast(new Mesh(new BoxGeometry(width, 0.14, len), rm), true, true);
      slab.position.set(b.x, b.h + b.rise - drop / 2 + 0.0, b.z + (s * half) / 2);
      slab.rotation.x = s * ang; g.add(slab);
      // calha
      const gz = b.z + s * (half - 0.02), gy = b.h - (b.rise * b.ovz) / (b.d / 2) - 0.1;
      const gut = new Mesh(new BoxGeometry(width - 0.1, 0.1, 0.13), trim); gut.position.set(b.x, gy, gz + s * 0.03); g.add(gut);
      refs.drips.push({ x0: b.x - width / 2 + 0.3, x1: b.x + width / 2 - 0.3, y: gy, z: gz + s * 0.1, front: s > 0 });
      // tubo de queda
      const pipe = new Mesh(new CylinderGeometry(0.04, 0.04, gy, 8), trim); pipe.position.set(b.x + (s > 0 ? width / 2 - 0.25 : -width / 2 + 0.25), gy / 2, gz); g.add(pipe);
    }
    // cumeeira
    const ridge = new Mesh(new BoxGeometry(width + 0.05, 0.12, 0.34), mat({ color: 0x6a2c1d }));
    ridge.position.set(b.x, b.h + b.rise + 0.09, b.z); ridge.castShadow = shadows; g.add(ridge);
    return g;
  }
  root.add(block(MAIN)); root.add(block(GAR));

  // ---------- janelas ----------
  const gmap = T.windowGlow();
  function windowAt(x, y, w, h, z, face = 1) {
    const g = new Group();
    const glassM = new MeshStandardMaterial({ map: gmap, emissiveMap: gmap, emissive: 0xffffff, emissiveIntensity: 1.15, roughness: 0.25, metalness: 0.1 });
    refs.windows.push(glassM);
    const glass = new Mesh(new PlaneGeometry(w, h), glassM); glass.position.z = 0.02; g.add(glass);
    const t = 0.07;
    for (const [bw, bh, bx, by] of [[w + 0.12, t, 0, h / 2], [w + 0.12, t, 0, -h / 2], [t, h, -w / 2, 0], [t, h, w / 2, 0], [t, h, 0, 0], [w, t, 0, 0]]) {
      const bar = new Mesh(new BoxGeometry(bw, bh, 0.1), trim); bar.position.set(bx, by, 0.05); g.add(bar);
    }
    const sill = new Mesh(new BoxGeometry(w + 0.35, 0.07, 0.24), conc); sill.position.set(0, -h / 2 - 0.08, 0.1); g.add(sill);
    const sp = new Sprite(new SpriteMaterial({ map: T.glowSprite(), blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
    sp.scale.set(w * 2.6, h * 2.6, 1); sp.position.z = 0.6; g.add(sp); refs.glows.push(sp);
    g.position.set(x, y, z); g.rotation.y = face > 0 ? 0 : Math.PI; root.add(g); return g;
  }
  const zf = MAIN.d / 2 + 0.005;
  windowAt(2.1, 1.75, 1.9, 1.25, zf); windowAt(4.0, 1.75, 1.0, 1.25, zf);

  // ---------- porta de entrada e varandinha ----------
  const door = new Mesh(new BoxGeometry(1.0, 2.15, 0.1), mat({ map: T.wood(), roughness: 0.55 })); door.position.set(-0.45, 1.075 + 0.05, zf + 0.04); cast(door); root.add(door);
  const dframe = new Mesh(new BoxGeometry(1.2, 2.3, 0.08), trim); dframe.position.set(-0.45, 1.15, zf + 0.0); root.add(dframe);
  const handle = new Mesh(new BoxGeometry(0.05, 0.22, 0.05), mat({ color: 0xd8d2c4, metalness: 0.8, roughness: 0.3 })); handle.position.set(-0.05, 1.05, zf + 0.12); root.add(handle);
  const canopy = cast(new Mesh(new BoxGeometry(2.0, 0.14, 1.2), mat({ color: 0xc9c4b8 }))); canopy.position.set(-0.45, 2.55, zf + 0.6); root.add(canopy);
  for (const dx of [-1, 1]) { const col = cast(new Mesh(new CylinderGeometry(0.07, 0.07, 2.5, 10), mat({ color: 0xe8e2d6 }))); col.position.set(-0.45 + dx * 0.88, 1.25, zf + 1.1); root.add(col); }
  const step = new Mesh(new BoxGeometry(2.0, 0.16, 1.1), conc); step.position.set(-0.45, 0.08, zf + 0.7); root.add(step);
  // luminária da varanda
  const lampP = new PointLight(0xffbf70, 5.5, 7, 1.6); lampP.position.set(-0.45, 2.35, zf + 0.9); root.add(lampP); refs.lights.push(lampP);
  const lampS = new Sprite(new SpriteMaterial({ map: T.glowSprite(), blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 })); lampS.scale.set(1.3, 1.3, 1); lampS.position.copy(lampP.position); root.add(lampS);

  // ---------- garagem ----------
  const gd = cast(new Mesh(new BoxGeometry(2.8, 2.1, 0.08), mat({ map: T.garage(), roughness: 0.5, metalness: 0.2 })));
  gd.position.set(GAR.x, 1.05 + 0.1, GAR.z + GAR.d / 2 + 0.03); root.add(gd);

  // ---------- manchas de umidade (aparecem sem barreira) ----------
  const stainT = T.stain();
  const stainAt = (x, y, w, h, z, ry = 0) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: stainT, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.set(x, y, z); m.rotation.y = ry; root.add(m); refs.stains.push(m);
  };
  const gx = MAIN.x + MAIN.w / 2 + 0.014; // empena lateral (lado que a câmera enxerga)
  stainAt(-1.0, 2.0, 1.6, 1.3, zf + 0.012);
  stainAt(gx, 2.15, 2.6, 1.7, MAIN.z - 1.1, Math.PI / 2);
  stainAt(gx, 2.1, 2.2, 1.5, MAIN.z + 1.3, Math.PI / 2);
  stainAt(GAR.x, 1.9, 2.8, 1.1, GAR.z + GAR.d / 2 + 0.075);

  // ---------- calçada, trilha, cerca ----------
  const side = new Mesh(new BoxGeometry(12.6, 0.12, 2.0), conc); side.position.set(0, 0.06, 9.9); side.receiveShadow = shadows; root.add(side);
  const curb = new Mesh(new BoxGeometry(9.6, 0.2, 0.2), mat({ color: 0x9aa1a8 })); curb.position.set(0, 0.1, 11.0); root.add(curb);
  const stoneT = T.stoneTiles(); stoneT.repeat.set(1, 4);
  const path = new Mesh(new PlaneGeometry(1.3, 6.2), mat({ map: stoneT, roughness: 0.9 })); path.rotation.x = -Math.PI / 2; path.position.set(-0.45, 0.02, zf + 4.4); path.receiveShadow = shadows; root.add(path);

  const rail = new Mesh(new BoxGeometry(15.4, 0.06, 0.07), trim); rail.position.set(0, 1.05, 8.0); root.add(rail);
  const rail2 = rail.clone(); rail2.position.y = 0.42; root.add(rail2);
  const pickets = new InstancedMesh(new BoxGeometry(0.06, 1.0, 0.06), trim, 40), o = new Object3D();
  for (let i = 0; i < 40; i++) { const px = -7.6 + (i * 15.2) / 39; if (Math.abs(px - -0.45) < 0.8) { o.position.set(0, -10, 0); } else o.position.set(px, 0.55, 8.0); o.updateMatrix(); pickets.setMatrixAt(i, o.matrix); }
  pickets.castShadow = shadows; root.add(pickets);
  for (const px of [-7.8, 7.8, -1.35, 0.45]) { const p = cast(new Mesh(new BoxGeometry(0.34, 1.3, 0.34), mat({ color: 0xb06a4a }))); p.position.set(px, 0.65, 8.0); root.add(p); }

  // ---------- plantas ----------
  const green = [0x1f4d2b, 0x2a5c33, 0x18401f, 0x336b3a];
  const bushes = [[-2.2, 0.35, 3.4, 0.6], [-1.6, 0.3, 3.3, 0.45], [1.0, 0.3, 3.0, 0.5], [2.5, 0.3, 3.0, 0.45], [4.6, 0.4, 3.1, 0.65], [5.6, 0.35, 3.2, 0.55], [-6.5, 0.4, 7.0, 0.7], [6.8, 0.4, 7.0, 0.7], [-3.8, 0.3, 4.6, 0.5], [3.0, 0.3, 6.3, 0.5]];
  for (const [x, y, z, r] of bushes) { const b = cast(new Mesh(new IcosahedronGeometry(r, 1), mat({ color: green[(Math.abs(x * 7) | 0) % 4], roughness: 1, flatShading: true }))); b.position.set(x, y, z); b.scale.y = 0.82; root.add(b); }
  const trunk = cast(new Mesh(new CylinderGeometry(0.2, 0.28, 2.6, 8), mat({ color: 0x4b3425 }))); trunk.position.set(-7.2, 1.3, 3.2); root.add(trunk);
  for (const [dx, dy, dz, r] of [[0, 3.2, 0, 1.5], [0.9, 2.8, 0.4, 1.1], [-0.9, 3.0, -0.4, 1.2], [0.1, 4.0, 0.1, 1.0]]) { const f = cast(new Mesh(new IcosahedronGeometry(r, 1), mat({ color: 0x1d4a2a, flatShading: true, roughness: 1 }))); f.position.set(-7.2 + dx, dy, 3.2 + dz); root.add(f); }

  // ---------- poste de luz ----------
  const pole = cast(new Mesh(new CylinderGeometry(0.06, 0.08, 4.2, 8), trim)); pole.position.set(8.6, 2.1, 9.4); root.add(pole);
  const arm = new Mesh(new BoxGeometry(1.1, 0.07, 0.07), trim); arm.position.set(8.1, 4.15, 9.4); root.add(arm);
  const bulb = new Mesh(new SphereGeometry(0.16, 12, 8), new MeshBasicMaterial({ color: 0xffd9a0 })); bulb.position.set(7.6, 4.05, 9.4); root.add(bulb);
  const pl = new PointLight(0xffc27a, 7, 11, 1.5); pl.position.copy(bulb.position); root.add(pl); refs.lights.push(pl);
  const ps = new Sprite(new SpriteMaterial({ map: T.glowSprite(), blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 })); ps.scale.set(2.6, 2.6, 1); ps.position.copy(bulb.position); root.add(ps);

  refs.roofY = roofY; refs.MAIN = MAIN; refs.GAR = GAR; refs.plasterMat = plasterM;
  return refs;
}
