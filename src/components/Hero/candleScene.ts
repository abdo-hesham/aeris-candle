import * as THREE from "three";

/** Rounded geometry with surface detail projected from the shared product photograph. */
export async function createCandleScene(
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
) {
  camera.position.set(0, 1.65, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const projection = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  );
  const texture = await new THREE.TextureLoader().loadAsync(
    "/assets/candle-product.png",
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const group = new THREE.Group();
  group.name = "Reference-matched Aeris ceramic vessel";
  scene.add(group);
  // Preserve the real speckles, warm shading and printed mark on curved geometry.
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPhoto: { value: texture },
      uProjection: { value: projection },
    },
    side: THREE.DoubleSide,
    vertexShader: `uniform mat4 uProjection; varying vec4 vPhoto; varying vec3 vNormal; varying vec3 vRestNormal;
      void main(){vPhoto=uProjection*vec4(position,1.0);vNormal=normalize(mat3(modelMatrix)*normal);vRestNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D uPhoto; varying vec4 vPhoto; varying vec3 vNormal; varying vec3 vRestNormal;
      void main(){
        vec2 uv=vPhoto.xy/vPhoto.w*0.5+0.5;
        if(vRestNormal.y>0.65 && abs(uv.x-0.5)<0.021 && uv.y>0.775) uv.x+=0.055;
        vec4 photo=texture2D(uPhoto,uv);
        vec3 clay=vec3(0.64,0.62,0.51);
        vec3 base=mix(clay,photo.rgb,smoothstep(0.05,0.8,photo.a));
        vec3 light=normalize(vec3(-3.0,4.0,5.0));
        float rest=0.65+max(dot(normalize(vRestNormal),light),0.0)*0.35;
        float live=0.65+max(dot(normalize(vNormal),light),0.0)*0.35;
        gl_FragColor=vec4(base*live/rest,1.0);
        #include <colorspace_fragment>
      }`,
  });
  const profile = [
    [0, -1.04],
    [0.79, -1.04],
    [0.9, -1.025],
    [0.966, -0.985],
    [0.993, -0.92],
    [1, -0.83],
    [1, 0.91],
    [0.995, 0.97],
    [0.976, 1],
    [0.956, 1.007],
    [0.937, 0.99],
    [0.935, 0.94],
    [0.935, 0.83],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const vessel = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 128),
    material,
  );
  vessel.name = "Rounded ceramic with original product surface";
  group.add(vessel);
  const waxGeometry = new THREE.CylinderGeometry(0.934, 0.934, 0.025, 96);
  waxGeometry.translate(0, 0.86, 0);
  group.add(new THREE.Mesh(waxGeometry, material));
  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.014, 0.08, 10),
    new THREE.MeshBasicMaterial({ color: 0x352416 }),
  );
  wick.position.set(0, 0.91, 0);
  wick.rotation.z = 0.1;
  group.add(wick);
  const flameGeometry = new THREE.LatheGeometry(
    [
      [0, 0],
      [0.013, 0.012],
      [0.024, 0.04],
      [0.021, 0.075],
      [0.014, 0.12],
      [0.004, 0.18],
      [0, 0.195],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    24,
  );
  const flameMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `varying float vHeight; void main(){vHeight=position.y/0.195;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying float vHeight;void main(){vec3 c=mix(vec3(1.0,0.53,0.12),vec3(1.0,0.97,0.79),smoothstep(0.0,0.3,vHeight));gl_FragColor=vec4(c,0.96);}`,
  });
  const flame = new THREE.Mesh(flameGeometry, flameMaterial);
  flame.position.set(0, 0.935, 0);
  group.add(flame);
  return {
    texture,
    update: (elapsed: number, x: number, y: number) => {
      group.rotation.y = x * 0.105 + Math.sin(elapsed * 0.24) * 0.012;
      group.rotation.x = y * 0.018;
      flame.scale.y =
        1 + Math.sin(elapsed * 6.2) * 0.045 + Math.sin(elapsed * 11.7) * 0.025;
      flame.rotation.z = Math.sin(elapsed * 3.7) * 0.05;
    },
  };
}
