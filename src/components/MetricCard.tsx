import { T, E, FONTS } from '../theme';
import { hpColor } from '../utils/hpUtils';
import MiniBar from './MiniBar';

interface MetricCardProps {
  icon: string;
  label: string;
  value: number;
  metricKey: string;
}

export default function MetricCard({ icon, label, value, metricKey }: MetricCardProps) {
  const mc = hpColor(value);
  const isPestWarn = metricKey === 'pest' && value < 60;

  return (
    <div
      style={{
        background: T.card,
        border: '1px solid ' + (isPestWarn ? 'rgba(230,81,0,0.25)' : T.border),
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: FONTS.pixel,
              color: isPestWarn ? '#E65100' : T.text1,
            }}
          >
            {label}
            {isPestWarn ? ' ' + E.warn : ''}
          </span>
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: mc,
            fontFamily: FONTS.pixel,
          }}
        >
          {value}
        </span>
      </div>
      <MiniBar value={value} />
    </div>
  );
}
