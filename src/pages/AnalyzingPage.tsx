import { useEffect, useState, useRef } from 'react';
import { T, E, FONTS } from '../theme';
import { useApp } from '../App';
import type { PlantAction } from '../types';
import { analyzePlant } from '../services/aiService';
import { smoothHp, validateMetrics } from '../utils/smoothing';
import { matchPlant, routeAfterScan } from '../utils/matchUtils';
import { saveScanRecord } from '../services/storageService';
import { savePhoto } from '../services/photoService';
import PixelBar from '../components/PixelBar';

const STEPS = [
  { text: '正在识别植物...', icon: E.seedling },
  { text: '分析健康状态...', icon: E.heart },
  { text: '评估各项指标...', icon: E.tube },
  { text: '生成养护建议...', icon: E.sparkle },
];

export default function AnalyzingPage() {
  const { state, dispatch, navigate } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(5);
  const calledRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
      setProgress((p) => Math.min(90, p + 20));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const pending = state.pendingScan;
    if (!pending?.photoBase64) {
      navigate('list');
      return;
    }

    // Determine if updating existing plant
    const targetPlant = pending.targetPlantId
      ? state.plants.find((p) => p.id === pending.targetPlantId)
      : undefined;

    async function run() {
      try {
        const aiResult = await analyzePlant(
          pending!.photoBase64,
          targetPlant || undefined
        );

        // Apply smoothing if updating
        if (targetPlant) {
          aiResult.hp = smoothHp(
            aiResult.hp,
            targetPlant.current_hp,
            aiResult.species_confidence
          );
        }

        // Validate metrics
        const validatedMetrics = validateMetrics(aiResult.metrics);
        aiResult.hp = Math.max(0, Math.min(100, Math.round(aiResult.hp)));

        // Match against existing plants
        const matches = matchPlant(aiResult.species, state.plants);

        // Update pending scan with results
        dispatch({
          type: 'SET_PENDING_SCAN',
          scan: {
            ...pending!,
            aiResult,
            matchResults: matches,
          },
        });

        setProgress(100);

        // Route to next page
        setTimeout(() => {
          if (targetPlant) {
            // Direct update for existing plant
            const scanRecord = {
              id: crypto.randomUUID(),
              plant_id: targetPlant.id,
              hp: aiResult.hp,
              metrics: validatedMetrics,
              scanned_at: Date.now(),
              ai_raw_response: aiResult,
            };
            // Build updated action from AI result
            const act = aiResult.primary_action;
            const actionIcon =
              act.type === 'water' ? E.drop :
              act.type === 'light' ? E.sun :
              act.type === 'nutrition' ? E.tube :
              act.type === 'pest' ? E.bug : E.sparkle;
            const plantAction: PlantAction = {
              type: act.type as PlantAction['type'],
              label: act.label,
              icon: actionIcon,
            };
            // Save scan record and photo
            saveScanRecord(scanRecord);
            if (pending?.photoBase64) {
              savePhoto(scanRecord.id, pending.photoBase64).catch(() => {});
            }
            dispatch({ type: 'UPDATE_PLANT_HP', id: targetPlant.id, scan: scanRecord, action: plantAction });
            dispatch({ type: 'SET_PENDING_SCAN', scan: null });
          } else {
            const route = routeAfterScan(matches, state.plants.length);
            navigate(route);
          }
        }, 600);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'AI 分析失败，请重试');
      }
    }

    run();
  }, []);

  const handleRetry = () => {
    calledRef.current = false;
    setError(null);
    setStepIndex(0);
    setProgress(5);
    // Re-trigger by remounting
    navigate('camera');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: T.bg,
      }}
    >
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{E.warn}</div>
          <div style={{ fontSize: 14, color: T.text1, fontWeight: 600, marginBottom: 8 }}>
            分析失败
          </div>
          <div style={{ fontSize: 12, color: T.text3, marginBottom: 24, lineHeight: 1.6 }}>
            {error}
          </div>
          <button
            onClick={handleRetry}
            style={{
              padding: '12px 28px',
              background: T.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            重新拍照
          </button>
        </div>
      ) : (
        <>
          {/* Animated plant icon */}
          <div
            style={{
              fontSize: 48,
              marginBottom: 24,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            {E.seedling}
          </div>

          {/* Step text */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: T.text1,
              marginBottom: 8,
              fontFamily: FONTS.pixel,
              transition: 'all 0.3s',
            }}
          >
            {STEPS[stepIndex].icon + ' ' + STEPS[stepIndex].text}
          </div>

          {/* Progress bar */}
          <div style={{ width: '80%', marginBottom: 16 }}>
            <PixelBar value={progress} total={15} h={10} gap={2} />
          </div>

          <div
            style={{
              fontSize: 10,
              color: T.text3,
              fontFamily: FONTS.pixel,
              letterSpacing: 1,
            }}
          >
            PLANT.OS AI ANALYZING...
          </div>

          {/* CSS animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
