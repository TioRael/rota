'use client';
// components/RotaRunner.tsx
// Easter egg: jogo runner tematico do ROTA.
// Adicione na home (app/page.tsx) no final da pagina.
// Pressionar Espaco ou clicar no canvas inicia/pula/reinicia.

import { useEffect, useRef, useState } from 'react';

// Interface para garantir a tipagem correta do roundRect sem usar "any"
interface ExtendedCanvasRenderingContext2D extends CanvasRenderingContext2D {
  roundRect: (x: number, y: number, w: number, h: number, radii?: number | number[]) => void;
}

export default function RotaRunner() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<'idle'|'running'|'dead'>('idle');
  const scoreRef   = useRef(0);
  const hiRef      = useRef(0);
  const rafRef     = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [hi,    setHi]    = useState(0);
  const [lvl,   setLvl]   = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as ExtendedCanvasRenderingContext2D;
    const W = canvas.width, H = canvas.height;

    // ─── Cores ────────────────────────────────────────────────
    const C = {
      sky:'#E8F4FF', road:'#555555', roadLine:'#FFCC00',
      grass:'#5CB85C', grassD:'#4A9E4A', sun:'#FFD966',
      car:'#FF6B1A', carDark:'#CC5000', window:'#A8D8F0',
      wheel:'#333333', hubcap:'#CCCCCC',
      coin:'#FFD700', coinRim:'#E6B800',
      white:'#FFFFFF', cloud:'#FFFFFF', mountain:'#B8C9D4',
      overlay:'rgba(0,0,0,0.42)',
    };

    const GROUND_Y  = H - 52;
    const GRAVITY   = 0.7;
    const JUMP_V    = -14;

    // ─── Estado ───────────────────────────────────────────────
    const car = { x:90, y:GROUND_Y-32, w:64, h:32, vy:0, grounded:true };

    interface Obs { x:number; w:number; h:number; type:string; }
    interface Coin { x:number; y:number; r:number; angle:number; }
    interface Particle { x:number; y:number; vx:number; vy:number; life:number; color:string; }
    interface Cloud { x:number; y:number; w:number; }
    interface Mountain { x:number; h:number; }

    let obstacles:Obs[] = [], coins:Coin[] = [], particles:Particle[] = [];
    
    // Corrigido para const, pois as referências dos arrays não são reatribuídas
    const clouds:Cloud[]   = [{x:120,y:28,w:60},{x:340,y:18,w:80},{x:560,y:32,w:50}];
    const mountains:Mountain[] = [{x:80,h:55},{x:200,h:40},{x:320,h:65},{x:440,h:48},{x:560,h:58},{x:650,h:35}];
    
    let roadLines   = [0, 170, 340, 510];
    let obsCooldown = 90;
    let frame = 0;
    let speed = 5;

    function reset() {
      stateRef.current = 'running';
      scoreRef.current = 0; frame = 0; speed = 5;
      obstacles = []; coins = []; particles = [];
      obsCooldown = 90;
      car.y = GROUND_Y - car.h; car.vy = 0; car.grounded = true;
      setScore(0); setLvl(1);
    }

    function jump() {
      if (stateRef.current !== 'running') { reset(); return; }
      if (car.grounded) { car.vy = JUMP_V; car.grounded = false; }
    }

    function emitParticles(x:number, y:number) {
      for (let i=0;i<10;i++) {
        const a=Math.random()*Math.PI*2, v=2+Math.random()*4;
        particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,life:1,
          color:[C.car,C.coin,'#E74C3C'][Math.floor(Math.random()*3)]});
      }
    }

    function hit(ax:number,ay:number,aw:number,ah:number,bx:number,by:number,bw:number,bh:number) {
      return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
    }

    function update() {
      frame++; scoreRef.current++;
      speed = 5 + Math.floor(scoreRef.current/400)*0.8;
      const l = 1 + Math.floor(scoreRef.current/400);

      car.vy += GRAVITY; car.y += car.vy;
      if (car.y >= GROUND_Y - car.h) { car.y=GROUND_Y-car.h; car.vy=0; car.grounded=true; }

      clouds.forEach(c => { c.x -= 0.6; if (c.x+c.w<0) c.x=W+c.w; });
      mountains.forEach(m => { m.x -= 0.3; if (m.x<-40) m.x=W+40; });
      roadLines = roadLines.map(x => { const n=x-speed; return n<-60?n+W+60:n; });

      obsCooldown--;
      if (obsCooldown<=0) {
        const type = Math.random()<0.35?'tall':'wide';
        obstacles.push({x:W+20, w:type==='tall'?22:38, h:type==='tall'?48:24, type});
        obsCooldown = Math.max(55,100-l*5) + Math.floor(Math.random()*40);
      }

      if (frame%120===0) {
        const hAlt = Math.random()<0.4;
        coins.push({x:W+20, y:hAlt?GROUND_Y-car.h-30:GROUND_Y-20, r:10, angle:0});
      }

      obstacles = obstacles.filter(o => {
        o.x -= speed;
        const oy = GROUND_Y - o.h;
        if (hit(car.x+6,car.y+4,car.w-12,car.h-8,o.x,oy,o.w,o.h)) {
          emitParticles(car.x+car.w/2,car.y+car.h/2);
          if (scoreRef.current>hiRef.current) { hiRef.current=scoreRef.current; setHi(scoreRef.current); }
          stateRef.current='dead';
          return false;
        }
        return o.x+o.w>-10;
      });

      coins = coins.filter(c => {
        c.x -= speed; c.angle += 0.1;
        if (hit(car.x+4,car.y+4,car.w-8,car.h-8,c.x-c.r,c.y-c.r,c.r*2,c.r*2)) {
          scoreRef.current += 50; emitParticles(c.x,c.y); return false;
        }
        return c.x+c.r>-10;
      });

      particles = particles.filter(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.life-=0.04; return p.life>0;
      });

      setScore(scoreRef.current);
      setLvl(l);
    }

    // ─── Desenho ──────────────────────────────────────────────
    function drawCloud(cx:number,cy:number,cw:number) {
      ctx.fillStyle=C.cloud; ctx.globalAlpha=0.85;
      const bh=cw*0.28;
      ctx.beginPath(); ctx.ellipse(cx,cy,cw/2,bh,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx-cw*0.22,cy+bh*0.2,cw*0.28,bh*0.75,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+cw*0.22,cy+bh*0.15,cw*0.32,bh*0.8,0,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    }
    
    function drawMountain(mx:number,mh:number) {
      ctx.fillStyle=C.mountain;
      ctx.beginPath(); ctx.moveTo(mx-40,GROUND_Y); ctx.lineTo(mx,GROUND_Y-mh); ctx.lineTo(mx+40,GROUND_Y); ctx.closePath(); ctx.fill();
      ctx.fillStyle=C.white; ctx.globalAlpha=0.6;
      ctx.beginPath(); ctx.moveTo(mx-10,GROUND_Y-mh+10); ctx.lineTo(mx,GROUND_Y-mh); ctx.lineTo(mx+10,GROUND_Y-mh+10); ctx.closePath(); ctx.fill();
      ctx.globalAlpha=1;
    }
    
    function drawCar(x:number,y:number) {
      const {w,h}=car;
      ctx.fillStyle='rgba(0,0,0,0.12)';
      ctx.beginPath(); ctx.ellipse(x+w/2,GROUND_Y+4,w/2-4,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=C.car;
      
      // Corrigido: sem uso de 'any'
      ctx.beginPath(); ctx.roundRect(x,y+h*0.35,w,h*0.65,4); ctx.fill();
      
      ctx.fillStyle=C.carDark;
      ctx.beginPath(); ctx.moveTo(x+w*0.18,y+h*0.35); ctx.lineTo(x+w*0.28,y+h*0.05); ctx.lineTo(x+w*0.72,y+h*0.05); ctx.lineTo(x+w*0.82,y+h*0.35); ctx.closePath(); ctx.fill();
      ctx.fillStyle=C.window; ctx.globalAlpha=0.85;
      ctx.beginPath(); ctx.moveTo(x+w*0.22,y+h*0.32); ctx.lineTo(x+w*0.30,y+h*0.09); ctx.lineTo(x+w*0.70,y+h*0.09); ctx.lineTo(x+w*0.78,y+h*0.32); ctx.closePath(); ctx.fill();
      ctx.globalAlpha=1;
      [0.2,0.78].forEach(rx => {
        const wx=x+w*rx, wy=y+h-4;
        ctx.fillStyle=C.wheel; ctx.beginPath(); ctx.arc(wx,wy,8,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=C.hubcap; ctx.beginPath(); ctx.arc(wx,wy,3.5,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle=C.white; ctx.font='bold 8px monospace'; ctx.textAlign='center';
      ctx.fillText('ROTA',x+w/2,y+h*0.72); ctx.textAlign='left';
    }
    
    function drawObstacle(o:Obs) {
      const oy=GROUND_Y-o.h;
      if (o.type==='tall') {
        ctx.fillStyle='#FF6600';
        ctx.beginPath(); ctx.moveTo(o.x+o.w/2,oy); ctx.lineTo(o.x+o.w,oy+o.h); ctx.lineTo(o.x,oy+o.h); ctx.closePath(); ctx.fill();
        ctx.fillStyle=C.white; ctx.fillRect(o.x+o.w*0.15,oy+o.h*0.35,o.w*0.7,o.h*0.12); ctx.fillRect(o.x+o.w*0.15,oy+o.h*0.6,o.w*0.7,o.h*0.12);
      } else {
        ctx.fillStyle='#778899';
        
        // Corrigido: sem uso de 'any'
        ctx.beginPath(); ctx.roundRect(o.x,oy,o.w,o.h,4); ctx.fill();
        
        ctx.fillStyle='#A0B0C0'; ctx.fillRect(o.x+4,oy+4,o.w-8,4);
      }
    }
    
    function drawCoin(c:Coin) {
      const sx=Math.abs(Math.cos(c.angle));
      ctx.save(); ctx.translate(c.x,c.y); ctx.scale(sx,1);
      ctx.fillStyle=C.coin; ctx.strokeStyle=C.coinRim; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0,c.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle=C.coinRim; ctx.font=`bold ${Math.round(c.r*1.2)}px monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('R',0,1);
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=C.sky; ctx.fillRect(0,0,W,GROUND_Y);
      ctx.fillStyle=C.sun; ctx.beginPath(); ctx.arc(W-60,38,22,0,Math.PI*2); ctx.fill();
      mountains.forEach(m=>drawMountain(m.x,m.h));
      clouds.forEach(c=>drawCloud(c.x,c.y,c.w));
      ctx.fillStyle=C.grass; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
      ctx.fillStyle=C.grassD; ctx.fillRect(0,GROUND_Y,W,6);
      ctx.fillStyle=C.road; ctx.fillRect(0,GROUND_Y+6,W,H-GROUND_Y-6);
      ctx.strokeStyle=C.roadLine; ctx.lineWidth=3; ctx.setLineDash([40,20]);
      const mid=GROUND_Y+6+(H-GROUND_Y-6)/2;
      ctx.beginPath(); ctx.moveTo(0,mid); ctx.lineTo(W,mid); ctx.stroke(); ctx.setLineDash([]);
      drawCar(car.x,car.y);
      obstacles.forEach(drawObstacle);
      coins.forEach(drawCoin);
      particles.forEach(p => {
        ctx.globalAlpha=p.life; ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha=1;

      if (stateRef.current==='idle') {
        ctx.fillStyle=C.overlay; ctx.fillRect(0,0,W,H);
        ctx.fillStyle=C.white; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
        ctx.fillText('🚗  ROTA Runner',W/2,H/2-22);
        ctx.font='14px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.7)';
        ctx.fillText('Pressione Espaço ou clique para começar',W/2,H/2+8); ctx.textAlign='left';
      }
      if (stateRef.current==='dead') {
        ctx.fillStyle=C.overlay; ctx.fillRect(0,0,W,H);
        ctx.fillStyle=C.white; ctx.font='bold 20px sans-serif'; ctx.textAlign='center';
        ctx.fillText('💥  Bateu!',W/2,H/2-24);
        ctx.font='14px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.75)';
        ctx.fillText('Pontos: '+scoreRef.current,W/2,H/2+4);
        ctx.fillStyle='#FFD700'; ctx.fillText('Recorde: '+hiRef.current,W/2,H/2+24);
        ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='12px sans-serif';
        ctx.fillText('Espaço ou clique para tentar de novo',W/2,H/2+48); ctx.textAlign='left';
      }
      if (stateRef.current==='running') {
        ctx.fillStyle='rgba(0,0,0,0.25)';
        
        // Corrigido: sem uso de 'any'
        ctx.beginPath(); ctx.roundRect(W-90,10,78,22,4); ctx.fill();
        
        ctx.fillStyle=C.white; ctx.font='11px monospace'; ctx.textAlign='right';
        ctx.fillText(Math.round(speed*20)+' km/h',W-16,25); ctx.textAlign='left';
      }
    }

    function loop() {
      if (stateRef.current==='running') update();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    const onKey = (e: KeyboardEvent) => { if (e.code==='Space') { e.preventDefault(); jump(); } };
    document.addEventListener('keydown', onKey);
    canvas.addEventListener('click', jump);

    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', jump);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem 3rem' }}>
      {/* Titulo easter egg */}
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
        🥚 Easter Egg
      </p>
      <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: '1.5rem', marginBottom: '0.4rem' }}>
        🚗 ROTA Runner
      </h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--texto-suave)', marginBottom: '1.25rem' }}>
        Pressione <kbd style={{ background: 'var(--creme-medio)', border: '1px solid var(--cinza-borda)', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.82rem' }}>Espaço</kbd> ou toque na tela para pular
      </p>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={680}
        height={180}
        style={{
          width: '100%', maxWidth: '680px', display: 'block', margin: '0 auto',
          borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--cinza-borda)',
          background: '#FFFDF7', cursor: 'pointer',
        }}
      />

      {/* HUD */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        {[
          { label: 'Pontos', valor: score,  cor: 'var(--texto-principal)' },
          { label: 'Recorde', valor: hi,    cor: 'var(--laranja-manga)' },
          { label: 'Fase',    valor: lvl,   cor: 'var(--verde-palmeira)' },
        ].map(({ label, valor, cor }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{label}</p>
            <p style={{ fontFamily: 'var(--fonte-display)', fontWeight: 800, fontSize: '1.4rem', color: cor, fontVariantNumeric: 'tabular-nums' }}>{valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}