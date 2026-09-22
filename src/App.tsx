import { useEffect } from "react";

import { About } from "./components/About";
import { Crt } from "./components/Crt";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Join } from "./components/Join";
import { Marquee } from "./components/Marquee";
import { Nav } from "./components/Nav";
import { Projects } from "./components/Projects";
import { Scrim } from "./components/Scrim";
import { startViewLoop } from "./lib/view";
import { Scene } from "./three/Scene";

const App = () => {
  // One rAF loop feeds both the DOM parallax layers and the three.js scene.
  useEffect(() => startViewLoop(), []);

  return (
    <>
      <Scene />
      <Scrim />
      <Nav />

      <main className="relative z-10">
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Join />
      </main>

      <Footer />

      <Crt />
    </>
  );
};

export default App;
