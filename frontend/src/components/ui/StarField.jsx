import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const isMobile = window.innerWidth < 768;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const starCount = isMobile ? 80 : 180;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.4 + 0.3,
      baseOpacity: Math.random() * 0.6 + 0.15,
      twinkleSpeed: Math.random() * 0.018 + 0.004,
      twinklePhase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.8 + 0.2,
    }));

    const orbs = [
      { x: 0.15, y: 0.25, r: 0.28, rgb: '139,92,246', drift: { x: 0.06, y: 0.04 } },
      { x: 0.85, y: 0.65, r: 0.22, rgb: '34,211,238', drift: { x: -0.04, y: 0.05 } },
      { x: 0.5,  y: 0.05, r: 0.18, rgb: '251,191,36', drift: { x: 0.03, y: 0.07 } },
      { x: 0.7,  y: 0.9,  r: 0.16, rgb: '244,63,94', drift: { x: -0.05, y: -0.03 } },
    ];

    let t = 0;

    const draw = () => {
      t += 0.004;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.5, W * 0.8);
      bg.addColorStop(0, '#0D0D28');
      bg.addColorStop(1, '#030308');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Nebula orbs
      orbs.forEach(orb => {
        const ox = (orb.x + Math.sin(t * orb.drift.x) * 0.07) * W;
        const oy = (orb.y + Math.cos(t * orb.drift.y) * 0.07) * H;
        const r  = orb.r * Math.min(W, H);
        const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0, `rgba(${orb.rgb},0.07)`);
        g.addColorStop(0.5, `rgba(${orb.rgb},0.025)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Stars
      stars.forEach(s => {
        s.twinklePhase += s.twinkleSpeed;
        const tw = (Math.sin(s.twinklePhase) + 1) * 0.5;
        const opacity = s.baseOpacity * (0.4 + tw * 0.6);

        let px = s.x * W;
        let py = s.y * H;

        if (!isMobile) {
          const dx = (mouse.x / W - 0.5) * s.depth * 18;
          const dy = (mouse.y / H - 0.5) * s.depth * 18;
          px -= dx;
          py -= dy;
        }

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);

        // Bigger stars get a warm white, smaller stay cool
        const hue = s.size > 1.2 ? `rgba(255,245,220,${opacity})` : `rgba(200,210,255,${opacity})`;
        ctx.fillStyle = hue;
        ctx.fill();

        // Star cross sparkle for large stars
        if (s.size > 1.1 && tw > 0.85) {
          ctx.strokeStyle = `rgba(255,245,200,${opacity * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(px - s.size * 3, py);
          ctx.lineTo(px + s.size * 3, py);
          ctx.moveTo(px, py - s.size * 3);
          ctx.lineTo(px, py + s.size * 3);
          ctx.stroke();
        }
      });

      raf = requestAnimationFrame(draw);
    };

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onTouch = (e) => {
      if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    };

    if (!isMobile) window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
