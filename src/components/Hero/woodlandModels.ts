import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/** Local CC0 plant and rock geometry. See ASSETS.md for provenance. */
export async function addWoodlandModels(
  root: THREE.Group,
  compact: boolean,
  clock: { value: number },
  heightAt: (x: number, z: number) => number,
  branch: THREE.CatmullRomCurve3,
  random: () => number,
) {
  const textures = new Set<THREE.Texture>();
  const loader = new GLTFLoader();
  const models = await Promise.all(
    ["fern_02", "moss_01", "rock_moss_set_01"].map((name) =>
      loader.loadAsync(`/assets/models/${name}/${name}.gltf`),
    ),
  );
  const dummy = new THREE.Object3D();
  for (let kind = 0; kind < models.length; kind++) {
    const source = models[kind].scene;
    const alpha =
      kind < 2
        ? await new THREE.TextureLoader().loadAsync(
            `/assets/models/${kind === 0 ? "fern_02" : "moss_01"}/alpha.jpg`,
          )
        : null;
    if (alpha) {
      alpha.flipY = false;
      textures.add(alpha);
    }
    source.updateMatrixWorld(true);
    const meshes: THREE.Mesh[] = [];
    source.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });
    // Asset sets contain several alternatives. One normalized variant is instanced per batch.
    const selected = kind === 0 ? meshes : meshes.slice(0, 1);
    const bounds =
      kind === 0
        ? new THREE.Box3().setFromObject(source)
        : new THREE.Box3().setFromObject(selected[0]);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const denominator = kind === 0 ? size.y : Math.max(size.x, size.z);
    const count =
      kind === 0
        ? compact
          ? 26
          : 55
        : kind === 1
          ? compact
            ? 340
            : 650
          : 12;
    const placements: { p: THREE.Vector3; s: THREE.Vector3; r: THREE.Euler }[] =
      [];
    for (let i = 0; i < count; i++) {
      let x = (random() - 0.5) * 23,
        z = -random() * 18 + 4;
      if (kind === 0 && Math.abs(x + Math.sin(z * 0.12) * 2 + 1.8) < 1.2)
        x += x > 0 ? 2.2 : -2.2;
      const scale =
        kind === 0
          ? 0.65 + random() * 1.0
          : kind === 1
            ? 0.18 + random() * 0.35
            : 0.5 + random() * 1.3;
      const p = new THREE.Vector3(x, heightAt(x, z), z);
      let rx = 0;
      if (kind === 1) {
        const angle = (random() - 0.5) * 2;
        p.copy(branch.getPointAt(random()));
        p.y += Math.cos(angle) * 0.42 - 0.025;
        p.z += Math.sin(angle) * 0.42;
        rx = angle * 0.65;
      }
      placements.push({
        p,
        s: new THREE.Vector3(scale, scale * (kind === 1 ? 0.8 : 1), scale),
        r: new THREE.Euler(rx, random() * Math.PI * 2, 0),
      });
    }
    for (const mesh of selected) {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.translate(-center.x, -bounds.min.y, -center.z);
      geometry.scale(1 / denominator, 1 / denominator, 1 / denominator);
      const material = (
        Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
      ).clone() as THREE.MeshStandardMaterial;
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) {
          textures.add(value);
          value.anisotropy = 4;
        }
      material.side = THREE.DoubleSide;
      if (alpha) {
        material.alphaMap = alpha;
        material.alphaTest = 0.38;
        material.transparent = false;
        material.alphaToCoverage = true;
      }
      if (kind !== 2) {
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uForestTime = clock;
          shader.vertexShader = shader.vertexShader.replace(
            "#include <common>",
            "#include <common>\nuniform float uForestTime;",
          );
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            vec3 anchor=instanceMatrix[3].xyz;
            transformed.x+=sin(uForestTime*0.65+anchor.x+anchor.z)*pow(max(position.y,0.0),2.0)*0.055;
            transformed.z+=cos(uForestTime*0.5+anchor.z)*max(position.y,0.0)*0.025;`,
          );
        };
      }
      const batch = new THREE.InstancedMesh(geometry, material, count);
      batch.name = [
        "Detailed fern plants",
        "Cushion moss on fallen branch",
        "Moss-covered woodland rocks",
      ][kind];
      placements.forEach(({ p, s, r }, i) => {
        dummy.position.copy(p);
        dummy.scale.copy(s);
        dummy.rotation.copy(r);
        dummy.updateMatrix();
        batch.setMatrixAt(i, dummy.matrix);
      });
      batch.castShadow = kind !== 1;
      batch.receiveShadow = true;
      batch.computeBoundingSphere();
      root.add(batch);
    }
    source.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((m) => m.dispose());
      }
    });
  }
  return [...textures];
}
