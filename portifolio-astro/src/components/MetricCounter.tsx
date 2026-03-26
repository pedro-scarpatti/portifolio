import { useState, useEffect, useRef } from 'react';

interface MetricCounterProps {
  targetValue: number;
  suffix: string;
  label: string;
  isMono?: boolean;
  delay?: number;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toString();
}

export default function MetricCounter({
  targetValue,
  suffix,
  label,
  isMono = false,
  delay = 0,
}: MetricCounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setTimeout(() => setStarted(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started, delay]);

  useEffect(() => {
    if (!started) return;

    const duration = 1800;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), targetValue);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [started, targetValue]);

  const lines = label.split('\n');

  return (
    <div
      ref={ref}
      className="card p-6 text-center"
      style={{ opacity: started ? 1 : 0, transform: started ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
    >
      <div
        className="text-4xl font-black mb-2"
        style={{
          fontFamily: isMono ? 'var(--font-mono)' : 'var(--font-display)',
          background: 'linear-gradient(135deg, #00d4aa, #4488ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {formatNumber(count)}
        {suffix && <span style={{ WebkitTextFillColor: '#8888aa', fontSize: '0.6em' }}>{suffix}</span>}
      </div>
      <div
        className="text-xs uppercase tracking-wider leading-tight"
        style={{ color: 'var(--color-text-muted)', fontFamily: isMono ? 'var(--font-mono)' : 'var(--font-body)' }}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}
