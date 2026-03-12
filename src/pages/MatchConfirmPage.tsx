import { useEffect } from 'react';
import { T, E, FONTS } from '../theme';
import { useApp } from '../App';
import { validateMetrics } from '../utils/smoothing';
import { insertMatchLog, uploadPhoto } from '../services/supabaseStorageService';
import { compressBase64Photo } from '../services/photoService';
import PixelPlant from '../components/PixelPlant';

export default function MatchConfirmPage() {
  const { state, dispatch, navigate } = useApp();
  const pending = state.pendingScan;

  useEffect(() => {
    if (!pending?.aiResult) navigate('list');
  }, [pending?.aiResult]);

  if (!pending?.aiResult) return null;

  const aiResult = pending.aiResult;
  const matches = pending.matchResults;

  const handleSelectPlant = async (plantId: string) => {
    const validatedMetrics = validateMetrics(aiResult.metrics);

    const scanRecord = {
      id: crypto.randomUUID(),
      plant_id: plantId,
      hp: aiResult.hp,
      metrics: validatedMetrics,
      scanned_at: Date.now(),
      ai_raw_response: aiResult,
    };

    // Compress & upload photo to Supabase Storage
    if (pending?.photoBase64) {
      compressBase64Photo(pending.photoBase64).then(
        (compressed) => uploadPhoto(scanRecord.id, compressed)
      ).catch(() => {});
    }

    // Save match log
    insertMatchLog({
      id: crypto.randomUUID(),
      scan_id: scanRecord.id,
      ai_suggestion: matches[0]?.plantId || null,
      ai_confidence: matches[0]?.confidence || 0,
      user_confirmed: plantId,
      is_new_plant: false,
    });

    // Build action from AI result
    const act = aiResult.primary_action;
    const actionIcon =
      act.type === 'water' ? E.drop :
      act.type === 'light' ? E.sun :
      act.type === 'nutrition' ? E.tube :
      act.type === 'pest' ? E.bug : E.sparkle;

    dispatch({
      type: 'UPDATE_PLANT_HP',
      id: plantId,
      scan: scanRecord,
      action: { type: act.type as 'water' | 'light' | 'nutrition' | 'pest' | 'none', label: act.label, icon: actionIcon },
    });
    dispatch({ type: 'SET_PENDING_SCAN', scan: null });
  };

  const handleNewPlant = () => {
    // Save match log
    insertMatchLog({
      id: crypto.randomUUID(),
      scan_id: crypto.randomUUID(),
      ai_suggestion: matches[0]?.plantId || null,
      ai_confidence: matches[0]?.confidence || 0,
      user_confirmed: null,
      is_new_plant: true,
    });

    navigate('create');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
      {/* Top bar */}
      <div
        onClick={() => navigate('list')}
        style={{
          fontSize: 13,
          color: T.accent,
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        ← 返回列表
      </div>

      <div style={{ fontSize: 18, fontWeight: 800, color: T.text1, marginBottom: 4 }}>
        这是哪棵植物？
      </div>
      <div style={{ fontSize: 12, color: T.text3, marginBottom: 16 }}>
        AI 识别为 <strong style={{ color: T.accent }}>{aiResult.species}</strong>，
        请确认是哪一棵
      </div>

      {/* AI recommended plant (first match) */}
      {matches.map((match, i) => {
        const plant = state.plants.find((p) => p.id === match.plantId);
        if (!plant) return null;
        const isFirst = i === 0;

        return (
          <div
            key={match.plantId}
            onClick={() => handleSelectPlant(match.plantId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 14,
              marginBottom: 8,
              cursor: 'pointer',
              background: isFirst ? T.accentLight : T.card,
              border: '1.5px solid ' + (isFirst ? T.accent : T.border),
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ width: 44, height: 44, flexShrink: 0 }}>
              <PixelPlant hp={plant.current_hp} size={44} species={plant.species} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: FONTS.pixel,
                    color: T.text1,
                  }}
                >
                  {plant.fun_name}
                </span>
                {isFirst && (
                  <span
                    style={{
                      fontSize: 9,
                      color: T.accent,
                      background: 'rgba(46,125,50,0.1)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    AI 推荐
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: T.text3 }}>
                {plant.species} · HP {plant.current_hp}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isFirst ? T.accent : T.text3,
                fontFamily: FONTS.pixel,
              }}
            >
              {Math.round(match.confidence * 100)}%
            </div>
          </div>
        );
      })}

      {/* Other plants (not matched) */}
      {state.plants
        .filter((p) => !matches.some((m) => m.plantId === p.id))
        .map((plant) => (
          <div
            key={plant.id}
            onClick={() => handleSelectPlant(plant.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 14,
              marginBottom: 8,
              cursor: 'pointer',
              background: T.card,
              border: '1px solid ' + T.border,
              opacity: 0.7,
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ width: 40, height: 40, flexShrink: 0 }}>
              <PixelPlant hp={plant.current_hp} size={40} species={plant.species} />
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: FONTS.pixel,
                  color: T.text2,
                }}
              >
                {plant.fun_name}
              </span>
              <div style={{ fontSize: 10, color: T.text3 }}>{plant.species}</div>
            </div>
          </div>
        ))}

      {/* New plant button */}
      <div
        onClick={handleNewPlant}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 14,
          borderRadius: 14,
          marginTop: 8,
          border: '1.5px dashed ' + T.accent,
          color: T.accent,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform 0.1s',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {E.seedling + ' 这是新植物'}
      </div>
    </div>
  );
}
