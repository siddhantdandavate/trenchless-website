import * as THREE from 'three';

// ── Helper ────────────────────────────────────────────────────────────────────

export function latLngToVector3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
  );
}

// ── Trayana Network: ONLY 5 locations (India hub + 4 international) ───────────

const TRAYANA_LOCATIONS = [
  { name: 'INDIA',       lat: 20.5937, lng:  78.9629, hub: true  },
  { name: 'DUBAI',       lat: 25.2048, lng:  55.2708, hub: false },
  { name: 'FRANCE',      lat: 50.9513, lng:   1.8587, hub: false },
  { name: 'KUALA LUMPUR',lat:  3.1390, lng: 101.6869, hub: false },
  { name: 'SINGAPORE',   lat:  1.3521, lng: 103.8198, hub: false },
] as const;

// Label offset direction and size (in local group space)
const LABEL_CFG: Record<string, { dx: number; dy: number }> = {
  'INDIA':        { dx:  0.9, dy:  0.1 },
  'DUBAI':        { dx: -0.9, dy: -0.1 },
  'FRANCE':       { dx: -0.9, dy:  0.2 },
  'KUALA LUMPUR': { dx:  0.9, dy: -0.1 },
  'SINGAPORE':    { dx:  0.9, dy: -0.4 },
};

// ── Globe3D ───────────────────────────────────────────────────────────────────

export class Globe3D {

  public  group:          THREE.Group;
  public  baseSphere:     THREE.Mesh;
  public  atmosphere:     THREE.Mesh;
  public  arcsGroup:      THREE.Group;
  public  nodesGroup:     THREE.Group;
  public  landParticles:  THREE.Points | null = null;
  public  labelGroups:    { group: THREE.Group }[] = [];
  public  manualRotationY = 0;
  public  manualRotationX = 0;  // vertical drag

  private radius:         number;
  private animTime        = 0;
  private autoRotTime     = 0;
  private loadTime        = 0;
  private isDragging      = false;
  private lastDragTime    = 0;
  private prevMouseX      = 0;
  private prevMouseY      = 0;
  private velocityX       = 0;
  private velocityY       = 0;
  private velocity        = 0;

