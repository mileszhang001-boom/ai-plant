import { useState } from 'react';
import { T, E, FONTS } from '../theme';
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
    setActionDone(true);
    dispatch({ type: 'COMPLETE_ACTION', id: plant.id });
    setTimeout(() => setActionDone(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
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
              padding: '4px 10px',
              borderRadius: 8,
              border: '1px solid ' + T.border,
              fontSize: 11,
              color: T.text2,
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 12 }}>{E.book}</span>
            成长相册
          </div>
        </div>

        {/* Hero Card */}
        <div
          style={{
            background: T.card,
            border: '1px solid ' + T.border,
            borderRadius: 18,
            padding: '16px 16px 14px',
            marginBottom: 12,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: T.text1,
                fontFamily: FONTS.pixel,
              }}
            >
              {plant.fun_name}
            </div>
            <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>
              {plant.species + ' ' + E.tri + ' ' + plant.personality}
            </div>
          </div>
          <div style={{ padding: '8px 0 4px' }}>
            <PixelPlant hp={dHp} size={90} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div
              style={{
                fontSize: 28,
                color: hpColor(dHp),
                fontFamily: FONTS.pixel,
                fontWeight: 700,
                letterSpacing: 4,
                lineHeight: 1,
                marginBottom: 3,
                transition: 'color 0.4s',
              }}
            >
              {hpFace(dHp)}
            </div>
            <div style={{ fontSize: 11, color: T.text2, letterSpacing: 0.5 }}>
              {hpMood(dHp)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                fontSize: 14,
                fontWeight: 800,
                color: hpColor(dHp),
                fontFamily: FONTS.pixel,
                minWidth: 40,
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
          style={{
            width: '100%',
            padding: '14px 0',
            background: actionDone ? '#43A047' : T.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
            fontFamily: 'inherit',
            transition: 'all 0.3s',
            marginBottom: 16,
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
