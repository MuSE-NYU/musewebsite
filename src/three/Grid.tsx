import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { getLevel } from "../lib/audio";
import { view } from "../lib/view";
import { track } from "./glsl";

/**
 * A horizon grid that scrolls toward the camera and fades into black. Pure
 * technical-blueprint filler — it gives the floating geometry a ground plane
 * without ever drawing attention to itself.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uOpacity;
  uniform float uAudio;
  uniform vec3 uColor;

  varying vec2 vUv;

  // Anti-aliased grid line: distance to the nearest cell edge, normalised by
  // the screen-space derivative so lines stay one pixel wide at any angle.
  float gridLine(vec2 uv, float cells, float width) {
    vec2 scaled = uv * cells;
    vec2 g = abs(fract(scaled - 0.5) - 0.5) / max(fwidth(scaled), vec2(1e-5));
    float line = min(g.x, g.y) / width;
    return 1.0 - clamp(line, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;

    // Scroll and time both pull the grid toward the viewer.
    uv.y += uScroll * 0.04 + uTime * 0.012;

    float fine = gridLine(uv, 60.0, 1.0) * 0.35;
    float coarse = gridLine(uv, 12.0, 1.2) * 0.65;
    float g = max(fine, coarse);

    // Fade out at the edges and toward the horizon.
    float edge = 1.0 - smoothstep(0.06, 0.5, distance(vUv, vec2(0.5)));
    float horizon = smoothstep(0.0, 0.42, vUv.y);

    float alpha = g * edge * horizon * uOpacity * (0.75 + uAudio * 0.5);
    if (alpha < 0.002) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function Grid() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAudio: { value: 0 },
      uOpacity: { value: 0.3 },
      uColor: { value: new THREE.Color("#9fb4c7") },
    }),
    [],
  );

  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 1 / 30);
    uniforms.uScroll.value = view.smoothY * 0.01;
    uniforms.uAudio.value = getLevel();

    uniforms.uOpacity.value = track(view.smoothProgress, [
      [0, 0.3],
      [0.35, 0.16],
      [0.7, 0.1],
      [1, 0.26],
    ]);

    if (mesh.current) {
      mesh.current.position.y = -5.2 + view.smoothPointerY * 0.2;
    }
  });

  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -5.2, -6]}
      frustumCulled={false}
    >
      <planeGeometry args={[90, 90]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
