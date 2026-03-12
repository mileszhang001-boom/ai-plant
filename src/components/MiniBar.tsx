import { hpColor } from '../utils/hpUtils';

interface MiniBarProps {
  value: number;
  total?: number;
  h?: number;
}

export default function MiniBar({ value, total = 10, h = 8 }: MiniBarProps) {
  const c = hpColor(value);
  const filled = Math.round((value / 100) * total);

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: h,
            borderRadius: 1,
            background: i < filled ? c : 'rgba(0,0,0,0.04)',
          }}
        />
      ))}
    </div>
  );
}
