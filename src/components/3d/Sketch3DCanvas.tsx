import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type SceneType = "vibe" | "food" | "drink" | "when" | "objection";

interface Sketch3DCanvasProps {
  type: SceneType;
  className?: string;
  height?: number;
}

export const Sketch3DCanvas: React.FC<Sketch3DCanvasProps> = ({
  type,
  className = "",
  height = 180,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    const width = container.clientWidth || 360;

    // 1. Scene & Transparent Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting (warm classroom / legal pad lighting)
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1.5, 10);
    pointLight.position.set(-3, 2, 2);
    scene.add(pointLight);

    // 3. Materials (Hand-drawn Ink / Cel Shader & Sketch Wireframe)
    const inkMaterial = new THREE.MeshToonMaterial({
      color: 0x18181b,
      wireframe: false,
    });

    const goldMaterial = new THREE.MeshToonMaterial({
      color: 0xfacc15,
    });

    const redMaterial = new THREE.MeshToonMaterial({
      color: 0xdc2626,
    });

    const blueMaterial = new THREE.MeshToonMaterial({
      color: 0x2563eb,
    });

    const wireframeOverlay = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
    });

    // 4. Build 3D Objects based on Step Type
    const group = new THREE.Group();
    scene.add(group);

    // Dynamic animation objects reference
    const animatedObjects: {
      mesh: THREE.Object3D;
      rotSpeed: { x: number; y: number; z: number };
      floatSpeed: number;
      floatOffset: number;
    }[] = [];

    if (type === "vibe") {
      // 3D Wine Glass Sketch + 3D Cloche/Fork
      // Glass
      const glassGeo = new THREE.CylinderGeometry(0.65, 0.15, 1.2, 16, 1, true);
      const glassMesh = new THREE.Mesh(glassGeo, goldMaterial);
      glassMesh.position.set(-1.2, 0.2, 0);

      const glassStem = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8);
      const stemMesh = new THREE.Mesh(glassStem, inkMaterial);
      stemMesh.position.set(-1.2, -0.6, 0);

      const glassBase = new THREE.CylinderGeometry(0.5, 0.5, 0.06, 16);
      const baseMesh = new THREE.Mesh(glassBase, inkMaterial);
      baseMesh.position.set(-1.2, -1.1, 0);

      const wineGroup = new THREE.Group();
      wineGroup.add(glassMesh, stemMesh, baseMesh);
      group.add(wineGroup);

      // Cloche/Food Dome
      const clocheGeo = new THREE.SphereGeometry(0.9, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
      const clocheMesh = new THREE.Mesh(clocheGeo, blueMaterial);
      clocheMesh.position.set(1.2, -0.3, 0);

      const clocheBase = new THREE.CylinderGeometry(1.05, 1.05, 0.08, 20);
      const clocheBaseMesh = new THREE.Mesh(clocheBase, inkMaterial);
      clocheBaseMesh.position.set(1.2, -0.3, 0);

      const handleGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const handleMesh = new THREE.Mesh(handleGeo, goldMaterial);
      handleMesh.position.set(1.2, 0.65, 0);

      const foodGroup = new THREE.Group();
      foodGroup.add(clocheMesh, clocheBaseMesh, handleMesh);
      group.add(foodGroup);

      animatedObjects.push(
        { mesh: wineGroup, rotSpeed: { x: 0.005, y: 0.015, z: 0.002 }, floatSpeed: 2, floatOffset: 0 },
        { mesh: foodGroup, rotSpeed: { x: 0.005, y: -0.012, z: 0.003 }, floatSpeed: 2.2, floatOffset: Math.PI }
      );
    } else if (type === "food") {
      // 3D Pizza Slice + 3D Skewer/Kabob
      // Pizza slice (Triangular prism)
      const pizzaShape = new THREE.Shape();
      pizzaShape.moveTo(0, 1.2);
      pizzaShape.lineTo(-0.7, -0.8);
      pizzaShape.lineTo(0.7, -0.8);
      pizzaShape.closePath();

      const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
      const pizzaGeo = new THREE.ExtrudeGeometry(pizzaShape, extrudeSettings);
      const pizzaMesh = new THREE.Mesh(pizzaGeo, goldMaterial);
      pizzaMesh.position.set(-1.1, 0, 0);

      const pizzaEdges = new THREE.LineSegments(new THREE.EdgesGeometry(pizzaGeo), wireframeOverlay);
      pizzaMesh.add(pizzaEdges);

      // Kabob skewer (stacked meat cubes on a rod)
      const skewerGroup = new THREE.Group();
      const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8);
      const rodMesh = new THREE.Mesh(rodGeo, inkMaterial);
      skewerGroup.add(rodMesh);

      for (let i = -2; i <= 2; i++) {
        const cubeGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
        const cubeMesh = new THREE.Mesh(cubeGeo, i % 2 === 0 ? redMaterial : goldMaterial);
        cubeMesh.position.set(0, i * 0.45, 0);
        cubeMesh.rotation.y = i * 0.4;
        const cubeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeo), wireframeOverlay);
        cubeMesh.add(cubeEdges);
        skewerGroup.add(cubeMesh);
      }
      skewerGroup.position.set(1.1, 0, 0);
      skewerGroup.rotation.z = -0.4;

      group.add(pizzaMesh, skewerGroup);

      animatedObjects.push(
        { mesh: pizzaMesh, rotSpeed: { x: 0.01, y: 0.015, z: 0.005 }, floatSpeed: 1.8, floatOffset: 0 },
        { mesh: skewerGroup, rotSpeed: { x: 0.01, y: 0.02, z: 0.005 }, floatSpeed: 2.1, floatOffset: 1.5 }
      );
    } else if (type === "drink") {
      // 3D Wine Bottle & Beer Mug
      const bottleGroup = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16);
      const bodyMesh = new THREE.Mesh(bodyGeo, redMaterial);
      const neckGeo = new THREE.CylinderGeometry(0.12, 0.25, 0.8, 16);
      neckGeo.translate(0, 0.9, 0);
      const neckMesh = new THREE.Mesh(neckGeo, inkMaterial);
      bottleGroup.add(bodyMesh, neckMesh);
      bottleGroup.position.set(-1.1, -0.2, 0);

      // Beer Mug
      const mugGroup = new THREE.Group();
      const mugGeo = new THREE.CylinderGeometry(0.5, 0.45, 1.3, 16);
      const mugMesh = new THREE.Mesh(mugGeo, goldMaterial);
      const mugEdges = new THREE.LineSegments(new THREE.EdgesGeometry(mugGeo), wireframeOverlay);
      mugMesh.add(mugEdges);

      const foamGeo = new THREE.SphereGeometry(0.55, 12, 8);
      foamGeo.scale(1, 0.35, 1);
      const foamMesh = new THREE.Mesh(foamGeo, new THREE.MeshToonMaterial({ color: 0xffffff }));
      foamMesh.position.set(0, 0.65, 0);

      const handleTorus = new THREE.TorusGeometry(0.35, 0.08, 8, 16, Math.PI);
      const mugHandle = new THREE.Mesh(handleTorus, inkMaterial);
      mugHandle.position.set(0.5, 0, 0);
      mugHandle.rotation.z = -Math.PI / 2;

      mugGroup.add(mugMesh, foamMesh, mugHandle);
      mugGroup.position.set(1.1, -0.2, 0);

      group.add(bottleGroup, mugGroup);

      animatedObjects.push(
        { mesh: bottleGroup, rotSpeed: { x: 0.008, y: 0.015, z: -0.005 }, floatSpeed: 1.9, floatOffset: 0 },
        { mesh: mugGroup, rotSpeed: { x: 0.008, y: -0.018, z: 0.005 }, floatSpeed: 2.3, floatOffset: 2.0 }
      );
    } else if (type === "when") {
      // 3D Pocket Watch / Floating Hourglass & Calendar Ring
      const clockGroup = new THREE.Group();
      const rimGeo = new THREE.TorusGeometry(1.0, 0.12, 12, 32);
      const rimMesh = new THREE.Mesh(rimGeo, goldMaterial);
      const faceGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.08, 32);
      faceGeo.rotateX(Math.PI / 2);
      const faceMesh = new THREE.Mesh(faceGeo, new THREE.MeshToonMaterial({ color: 0xffffff }));

      const handGeo = new THREE.BoxGeometry(0.06, 0.6, 0.04);
      handGeo.translate(0, 0.25, 0.06);
      const handMesh = new THREE.Mesh(handGeo, redMaterial);
      handMesh.rotation.z = -0.6;

      const hourHandGeo = new THREE.BoxGeometry(0.08, 0.45, 0.04);
      hourHandGeo.translate(0, 0.18, 0.06);
      const hourHandMesh = new THREE.Mesh(hourHandGeo, inkMaterial);
      hourHandMesh.rotation.z = 0.8;

      clockGroup.add(rimMesh, faceMesh, handMesh, hourHandMesh);
      group.add(clockGroup);

      animatedObjects.push({
        mesh: clockGroup,
        rotSpeed: { x: 0.006, y: 0.015, z: 0.002 },
        floatSpeed: 2.0,
        floatOffset: 0,
      });
    } else if (type === "objection") {
      // 3D Paper Airplane
      const planeShape = new THREE.Shape();
      planeShape.moveTo(0, 1.4);
      planeShape.lineTo(-1.1, -1.0);
      planeShape.lineTo(0, -0.4);
      planeShape.lineTo(1.1, -1.0);
      planeShape.closePath();

      const planeGeo = new THREE.ExtrudeGeometry(planeShape, { depth: 0.05, bevelEnabled: false });
      const planeMesh = new THREE.Mesh(planeGeo, redMaterial);
      const planeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(planeGeo), wireframeOverlay);
      planeMesh.add(planeEdges);
      planeMesh.rotation.x = Math.PI / 2.5;

      group.add(planeMesh);

      animatedObjects.push({
        mesh: planeMesh,
        rotSpeed: { x: 0.015, y: 0.02, z: 0.01 },
        floatSpeed: 2.5,
        floatOffset: 0,
      });
    }

    // 5. Floating Sketch Particle Dust (Ink Doodles / Stars)
    const particleCount = 28;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 3;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xca8a04,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleSystem);

    // 6. Interactive Mouse 3D Orbit / Parallax Tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.45;
      targetRotX = -y * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
        targetRotY = x * 0.45;
        targetRotX = -y * 0.35;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // 7. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth Orbit Lerp
      group.rotation.y += (targetRotY - group.rotation.y) * 0.06;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.06;

      // Animate individual meshes
      animatedObjects.forEach((item) => {
        item.mesh.rotation.x += item.rotSpeed.x;
        item.mesh.rotation.y += item.rotSpeed.y;
        item.mesh.rotation.z += item.rotSpeed.z;
        item.mesh.position.y += Math.sin(elapsedTime * item.floatSpeed + item.floatOffset) * 0.003;
      });

      // Rotate particles slowly
      particleSystem.rotation.y = elapsedTime * 0.05;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 360;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type, height]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ height }}
    />
  );
};
