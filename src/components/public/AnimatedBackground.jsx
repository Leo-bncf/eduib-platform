import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const blob1 = useRef(null);
  const blob2 = useRef(null);
  const blob3 = useRef(null);

  useEffect(() => {
    let frame;
    let t = 0;

    const animate = () => {
      t += 0.003;
      if (blob1.current) {
        const s1 = 1 + 0.06 * Math.sin(t);
        blob1.current.style.transform = `scale(${s1}) translate(${Math.sin(t * 0.7) * 18}px, ${Math.cos(t * 0.5) * 12}px)`;
      }
      if (blob2.current) {
        const s2 = 1 + 0.05 * Math.cos(t * 1.1);
        blob2.current.style.transform = `scale(${s2}) translate(${Math.cos(t * 0.6) * 14}px, ${Math.sin(t * 0.8) * 10}px)`;
      }
      if (blob3.current) {
        const s3 = 1 + 0.07 * Math.sin(t * 0.9 + 1);
        blob3.current.style.transform = `scale(${s3}) translate(${Math.sin(t * 0.4) * 20}px, ${Math.cos(t * 0.6) * 15}px)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base gradient - matches Schedual screenshot: light blue top, lavender/white bottom */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, #e8f4ff 0%, #dceeff 25%, #ede8ff 60%, #f5f0ff 85%, #ffffff 100%)'
      }} />

      {/* Blob 1 - soft blue, top-left */}
      <div
        ref={blob1}
        className="absolute"
        style={{
          width: '700px',
          height: '700px',
          top: '-200px',
          left: '-150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,197,253,0.45) 0%, rgba(165,180,252,0.2) 60%, transparent 100%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />

      {/* Blob 2 - soft indigo/lavender, top-right */}
      <div
        ref={blob2}
        className="absolute"
        style={{
          width: '600px',
          height: '600px',
          top: '-100px',
          right: '-100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,181,253,0.4) 0%, rgba(167,139,250,0.15) 60%, transparent 100%)',
          filter: 'blur(70px)',
          willChange: 'transform',
        }}
      />

      {/* Blob 3 - light blue center */}
      <div
        ref={blob3}
        className="absolute"
        style={{
          width: '500px',
          height: '500px',
          top: '100px',
          left: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(186,230,253,0.35) 0%, rgba(147,197,253,0.1) 60%, transparent 100%)',
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}