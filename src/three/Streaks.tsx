import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { getBeat, getLevel } from "../lib/audio";
import { view } from "../lib/view";
import { SIMPLEX_3D, track } from "./glsl";

/**
 * Light-trail fans radiating from the core — the streaked, motion-blurred look
 * of late-2000s / early-2010s tech wallpapers.
 *
 * Every vertex position is computed in the vertex shader from two attributes
 * (position along the strip, and which strip it belongs to), so animating
 * thousands of line segments costs nothing on the CPU.
 */

const STRIPS = 36;
const SEGMENTS = 64;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAudio;
  uniform float uBeat;
  uniform float uLength;
  uniform float uSpread;

  attribute float aT;
  attribute float aStrip;
  attribute float aSeed;

  varying float vAlpha;
  varying float vT;

  ${SIMPLEX_3D}

  void main() {
    float t = aT;

    // Strips pinch to a point at the origin and fan out — pow() biases the
    // spread so the convergence stays tight.
    float env = pow(t, 1.3);

    // Per-strip length so the fan has a ragged silhouette instead of a
    // uniform starburst.
    float len = uLength * (0.4 + aSeed * 0.8);

    float drift = uTime * (0.16 + aSeed * 0.24);
    float angle = (aStrip - 0.5) * 1.9 + sin(drift + aSeed * 6.283) * 0.35;

    float reach = env * len;

    vec3 p;
    p.x = reach * (0.6 + 0.4 * cos(angle * 0.4));
    p.y = reach * sin(angle) * uSpread * 0.3;
    p.z = reach * sin(angle * 0.55 + aSeed * 4.0) * uSpread * 0.28;

    // Low-frequency curl that grows along the strip: the root stays pinned to
    // the core and the tail whips, which is what turns a ray into a trail.
    float n1 = snoise(vec3(t * 1.1, aStrip * 2.2 + aSeed * 3.0, uTime * 0.16));
    float n2 = snoise(vec3(t * 0.9 + 7.0, aStrip * 2.2 - aSeed * 3.0, uTime * 0.13));
    float n3 = snoise(vec3(t * 2.6 + 3.0, aStrip * 5.0, uTime * 0.25));

    float curl = env * (1.0 + uAudio * 1.2);
    p.y += n1 * curl * 2.2 + n3 * curl * 0.45;
    p.z += n2 * curl * 1.9;

    // Transients punch the whole fan outward.
    p *= 1.0 + uBeat * 0.1;

    vT = t;
    // Fade out well before the tip, and vary brightness strip to strip.
    vAlpha =
      smoothstep(0.0, 0.06, t) *
      (1.0 - smoothstep(0.28, 0.9, t)) *
      (0.3 + aSeed * 0.7);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uTint;

  varying float vAlpha;
  varying float vT;

  void main() {
    vec3 color = mix(uColor, uAccent, smoothstep(0.15, 0.8, vT) * uTint);
    gl_FragColor = vec4(color, vAlpha * uOpacity);
  }
`;

function useStreakGeometry() {
  return useMemo(() => {
    const count = STRIPS * SEGMENTS;

    const positions = new Float32Array(count * 3);
    const aT = new Float32Array(count);
    const aStrip = new Float32Array(count);
    const aSeed = new Float32Array(count);
    const indices: number[] = [];

    for (let s = 0; s < STRIPS; s++) {
      const stripT = s / (STRIPS - 1);
      // Deterministic pseudo-random seed — no Math.random, so hot reloads and
      // reloads look identical.
      const seed = (Math.sin(s * 127.1) * 43758.5453) % 1;

      for (let i = 0; i < SEGMENTS; i++) {
        const index = s * SEGMENTS + i;
        aT[index] = i / (SEGMENTS - 1);
        aStrip[index] = stripT;
        aSeed[index] = Math.abs(seed);

        if (i < SEGMENTS - 1) indices.push(index, index + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
    geometry.setAttribute("aStrip", new THREE.BufferAttribute(aStrip, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
    geometry.setIndex(indices);

    return geometry;
  }, []);
}

export function Streaks() {
  const geometry = useStreakGeometry();
  const group = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uBeat: { value: 0 },
      uLength: { value: 7 },
      uSpread: { value: 1 },
      uOpacity: { value: 0.62 },
      uTint: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") },
      uAccent: { value: new THREE.Color("#ff4d00") },
    }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const p = view.smoothProgress;

    uniforms.uTime.value += dt;
    uniforms.uAudio.value = getLevel();
    uniforms.uBeat.value = getBeat();

    uniforms.uOpacity.value = track(p, [
      [0, 0.62],
      [0.3, 0.4],
      [0.62, 0.2],
      [0.86, 0.55],
      [1, 0.55],
    ]);

    uniforms.uTint.value = track(p, [
      [0, 0.12],
      [0.72, 0.2],
      [0.9, 0.7],
      [1, 0.7],
    ]);

    if (group.current) {
      group.current.rotation.z = Math.sin(uniforms.uTime.value * 0.08) * 0.14 + p * 0.5;
      group.current.rotation.x = view.smoothPointerY * 0.06;
    }
  });

  return (
    <group ref={group}>
      {/* Two mirrored fans give the symmetric composition of the references. */}
      <lineSegments geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <lineSegments
        geometry={geometry}
        rotation={[0, Math.PI, 0]}
        frustumCulled={false}
      >
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
