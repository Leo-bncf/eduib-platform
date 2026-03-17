import React, { useEffect, useRef } from 'react';

const orbs = [
  { cx: '15%', cy: '20%', r: 320, color: '#1e3a8a', delay: 0 },
  { cx: '80%', cy: '15%', r: 280, color: '#1d4ed8', delay: 0.3 },
  { cx: '60%', cy: '60%', r: 360, color: '#1e3a8a', delay: 0.6 },
  { cx: '10%', cy: '75%', r: 240, color: '#2563eb', delay: 0.2 },
  { cx: '85%', cy: '80%', r: 300, color: '#1e40af', delay: 0.5 },
];

export default function AnimatedBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xRatio = (clientX / innerWidth - 0.5) * 2;
      const yRatio = (clientY / innerHeight - 0.5) * 2;

      const orbEls = containerRef.current.querySelectorAll('.parallax-orb');
      orbEls.forEach((orb, i) => {
        const strength = (i % 3 + 1) * 12;
        orb.style.transform = `translate(${xRatio * strength}px, ${yRatio * strength}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #060e1e 0%, #0d1b3e 50%, #060e1e 100%)' }} />

      {/* Flowering orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="parallax-orb absolute rounded-full"
          style={{
            left: orb.cx,
            top: orb.cy,
            width: orb.r * 2,
            height: orb.r * 2,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${orb.color}55 0%, ${orb.color}22 50%, transparent 75%)`,
            filter: 'blur(40px)',
            animation: `flowerIn 1.4s ease-out ${orb.delay}s both, orbFloat ${7 + i * 1.5}s ease-in-out ${orb.delay}s infinite alternate`,
            transition: 'transform 0.15s ease-out',
          }}
        />
      ))}

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <style>{`
        @keyframes flowerIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes orbFloat {
          0% { transform: translate(-50%, -50%) translateY(0px); }
          100% { transform: translate(-50%, -50%) translateY(-30px); }
        }
      `}</style>
    </div>
  );
}