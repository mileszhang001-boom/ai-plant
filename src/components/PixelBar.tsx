import { T } from '../theme';
import { hpColor } from '../utils/hpUtils';

interface PixelBarProps {
  value: number;
  total?: number;
  h?: number;
  gap?: number;
  animate?: boolean;
}

export default function PixelBar({
  value,
  total = 20,
  h = 14,
  gap = 1.5,
  animate = true,
}: PixelBarProps) {
  const c = hpColor(value);
  const filled = Math.round((value / 100) * total);

  return (
    <div
      style={{
        display: 'flex',
        gap,
        height: h,
        background: T.barBg,
        borderRadius: 3,
        border: '1px solid ' + T.barBorder,
        padding: 2,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: 1,
            background: i < filled ? c : 'rgba(0,0,0,0.025)',
            transition: animate ? 'all 0.3s ease' : 'none',
            transitionDelay: animate ? i * 25 + 'ms' : '0ms',
          }}
        />
      ))}
    </div>
  );
}
