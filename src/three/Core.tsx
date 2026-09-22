import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { getBeat, getLevel } from "../lib/audio";
import { view } from "../lib/view";
import { SIMPLEX_3D, track } from "./glsl";

/**
 * The visualiser: a noise-displaced sphere rendered as a dense point cloud with
 * a faint wireframe shell inside it and two HUD rings orbiting. Displacement is
 * driven by the audio level, so it inflates and shivers on transients.
 */

const DISPLACE = /* glsl */ `
  vec3 displace(vec3 pos, float time, float audio, float beat, out float amount) {
    vec3 n = normalize(pos);

    float d =
        snoise(n * 1.5 + vec3(0.0, 0.0, time * 0.28)) * 0.55
      + snoise(n * 3.3 + vec3(time * 0.33, 0.0, 0.0)) * 0.26
      + snoise(n * 7.1 - vec3(0.0, time * 0.22, 0.0)) * 0.13;

    // Ripple travelling pole-to-pole, reads as a waveform crossing the sphere.
    d += sin(n.y * 9.0 - time * 1.6) * 0.09 * (0.3 + audio);

    float amp = 0.26 + audio * 0.62 + beat * 0.34;
    amount = d;
    return pos + n * d * amp;
  }
`;

const POINTS_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAudio;
  uniform float uBeat;
  uniform float uSize;
  varying float vAmount;

  ${SIMPLEX_3D}
  ${DISPLACE}

  void main() {
    float amount;
    vec3 displaced = displace(position, uTime, uAudio, uBeat, amount);
    vAmount = amount;

    vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
    gl_PointSize = uSize * (1.0 + amount * 0.9) * (15.0 / max(-mv.z, 0.1));
    gl_Position = projectionMatrix * mv;
  }
`;

const POINTS_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uTint;
  varying float vAmount;

  void main() {
    // Round, soft-edged point sprite.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float falloff = 1.0 - smoothstep(0.0, 0.5, d);

    float hot = smoothstep(0.05, 0.55, vAmount);
    vec3 color = mix(uColor, uAccent, hot * uTint);

    gl_FragColor = vec4(color, falloff * uOpacity * (0.10 + hot * 0.34));
  }
`;

const SHELL_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAudio;
  uniform float uBeat;
  varying float vAmount;

  ${SIMPLEX_3D}
  ${DISPLACE}

  void main() {
    float amount;
    vec3 displaced = displace(position, uTime, uAudio, uBeat, amount);
    vAmount = amount;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const SHELL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAmount;

  void main() {
    float hot = smoothstep(-0.2, 0.6, vAmount);
    gl_FragColor = vec4(uColor, uOpacity * (0.05 + hot * 0.16));
  }
`;

export function Core() {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const pointsUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uBeat: { value: 0 },
      uSize: { value: 1.1 },
      uOpacity: { value: 1 },
      uTint: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") },
      uAccent: { value: new THREE.Color("#ff4d00") },
    }),
    [],
  );

  const shellUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uBeat: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color("#ffffff") },
    }),
    [],
  );

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ffffff"),
        wireframe: true,
        transparent: true,
        opacity: 0.045,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    const level = getLevel();
    const beat = getBeat();
    const p = view.smoothProgress;
    const dt = Math.min(delta, 1 / 30);

    pointsUniforms.uTime.value += dt;
    shellUniforms.uTime.value = pointsUniforms.uTime.value;

    pointsUniforms.uAudio.value = level;
    pointsUniforms.uBeat.value = beat;
    shellUniforms.uAudio.value = level;
    shellUniforms.uBeat.value = beat;

    // Choreography against scroll: centre → drift left → recede → return.
    const scale = track(p, [
      [0, 1],
      [0.3, 0.62],
      [0.62, 0.34],
      [0.86, 0.92],
      [1, 0.92],
    ]);

    const x = track(p, [
      [0, 0],
      [0.3, -2.7],
      [0.62, 2.4],
      [0.86, 0],
      [1, 0],
    ]);

    const y = track(p, [
      [0, 0],
      [0.3, 0.5],
      [0.62, -0.4],
      [0.86, 0],
      [1, 0],
    ]);

    const z = track(p, [
      [0, 0],
      [0.3, -2],
      [0.62, -7],
      [0.86, -1],
      [1, -1],
    ]);

    pointsUniforms.uOpacity.value = track(p, [
      [0, 1],
      [0.3, 0.75],
      [0.62, 0.4],
      [0.86, 1],
      [1, 1],
    ]);

    shellUniforms.uOpacity.value = pointsUniforms.uOpacity.value * 0.5;

    // Warms to orange as the page reaches the join section.
    pointsUniforms.uTint.value = track(p, [
      [0, 0],
      [0.72, 0.1],
      [0.9, 0.85],
      [1, 0.85],
    ]);

    if (group.current) {
      group.current.position.set(x, y, z);
      group.current.scale.setScalar(scale);
    }

    if (spin.current) {
      spin.current.rotation.y += dt * (0.09 + level * 0.14);
      spin.current.rotation.x = Math.sin(pointsUniforms.uTime.value * 0.16) * 0.22;
      // Scroll adds a little extra twist so the object feels connected to it.
      spin.current.rotation.z = p * 1.2 + view.velocity * 0.006;
    }

    if (ringA.current) {
      ringA.current.rotation.x += dt * 0.22;
      ringA.current.rotation.y -= dt * 0.14;
      ringA.current.scale.setScalar(1 + beat * 0.06);
    }

    if (ringB.current) {
      ringB.current.rotation.y += dt * 0.19;
      ringB.current.rotation.z += dt * 0.11;
      ringB.current.scale.setScalar(1 + level * 0.05);
    }
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        <points frustumCulled={false}>
          <icosahedronGeometry args={[1.35, 4]} />
          <shaderMaterial
            vertexShader={POINTS_VERT}
            fragmentShader={POINTS_FRAG}
            uniforms={pointsUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <mesh frustumCulled={false}>
          <icosahedronGeometry args={[1.33, 3]} />
          <shaderMaterial
            vertexShader={SHELL_VERT}
            fragmentShader={SHELL_FRAG}
            uniforms={shellUniforms}
            transparent
            wireframe
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh ref={ringA} material={ringMaterial} frustumCulled={false}>
          <torusGeometry args={[1.8, 0.004, 3, 128]} />
        </mesh>

        <mesh
          ref={ringB}
          material={ringMaterial}
          rotation={[Math.PI / 2.6, 0, 0]}
          frustumCulled={false}
        >
          <torusGeometry args={[2.15, 0.003, 3, 128]} />
        </mesh>
      </group>
    </group>
  );
}
