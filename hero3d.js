/* ===== Lord of the Bins: 3D scroll hero (Three.js) =====
   Doors open, then fly through a corridor of real jobs.
   Each before photo flips to its after photo as you pass. */
(() => {
'use strict';
const hero = document.getElementById('hero');
if (!hero || !window.THREE) return;
const T = window.THREE;

/* jobs in the corridor (images/ba/NN-before.jpg + NN-after.jpg). Missing ones are skipped. */
const ALL_JOBS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14'];
const FINAL = '01';   // the clean space you arrive in at the end (uses NN-after.jpg)

let renderer;
try { renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
catch (e) { console.warn('3D hero: WebGL not available, using 2D version'); return; }

const stage = hero.querySelector('.stage');
const old = document.getElementById('scene');
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.outputEncoding = T.sRGBEncoding;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.domElement.className = 'scene3d';
stage.insertBefore(renderer.domElement, stage.firstChild);
if (old) old.style.display = 'none';
window.HERO3D = true;

const GREEN = 0x81d742;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < innerHeight;
const JOBS = mobile ? ALL_JOBS.slice(0, 8) : ALL_JOBS;   // fewer photos on phones = faster loading
const cl = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;

const scene = new T.Scene();
const BG = new T.Color(0x050605);
scene.background = BG;
scene.fog = new T.Fog(BG, 4, 22);
const camera = new T.PerspectiveCamera(mobile ? 70 : 55, innerWidth / innerHeight, .1, 150);

/* lights (photos are unlit so their colours stay true; lights are for wall, door and floor) */
scene.add(new T.HemisphereLight(0xdfffd0, 0x0a1208, .7));
const glow = new T.PointLight(GREEN, 1, 16); glow.position.set(0, 1.2, -3); scene.add(glow);
const frontLight = new T.PointLight(0xffffff, .7, 14); frontLight.position.set(0, 2.2, 6); scene.add(frontLight);

const edgeMat = new T.LineBasicMaterial({ color: GREEN, transparent: true, opacity: .85 });
const ringMat = new T.LineBasicMaterial({ color: GREEN, transparent: true, opacity: .28 });
const rectLine = (w, h, mat) => {
  const g = new T.BufferGeometry().setFromPoints([
    new T.Vector3(-w / 2, -h / 2, 0), new T.Vector3(w / 2, -h / 2, 0),
    new T.Vector3(w / 2, h / 2, 0), new T.Vector3(-w / 2, h / 2, 0)]);
  return new T.LineLoop(g, mat);
};

/* ---------- brick wall with a doorway ---------- */
const brickTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#0a0e09'; g.fillRect(0, 0, 512, 512);
  const bw = 64, bh = 28;
  for (let y = 0, row = 0; y < 512; y += bh, row++)
    for (let x = -(row % 2) * bw / 2; x < 512; x += bw) {
      const v = 16 + Math.random() * 14;
      g.fillStyle = `rgb(${v + 8},${v + 5},${v})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
    }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(.3, .3); t.encoding = T.sRGBEncoding;
  return t;
};
const DW = 1.5, DH = 3.4, FLOOR = -1.2;
const wallShape = new T.Shape();
wallShape.moveTo(-18, -3); wallShape.lineTo(18, -3); wallShape.lineTo(18, 12); wallShape.lineTo(-18, 12); wallShape.lineTo(-18, -3);
const hole = new T.Path();
hole.moveTo(-DW, FLOOR); hole.lineTo(-DW, FLOOR + DH); hole.lineTo(DW, FLOOR + DH); hole.lineTo(DW, FLOOR); hole.lineTo(-DW, FLOOR);
wallShape.holes.push(hole);
const wall = new T.Mesh(new T.ShapeGeometry(wallShape), new T.MeshStandardMaterial({ map: brickTex(), roughness: .92, metalness: .05 }));
scene.add(wall);

/* ---------- double door ---------- */
const leafMat = new T.MeshStandardMaterial({ color: 0x121a10, roughness: .5, metalness: .4 });
const handleMat = new T.MeshBasicMaterial({ color: GREEN });
const makeLeaf = side => {           // side -1 = left leaf, 1 = right leaf (hinged on the outer edge)
  const pivot = new T.Group();
  pivot.position.set(side * DW, FLOOR + DH / 2, 0);
  const leaf = new T.Mesh(new T.BoxGeometry(DW - .04, DH - .04, .08), leafMat);
  leaf.position.x = -side * DW / 2;
  const t1 = rectLine(DW - .32, DH - .32, edgeMat); t1.position.set(-side * DW / 2, 0, .05);
  const t2 = rectLine(DW - .62, DH * .42, edgeMat); t2.position.set(-side * DW / 2, DH * .17, .05);
  const handle = new T.Mesh(new T.BoxGeometry(.06, .5, .08), handleMat);
  handle.position.set(-side * (DW - .22), -.1, .1);
  pivot.add(leaf, t1, t2, handle); scene.add(pivot);
  return pivot;
};
const leaves = [makeLeaf(-1), makeLeaf(1)];
const doorFrame = rectLine(DW * 2 + .16, DH + .08, new T.LineBasicMaterial({ color: GREEN }));
doorFrame.position.set(0, FLOOR + DH / 2, .02); scene.add(doorFrame);
const leak = new T.Mesh(new T.PlaneGeometry(DW * 2, DH), new T.MeshBasicMaterial({ color: 0xd9ffc0, transparent: true, opacity: 0, fog: false, depthWrite: false }));
leak.position.set(0, FLOOR + DH / 2, -.4); scene.add(leak);

/* ---------- dust particles ---------- */
const PN = mobile ? 400 : 700, pos = new Float32Array(PN * 3);
const SP = 3.6, Z0 = -4.5;
let zFinal = Z0 - JOBS.length * SP - 2.5;
for (let i = 0; i < PN; i++) {
  pos[i * 3] = (Math.random() - .5) * 14;
  pos[i * 3 + 1] = FLOOR + Math.random() * 6;
  pos[i * 3 + 2] = 6 - Math.random() * (6 - zFinal + 6);
}
const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pos, 3));
const dust = new T.Points(pGeo, new T.PointsMaterial({ color: 0xeaf6dc, size: .035, transparent: true, opacity: .7, depthWrite: false, blending: T.AdditiveBlending }));
scene.add(dust);

/* ---------- photos ---------- */
const loader = new T.TextureLoader();
const loadTex = url => new Promise(res => loader.load(url, t => {
  t.encoding = T.sRGBEncoding; t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); res(t);
}, undefined, () => res(null)));
const fit = (t, aspect) => {      // cover-fit a texture onto a plane of the given aspect ratio
  const ia = t.image.width / t.image.height;
  if (ia > aspect) { t.repeat.set(aspect / ia, 1); t.offset.set((1 - aspect / ia) / 2, 0); }
  else { t.repeat.set(1, ia / aspect); t.offset.set(0, (1 - ia / aspect) / 2); }
  t.needsUpdate = true;
};

const panels = [];
let finalMesh = null, finalTex = null;
const FD = 4.6;  // camera distance from the final photo
const sizeFinal = () => {
  if (!finalMesh) return;
  const h = 2 * FD * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * 1.04;
  finalMesh.scale.set(h * camera.aspect, h, 1);
  fit(finalTex, camera.aspect);
};

Promise.all(JOBS.map(id => Promise.all([loadTex(`images/ba/${id}-before.jpg`), loadTex(`images/ba/${id}-after.jpg`)])
  .then(([b, a]) => (b && a ? { id, b, a } : null))))
.then(list => {
  const jobs = list.filter(Boolean);
  if (!jobs.length) { console.warn('3D hero: no before/after photos found in images/ba/'); return; }
  console.info(`3D hero: ${jobs.length} jobs loaded`);
  const PW = mobile ? 1.5 : 2.4, PH = PW * .75, X = mobile ? 1.2 : 2.75;

  jobs.forEach((j, i) => {
    const side = i % 2 ? 1 : -1;
    const g = new T.Group();
    g.position.set(side * X, .45, Z0 - i * SP);
    g.userData = { base: side > 0 ? -.55 : .55, i };
    fit(j.b, PW / PH); fit(j.a, PW / PH);
    const geo = new T.PlaneGeometry(PW, PH);
    const frontFace = new T.Mesh(geo, new T.MeshBasicMaterial({ map: j.b }));
    const backFace = new T.Mesh(geo, new T.MeshBasicMaterial({ map: j.a })); backFace.rotation.y = Math.PI; backFace.position.z = -.01;
    const e1 = rectLine(PW + .08, PH + .08, edgeMat); e1.position.z = .006;
    const e2 = rectLine(PW + .08, PH + .08, edgeMat); e2.position.z = -.016;
    g.add(frontFace, backFace, e1, e2); scene.add(g); panels.push(g);
    const ring = rectLine(mobile ? 4.4 : 8.2, 4.8, ringMat);
    ring.position.set(0, 1.2, Z0 - i * SP + SP / 2); scene.add(ring);
  });

  zFinal = Z0 - jobs.length * SP - 2.5;

  /* final clean space */
  const fj = jobs.find(j => j.id === FINAL) || jobs[0];
  finalTex = fj.a.clone(); finalTex.needsUpdate = true;
  finalMesh = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: finalTex }));
  finalMesh.position.set(0, .7, zFinal);
  scene.add(finalMesh); sizeFinal();

  /* floor + grid */
  const len = 20 - zFinal;
  const floor = new T.Mesh(new T.PlaneGeometry(36, len), new T.MeshStandardMaterial({ color: 0x070a06, roughness: .8, metalness: .2 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR, zFinal / 2); scene.add(floor);
  const pts = [];
  for (let x = -8; x <= 8; x++) pts.push(new T.Vector3(x, FLOOR + .01, 10), new T.Vector3(x, FLOOR + .01, zFinal - 10));
  for (let z = 10; z >= zFinal - 10; z -= 2) pts.push(new T.Vector3(-8, FLOOR + .01, z), new T.Vector3(8, FLOOR + .01, z));
  scene.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: GREEN, transparent: true, opacity: .12 })));
});

/* ---------- resize + mouse ---------- */
const resize = () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  sizeFinal();
};
addEventListener('resize', resize); resize();
let mx = 0, my = 0, tmx = 0, tmy = 0;
if (!reduce) addEventListener('mousemove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; });

/* ---------- animate ---------- */
const clock = new T.Clock();
let prog = 0;
(function loop() {
  requestAnimationFrame(loop);
  const r = hero.getBoundingClientRect();
  if (r.bottom <= 0) return;
  const target = cl(-r.top / (hero.offsetHeight - innerHeight));
  prog += (target - prog) * (reduce ? 1 : .08);
  const p = prog, t = clock.getElapsedTime();
  mx += (tmx - mx) * .05; my += (tmy - my) * .05;

  /* doors open in the first part of the scroll */
  const open = ease(cl(p / .14));
  leaves[0].rotation.y = open * 1.75;
  leaves[1].rotation.y = -open * 1.75;
  leak.material.opacity = Math.sin(Math.PI * cl(p / .16)) * .55;
  glow.intensity = 1 + open * 2.2;

  /* camera: approach the door, then fly down the corridor to the final clean space */
  const zEnd = zFinal + FD;
  const z = p < .14 ? lerp(6, 2.2, ease(p / .14)) : lerp(2.2, zEnd, ease(cl((p - .14) / .86)));
  const end = ease(cl((p - .85) / .15));
  const cx = Math.sin(p * 9) * .35 * (1 - end) + mx * .5 * (1 - end * .7);
  const cy = .55 + Math.sin(p * 5) * .12 * (1 - end) - my * .25 * (1 - end * .7) + end * .15;
  camera.position.set(cx, cy, z);
  camera.lookAt(cx * .4, lerp(.6, .7, end), z - 6);

  /* photos flip from before to after as you pass them */
  panels.forEach(g => {
    const d = z - g.position.z;
    const f = ease(cl((7 - d) / 3.5));
    g.rotation.y = g.userData.base + f * Math.PI;
    g.position.y = .45 + Math.sin(t * .8 + g.userData.i) * .06;
  });

  /* dust drifts upward */
  const a = pGeo.attributes.position.array;
  for (let i = 1; i < a.length; i += 3) { a[i] += .0025; if (a[i] > FLOOR + 6) a[i] = FLOOR; }
  pGeo.attributes.position.needsUpdate = true;

  /* fog lifts and light brightens at the end */
  scene.fog.near = 4 + end * 8;
  scene.fog.far = 22 + end * 50;
  renderer.toneMappingExposure = 1.05 + end * .3;

  renderer.render(scene, camera);
})();
})();