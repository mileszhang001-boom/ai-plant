import { T, E, FONTS } from '../theme';
import { hpColor, hpFace } from '../utils/hpUtils';
import { useApp } from '../App';
import PixelPlant from '../components/PixelPlant';
import MiniBar from '../components/MiniBar';

export default function AlbumPage() {
  const { state, navigate } = useApp();
  const plant = state.plants.find((p) => p.id === state.selectedPlantId);
  if (!plant) return null;

  // Get scan records for this plant, sorted newest first
  const records = state.scanRecords
    .filter((r) => r.plant_id === plant.id)
    .sort((a, b) => b.scanned_at - a.scanned_at);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
      <div
        onClick={() => navigate('detail')}
        style={{
          fontSize: 13,
          color: T.accent,
          cursor: 'pointer',
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        {'← ' + plant.fun_name}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>成长相册</span>
        <span style={{ fontSize: 11, color: T.text3 }}>{records.length + ' 次记录'}</span>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: T.text3 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{E.book}</div>
          <div style={{ fontSize: 13 }}>还没有检测记录</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>拍照检测后会在这里记录成长轨迹</div>
        </div>
      ) : (
        records.map((entry, i) => {
          const ec = hpColor(entry.hp);
          const prevRecord = records[i + 1];
          const diff = prevRecord ? entry.hp - prevRecord.hp : null;
          const isFirst = i === records.length - 1;
          const dateStr = new Date(entry.scanned_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

          return (
            <div key={entry.id}>
              {i > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 12,
                    borderLeft: '1.5px dashed ' + T.barBorder,
                    marginLeft: 24,
                  }}
                />
              )}
              <div
                style={{
                  background: T.card,
                  border: '1px solid ' + T.border,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: T.text2,
                      fontFamily: FONTS.pixel,
                      fontWeight: 600,
                    }}
                  >
                    {dateStr}
                  </span>
                  {isFirst && (
                    <span
                      style={{
                        fontSize: 9,
                        color: T.accent,
                        background: T.accentLight,
                        padding: '2px 8px',
                        borderRadius: 8,
                        fontWeight: 700,
                        border: '1px solid ' + T.accentBorder,
                      }}
                    >
                      领养日
                    </span>
                  )}
                </div>
                {/* Photo placeholder with pixel plant */}
                <div
                  style={{
                    width: '100%',
                    height: 100,
                    borderRadius: 10,
                    background: T.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    border: '1px solid ' + T.border,
                  }}
                >
                  <PixelPlant hp={entry.hp} size={60} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: ec,
                        fontFamily: FONTS.pixel,
                      }}
                    >
                      {'HP ' + entry.hp}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: ec,
                        fontFamily: FONTS.pixel,
                      }}
                    >
                      {hpFace(entry.hp)}
                    </span>
                  </div>
                  <div style={{ width: 66 }}>
                    <MiniBar value={entry.hp} total={8} h={6} />
                  </div>
                </div>
                {diff !== null && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: FONTS.pixel,
                      color: diff >= 0 ? '#2E7D32' : '#C62828',
                    }}
                  >
                    {diff >= 0 ? E.arrowUp + ' +' + diff : E.arrowDown + ' ' + diff}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
