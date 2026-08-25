import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Node2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  status: 'normal' | 'risk' | 'recovering';
  pulseOffset: number;
}

export default function TransactionNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 2D nodes
    const nodeCount = width < 640 ? 14 : 26;
    const nodes: Node2D[] = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: i % 5 === 0 ? 4 : 2.5,
      status: i % 6 === 0 ? 'risk' : i % 8 === 0 ? 'recovering' : 'normal',
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);

            if (nodes[i].status === 'risk' || nodes[j].status === 'risk') {
              ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 1.5})`;
            } else {
              ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            }
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Render & Update Nodes
      nodes.forEach((node) => {
        if (!reducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        ctx.beginPath();
        let color = 'rgba(0, 212, 255, 0.8)';
        let currentRadius = node.radius;

        if (node.status === 'risk') {
          const pulse = Math.sin(time * 0.005 + node.pulseOffset) * 2;
          currentRadius = node.radius + Math.max(0, pulse);
          color = 'rgba(245, 158, 11, 0.9)';
        } else if (node.status === 'recovering') {
          color = 'rgba(16, 185, 129, 0.85)';
        }

        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animId = requestAnimationFrame((t) => render(t));
    };

    animId = requestAnimationFrame((t) => render(t));

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full rounded-lg glass border border-white/[0.06] overflow-hidden my-8">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4 text-[10px] font-mono text-white/50 uppercase tracking-widest">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" /> Healthy Transaction
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" /> At-Risk Anomaly
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> AI Recovered
        </span>
      </div>
      <canvas ref={canvasRef} className="block w-full h-[360px]" />
    </div>
  );
}
