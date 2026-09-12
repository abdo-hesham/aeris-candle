import * as THREE from "three";
import { addWoodlandModels } from "./woodlandModels";

/** Deterministic, modeled woodland. No photographic planes or vegetation sprites. */
export async function createForestScene(scene: THREE.Scene, compact: boolean) {
  const textures: THREE.Texture[] = [];
  const loader = new THREE.TextureLoader();
  const maps = await Promise.all(
    ["bark_brown_02", "forest_ground_04"].map(async (name) => {
      const [map, normalMap, roughnessMap] = await Promise.all(
        ["color", "normal", "roughness"].map(async (kind) => {
          const texture = await loader.loadAsync(
            `/assets/materials/${name}-${kind}.jpg`,
          );
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.anisotropy = 4;
          if (kind === "color") texture.colorSpace = THREE.SRGBColorSpace;
          textures.push(texture);
          return texture;
        }),
      );
      return { map, normalMap, roughnessMap };
    }),
  );
  let seed = 7419;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const between = (a: number, b: number) => a + random() * (b - a);
  const clock = { value: 0 };
  const root = new THREE.Group();
  root.name = "Modeled woodland";
  scene.add(root);
  scene.background = new THREE.Color("#758163");
  scene.fog = new THREE.FogExp2("#758163", 0.042);
  scene.add(new THREE.HemisphereLight(0xf9edcf, 0x1e2b17, 1.25));
  const sun = new THREE.DirectionalLight(0xffedb4, 4.1);
  sun.position.set(-9, 15, -9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -12,
    right: 12,
    top: 14,
    bottom: -10,
    near: 1,
    far: 48,
  });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.06;
  sun.target.position.set(0, 0, -3);
  scene.add(sun, sun.target);
  const bounce = new THREE.DirectionalLight(0xb3bb83, 0.55);
  bounce.position.set(3, 3, 6);
  scene.add(bounce);

  // Small-scale surface relief is evaluated in world space, independent of mesh density.
  const organicMaterial = (color: number, bark = false) => {
    if (bark)
      return new THREE.MeshStandardMaterial({
        ...maps[0],
        color: 0xaaa995,
        roughness: 0.95,
        normalScale: new THREE.Vector2(1.4, 1.4),
      });
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vOrganic;",
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvOrganic = position;",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vOrganic;\nfloat grain(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float fleck = grain(floor(vOrganic * ${bark ? "145.0" : "85.0"}));
        float mottling = sin(vOrganic.x*7.0+sin(vOrganic.z*11.0))*sin(vOrganic.y*13.0+vOrganic.z*8.0);
        ${bark ? "float furrow = pow(abs(sin(vOrganic.x*48.0+sin(vOrganic.y*8.0)*0.8+vOrganic.z*26.0)),5.0); diffuseColor.rgb *= 0.56 + furrow*0.42 + fleck*0.17;" : "diffuseColor.rgb *= 0.78 + mottling*0.13 + fleck*0.25;"}
      `,
      );
    };
    material.customProgramCacheKey = () =>
      bark ? "aeris-bark-v1" : "aeris-earth-v1";
    return material;
  };
  const heightAt = (x: number, z: number) =>
    -0.55 +
    Math.sin(x * 0.32 + z * 0.1) * 0.3 +
    Math.cos(z * 0.35) * 0.22 +
    Math.sin(x * 1.2 + z * 0.9) * 0.07 +
    0.6 * Math.exp(-((x - 2) ** 2 / 9 + (z - 1) ** 2 / 6));
  const groundGeometry = new THREE.PlaneGeometry(100, 100, 150, 150);
  groundGeometry.rotateX(-Math.PI / 2);
  groundGeometry.translate(0, 0, -30);
  const positions = groundGeometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const earth = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      z = positions.getZ(i);
    positions.setY(i, heightAt(x, z));
    const path = Math.exp(-((x + Math.sin(z * 0.12) * 2 + 1.8) ** 2) / 2.5);
    earth.setHSL(
      0.205 - path * 0.07,
      0.26 + random() * 0.2,
      0.11 + random() * 0.08 + path * 0.04,
    );
    earth.toArray(colors, i * 3);
  }
  groundGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  groundGeometry.computeVertexNormals();
  Object.values(maps[1]).forEach((texture) => texture.repeat.set(32, 32));
  const groundMaterial = new THREE.MeshStandardMaterial({
    ...maps[1],
    color: 0x969d77,
    roughness: 1,
    normalScale: new THREE.Vector2(1.2, 1.2),
  });
  const terrain = new THREE.Mesh(groundGeometry, groundMaterial);
  terrain.name = "Continuous sculpted forest floor";
  terrain.receiveShadow = true;
  root.add(terrain);

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  type Placement = {
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Quaternion;
    color?: THREE.Color;
  };
  const instances = (
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    items: Placement[],
    shadows = false,
  ) => {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    mesh.name = name;
    items.forEach((item, i) => {
      dummy.position.copy(item.position);
      dummy.scale.copy(item.scale);
      dummy.quaternion.copy(item.rotation);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (item.color) mesh.setColorAt(i, item.color);
    });
    mesh.castShadow = shadows;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
    return mesh;
  };
  const segment = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
  ): Placement => ({
    position: a.clone().add(b).multiplyScalar(0.5),
    scale: new THREE.Vector3(radius, a.distanceTo(b), radius),
    rotation: new THREE.Quaternion().setFromUnitVectors(
      up,
      b.clone().sub(a).normalize(),
    ),
  });
  const wood: Placement[] = [],
    foliage: Placement[] = [],
    stems: Placement[] = [],
    fernLeaves: Placement[] = [];
  const leaf = (
    point: THREE.Vector3,
    scale: number,
    rotation: THREE.Euler,
    collection = foliage,
  ) => {
    collection.push({
      position: point,
      scale: new THREE.Vector3(scale * between(0.65, 1), scale, scale),
      rotation: new THREE.Quaternion().setFromEuler(rotation),
      color: new THREE.Color().setHSL(
        between(0.18, 0.27),
        between(0.35, 0.58),
        between(0.16, 0.34),
      ),
    });
  };
  const treeCount = compact ? 38 : 58;
  for (let t = 0; t < treeCount; t++) {
    const z = t < 6 ? between(-4, -12) : between(-12, -62);
    const side = t % 2 ? -1 : 1;
    const x = side * between(t < 6 ? 5 : 3, t < 6 ? 11 : 31);
    const base = new THREE.Vector3(x, heightAt(x, z), z);
    const tall = between(10, 22),
      radius = between(0.19, 0.48);
    const tip = base
      .clone()
      .add(new THREE.Vector3(between(-0.7, 0.7), tall, between(-0.5, 0.5)));
    wood.push(segment(base, tip, radius));
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 2 + random();
      const end = new THREE.Vector3(
        x + Math.cos(angle) * radius * 4,
        base.y - 0.04,
        z + Math.sin(angle) * radius * 4,
      );
      wood.push(
        segment(
          base.clone().add(new THREE.Vector3(0, radius, 0)),
          end,
          radius * 0.4,
        ),
      );
    }
    for (let b = 0; b < 5; b++) {
      const angle = b * 2.4 + random();
      const start = base.clone().lerp(tip, 0.45 + b * 0.09);
      const end = start
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(angle) * between(2, 4.5),
            between(0.6, 2.2),
            Math.sin(angle) * between(2, 4.5),
          ),
        );
      wood.push(segment(start, end, radius * (0.45 - b * 0.045)));
      for (let twig = 0; twig < 3; twig++) {
        const twigEnd = end
          .clone()
          .add(
            new THREE.Vector3(
              between(-1.6, 1.6),
              between(-0.2, 1.2),
              between(-1.6, 1.6),
            ),
          );
        wood.push(segment(end.clone().lerp(start, 0.2), twigEnd, 0.025));
        for (let l = 0; l < (compact ? 12 : 22); l++) {
          leaf(
            twigEnd
              .clone()
              .add(
                new THREE.Vector3(
                  between(-1.35, 1.35),
                  between(-0.6, 0.8),
                  between(-1.3, 1.3),
                ),
              ),
            between(0.18, 0.5),
            new THREE.Euler(
              between(-1.7, 1.7),
              random() * Math.PI * 2,
              random() * Math.PI * 2,
            ),
          );
        }
      }
    }
  }
  instances(
    "Bark trunks, branching limbs and roots",
    new THREE.CylinderGeometry(0.65, 1, 1, 9, 5),
    organicMaterial(0x77705a, true),
    wood,
    true,
  );

  // Folded leaf mesh: raised midrib, tapered tips and curved edges, never a sprite.
  const leafVertices: number[] = [],
    leafIndices: number[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8,
      width = Math.sin(t * Math.PI) * 0.25;
    leafVertices.push(
      -width,
      t,
      Math.sin(t * Math.PI) * 0.03,
      0,
      t,
      Math.sin(t * Math.PI) * 0.12,
      width,
      t,
      Math.sin(t * Math.PI) * 0.03,
    );
    if (i < 8) {
      const n = i * 3;
      leafIndices.push(
        n,
        n + 3,
        n + 1,
        n + 1,
        n + 3,
        n + 4,
        n + 1,
        n + 4,
        n + 2,
        n + 2,
        n + 4,
        n + 5,
      );
    }
  }
  const leafGeometry = new THREE.BufferGeometry();
  leafGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(leafVertices, 3),
  );
  leafGeometry.setIndex(leafIndices);
  leafGeometry.computeVertexNormals();
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    roughness: 0.65,
  });
  leafMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uForestTime = clock;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      "#include <common>\nuniform float uForestTime;\nvarying vec2 vLeaf;",
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vLeaf = position.xy;
      vec3 anchor = instanceMatrix[3].xyz;
      transformed.z += sin(uForestTime*0.7+anchor.x*1.2+anchor.z*0.7)*position.y*position.y*0.12;
      transformed.x += sin(uForestTime*0.45+anchor.z)*position.y*0.035;
    `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      "#include <common>\nvarying vec2 vLeaf;",
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      float vein = 1.0-smoothstep(0.003,0.012,abs(vLeaf.x));
      float ribs = pow(abs(sin(vLeaf.y*72.0-abs(vLeaf.x)*48.0)),18.0);
      diffuseColor.rgb *= 0.85+vein*0.22+ribs*0.08;
    `,
    );
  };
  instances(
    "Three-dimensional canopy leaves",
    leafGeometry,
    leafMaterial,
    foliage,
    true,
  );

  // Fern fronds are paired modeled pinnae along a bowed spine.
  for (let f = 0; f < (compact ? 48 : 85); f++) {
    const x = between(-13, 13),
      z = between(-20, 5);
    if (Math.abs(x + Math.sin(z * 0.12) * 2 + 1.8) < 1.1 && random() < 0.85)
      continue;
    const base = new THREE.Vector3(x, heightAt(x, z) + 0.02, z);
    const size = between(0.55, 1.45);
    for (let frond = 0; frond < 7; frond++) {
      const angle = (frond * Math.PI * 2) / 7 + random() * 0.4;
      let previous = base.clone();
      for (let p = 1; p <= 12; p++) {
        const t = p / 12;
        const next = base
          .clone()
          .add(
            new THREE.Vector3(
              Math.cos(angle) * t * size,
              Math.sin(t * Math.PI * 0.78) * size * 0.75,
              Math.sin(angle) * t * size,
            ),
          );
        stems.push(segment(previous, next, 0.004 * size));
        previous = next;
        for (const side of [-1, 1]) {
          const length = Math.sin(t * Math.PI) * size * 0.35 + 0.025;
          leaf(
            next.clone(),
            length,
            new THREE.Euler(0.95, -angle + side * 0.9, side * 0.5),
            fernLeaves,
          );
        }
      }
    }
  }
  const proceduralSpines = instances(
    "Fern spines",
    new THREE.CylinderGeometry(0.7, 1, 1, 3),
    new THREE.MeshStandardMaterial({ color: 0x677632, roughness: 0.9 }),
    stems,
  );
  const proceduralFerns = instances(
    "Individual fern pinnae",
    leafGeometry,
    leafMaterial,
    fernLeaves,
  );

  const moss: Placement[] = [];
  // The reference video's framing device: a sculptural, moss-covered fallen limb.
  const fallenPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7, 2.4, 0),
    new THREE.Vector3(-4, 0.45, 1),
    new THREE.Vector3(-1, 0.05, 2),
    new THREE.Vector3(2.1, 0.55, 1.7),
    new THREE.Vector3(5, 0.7, 0.5),
    new THREE.Vector3(8, 1.5, -1),
  ]);
  const fallenGeometry = new THREE.TubeGeometry(
    fallenPath,
    100,
    0.42,
    18,
    false,
  );
  const fallenPositions = fallenGeometry.attributes.position;
  const fallenUV = fallenGeometry.attributes.uv;
  for (let i = 0; i < fallenUV.count; i++)
    fallenUV.setXY(i, fallenUV.getY(i) * 2, fallenUV.getX(i) * 9);
  const fallenNormals = fallenGeometry.attributes.normal;
  for (let i = 0; i < fallenPositions.count; i++) {
    const x = fallenPositions.getX(i),
      y = fallenPositions.getY(i),
      z = fallenPositions.getZ(i);
    const relief =
      Math.sin(x * 21 + Math.sin(z * 12)) * Math.sin(y * 28 + z * 7) * 0.028 +
      Math.sin(x * 7 + z * 9) * 0.018;
    fallenPositions.setXYZ(
      i,
      x + fallenNormals.getX(i) * relief,
      y + fallenNormals.getY(i) * relief,
      z + fallenNormals.getZ(i) * relief,
    );
  }
  fallenGeometry.computeVertexNormals();
  const fallen = new THREE.Mesh(
    fallenGeometry,
    organicMaterial(0x756c5d, true),
  );
  fallen.name = "Reference-inspired moss-covered sculptural branch";
  fallen.castShadow = true;
  fallen.receiveShadow = true;
  root.add(fallen);
  for (let i = 0; i < (compact ? 6000 : 12000); i++) {
    const t = random(),
      angle = between(-1.2, 1.2),
      point = fallenPath.getPointAt(t);
    const radius = 0.42 + between(-0.005, 0.025);
    point.y += Math.cos(angle) * radius;
    point.z += Math.sin(angle) * radius;
    moss.push({
      position: point,
      scale: new THREE.Vector3(between(0.03, 0.07), between(0.025, 0.07), 0.04),
      rotation: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(angle * 0.4, random() * 6.28, between(-0.3, 0.3)),
      ),
      color: new THREE.Color().setHSL(
        between(0.17, 0.24),
        between(0.35, 0.65),
        between(0.13, 0.29),
      ),
    });
  }
  for (let i = 0; i < (compact ? 11000 : 24000); i++) {
    const x = between(-14, 14),
      z = between(-19, 7);
    const path = Math.abs(x + Math.sin(z * 0.12) * 2 + 1.8);
    if (path < 1.05 && random() < 0.88) continue;
    moss.push({
      position: new THREE.Vector3(x, heightAt(x, z), z),
      scale: new THREE.Vector3(between(0.04, 0.09), between(0.06, 0.2), 0.05),
      rotation: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          between(-0.3, 0.3),
          random() * 6.28,
          between(-0.2, 0.2),
        ),
      ),
      color: new THREE.Color().setHSL(
        between(0.16, 0.25),
        between(0.3, 0.6),
        between(0.14, 0.3),
      ),
    });
  }
  const mossGeometry = new THREE.BufferGeometry();
  mossGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-0.22, 0, 0, 0.22, 0, 0, 0, 1, 0.15], 3),
  );
  mossGeometry.computeVertexNormals();
  instances("Living moss tips", mossGeometry, leafMaterial, moss);
  const stones: Placement[] = [];
  for (let i = 0; i < 65; i++) {
    const x = between(-15, 15),
      z = between(-22, 5),
      size = between(0.12, 0.8);
    stones.push({
      position: new THREE.Vector3(x, heightAt(x, z), z),
      scale: new THREE.Vector3(size * 1.5, size * 0.65, size),
      rotation: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(random(), random() * 6, random()),
      ),
      color: new THREE.Color().setHSL(0.19, 0.12, between(0.2, 0.4)),
    });
  }
  const proceduralStones = instances(
    "Weathered woodland stones",
    new THREE.IcosahedronGeometry(1, 2),
    organicMaterial(0xffffff),
    stones,
    true,
  );

  const dustGeometry = new THREE.BufferGeometry();
  const dust = new Float32Array((compact ? 40 : 85) * 3);
  for (let i = 0; i < dust.length; i += 3) {
    dust[i] = between(-9, 9);
    dust[i + 1] = between(0, 8);
    dust[i + 2] = between(-14, 6);
  }
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  const dustMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: clock },
    vertexShader: `uniform float uTime; varying float vLight; void main(){vec3 p=position; p.y=mod(p.y+uTime*0.055,8.0); p.x+=sin(uTime*0.2+p.z)*0.14; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(22.0/-mv.z,1.0,3.5); vLight=0.25+0.25*sin(p.x+uTime*0.4);}`,
    fragmentShader: `varying float vLight; void main(){float a=1.0-smoothstep(0.08,0.5,length(gl_PointCoord-0.5));gl_FragColor=vec4(1.0,0.9,0.62,a*vLight);}`,
  });
  root.add(new THREE.Points(dustGeometry, dustMaterial));

  // Soft shafts are analytical atmospheric volumes; no fog or light image overlays.
  const rayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: clock },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; void main(){float edge=pow(sin(vUv.x*3.14159),3.0);float fade=sin(vUv.y*3.14159);gl_FragColor=vec4(0.94,0.84,0.49,edge*fade*0.022);}`,
  });
  for (let i = 0; i < 7; i++) {
    const start = new THREE.Vector3(-8 + i * 0.8, 13, -13 - i),
      end = new THREE.Vector3(-2 + i * 1.4, -1, -3 - i * 1.1);
    const ray = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, start.distanceTo(end), 24, 1, true),
      rayMaterial,
    );
    ray.position.copy(start).add(end).multiplyScalar(0.5);
    ray.quaternion.setFromUnitVectors(up, start.clone().sub(end).normalize());
    root.add(ray);
  }
  try {
    textures.push(
      ...(await addWoodlandModels(
        root,
        compact,
        clock,
        heightAt,
        fallenPath,
        random,
      )),
    );
    proceduralSpines.visible = false;
    proceduralFerns.visible = false;
    proceduralStones.visible = false;
  } catch {
    // The modeled procedural plants preserve the full 3D scene if a local asset is unavailable.
  }
  return {
    textures,
    update: (elapsed: number) => {
      clock.value = elapsed;
    },
    groundHeight: heightAt,
  };
}
