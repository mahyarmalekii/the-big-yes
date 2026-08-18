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
  height = 240,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    const width = container.clientWidth || 380;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();

    // 2. Orthographic Camera for contemporary editorial illustration look
    const aspect = width / height;
    const frustumSize = 5.2;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );

    // 3/4 Elevated View
    camera.position.set(4.5, 4.0, 4.5);
    camera.lookAt(0, 0.85, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(5, 8, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x60a5fa, 1.2, 12);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // 4. Load Blender Diorama GLB
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);
    modelRef.current = dioramaGroup;

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

        // Play animations (6-second seamless loop from Blender)
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer?.clipAction(clip).play();
          });
        }

        setLoaded(true);
      },
      undefined,
      (error) => {
        console.warn("Could not load diorama.glb, using fallback scene:", error);
      }
    );

    // 5. Mouse Parallax Orbit
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.25;
      targetRotX = -y * 0.15;
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
      dioramaGroup.rotation.y += (targetRotY - dioramaGroup.rotation.y) * 0.05;
      dioramaGroup.rotation.x += (targetRotX - dioramaGroup.rotation.x) * 0.05;

      // Dynamic Highlighting pulse
      if (dioramaGroup) {
        const time = currentTime / 1000;
        dioramaGroup.traverse((child) => {
          const name = child.name.toUpperCase();
          if (highlight === "food" && (name.includes("FOOD") || name.includes("FORK") || name.includes("LEFT"))) {
            child.scale.setScalar(1.0 + Math.sin(time * 6) * 0.06);
          } else if (highlight === "drink" && (name.includes("WINE") || name.includes("BEER") || name.includes("RIGHT"))) {
            child.scale.setScalar(1.0 + Math.sin(time * 6) * 0.06);
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
      const newAspect = newWidth / height;
      camera.left = (-frustumSize * newAspect) / 2;
      camera.right = (frustumSize * newAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
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
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-black/40">
          Loading 3D Diorama...
        </div>
      )}
    </div>
  );
};
