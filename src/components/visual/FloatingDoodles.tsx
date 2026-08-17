import React, { useEffect, useState } from "react";

export const FloatingDoodles: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 select-none">
      {/* Top Left Paper Clip */}
      <div
        className="absolute -top-3 left-10 transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4 - scrollY * 0.05}px, 0) rotate(-6deg)`,
        }}
      >
        <svg width="28" height="56" viewBox="0 0 28 56" fill="none">
          <path
            d="M8 12V42C8 46.4183 11.5817 50 16 50C20.4183 50 24 46.4183 24 42V10C24 5.58172 20.4183 2 16 2C11.5817 2 8 5.58172 8 10V38C8 40.2091 9.79086 42 12 42C14.2091 42 16 40.2091 16 38V12"
            stroke="#52525b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Hand-drawn Red Ink Star / Asterisk */}
      <div
        className="absolute top-16 right-4 transition-transform duration-150 ease-out font-handwriting text-2xl text-red-600 font-bold opacity-75"
        style={{
          transform: `translate3d(${-mousePos.x * 0.6}px, ${-mousePos.y * 0.6 - scrollY * 0.08}px, 0) rotate(12deg)`,
        }}
      >
        *important*
      </div>

      {/* Sketched Curly Arrow Doodle */}
      <div
        className="absolute bottom-24 -left-2 transition-transform duration-200 ease-out opacity-60"
        style={{
          transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5 - scrollY * 0.06}px, 0) rotate(-15deg)`,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M8 14C16 4 36 6 38 20C40 32 24 38 18 32C14 28 16 20 26 18C34 16 42 26 42 36"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 4"
          />
          <path d="M38 38L42 36L44 30" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Subtle Coffee Stain Ring on Bottom Right */}
      <div
        className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-4 border-amber-800/15 pointer-events-none opacity-40 blur-[0.5px]"
        style={{
          transform: `translate3d(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px, 0) scale(1, 0.95)`,
        }}
      />
    </div>
  );
};
