// Casa 3D com bolha protetora e chuva. Carregado sob demanda (três.js só entra se o aparelho aguentar).
import {
  WebGLRenderer, PMREMGenerator, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace, Color, MathUtils,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildScene, roofY } from './build.js';
import { createDome, createRain, createSplash, respawn, R } from './effects.js';

const WEATHER = {
  garoa: { drops: 520, speed: 11.5, wind: 0.7, len: 0.42, opacity: 0.55, exposure: 1.05, storm: false },
  chuva: { drops: 1500, speed: 15.5, wind: 1.9, len: 0.7, opacity: 0.68, exposure: 0.98, storm: false },
  temporal: { drops: 2900, speed: 20, wind: 5.2, len: 1.0, opacity: 0.8, exposure: 0.9, storm: true },
};

function mount(container, opts = {}) {
  const small = matchMedia('(max-width: 760px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const dprMax = small ? 1.5 : 1.75;
  const renderer = new WebGLRenderer({ alpha: true, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !small; renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  const el = renderer.domElement; el.className = 'house-canvas'; el.setAttribute('aria-hidden', 'true');
  container.appendChild(el);

  const scene = new Scene();
  // reflexos suaves (telhado molhado, vidros)
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture; scene.environmentIntensity = 0.28; pmrem.dispose();
  const camera = new PerspectiveCamera(30, 1, 0.5, 120);
  const target = { x: 1.1, y: 1.6, z: 1.4 };

  // ---------- luz ----------
  const hemi = new HemisphereLight(0x8fb4e0, 0x1a2b3d, 0.9); scene.add(hemi);
  const moon = new DirectionalLight(0xbfd8ff, 1.15); moon.position.set(-9, 15, 11); scene.add(moon);
  if (!small) {
    moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    const c = moon.shadow.camera; c.left = -15; c.right = 15; c.top = 15; c.bottom = -15; c.near = 1; c.far = 50; moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.04;
  }
  const rim = new DirectionalLight(0x2fc8ff, 0.55); rim.position.set(10, 6, -10); scene.add(rim);

  const H = buildScene({ shadows: !small });
  scene.add(H.root);
  const dome = createDome(); scene.add(dome.mesh); scene.add(dome.ring);
  const maxDrops = small ? 1500 : 2900;
  const rain = createRain(maxDrops); scene.add(rain.lines);
  const splash = createSplash(small ? 380 : 700); scene.add(splash.points);

  // ---------- estado ----------
  const state = { weather: opts.weather || 'chuva', barrier: opts.barrier !== false };
  const live = { drops: 0, speed: 0, wind: 0, len: 0, opacity: 0, exposure: 1, barrier: state.barrier ? 1 : 0, wet: 0, flash: 0, gust: 0 };
  const w0 = WEATHER[state.weather];
  Object.assign(live, { drops: w0.drops * (small ? 0.5 : 1), speed: w0.speed, wind: w0.wind, len: w0.len, opacity: w0.opacity, exposure: w0.exposure });
  let time = 0, running = false, raf = 0, last = 0, nextBolt = 3, boltLeft = 0, quality = 1, slow = 0, frames = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const lights0 = { hemi: hemi.intensity, moon: moon.intensity };
  let flashCb = opts.onFlash || null;

  const COUNT = small ? 0.5 : 1;
  function setSize() {
    const w = container.clientWidth || 800, h = container.clientHeight || 600;
    renderer.setSize(w, h, false); el.style.width = '100%'; el.style.height = '100%';
    camera.aspect = w / h; camera.updateProjectionMatrix();
    splash.mat.uniforms.uScale.value = h * 0.55 / Math.tan(MathUtils.degToRad(camera.fov / 2)) / 2 * 0.6;
    placeCamera();
  }
  let camAngle = 0.0;
  function placeCamera() {
    const aspect = camera.aspect;
    // enquadra a bolha inteira (largura ~20 u) em qualquer proporção
    const dist = Math.max(27, (38.5 / aspect) * (aspect < 1 ? 1.04 : 1.0));
    const a = 0.56 + camAngle, el_ = 0.31 + pointer.y * 0.03 + (aspect < 1 ? 0.05 : 0);
    camera.position.set(target.x + Math.sin(a) * dist * Math.cos(el_), target.y + Math.sin(el_) * dist, target.z + Math.cos(a) * dist * Math.cos(el_));
    camera.lookAt(target.x, target.y + 0.9, target.z);
  }

  // ---------- simulação ----------
  const gutterPts = H.drips;
  function step(dt) {
    time += dt;
    const W = WEATHER[state.weather];
    const k = 1 - Math.exp(-dt * 2.2);
    live.drops += (W.drops * COUNT * quality - live.drops) * k;
    live.speed += (W.speed - live.speed) * k; live.wind += (W.wind - live.wind) * k; live.len += (W.len - live.len) * k;
    live.opacity += (W.opacity - live.opacity) * k; live.exposure += (W.exposure - live.exposure) * k;
    live.barrier += ((state.barrier ? 1 : 0) - live.barrier) * (1 - Math.exp(-dt * 3.2));
    live.gust = W.storm ? Math.sin(time * 0.7) * 0.5 + Math.sin(time * 1.9) * 0.25 : 0;
    const wind = live.wind * (1 + live.gust * 0.5);
    const barrierOn = state.barrier && live.barrier > 0.6;

    // relâmpagos (só no temporal)
    if (W.storm) {
      nextBolt -= dt;
      if (nextBolt <= 0) { boltLeft = 2; nextBolt = 3.5 + Math.random() * 5; live.flash = 1; }
      if (boltLeft > 0 && live.flash < 0.35) { boltLeft--; live.flash = boltLeft ? 0.8 : 0; if (boltLeft === 1) live.flash = 0.85; }
    }
    live.flash = Math.max(0, live.flash - dt * 4.2);
    if (flashCb) flashCb(live.flash);

    // chuva
    const n = Math.min(maxDrops, Math.round(live.drops));
    const d = rain.drops, p = rain.pos;
    const R2 = R * R, edge = (R - 1.4) * (R - 1.4);
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      const v = live.speed * d[o + 3];
      d[o + 1] -= v * dt; d[o] += wind * dt; d[o + 2] += wind * 0.25 * dt;
      const x = d[o], y = d[o + 1], z = d[o + 2];
      let hit = false;
      if (y <= 0) { hit = true; if (Math.random() < 0.05 && (!state.barrier || x * x + z * z > R2)) splash.spawn(x, 0.03, z, (Math.random() - 0.5) * 0.8, 1.2 + Math.random(), (Math.random() - 0.5) * 0.8, 0.35, 0.05, 9); }
      else if (live.barrier > 0.5) {
        const r2 = x * x + y * y + z * z;
        if (r2 < R2) {
          hit = true;
          if (r2 > edge) {
            const r = Math.sqrt(r2), nx = x / r, ny = y / r, nz = z / r;
            dome.ripple(nx * R, ny * R, nz * R, time);
            for (let s = 0; s < 3; s++) splash.spawn(nx * R, ny * R, nz * R, nx * (1 + Math.random() * 1.8) + (Math.random() - 0.5), ny * (1 + Math.random() * 1.5) + 0.6, nz * (1 + Math.random() * 1.8) + (Math.random() - 0.5), 0.55 + Math.random() * 0.3, 0.06, 7);
          }
        }
      } else {
        const ry = roofY(x, z);
        if (ry > 0 && y <= ry && y > ry - 0.7) {
          hit = true;
          if (Math.random() < 0.5) splash.spawn(x, ry + 0.02, z, (Math.random() - 0.5) * 1.2, 1.4 + Math.random() * 1.2, (Math.random() - 0.5) * 1.2, 0.3, 0.05, 11);
        }
      }
      if (hit) { respawn(d, i, false); continue; }
      const kk = live.len / Math.hypot(wind, v);
      p[i * 6] = x; p[i * 6 + 1] = y; p[i * 6 + 2] = z;
      p[i * 6 + 3] = x - wind * kk; p[i * 6 + 4] = y + v * kk; p[i * 6 + 5] = z - wind * 0.25 * kk;
    }
    rain.geo.setDrawRange(0, n * 2);
    rain.geo.attributes.position.needsUpdate = true;
    rain.mat.uniforms.uOpacity.value = live.opacity;

    // umidade sem barreira: telhado molha, calha pinga, mancha aparece
    const raining = live.drops > 100;
    const wetTarget = !state.barrier && raining ? 1 : 0;
    live.wet += (wetTarget - live.wet) * (1 - Math.exp(-dt * (wetTarget ? 0.22 : 0.45)));
    for (const m of H.roofMats) { m.roughness = 0.82 - live.wet * 0.58; m.color.setRGB(1 - live.wet * 0.5, 1 - live.wet * 0.46, 1 - live.wet * 0.36); }
    const sOp = MathUtils.smoothstep(live.wet, 0.3, 0.95) * 0.95;
    for (const s of H.stains) s.material.opacity = sOp;
    if (live.wet > 0.2 && !state.barrier) {
      const rate = 7 * (live.drops / 1500) * live.wet;
      for (const g of gutterPts) {
        if (!g.front && Math.random() > 0.35) continue;
        let c = rate * dt * (g.x1 - g.x0) * 0.25;
        while (c > 0) { if (Math.random() < c) splash.spawn(g.x0 + Math.random() * (g.x1 - g.x0), g.y - 0.05, g.z, 0, -1.2, g.front ? 0.15 : -0.15, 1.6, 0.085, 9.5); c -= 1; }
      }
    }
    splash.update(dt, (x, z) => { if (Math.random() < 0.35) splash.spawn(x, 0.03, z, (Math.random() - 0.5), 1.1, (Math.random() - 0.5), 0.3, 0.045, 9); });

    // bolha
    dome.mat.uniforms.uTime.value = time; dome.mat.uniforms.uBarrier.value = live.barrier; dome.mat.uniforms.uFlash.value = live.flash;
    dome.mesh.visible = dome.ring.visible = live.barrier > 0.01;
    dome.ring.material.opacity = (0.55 + Math.sin(time * 2.2) * 0.2 + live.flash * 0.4) * live.barrier;

    // luz
    renderer.toneMappingExposure = live.exposure;
    hemi.intensity = lights0.hemi + live.flash * 2.6 + (state.barrier ? 0 : -0.1);
    moon.intensity = lights0.moon + live.flash * 3.2;
    const flick = state.weather === 'temporal' ? 0.9 + Math.random() * 0.2 : 1;
    for (const m of H.windows) m.emissiveIntensity = (1.1 + (state.barrier ? 0.1 : -0.25 * live.wet)) * flick;

    // câmera: balanço leve + mouse (só com ponteiro fino)
    pointer.x += (pointer.tx - pointer.x) * 0.04; pointer.y += (pointer.ty - pointer.y) * 0.04;
    camAngle = Math.sin(time * 0.15) * 0.1 + pointer.x * 0.16;
    placeCamera();
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    step(dt);
    renderer.render(scene, camera);
    // desempenho adaptativo
    frames++; slow += dt > 0.03 ? 1 : 0;
    if (frames === 90) {
      if (slow > 30) {
        if (renderer.getPixelRatio() > 1.05) renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() - 0.35));
        else quality = Math.max(0.45, quality - 0.25);
        setSize();
      }
      frames = 0; slow = 0;
    }
  }

  setSize();
  const ro = new ResizeObserver(setSize); ro.observe(container);
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; pointer.tx = (e.clientX / innerWidth - 0.5) * 2; pointer.ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  const api = {
    state,
    setWeather(w) { if (WEATHER[w]) state.weather = w; },
    setBarrier(b) { state.barrier = !!b; },
    setActive(on) {
      if (on && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    },
    onFlash(cb) { flashCb = cb; },
    /** um quadro determinístico (pôster / movimento reduzido) */
    still(seconds = 3) {
      Math.random = (() => { let s = 12345; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
      for (let i = 0; i < maxDrops; i++) respawn(rain.drops, i, true);
      for (let t = 0; t < seconds; t += 0.033) step(0.033);
      renderer.render(scene, camera);
    },
    dispose() { api.setActive(false); ro.disconnect(); renderer.dispose(); el.remove(); },
    canvas: el,
  };
  window.IsraelHouse.last = api;
  return api;
}

window.IsraelHouse = { mount, last: null };
