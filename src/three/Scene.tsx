import { useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { updateAudio } from "../lib/audio";
import { lerp, view } from "../lib/view";
import { track } from "./glsl";
import { Core } from "./Core";
import { Effects } from "./Effects";
import { Grid } from "./Grid";
import { Particles } from "./Particles";
import { Streaks } from "./Streaks";

/**
 * Advances the audio analyser once per frame. Mounted first so every other
 * useFrame callback in this tree reads a value from the current frame.
 */
function AudioDriver() {
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    elapsed.current += dt;
    updateAudio(elapsed.current, dt);
  });

  return null;
}

/**
 * Lifts the fan and the core above centre through the hero so they sit behind
 * the wordmark rather than behind the paragraph underneath it.
 */
function HeroLift({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.y = track(view.smoothProgress, [
      [0, 1.25],
      [0.25, 0],
      [1, 0],
    ]);
  });

  return <group ref={group}>{children}</group>;
}

/** Camera drift: cursor parallax plus a slow dolly tied to scroll. */
function Rig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const p = view.smoothProgress;

    const x = view.smoothPointerX * 0.85;
    const y = -view.smoothPointerY * 0.55 + track(p, [
      [0, 0],
      [0.5, 0.6],
      [1, -0.3],
    ]);
    const z = 7 + track(p, [
      [0, 0],
      [0.35, 1.4],
      [0.7, 2.6],
      [1, 0.2],
    ]);

    camera.position.x = lerp(camera.position.x, x, 0.04);
    camera.position.y = lerp(camera.position.y, y, 0.04);
    camera.position.z = lerp(camera.position.z, z, 0.04);

    // Look slightly ahead of centre so the frame never feels locked off.
    target.current.set(
      view.smoothPointerX * 0.2,
      -view.smoothPointerY * 0.15,
      0,
    );
    camera.lookAt(target.current);
  });

  return null;
}

export function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 7], fov: 42, near: 0.1, far: 140 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#050506"), 1);
        }}
      >
        <AudioDriver />
        <Rig />

        <Grid />
        <Particles />

        <HeroLift>
          <Streaks />
          <Core />
        </HeroLift>

        <Effects />
      </Canvas>
    </div>
  );
}
