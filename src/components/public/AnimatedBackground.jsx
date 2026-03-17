import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const blob1 = useRef(null);
  const blob2 = useRef(null);

  useEffect(() => {
    let x1 = 30, y1 = 30, vx1 = 0.12, vy1 = 0.08;
    let x2 = 65, y2 = 55, vx2 = -0.09, vy2 = 0.11;
    let raf;

    const animate = () => {
      x1 += vx1; y1 += vy1;
      x2 += vx2; y2 += vy2;

      if (x1 < 10 || x1 > 80) vx1 *= -1;
      if (y1 < 10 || y1 > 80) vy1 *= -1;
      if (x2 < 20 || x2 > 90) vx2 *= -1;
      if (y2 < 10 || y2 > 80) vy2 *= -1;

      if (blob1.current) {
        blob1.current.style.left = `${x1}%`;
        blob1.current.style.top = `${y1}%`;
      }
      if (blob2.current) {
        blob2.current.style.left = `${x2}%`;
        blob2.current.style.top = `${y2}%`;
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Primary large bloom — top left */}
      <div
        ref={blob1}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.30) 0%, rgba(99,102,241,0.15) 50%, transparent 75%)',
          filter: 'blur(60px)',
          transition: 'left 0.1s linear, top 0.1s linear',
        }}
      />
      {/* Secondary bloom — right side */}
      <div
        ref={blob2}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, rgba(59,130,246,0.12) 50%, transparent 75%)',
          filter: 'blur(50px)',
          transition: 'left 0.1s linear, top 0.1s linear',
        }}
      />
    </div>
  );
}