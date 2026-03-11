import { T, E } from '../theme';
import { useApp } from '../App';
import PlantCard from '../components/PlantCard';
import Scanlines from '../components/Scanlines';

export default function PlantListPage() {
  const { state, dispatch, navigate } = useApp();
  const plants = state.plants;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Scanlines />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
            marginTop: 4,
          }}
        >
          <div
            style={{
              color: T.accent,
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            {E.tri + ' PLANT.OS v1.0'}
          </div>
          <div
            style={{
              color: '#C62828',
              fontSize: 9,
              letterSpacing: 1,
              fontWeight: 600,
            }}
          >
            {E.circle + ' LIVE'}
          </div>
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: T.text1,
            marginBottom: 12,
          }}
        >
          {'我的植物团 (' + plants.length + ')'}
        </div>

        {/* Empty state */}
        {plants.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: T.text2,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>{E.seedling}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text1, marginBottom: 8 }}>
              还没有植物呢！
            </div>
            <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.6, marginBottom: 24 }}>
              拍一张照片，
              <br />
              领养你的第一棵植物吧
            </div>
            <button
              onClick={() => navigate('camera')}
              style={{
                padding: '12px 28px',
                background: T.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
              }}
            >
              <span style={{ fontSize: 16 }}>{E.camera}</span>
              拍照领养
            </button>
          </div>
        ) : (
          <>
            {/* Plant cards */}
            {plants.map((p) => (
              <PlantCard
                key={p.id}
                plant={p}
                onClick={() => dispatch({ type: 'SELECT_PLANT', id: p.id })}
              />
            ))}

            {/* Add new plant card */}
            <div
              onClick={() => navigate('camera')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                borderRadius: 14,
                border: '1.5px dashed ' + T.border,
                color: T.text3,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + 拍照添加新植物
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      {plants.length > 0 && (
        <div
          onClick={() => navigate('camera')}
          style={{
            position: 'absolute',
            bottom: 28,
            right: 20,
            zIndex: 15,
            width: 54,
            height: 54,
            borderRadius: 14,
            background: T.accent,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
          }}
        >
          {E.camera}
        </div>
      )}
    </div>
  );
}