  private pulseSpheres: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; t: number }[] = [];

  private boundDown: (e: PointerEvent) => void;
  private boundMove: (e: PointerEvent) => void;
  private boundUp:   ()  => void;

  // ── Constructor ─────────────────────────────────────────────────────────────

  constructor(radius = 4.2) {
    this.radius = radius;

    this.group      = new THREE.Group();
    this.arcsGroup  = new THREE.Group();
    this.nodesGroup = new THREE.Group();

    // ① Pitch-black base sphere
    const sGeo = new THREE.SphereGeometry(radius, 64, 64);
    const sMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0 });
    this.baseSphere = new THREE.Mesh(sGeo, sMat);
    this.group.add(this.baseSphere);

    // ② Fine particle continents (pixel-sampled from world-map image)
    this.buildContinentParticles();

    // ③ Atmosphere — prominent orange glow at the bottom edge
    this.atmosphere = this.buildAtmosphere();
    this.group.add(this.atmosphere);

    // ④ Network nodes, labels, arcs
    this.buildNetworkLayer();
    this.group.add(this.arcsGroup);
    this.group.add(this.nodesGroup);

    // ⑤ Orient Earth so INDIA faces camera.
    // With latLngToVector3: 90°W (Americas) = +z (camera-facing at rot=0).
    // India (79°E) is at -z (hidden). Adding π flips India to +z = visible.
    // Subtract 0.4 to nudge India right-of-center.
    this.group.rotation.y =  Math.PI - 0.4;  // ≈ 2.74 rad
    this.group.rotation.x =  0.10;

    // Bind pointer handlers
    this.boundDown = this.onDown.bind(this);
    this.boundMove = this.onMove.bind(this);
    this.boundUp   = this.onUp.bind(this);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  public initInteraction(_el: HTMLElement) {
    this.loadTime     = performance.now();
    this.lastDragTime = performance.now();
    window.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup',   this.boundUp);
  }

  public disposeInteraction() {
    window.removeEventListener('pointerdown', this.boundDown);
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup',   this.boundUp);
  }

  public update(delta: number, scrollProgress: number) {
    const now = performance.now();
    this.animTime += delta;

    // Inertia decay after drag release
    if (!this.isDragging) {
      if (Math.abs(this.velocityX) > 0.00005) {
        this.velocityX       *= 0.92;
        this.manualRotationX += this.velocityX;
        // Clamp X rotation so globe doesn't flip upside down
        this.manualRotationX  = Math.max(-0.8, Math.min(0.8, this.manualRotationX));
      }
      if (Math.abs(this.velocityY) > 0.00005) {
        this.velocityY       *= 0.92;
        this.manualRotationY += this.velocityY;
      }
    }

    // Auto-rotation: hold 2.5 s on load, pause 1.5 s after drag
    const sinceLoad = now - this.loadTime;
    const sinceDrag = now - this.lastDragTime;
    if (!this.isDragging && sinceLoad > 2500 && sinceDrag > 1500) {
      this.autoRotTime += delta;
    }

    // Bounded gentle oscillation — India/network stays on the right side
    const base   = Math.PI - 0.4;  // same as constructor: India facing camera
    const swing  = Math.sin(this.autoRotTime * 0.16) * 0.22;
    const scroll = scrollProgress * Math.PI * 1.5;
    this.group.rotation.y = base + swing + scroll + this.manualRotationY;
    this.group.rotation.x = 0.10 + this.manualRotationX;
    this.group.rotation.z = -0.03;

    // Update world matrices so label visibility check is accurate
    this.group.updateMatrixWorld(true);

    // Per-label: back-face cull + left-zone fade
    this.labelGroups.forEach(({ group: lg }) => {
      const wp = new THREE.Vector3().setFromMatrixPosition(lg.matrixWorld);
      let opacity = 1.0;
      if (wp.z < 0) {
        opacity = 0;
      } else if (wp.x < 0) {
        opacity = Math.max(0, 1.0 - Math.abs(wp.x) * 1.6);
      }
      lg.traverse(child => {
        if ((child as THREE.Sprite).isSprite) {
          ((child as THREE.Sprite).material as THREE.SpriteMaterial).opacity = opacity;
        } else if ((child as THREE.Line).isLine) {
          ((child as THREE.Line).material as THREE.LineBasicMaterial).opacity = opacity * 0.8;
        }
      });
    });

    // Moving satellites along arcs
    this.pulseSpheres.forEach(p => {
      p.t = (p.t + p.speed) % 1;
      p.mesh.position.copy(p.curve.getPointAt(p.t));
    });
  }

  // ── Private builders ────────────────────────────────────────────────────────

  private buildContinentParticles() {
    // Use topology map as primary — land = bright (elevation), ocean = black.
    // This is the most reliable cross-origin source.
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

    img.onload = () => {
      const W = 2048, H = 1024;
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      const positions: number[] = [];
      const colors:    number[] = [];

      // Dense sampling — gives the crisp dot-field seen in the reference
      const latSteps = 400, lngSteps = 800;
      for (let i = 0; i < latSteps; i++) {
        const lat = -90 + (180 * i) / latSteps;
        for (let j = 0; j < lngSteps; j++) {
          const lng = -180 + (360 * j) / lngSteps;
          const px  = Math.floor(((lng + 180) / 360) * W);
          const py  = Math.floor(((90 - lat)  / 180) * H);
          const r   = data[(py * W + px) * 4];
          if (r > 18) {   // land = elevated terrain (bright pixels)
            const jLat = lat + (Math.random() - 0.5) * 0.2;
            const jLng = lng + (Math.random() - 0.5) * 0.2;
            const v = latLngToVector3(jLat, jLng, this.radius + 0.005);
            positions.push(v.x, v.y, v.z);
            const br = 0.55 + (r / 255) * 0.45;
            colors.push(br, br, br);
          }
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors,    3));

      const mat = new THREE.PointsMaterial({
        size: 0.022,
        map:  new THREE.CanvasTexture(this.makeDotTexture()),
        vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
        opacity: 0.92, sizeAttenuation: true,
      });

      // Remove placeholder and add real particles
      const old = this.group.getObjectByName('placeholder_dots');
      if (old) this.group.remove(old);

      this.landParticles = new THREE.Points(geo, mat);
      this.group.add(this.landParticles);
    };

    img.onerror = () => this.buildContinentParticlesFallback();
  }

  /** Fallback using topology map (land = bright elevation) */
  private buildContinentParticlesFallback() {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
    img.onload = () => {
      const W = 1024, H = 512;
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      const positions: number[] = [];
      const colors:    number[] = [];

      const latSteps = 350, lngSteps = 700;
      for (let i = 0; i < latSteps; i++) {
        const lat = -90 + (180 * i) / latSteps;
        for (let j = 0; j < lngSteps; j++) {
          const lng = -180 + (360 * j) / lngSteps;
          const px  = Math.floor(((lng + 180) / 360) * W);
          const py  = Math.floor(((90 - lat)  / 180) * H);
          const r   = data[(py * W + px) * 4];
          if (r > 18) {
            const v = latLngToVector3(
              lat + (Math.random() - 0.5) * 0.2,
              lng + (Math.random() - 0.5) * 0.2,
              this.radius + 0.005,
            );
            positions.push(v.x, v.y, v.z);
            const br = 0.6 + (r / 255) * 0.4;
            colors.push(br, br, br);
          }
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors,    3));

      const mat = new THREE.PointsMaterial({
        size: 0.022, map: new THREE.CanvasTexture(this.makeDotTexture()),
        vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9,
        sizeAttenuation: true,
      });

      if (this.landParticles) this.group.remove(this.landParticles);
      this.landParticles = new THREE.Points(geo, mat);
      this.group.add(this.landParticles);
    };
  }

  private makeDotTexture(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const ctx = c.getContext('2d')!;
    // Soft circular dot with feathered edge — avoids square aliasing
    const grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
    grd.addColorStop(0,   'rgba(255,255,255,1)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    grd.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    return c;
  }

  private buildAtmosphere(): THREE.Mesh {
    const geo = new THREE.SphereGeometry(this.radius * 1.12, 64, 64);
    const vert = /* glsl */`
      varying vec3 vNormal;
      void main() {
        vNormal     = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    // Matches reference: dominant orange-amber glow at bottom,
    // thinner blue accent on upper/right rim
    const frag = /* glsl */`
      varying vec3 vNormal;
      void main() {
        vec3 south = normalize(vec3(0.0, -1.0, 0.0));
        vec3 view  = normalize(vec3(0.0,  0.0, 1.0));

        float edgeBottom = pow(max(0.0, 0.62 - dot(vNormal, south)), 2.5);
        float edgeRim    = pow(max(0.0, 0.58 - dot(vNormal, view )), 3.2);

        vec3 orange = vec3(1.0, 0.38, 0.04) * edgeBottom * 2.2;
        vec3 blue   = vec3(0.05, 0.35, 1.0) * edgeRim   * 0.85;

        float alpha = clamp((edgeBottom + edgeRim) * 0.9, 0.0, 1.0);
        gl_FragColor = vec4(orange + blue, alpha);
      }
    `;
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag,
      blending: THREE.AdditiveBlending, side: THREE.BackSide,
      transparent: true, depthWrite: false,
    });
    return new THREE.Mesh(geo, mat);
  }

  private buildNetworkLayer() {
    const indiaData = TRAYANA_LOCATIONS.find(l => l.name === 'INDIA')!;
    const indiaVec  = latLngToVector3(indiaData.lat, indiaData.lng, this.radius + 0.02);

    TRAYANA_LOCATIONS.forEach(loc => {
      const pos = latLngToVector3(loc.lat, loc.lng, this.radius + 0.02);
      const cfg = LABEL_CFG[loc.name] ?? { dx: 0.5, dy: 0 };

      // ── Node dot ───────────────────────────────────────────────────────
      const r   = loc.hub ? 0.028 : 0.016;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff5500 }),
      );
      dot.position.copy(pos);
      this.nodesGroup.add(dot);

      // Outer pulse ring for INDIA hub
      if (loc.hub) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(r + 0.01, r + 0.032, 48),
          new THREE.MeshBasicMaterial({ color: 0xff5500, side: THREE.DoubleSide, transparent: true, opacity: 0.4 }),
        );
        ring.position.copy(pos);
        ring.lookAt(pos.clone().multiplyScalar(2));
        this.nodesGroup.add(ring);
      }

      // ── Label + leader line ────────────────────────────────────────────
      const lg = new THREE.Group();
      lg.position.copy(pos);
      lg.lookAt(pos.clone().multiplyScalar(2));  // face outward from globe

      // Thin leader line
      const lGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(cfg.dx, cfg.dy, 0.01),
      ]);
      lg.add(new THREE.Line(lGeo, new THREE.LineBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.85 })));

      // Label sprite
      lg.add(this.makeLabel(loc.name, loc.hub, cfg));

      this.nodesGroup.add(lg);
      this.labelGroups.push({ group: lg });

      // ── Connection arc: India → International ──────────────────────────
      if (!loc.hub) {
        const mid  = indiaVec.clone().add(pos).multiplyScalar(0.5);
        const dist = indiaVec.distanceTo(pos);
        mid.normalize().multiplyScalar(this.radius + dist * 0.55);

        const curve = new THREE.CatmullRomCurve3([indiaVec, mid, pos]);
        this.arcsGroup.add(new THREE.Mesh(
          new THREE.TubeGeometry(curve, 80, 0.004, 6, false),
          new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8 }),
        ));

        // Moving satellite dot along the arc
        const sat = new THREE.Mesh(
          new THREE.SphereGeometry(0.013, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff }),
        );
        this.arcsGroup.add(sat);
        this.pulseSpheres.push({ mesh: sat, curve, speed: 0.001 + Math.random() * 0.001, t: Math.random() });
      }
    });
  }

  private makeLabel(text: string, isPrimary: boolean, cfg: { dx: number; dy: number }): THREE.Sprite {
    const W = 320, H = 80;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d')!;

    // Dark semi-transparent background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.beginPath();
    ctx.roundRect(4, 14, W - 8, H - 28, 8);
    ctx.fill();

    // Text
    const fs = isPrimary ? 22 : 17;
    ctx.font        = `${isPrimary ? 'bold ' : '600 '}${fs}px "Inter", "Helvetica Neue", sans-serif`;
    ctx.fillStyle   = isPrimary ? '#ff7733' : '#f0f0f0';
    ctx.textAlign   = cfg.dx > 0 ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = 'rgba(0,0,0,1)';
    ctx.shadowBlur   = 8;
    const tx = cfg.dx > 0 ? 16 : W - 16;
    ctx.fillText(text, tx, H / 2);

    const mat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true, depthTest: false });
    const spr = new THREE.Sprite(mat);
    // Scale: hub label is larger
    spr.scale.set(isPrimary ? 1.0 : 0.82, 0.26, 1);
    // Position: at the end of the leader line
    spr.position.set(
      cfg.dx + (cfg.dx > 0 ? 0.38 : -0.38),
      cfg.dy,
      0.01,
    );
    return spr;
  }

  // ── Pointer interaction ──────────────────────────────────────────────────────

  private onDown(e: PointerEvent) {
    this.isDragging = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
    this.velocityX  = 0;
    this.velocityY  = 0;
  }

  private onMove(e: PointerEvent) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.prevMouseX;
    const dy = e.clientY - this.prevMouseY;
    this.velocityY       = dx * 0.0025;
    this.velocityX       = dy * 0.0025;
    this.manualRotationY += this.velocityY;
    this.manualRotationX += this.velocityX;
    // Clamp X so it doesn’t flip
    this.manualRotationX = Math.max(-0.8, Math.min(0.8, this.manualRotationX));
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  }

  private onUp() {
    if (!this.isDragging) return;
    this.isDragging   = false;
    this.lastDragTime = performance.now();
  }
}
