import * as THREE from 'three';

export class Underground3D {
  public group: THREE.Group;
  
  // Scene components
  public strataGroup: THREE.Group;
  public surfaceGroup: THREE.Group;
  public borePathCurve: THREE.CatmullRomCurve3;
  
  // HDD Drill Rig & Assembly
  public drillAssembly: THREE.Group;
  public drillHead: THREE.Group;
  public drillCutter: THREE.Mesh;
  public drillShaftMesh: THREE.Mesh;
  public productPipeMesh: THREE.Mesh;
  public boreTunnelMesh: THREE.Mesh;
  
  // Microtunneling & Infrastructure
  public microtunnelGroup: THREE.Group;
  public railwayGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.strataGroup = new THREE.Group();
    this.surfaceGroup = new THREE.Group();
    this.drillAssembly = new THREE.Group();
    this.drillHead = new THREE.Group();
    this.microtunnelGroup = new THREE.Group();
    this.railwayGroup = new THREE.Group();

    // Hide initially until scroll transitions underground
    this.group.visible = false;
    this.group.position.set(0, -15, 0);

    // 1. Create Underground Strata & Surface
    this.createGroundStrata();

    // 2. Create HDD Bore Path Curve
    this.borePathCurve = this.createBorePathCurve();

    // 3. Create HDD Drill Head, Shaft & Product Pipe
    this.drillShaftMesh = new THREE.Mesh();
    this.productPipeMesh = new THREE.Mesh();
    this.boreTunnelMesh = new THREE.Mesh();
    this.drillCutter = new THREE.Mesh();
    this.createHDDAssembly();

    // 4. Create Surface Infrastructure (Railway Tracks & Utility Crossing)
    this.createSurfaceInfrastructure();

    // 5. Create Microtunneling & Pipe Jacking Setup
    this.createMicrotunnelingSetup();

