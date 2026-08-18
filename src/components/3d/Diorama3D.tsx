import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface Diorama3DProps {
  highlight?: "food" | "drink" | null;
  className?: string;
  height?: number;
}

export const Diorama3D: React.FC<Diorama3DProps> = ({
  highlight = null,
  className = "",
  height = 280,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    const width = container.clientWidth || 380;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();

    // 2. Perspective Camera with cinematic 3/4 view focused on couple
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(3.4, 3.2, 3.8);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting for Rich Clay/Toy Shading
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0xffedd5, 2.8);
    keySun.position.set(4, 7, 3.5);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 1024;
    keySun.shadow.mapSize.height = 1024;
    keySun.shadow.bias = -0.001;
    scene.add(keySun);

    const fillBlue = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillBlue.position.set(-4, 3, -3);
    scene.add(fillBlue);

    // Warm Lantern Glow
    const lanternLight = new THREE.PointLight(0xfef08a, 2.5, 5);
    lanternLight.position.set(-1.7, 2.45, 1.1);
    scene.add(lanternLight);

    // 4. Load Diorama Model
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    const dioramaGroup = new THREE.Group();
    dioramaGroup.position.set(0, -0.2, 0);
    scene.add(dioramaGroup);

    loader.load(
      "/assets/diorama.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        dioramaGroup.add(model);

        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer?.clipAction(clip).play();
          });
        }

        setLoaded(true);
      },
      undefined,
      (err) => console.warn("Error loading diorama:", err)
    );

    // 5. Mouse Parallax Orbit
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.35;
      targetRotX = -y * 0.20;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (mixer) mixer.update(delta);

      // Smooth camera orbit
      dioramaGroup.rotation.y += (targetRotY - dioramaGroup.rotation.y) * 0.06;
      dioramaGroup.rotation.x += (targetRotX - dioramaGroup.rotation.x) * 0.06;

      // Dynamic Highlighting pulse
      if (dioramaGroup) {
        const time = currentTime / 1000;
        dioramaGroup.traverse((child) => {
          const name = child.name.toUpperCase();
          if (highlight === "food" && (name.includes("FOOD") || name.includes("FORK") || name.includes("LEFT") || name.includes("PASTA"))) {
            child.scale.setScalar(1.0 + Math.sin(time * 8) * 0.08);
          } else if (highlight === "drink" && (name.includes("WINE") || name.includes("BEER") || name.includes("RIGHT"))) {
            child.scale.setScalar(1.0 + Math.sin(time * 8) * 0.08);
          } else {
            child.scale.setScalar(1.0);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 380;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [height, highlight]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{ height }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-black/40 animate-pulse">
          Crafting 3D Date World...
        </div>
      )}
    </div>
  );
};
