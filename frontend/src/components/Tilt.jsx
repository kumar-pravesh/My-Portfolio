import React, { useRef, useState } from "react";

const Tilt = ({ children, className = "", options = {} }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});

  const defaultOptions = {
    max: 10, // max tilt rotation (degrees) - subtle is premium
    perspective: 1000, // transform perspective
    scale: 1.02, // transform scale on hover
    speed: 300, // speed of transition
    easing: "cubic-bezier(.03,.98,.52,.99)", // easing function
    ...options,
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    // Mouse position relative to card center
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;

    // Normalize coordinates (-0.5 to 0.5)
    const px = x / width;
    const py = y / height;

    // Calculate tilt angles
    const tiltX = (py * defaultOptions.max).toFixed(2);
    const tiltY = -(px * defaultOptions.max).toFixed(2);

    setStyle({
      transform: `perspective(${defaultOptions.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${defaultOptions.scale}, ${defaultOptions.scale}, ${defaultOptions.scale})`,
      transition: "none",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(${defaultOptions.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${defaultOptions.speed}ms ${defaultOptions.easing}`,
    });
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export default Tilt;
