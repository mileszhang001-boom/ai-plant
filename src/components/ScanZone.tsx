import { T, E, FONTS } from '../theme';
import { formatTimeSince, isStale } from '../utils/hpUtils';

interface ScanZoneProps {
  lastScannedAt: number;
  onScan: () => void;
}

export default function ScanZone({ lastScannedAt, onScan }: ScanZoneProps) {
  const stale = isStale(lastScannedAt);

  return (
    <div
      style={{
        flexShrink: 0,
        padding: '10px 16px 16px',
        borderTop: '1px solid ' + T.border,
        background: T.bg,
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
          <span style={{ fontSize: 13 }}>{E.clock}</span>
          <div>
            <div
              style={{
                fontSize: 9,
                color: T.text3,
                letterSpacing: 1,
                fontFamily: FONTS.pixel,
                fontWeight: 600,
              }}
            >
              上次检测
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: FONTS.pixel,
                color: stale ? '#E65100' : T.text2,
              }}
            >
              {formatTimeSince(lastScannedAt)}
            </div>
          </div>
        </div>
        {stale && (
          <div
            style={{
              fontSize: 10,
              color: '#E65100',
              background: 'rgba(230,81,0,0.08)',
              padding: '3px 10px',
              borderRadius: 8,
              fontWeight: 700,
              border: '1px solid rgba(230,81,0,0.15)',
            }}
          >
            该复查了
          </div>
        )}
      </div>
      <button
        onClick={onScan}
        style={{
          width: '100%',
          padding: '12px 0',
          background: stale ? '#E65100' : 'transparent',
          color: stale ? '#fff' : T.text2,
          border: stale ? 'none' : '1.5px solid ' + T.border,
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'inherit',
          boxShadow: stale ? '0 2px 8px rgba(230,81,0,0.15)' : 'none',
        }}
      >
        <span style={{ fontSize: 15 }}>{E.camera}</span>
        {stale ? '立即拍照检测' : '再次拍照检测'}
      </button>
    </div>
  );
}
