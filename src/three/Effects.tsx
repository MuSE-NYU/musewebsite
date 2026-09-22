import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { ChromaticAberrationEffect } from "postprocessing";

import { getBeat } from "../lib/audio";
import { view } from "../lib/view";

/**
 * Bloom sells the "light trails on black" look; the aberration offset is driven
 * by scroll velocity and audio transients so fast scrolling smears the colour
 * fringes the way a cheap CRT would.
 */
export function Effects() {
  const aberration = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new THREE.Vector2(0.00003, 0.00002), []);

  useFrame(() => {
    if (!aberration.current) return;

    // Near-zero at rest: a static rainbow fringe on every line is decoration.
    // Scroll velocity is what earns the smear, so the effect reads as motion.
    const kick = Math.min(Math.abs(view.velocity) * 0.00008, 0.0018);
    const beat = getBeat() * 0.0003;

    offset.set(0.00003 + kick + beat, 0.00002 + kick * 0.6);
    aberration.current.offset = offset;
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.6}
      />
      <ChromaticAberration
        ref={aberration}
        offset={offset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise opacity={0.055} premultiply blendFunction={BlendFunction.SCREEN} />
      <Vignette offset={0.26} darkness={0.72} />
    </EffectComposer>
  );
}
