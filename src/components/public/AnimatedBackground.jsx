import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [bloomed, setBloomed] = useState(false);

  useEffect(() => {
    // Trigger bloom animation shortly after mount
    const t = setTimeout(() => setBloomed(true), 100);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Parallax: orbs move up as user scrolls down
  const parallax = (factor) => `translateY(${-scrollY * factor}px)`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1628] to-[#0d1f3c]" />

      {/* Bloom orb 1 — large center-left blue */}
      <div
        className="absolute rounded-full"
        style={{
          width: '900px',
          height: '900px',
          top: '-200px',
          left: '-150px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0.08) 50%, transparent 75%)',
          transform: `${parallax(0.15)} scale(${bloomed ? 1 : 0.2})`,
          opacity: bloomed ? 1 : 0,
          transition: 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.8s ease',
        }}
      />

      {/* Bloom orb 2 — medium top-right indigo */}
      <div
        className="absolute rounded-full"
        style={{
          width: '600px',
          height: '600px',
          top: '-100px',
          right: '-100px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(99,102,241,0.06) 55%, transparent 75%)',
          transform: `${parallax(0.1)} scale(${bloomed ? 1 : 0.2})`,
          opacity: bloomed ? 1 : 0,
          transition: 'transform 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 2.2s ease 0.2s',
        }}
      />

      {/* Bloom orb 3 — accent cyan-blue bottom-center */}
      <div
        className="absolute rounded-full"
        style={{
          width: '700px',
          height: '700px',
          top: '200px',
          left: '35%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(14,165,233,0.05) 55%, transparent 75%)',
          transform: `${parallax(0.08)} scale(${bloomed ? 1 : 0.15})`,
          opacity: bloomed ? 1 : 0,
          transition: 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, opacity 2.5s ease 0.4s',
        }}
      />

      {/* Bloom orb 4 — deep navy bottom-left anchor */}
      <div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          top: '400px',
          left: '-80px',
          background: 'radial-gradient(circle, rgba(29,78,216,0.22) 0%, rgba(29,78,216,0.05) 60%, transparent 80%)',
          transform: `${parallax(0.05)} scale(${bloomed ? 1 : 0.2})`,
          opacity: bloomed ? 1 : 0,
          transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s, opacity 2s ease 0.6s',
        }}
      />

      {/* Subtle noise/grain overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />
    </div>
  );
}