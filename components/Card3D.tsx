'use client';
// components/Card3D.tsx
// Wrapper de hover 3D reutilizavel.
// Uso: envolva qualquer card com <Card3D> para ganhar o efeito.
//
// Exemplo:
//   <Card3D>
//     <Link href="/rotas/1" className="card card-rota">...</Link>
//   </Card3D>
//
// Props:
//   intensity  — forca da rotacao (padrao: 12). Use 8 para sutil, 18 para dramatico.
//   scale      — quanto o card cresce no hover (padrao: 1.02).
//   className  — classe extra no wrapper (opcional).

import { useRef, useCallback, ReactNode } from 'react';

interface Card3DProps {
  children:   ReactNode;
  intensity?: number;
  scale?:     number;
  className?: string;
}

export default function Card3D({
  children,
  intensity = 12,
  scale     = 1.02,
  className = '',
}: Card3DProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const wrap = wrapRef.current;
      const inner= innerRef.current;
      const shine= shineRef.current;
      if (!wrap || !inner || !shine) return;

      const rect = wrap.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 a 0.5
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;

      const rx = -y * intensity;  // rotacao X (cima/baixo)
      const ry =  x * intensity;  // rotacao Y (esquerda/direita)

      inner.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale}) translateZ(4px)`;
      inner.style.boxShadow  = `${-ry * 1.5}px ${rx * 1.5}px 36px rgba(0,0,0,0.16)`;

      // Reflexo de luz seguindo o cursor
      shine.style.opacity    = '1';
      shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;
    });
  }, [intensity, scale]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const inner = innerRef.current;
    const shine = shineRef.current;
    if (!inner || !shine) return;
    inner.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)';
    inner.style.boxShadow = '';
    shine.style.opacity   = '0';
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`card3d-wrap ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      {/* Camada interna que recebe a transformacao 3D */}
      <div
        ref={innerRef}
        className="card3d-inner"
        style={{
          transformStyle:  'preserve-3d',
          transition:      'transform 0.08s ease-out, box-shadow 0.08s ease-out',
          willChange:      'transform',
          borderRadius:    'inherit',
        }}
      >
        {children}
      </div>

      {/* Reflexo de luz (overlay sobre os filhos) */}
      <div
        ref={shineRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          borderRadius:  'inherit',
          pointerEvents: 'none',
          opacity:       0,
          transition:    'opacity 0.15s',
          zIndex:        10,
        }}
      />
    </div>
  );
}