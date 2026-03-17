import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const bloom1Ref = useRef(null);
  const bloom2Ref = useRef(null);

  useEffect(() => {
    let frame;
    let t = 0;

    const animate = () => {
      t += 0.005;
      if (bloom1Ref.current) {
        const scale = 1 + Math.sin(t) * 0.04;
        bloom1Ref.current.style.transform = `scale(${scale})`;
      }
      if (bloom2Ref.current) {
        const scale = 1 + Math.sin(t + 1.5) * 0.04;
        bloom2Ref.current.style.transform = `scale(${scale})`;
      }
      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* White base */}
      <div className="absolute inset-0 bg-white" />

      {/* Yellow/gold bloom — top left */}
      <div
        ref={bloom1Ref}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '55%',
          height: '80%',
          background: 'radial-gradient(ellipse at center, rgba(251, 211, 100, 0.55) 0%, rgba(251, 211, 100, 0.2) 45%, transparent 75%)',
          filter: 'blur(60px)',
          animation: 'bloomIn 1.6s ease-out both',
          transformOrigin: 'center center',
        }}
      />

      {/* Pink/lavender bloom — top right / center */}
      <div
        ref={bloom2Ref}
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '65%',
          height: '90%',
          background: 'radial-gradient(ellipse at center, rgba(216, 155, 210, 0.5) 0%, rgba(196, 130, 200, 0.2) 45%, transparent 72%)',
          filter: 'blur(70px)',
          animation: 'bloomIn 1.8s ease-out 0.2s both',
          transformOrigin: 'center center',
        }}
      />

      <style>{`
        @keyframes bloomIn {
          0%   { opacity: 0; transform: scale(0.3); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}