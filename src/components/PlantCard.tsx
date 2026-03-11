import { T, E, FONTS } from '../theme';
import { hpColor, hpFace, formatTimeSince, isStale } from '../utils/hpUtils';
import type { Plant } from '../types';
import PixelPlant from './PixelPlant';
import PixelBar from './PixelBar';

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
}

export default function PlantCard({ plant, onClick }: PlantCardProps) {
  const c = hpColor(plant.current_hp);
  const stale = isStale(plant.last_scanned_at);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        marginBottom: 8,
        cursor: 'pointer',
        background: T.card,
        border: '1px solid ' + T.border,
        transition: 'transform 0.1s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
      onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Mini pixel plant */}
      <div style={{ width: 44, height: 44, flexShrink: 0, position: 'relative' }}>
        <PixelPlant hp={plant.current_hp} size={44} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.text1,
              fontFamily: FONTS.pixel,
            }}
          >
            {plant.fun_name}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: c,
                fontFamily: FONTS.pixel,
              }}
            >
              {plant.current_hp}
            </span>
            <span
              style={{
                fontSize: 9,
                color: T.text3,
                fontFamily: FONTS.pixel,
              }}
            >
              HP
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
          }}
        >
          <span style={{ fontSize: 10, color: T.text3 }}>{plant.species}</span>
          <span
            style={{
              fontSize: 12,
              color: c,
              fontFamily: FONTS.pixel,
              letterSpacing: 1,
            }}
          >
            {hpFace(plant.current_hp)}
          </span>
        </div>
        <PixelBar value={plant.current_hp} total={15} h={6} gap={1} />
        {/* Last scan time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <span
            style={{
              fontSize: 9,
              color: stale ? '#E65100' : T.text3,
              fontFamily: FONTS.pixel,
              fontWeight: 600,
            }}
          >
            {E.clock + ' ' + formatTimeSince(plant.last_scanned_at)}
          </span>
          {stale && (
            <span
              style={{
                fontSize: 8,
                color: '#E65100',
                fontWeight: 700,
                background: 'rgba(230,81,0,0.08)',
                padding: '1px 5px',
                borderRadius: 4,
              }}
            >
              该复查
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
