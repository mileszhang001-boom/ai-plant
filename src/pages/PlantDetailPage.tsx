import { useState } from 'react';
import { T, E, FONTS, heroGradient } from '../theme';
import { hpColor, hpFace, hpMood } from '../utils/hpUtils';
import { useApp } from '../App';
import PixelPlant from '../components/PixelPlant';
import PixelBar from '../components/PixelBar';
import MetricCard from '../components/MetricCard';
import ScanZone from '../components/ScanZone';

export default function PlantDetailPage() {
  const { state, dispatch, navigate } = useApp();
  const [actionDone, setActionDone] = useState(false);

  const plant = state.plants.find((p) => p.id === state.selectedPlantId);
  if (!plant) return null;

  const dHp = actionDone ? Math.min(100, plant.current_hp + 5) : plant.current_hp;

  const metrics = [
    { key: 'water', label: '水分', icon: E.drop, value: plant.current_metrics.water },
    { key: 'light', label: '光照', icon: E.sun, value: plant.current_metrics.light },
    { key: 'nutrition', label: '营养', icon: E.tube, value: plant.current_metrics.nutrition },
    { key: 'pest', label: '病虫害', icon: E.shield, value: plant.current_metrics.pest },
  ];

  const handleAction = () => {
    if (actionDone) return;
    setActionDone(true);
    dispatch({ type: 'COMPLETE_ACTION', id: plant.id });
    setTimeout(() => setActionDone(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0 8px',
          }}
        >
          <div
            onClick={() => navigate('list')}
            style={{ fontSize: 13, color: T.accent, cursor: 'pointer', fontWeight: 600 }}
          >
            ← 返回
          </div>
          <div
            onClick={() => navigate('album')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid ' + T.border,
              fontSize: 11,
              color: T.text2,
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <span style={{ fontSize: 12 }}>{E.book}</span>
            成长相册
          </div>
        </div>

        {/* Hero Card — redesigned with gradient background */}
        <div
          style={{
            background: heroGradient(dHp),
            border: '1px solid ' + T.border,
            borderRadius: 20,
            padding: '20px 20px 18px',
            marginBottom: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle inner border glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.6)',
            pointerEvents: 'none',
          }} />

          {/* Plant name & species */}
          <div style={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: T.text1,
                fontFamily: FONTS.pixel,
                letterSpacing: 1,
              }}
            >
              {plant.fun_name}
            </div>
            <div style={{ fontSize: 10, color: T.text2, marginTop: 3 }}>
              {plant.species + ' ' + E.tri + ' ' + plant.personality}
            </div>
          </div>

          {/* Pixel plant — enlarged */}
          <div style={{ padding: '12px 0 8px', position: 'relative' }}>
            <PixelPlant hp={dHp} size={120} species={plant.species} />
          </div>

          {/* ASCII expression — enlarged */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div
              style={{
                fontSize: 36,
                color: hpColor(dHp),
                fontFamily: FONTS.pixel,
                fontWeight: 700,
                letterSpacing: 5,
                lineHeight: 1,
                marginBottom: 5,
                transition: 'color 0.4s',
              }}
            >
              {hpFace(dHp)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: T.text2,
                letterSpacing: 0.5,
                fontWeight: 500,
              }}
            >
              {hpMood(dHp)}
            </div>
          </div>

          {/* HP Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.5)',
              borderRadius: 10,
              padding: '8px 12px',
            }}
          >
            <span
              style={{
                color: T.accent,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: FONTS.pixel,
                minWidth: 20,
              }}
            >
              HP
            </span>
            <div style={{ flex: 1 }}>
              <PixelBar value={dHp} />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: hpColor(dHp),
                fontFamily: FONTS.pixel,
                minWidth: 44,
                textAlign: 'right',
                transition: 'all 0.4s',
              }}
            >
              {dHp + '%'}
            </span>
          </div>
        </div>

        {/* Metrics 2x2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {metrics.map((m) => (
            <MetricCard
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={m.value}
              metricKey={m.key}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={handleAction}
          disabled={actionDone}
          style={{
            width: '100%',
            padding: '14px 0',
            background: actionDone ? '#43A047' : T.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: actionDone ? 'default' : 'pointer',
            opacity: actionDone ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
            fontFamily: 'inherit',
            transition: 'all 0.3s',
          }}
        >
          <span style={{ fontSize: 17 }}>
            {actionDone ? E.check : plant.current_action.icon}
          </span>
          {actionDone ? '已完成! HP+5' : plant.current_action.label}
        </button>
      </div>

      {/* Fixed bottom: scan zone */}
      <ScanZone
        lastScannedAt={plant.last_scanned_at}
        onScan={() => {
          dispatch({
            type: 'SET_PENDING_SCAN',
            scan: {
              photoBase64: '',
              aiResult: null,
              matchResults: [],
              targetPlantId: plant.id,
            },
          });
          navigate('camera');
        }}
      />
    </div>
  );
}
