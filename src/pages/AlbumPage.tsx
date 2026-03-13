import { useState, useEffect } from 'react';
import { T, E, FONTS } from '../theme';
import { hpColor, hpFace } from '../utils/hpUtils';
import { useApp } from '../App';
import { getPhotoUrl } from '../services/supabaseStorageService';
import PixelPlant from '../components/PixelPlant';
import MiniBar from '../components/MiniBar';

export default function AlbumPage() {
  const { state, navigate } = useApp();
  const plant = state.plants.find((p) => p.id === state.selectedPlantId);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  // Load photos from IndexedDB
  const records = (plant ? state.scanRecords
    .filter((r) => r.plant_id === plant.id)
    .sort((a, b) => b.scanned_at - a.scanned_at) : []);

  useEffect(() => {
    if (!records.length) return;
    let cancelled = false;
    async function loadPhotos() {
      const loaded: Record<string, string> = {};
      for (const r of records) {
        try {
          const url = await getPhotoUrl(r.id);
          if (url) loaded[r.id] = url;
        } catch { /* ignore */ }
      }
      if (!cancelled) setPhotos(loaded);
    }
    loadPhotos();
    return () => { cancelled = true; };
  }, [records.length]);

  if (!plant) return null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
      <div
        onClick={() => navigate('detail')}
        style={{
          fontSize: 13,
          color: T.accent,
          cursor: 'pointer',
          marginBottom: 4,
          fontWeight: 600,
          padding: '8px 4px',
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
                {/* Photo or pixel plant fallback */}
                <div
                  style={{
                    width: '100%',
                    height: 240,
                    borderRadius: 10,
                    background: T.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    border: '1px solid ' + T.border,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {photos[entry.id] ? (
                    <>
                      <img
                        src={photos[entry.id]}
                        alt="植物照片"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                      }}>
                        <PixelPlant hp={entry.hp} size={36} species={plant.species} />
                      </div>
                    </>
                  ) : (
                    <PixelPlant hp={entry.hp} size={60} species={plant.species} />
                  )}
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
