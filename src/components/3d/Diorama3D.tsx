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
  height = 290,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    const width = container.clientWidth || 380;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 3.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Studio Claymation Softbox Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 2.2);
    scene.add(ambientLight);

    const keySoftbox = new THREE.DirectionalLight(0xffedd5, 3.0);
    keySoftbox.position.set(3, 5, 4);
    keySoftbox.castShadow = true;
    keySoftbox.shadow.mapSize.width = 1024;
    keySoftbox.shadow.mapSize.height = 1024;
    keySoftbox.shadow.bias = -0.001;
    scene.add(keySoftbox);

    const fillSky = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    fillSky.position.set(-3, 3, 2);
    scene.add(fillSky);

    // 3. Load Clay Diorama
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    loader.load(
      "/assets/diorama.glb",
      (gltf) => {
        const model = gltf.scene;

        // Auto-center model at origin
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

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
      (err) => console.warn("Error loading clay diorama:", err)
    );

    // 4. Subtle Mouse Parallax
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.35;
      targetRotX = -y * 0.15;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 5. Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (mixer) mixer.update(delta);

      // Smooth parallax
      dioramaGroup.rotation.y += (targetRotY - dioramaGroup.rotation.y) * 0.06;
      dioramaGroup.rotation.x += (targetRotX - dioramaGroup.rotation.x) * 0.06;

      // Dynamic Highlighting pulse
      if (dioramaGroup) {
        const time = currentTime / 1000;
        dioramaGroup.traverse((child) => {
          const name = child.name.toUpperCase();
          if (highlight === "food" && (name.includes("FOOD") || name.includes("FORK") || name.includes("LEFT") || name.includes("PASTA"))) {
            child.scale.setScalar(1.0 + Math.sin(time * 8) * 0.08);
          } else if (highlight === "drink" && (name.includes("WINE") || name.includes("BEER") || name.includes("MUG") || name.includes("RIGHT"))) {
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
      className={`w-full flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none rounded-xl overflow-hidden ${className}`}
      style={{ height }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-black/40 animate-pulse">
          Crafting Handmade Clay Scene...
        </div>
      )}
    </div>
  );
};
