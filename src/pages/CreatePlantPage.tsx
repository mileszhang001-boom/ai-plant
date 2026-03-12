import { useState, useEffect } from 'react';
import { T, E, FONTS } from '../theme';
import { useApp } from '../App';
import { validateMetrics } from '../utils/smoothing';
import { insertMatchLog } from '../services/supabaseStorageService';
import { uploadPhoto } from '../services/supabaseStorageService';
import { compressBase64Photo } from '../services/photoService';
import PixelPlant from '../components/PixelPlant';
import PixelBar from '../components/PixelBar';

export default function CreatePlantPage() {
  const { state, dispatch, navigate } = useApp();
  const pending = state.pendingScan;

  const aiResult = pending?.aiResult;
  const [funName, setFunName] = useState(aiResult?.fun_name || '我的新植物');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!aiResult) navigate('list');
  }, [aiResult]);

  if (!aiResult) return null;

  const validatedMetrics = validateMetrics(aiResult.metrics);

  const handleConfirm = async () => {
    const plantId = crypto.randomUUID();
    const scanId = crypto.randomUUID();
    const now = Date.now();

    // Determine action
    const action = aiResult.primary_action;
    const actionIcon =
      action.type === 'water' ? E.drop :
      action.type === 'light' ? E.sun :
      action.type === 'nutrition' ? E.tube :
      action.type === 'pest' ? E.bug : E.sparkle;

    // Create plant
    const plant = {
      id: plantId,
      species: aiResult.species,
      fun_name: funName,
      personality: aiResult.personality || '一棵可爱的植物',
      current_hp: aiResult.hp,
      current_metrics: validatedMetrics,
      current_action: {
        type: action.type as 'water' | 'light' | 'nutrition' | 'pest' | 'none',
        label: action.label,
        icon: actionIcon,
      },
      created_at: now,
      last_scanned_at: now,
    };

    // Create scan record
    const scanRecord = {
      id: scanId,
      plant_id: plantId,
      hp: aiResult.hp,
      metrics: validatedMetrics,
      scanned_at: now,
      ai_raw_response: aiResult,
    };

    // Compress & upload photo to Supabase Storage
    if (pending?.photoBase64) {
      compressBase64Photo(pending.photoBase64).then(
        (compressed) => uploadPhoto(scanId, compressed)
      ).catch(() => {});
    }

    // Save match log
    insertMatchLog({
      id: crypto.randomUUID(),
      scan_id: scanId,
      ai_suggestion: null,
      ai_confidence: aiResult.species_confidence,
      user_confirmed: null,
      is_new_plant: true,
    });

    // Add plant to state (this also navigates to detail)
    dispatch({ type: 'ADD_SCAN_RECORD', record: scanRecord });
    dispatch({ type: 'ADD_PLANT', plant });
    dispatch({ type: 'SET_PENDING_SCAN', scan: null });
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px 24px',
      }}
    >
      {/* Top bar */}
      <div
        onClick={() => navigate('list')}
        style={{
          fontSize: 13,
          color: T.accent,
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        ← 返回列表
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text1, marginBottom: 4 }}>
          领养新植物
        </div>
        <div style={{ fontSize: 12, color: T.text3 }}>
          给你的新植物起个名字吧
        </div>
      </div>

      {/* Plant preview card */}
      <div
        style={{
          background: T.card,
          border: '1px solid ' + T.border,
          borderRadius: 18,
          padding: '20px 16px',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        <PixelPlant hp={aiResult.hp} size={90} species={aiResult.species} />

        {/* Editable name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          {editing ? (
            <input
              value={funName}
              onChange={(e) => setFunName(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              autoFocus
              maxLength={10}
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: FONTS.pixel,
                color: T.text1,
                textAlign: 'center',
                border: 'none',
                borderBottom: '2px solid ' + T.accent,
                background: 'transparent',
                outline: 'none',
                width: '60%',
                padding: '2px 4px',
              }}
            />
          ) : (
            <>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: FONTS.pixel,
                  color: T.text1,
                }}
              >
                {funName}
              </span>
              <span
                onClick={() => setEditing(true)}
                style={{
                  fontSize: 14,
                  cursor: 'pointer',
                  color: T.text3,
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
              >
                ✏️
              </span>
            </>
          )}
        </div>

        <div style={{ fontSize: 11, color: T.text3, marginBottom: 12 }}>
          {aiResult.species} · {aiResult.personality || ''}
        </div>

        {/* HP bar */}
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
            <PixelBar value={aiResult.hp} />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: T.accent,
              fontFamily: FONTS.pixel,
            }}
          >
            {aiResult.hp}%
          </span>
        </div>
      </div>

      {/* Diagnosis summary */}
      {aiResult.diagnosis_summary && (
        <div
          style={{
            background: T.accentLight,
            border: '1px solid ' + T.accentBorder,
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: 12,
            color: T.text2,
            lineHeight: 1.6,
          }}
        >
          {E.sparkle + ' ' + aiResult.diagnosis_summary}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        style={{
          width: '100%',
          padding: '16px 0',
          background: T.accent,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
        }}
      >
        {E.heart + ' 确认领养'}
      </button>
    </div>
  );
}
