import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Hero3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.5;

    // Renderer (transparent background)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf5a623, 3, 30); // Theme Gold
    goldLight.position.set(4, 4, 3);
    scene.add(goldLight);

    const blueLight = new THREE.PointLight(0x2b4b9b, 3, 30); // Theme Blue
    blueLight.position.set(-4, -4, 3);
    scene.add(blueLight);

    // Inner core 3D object
    const coreGeometry = new THREE.IcosahedronGeometry(1.4, 1);

    // Wireframe material (gold)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.Mesh(coreGeometry, wireframeMaterial);
    scene.add(wireframeMesh);

    // Solid core (glassmorphic dark blue style)
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x0b1528,
      emissive: 0x122240,
      specular: 0xffffff,
      shininess: 80,
      transparent: true,
      opacity: 0.5,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Outer particle field
    const particlesCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorGold = new THREE.Color(0xf5a623);
    const colorBlue = new THREE.Color(0x2b4b9b);

    for (let i = 0; i < particlesCount; i++) {
      // Spherical distribution around the center
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.8 + Math.random() * 1.5; // Radius between 1.8 and 3.3

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Interpolate colors (50% gold, 50% blue)
      const mixedColor = Math.random() > 0.5 ? colorGold : colorBlue;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );

    // Particle texture / style
    const pMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });

    const particleSystem = new THREE.Points(particlesGeometry, pMaterial);
    scene.add(particleSystem);

    // Mouse Tracking Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      targetX = (x / (rect.width / 2)) * 0.8;
      targetY = (y / (rect.height / 2)) * 0.8;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize listener
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });

    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Constant rotations
      wireframeMesh.rotation.y = elapsedTime * 0.12;
      wireframeMesh.rotation.x = elapsedTime * 0.08;

      coreMesh.rotation.y = elapsedTime * 0.12;
      coreMesh.rotation.x = elapsedTime * 0.08;

      particleSystem.rotation.y = elapsedTime * -0.04;
      particleSystem.rotation.x = elapsedTime * -0.02;

      // Mouse response (smooth interpolation / lerp)
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate objects according to mouse
      wireframeMesh.rotation.y += mouseX * 0.4;
      wireframeMesh.rotation.x += mouseY * 0.4;
      coreMesh.rotation.y += mouseX * 0.4;
      coreMesh.rotation.x += mouseY * 0.4;

      particleSystem.rotation.y += mouseX * 0.15;
      particleSystem.rotation.x += mouseY * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      if (containerRef.current) {
        resizeObserver.disconnect();
      }

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      coreGeometry.dispose();
      wireframeMaterial.dispose();
      coreMaterial.dispose();
      particlesGeometry.dispose();
      pMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-3d-canvas"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
};

export default Hero3D;
