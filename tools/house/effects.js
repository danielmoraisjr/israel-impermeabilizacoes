// A bolha (cúpula), a chuva em 3D e os respingos.
import {
  Mesh, SphereGeometry, ShaderMaterial, AdditiveBlending, DoubleSide, Color, Vector4, TorusGeometry, MeshBasicMaterial,
  BufferGeometry, BufferAttribute, LineSegments, Points,
} from 'three';

export const R = 9.2; // raio da bolha

// ------------------------------------------------------------------ bolha
export function createDome() {
  const hits = Array.from({ length: 24 }, () => new Vector4(0, 0, 0, -99));
  const mat = new ShaderMaterial({
    transparent: true, depthWrite: false, side: DoubleSide, blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uBarrier: { value: 1 }, uHits: { value: hits }, uColor: { value: new Color(0x2fc8ff) }, uFlash: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uTime, uBarrier, uFlash; uniform vec3 uColor; uniform vec4 uHits[24]; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float fres = pow(1.0 - abs(dot(normalize(vN), V)), 3.2);
        float lat = abs(sin(vW.y * 1.15 - uTime * 0.3));
        float bands = smoothstep(0.985, 1.0, lat) * 0.09;
        float lon = atan(vW.z, vW.x);
        float mer = smoothstep(0.988, 1.0, abs(sin(lon * 16.0))) * 0.045;
        float rip = 0.0;
        for (int i = 0; i < 24; i++) {
          vec4 h = uHits[i]; float age = uTime - h.w;
          if (age > 0.0 && age < 1.5) {
            float d = distance(vW, h.xyz);
            rip += exp(-pow((d - age * 3.6) * 3.4, 2.0)) * exp(-age * 2.6) * 0.55 + exp(-d * 5.5) * exp(-age * 9.0) * 0.7;
          }
        }
        float a = (fres * 0.7 + 0.018 + bands + mer + rip) * uBarrier;
        vec3 col = uColor * (1.0 + rip * 0.7) + vec3(0.45, 0.65, 0.9) * uFlash * 0.6;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }`,
  });
  const mesh = new Mesh(new SphereGeometry(R, 80, 48, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  mesh.renderOrder = 5;
  const ring = new Mesh(new TorusGeometry(R, 0.06, 8, 160), new MeshBasicMaterial({ color: 0x2fc8ff, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.06;
  let hi = 0;
  return {
    mesh, ring, mat,
    ripple(x, y, z, t) { hits[hi].set(x, y, z, t); hi = (hi + 1) % hits.length; },
  };
}

// ------------------------------------------------------------------ chuva
export function createRain(max) {
  const pos = new Float32Array(max * 6), alp = new Float32Array(max * 2);
  const drops = new Float32Array(max * 4); // x y z v
  for (let i = 0; i < max; i++) { alp[i * 2] = 0.9; alp[i * 2 + 1] = 0.0; respawn(drops, i, true); }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3).setUsage(35048));
  geo.setAttribute('aAlpha', new BufferAttribute(alp, 1));
  const mat = new ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new Color(0xbfdcf0) }, uOpacity: { value: 0.7 } },
    vertexShader: `attribute float aAlpha; varying float vA; void main(){ vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vA; void main(){ gl_FragColor = vec4(uColor, vA * uOpacity); }`,
  });
  const lines = new LineSegments(geo, mat); lines.frustumCulled = false; lines.renderOrder = 6;
  return { lines, mat, geo, pos, drops, max };
}

export function respawn(d, i, init) {
  d[i * 4] = (Math.random() - 0.5) * 34;
  d[i * 4 + 1] = init ? Math.random() * 19 : 18 + Math.random() * 4;
  d[i * 4 + 2] = (Math.random() - 0.5) * 34;
  d[i * 4 + 3] = 0.8 + Math.random() * 0.4; // fator de velocidade
}

// ------------------------------------------------------------------ respingos
export function createSplash(max) {
  const pos = new Float32Array(max * 3), vel = new Float32Array(max * 3), life = new Float32Array(max), size = new Float32Array(max), alpha = new Float32Array(max);
  const maxLife = new Float32Array(max); const grav = new Float32Array(max);
  for (let i = 0; i < max; i++) { pos[i * 3 + 1] = -50; life[i] = 0; }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3).setUsage(35048));
  geo.setAttribute('aSize', new BufferAttribute(size, 1).setUsage(35048));
  geo.setAttribute('aAlpha', new BufferAttribute(alpha, 1).setUsage(35048));
  const mat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uScale: { value: 600 }, uColor: { value: new Color(0xcfe8ff) } },
    vertexShader: `attribute float aSize; attribute float aAlpha; uniform float uScale; varying float vA;
      void main(){ vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = max(1.0, aSize * uScale / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(uColor, vA * (1.0 - d * 2.0)); }`,
  });
  const points = new Points(geo, mat); points.frustumCulled = false; points.renderOrder = 7;
  let cursor = 0;
  return {
    points, mat, geo,
    spawn(x, y, z, vx, vy, vz, l, s, g = 9.5) {
      const i = cursor; cursor = (cursor + 1) % max;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
      life[i] = l; maxLife[i] = l; size[i] = s; grav[i] = g;
    },
    update(dt, onGround) {
      for (let i = 0; i < max; i++) {
        if (life[i] <= 0) { alpha[i] = 0; continue; }
        life[i] -= dt;
        vel[i * 3 + 1] -= grav[i] * dt;
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        if (pos[i * 3 + 1] < 0.02) { if (onGround && grav[i] > 5) onGround(pos[i * 3], pos[i * 3 + 2]); life[i] = 0; alpha[i] = 0; continue; }
        alpha[i] = Math.min(1, life[i] / maxLife[i] * 1.6) * 0.9;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.aAlpha.needsUpdate = true; geo.attributes.aSize.needsUpdate = true;
    },
  };
}