    // Add everything to group
    this.group.add(this.strataGroup);
    this.group.add(this.surfaceGroup);
    this.group.add(this.drillAssembly);
    this.group.add(this.railwayGroup);
    this.group.add(this.microtunnelGroup);
  }

  private createGroundStrata() {
    // Geological layers extending from X: -30 to +50, Y: -20 to 5, Z: -10 to +10
    const layerHeight = 5;
    const width = 80;
    const depth = 30;

    const layers = [
      { name: 'SOIL & HUMUS', color: '#3a2416', y: 2.5, depth: 3 },
      { name: 'CLAY & GRAVEL STRATA', color: '#2b190e', y: -1.0, depth: 4 },
      { name: 'DENSE SANDSTONE', color: '#1c1008', y: -5.0, depth: 5 },
      { name: 'HARD ROCK FORMATION', color: '#0f0904', y: -9.5, depth: 5 },
      { name: 'DEEP BEDROCK', color: '#070402', y: -15.0, depth: 6 },
    ];

    layers.forEach(layer => {
      const geo = new THREE.BoxGeometry(width, layer.depth, depth);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(layer.color),
        roughness: 0.9,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(10, layer.y, 0);
      this.strataGroup.add(mesh);
    });

    // Particle texture in ground for geological cross-section texture
    const particleCount = 1500;
    const pos: number[] = [];
    for (let i = 0; i < particleCount; i++) {
      pos.push(
        (Math.random() - 0.3) * 70,
        -18 + Math.random() * 22,
        (Math.random() - 0.5) * 15
      );
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.12,
      color: new THREE.Color('#d97706'),
      transparent: true,
      opacity: 0.35,
    });
    const strataParticles = new THREE.Points(partGeo, partMat);
    this.strataGroup.add(strataParticles);
  }

  private createBorePathCurve(): THREE.CatmullRomCurve3 {
    // 3D Trajectory from Surface Entry Pit down into Subterranean Rock Strata and horizontally forward
    const points = [
      new THREE.Vector3(-18, 4.0, 0),    // Surface Entry Pit
      new THREE.Vector3(-12, 1.5, 0),    // Steerable entry slope
      new THREE.Vector3(-4, -4.5, 0),    // Transition into subterranean rock
      new THREE.Vector3(5, -6.5, 0),     // Horizontal bore path under infrastructure
      new THREE.Vector3(20, -6.5, 0),    // Main drill extension path
      new THREE.Vector3(35, -6.5, 0),    // Deep utility corridor
      new THREE.Vector3(48, -3.0, 0)     // Exit curve towards surface
    ];
    return new THREE.CatmullRomCurve3(points);
  }

  private createHDDAssembly() {
    // --- DRILL HEAD ---
    // Outer reamer cutter body
    const cutterGeo = new THREE.ConeGeometry(0.7, 1.8, 16);
    cutterGeo.rotateZ(-Math.PI / 2); // Point right along +X
    const cutterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff5500'),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color('#331100'),
    });
    this.drillCutter = new THREE.Mesh(cutterGeo, cutterMat);
    this.drillHead.add(this.drillCutter);

    // Tungsten Carbide Cutter Teeth
    const teethGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const toothGeo = new THREE.BoxGeometry(0.15, 0.12, 0.3);
      const toothMat = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.9, roughness: 0.1 });
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(0.2, Math.cos(angle) * 0.5, Math.sin(angle) * 0.5);
      teethGroup.add(tooth);
    }
    this.drillHead.add(teethGroup);

    // High-pressure jet fluid nozzles
    const jetGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8);
    const jetMat = new THREE.MeshStandardMaterial({ color: '#38bdf8' });
    const jet = new THREE.Mesh(jetGeo, jetMat);
    jet.position.set(0.8, 0, 0);
    jet.rotateZ(-Math.PI / 2);
    this.drillHead.add(jet);

    this.drillAssembly.add(this.drillHead);

    // --- REAMER ASSEMBLY & PIPE INITIALIZATION ---
    this.updateHDDPath(0.01);
  }

  public updateHDDPath(progress: number) {
    const clampedProgress = Math.max(0.001, Math.min(0.999, progress));
    
    // 1. Position & Orientation of Drill Head
    const currentPoint = this.borePathCurve.getPointAt(clampedProgress);
    const tangent = this.borePathCurve.getTangentAt(clampedProgress).normalize();

    this.drillHead.position.copy(currentPoint);

    // Align drill head forward along curve tangent vector
    const up = new THREE.Vector3(0, 1, 0);
    const axis = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const radians = Math.acos(up.dot(tangent));
    this.drillHead.quaternion.setFromAxisAngle(axis, radians);
    
    // Additional offset to point cone directly along tangent
    this.drillHead.rotateZ(-Math.PI / 2);

    // 2. DRILL ROTATION PHYSICS: Continuous axial roll around longitudinal axis
    this.drillCutter.rotation.x = clampedProgress * Math.PI * 80;

    // 3. Drill Shaft (Rods) behind Drill Head
    if (this.drillShaftMesh.parent) this.drillAssembly.remove(this.drillShaftMesh);
    
    // Drill shaft curve (from start 0 to drill head progress)
    const shaftPoints: THREE.Vector3[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const p = (clampedProgress * i) / steps;
      shaftPoints.push(this.borePathCurve.getPointAt(p));
    }
    if (shaftPoints.length > 1) {
      const shaftCurve = new THREE.CatmullRomCurve3(shaftPoints);
      const shaftGeo = new THREE.TubeGeometry(shaftCurve, 64, 0.22, 12, false);
      const shaftMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#475569'),
        metalness: 0.85,
        roughness: 0.25,
      });
      this.drillShaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      this.drillAssembly.add(this.drillShaftMesh);
    }

    // 4. Product Pipe String following IMMEDIATELY behind Reamer Head (NO GAP)
    if (this.productPipeMesh.parent) this.drillAssembly.remove(this.productPipeMesh);
    if (this.boreTunnelMesh.parent) this.drillAssembly.remove(this.boreTunnelMesh);

    // Pipe follows slightly behind drill head (0 to clampedProgress - 0.02)
    const pipeEndProgress = Math.max(0.001, clampedProgress - 0.015);
    const pipePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
      const p = (pipeEndProgress * i) / steps;
      pipePoints.push(this.borePathCurve.getPointAt(p));
    }

    if (pipePoints.length > 1) {
      const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
      
      // Heavy Steel Product Pipe
      const pipeGeo = new THREE.TubeGeometry(pipeCurve, 64, 0.48, 16, false);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1e293b'),
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color('#0f172a'),
      });
      this.productPipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      this.drillAssembly.add(this.productPipeMesh);

      // Outer Reamed Borehole Tunnel around pipe
      const tunnelGeo = new THREE.TubeGeometry(pipeCurve, 64, 0.62, 16, false);
      const tunnelMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0f172a'),
        roughness: 0.9,
        transparent: true,
        opacity: 0.7,
        side: THREE.BackSide,
      });
      this.boreTunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
      this.drillAssembly.add(this.boreTunnelMesh);
    }
  }

  private createSurfaceInfrastructure() {
    // Railway Tracks on Surface level (Y = 4.2)
    const trackWidth = 50;
    
    // Ballast Bed
    const ballastGeo = new THREE.BoxGeometry(trackWidth, 0.4, 6);
    const ballastMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(10, 4.2, 0);
    this.railwayGroup.add(ballast);

    // Railway Sleepers (Concrete Ties)
    for (let x = -10; x <= 30; x += 1.8) {
      const tieGeo = new THREE.BoxGeometry(0.3, 0.25, 4.5);
      const tieMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1' });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(x, 4.5, 0);
      this.railwayGroup.add(tie);
    }

    // Steel Rails
    const railMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.95, roughness: 0.1 });
    const rail1Geo = new THREE.BoxGeometry(trackWidth, 0.2, 0.15);
    const rail1 = new THREE.Mesh(rail1Geo, railMat);
    rail1.position.set(10, 4.7, -1.2);
    this.railwayGroup.add(rail1);

    const rail2 = new THREE.Mesh(rail1Geo, railMat);
    rail2.position.set(10, 4.7, 1.2);
    this.railwayGroup.add(rail2);
  }

  private createMicrotunnelingSetup() {
    // Concrete Pipe Jacking Segment Ring at X = 20, Y = -6.5
    const ringGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 24, 1, true);
    ringGeo.rotateZ(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      roughness: 0.6,
      wireframe: false,
    });
    const segmentRing = new THREE.Mesh(ringGeo, ringMat);
    segmentRing.position.set(22, -6.5, 0);
    this.microtunnelGroup.add(segmentRing);

    // Jacking Frame Hydraulic Push Rams
    const ramMat = new THREE.MeshStandardMaterial({ color: '#ea580c', metalness: 0.8 });
    const ramGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.0, 16);
    ramGeo.rotateZ(Math.PI / 2);

    const ram1 = new THREE.Mesh(ramGeo, ramMat);
    ram1.position.set(19, -5.7, 0.9);
    this.microtunnelGroup.add(ram1);

    const ram2 = new THREE.Mesh(ramGeo, ramMat);
    ram2.position.set(19, -7.3, -0.9);
    this.microtunnelGroup.add(ram2);
  }

  public update(scrollProgress: number) {
    // Control visibility based on scroll progress
    if (scrollProgress > 0.15) {
      this.group.visible = true;
      
      // Keep underground at Y=0 so camera can actually fly through it
      this.group.position.y = 0;

      // Surface fade-in (e.g. from 0.15 to 0.25)
      // The drill starts moving at scrollProgress 0.58 and finishes around 0.82
      if (scrollProgress >= 0.40) {
        // HDD Phase is 0.58 to 0.82, but let's start the drill moving gradually 
        // to match the HDD camera tracking.
        const hddProgress = Math.max(0.001, Math.min(0.999, (scrollProgress - 0.40) / 0.45));
        this.updateHDDPath(hddProgress);
      }
    } else {
      this.group.visible = false;
    }
  }
}
