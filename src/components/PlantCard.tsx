import { useRef, useState, useEffect } from 'react';
import { T, E, FONTS } from '../theme';
import { hpColor, hpFace, formatTimeSince, isStale } from '../utils/hpUtils';
import type { Plant } from '../types';
import PixelPlant from './PixelPlant';
import PixelBar from './PixelBar';

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
  onDelete?: () => void;
}

const DELETE_WIDTH = 76;
const SWIPE_THRESHOLD = 36;

export default function PlantCard({ plant, onClick, onDelete }: PlantCardProps) {
  const c = hpColor(plant.current_hp);
  const stale = isStale(plant.last_scanned_at);

  const [offsetX, setOffsetX] = useState(0);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);
  const locked = useRef(false);
  const moving = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = false;
    locked.current = false;
    moving.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        locked.current = true;
        swiping.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!swiping.current) return;
    moving.current = true;

    const base = open ? -DELETE_WIDTH : 0;
    const raw = base + dx;
    // Rubber band effect past the bounds
    const next = raw > 0
      ? raw * 0.3
      : raw < -DELETE_WIDTH
        ? -DELETE_WIDTH + (raw + DELETE_WIDTH) * 0.3
        : raw;
    setOffsetX(next);
  };

  const handleTouchEnd = () => {
    if (!moving.current) return;
    if (offsetX < -SWIPE_THRESHOLD) {
      setOffsetX(-DELETE_WIDTH);
      setOpen(true);
    } else {
      setOffsetX(0);
      setOpen(false);
    }
  };

  const handleClick = () => {
    if (open) {
      setOffsetX(0);
      setOpen(false);
      return;
    }
    if (!moving.current) onClick();
  };

  const handleDeleteTap = () => {
    setConfirming(true);
  };

  const handleConfirmDelete = () => {
    setConfirming(false);
    setRemoving(true);
    setTimeout(() => {
      onDelete?.();
    }, 300);
  };

  const handleCancelDelete = () => {
    setConfirming(false);
    setOffsetX(0);
    setOpen(false);
  };

  // Close swipe when clicking elsewhere
  useEffect(() => {
    if (!open) return;
    const close = () => { setOffsetX(0); setOpen(false); };
    const timer = setTimeout(() => document.addEventListener('touchstart', close, { once: true }), 100);
    return () => { clearTimeout(timer); document.removeEventListener('touchstart', close); };
  }, [open]);

  return (
    <>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          marginBottom: 8,
          height: removing ? 0 : 'auto',
          opacity: removing ? 0 : 1,
          marginTop: removing ? -8 : 0,
          transition: removing ? 'height 0.3s ease, opacity 0.2s ease, margin 0.3s ease' : undefined,
        }}
      >
        {/* Delete button behind */}
        <div
          onClick={handleDeleteTap}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: DELETE_WIDTH,
            background: 'linear-gradient(135deg, #EF5350, #E53935)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '0 16px 16px 0',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700 }}>删除</span>
        </div>

        {/* Card content */}
        <div
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            cursor: 'pointer',
            background: T.card,
            border: '1px solid ' + T.border,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transform: `translateX(${offsetX}px)`,
            transition: moving.current ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            borderRadius: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ width: 44, height: 44, flexShrink: 0, position: 'relative' }}>
            <PixelPlant hp={plant.current_hp} size={44} species={plant.species} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: FONTS.pixel }}>
                {plant.fun_name}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: FONTS.pixel }}>
                  {plant.current_hp}
                </span>
                <span style={{ fontSize: 9, color: T.text3, fontFamily: FONTS.pixel }}>HP</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: T.text3 }}>{plant.species}</span>
              <span style={{ fontSize: 12, color: c, fontFamily: FONTS.pixel, letterSpacing: 1 }}>
                {hpFace(plant.current_hp)}
              </span>
            </div>
            <PixelBar value={plant.current_hp} total={12} h={7} gap={2} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
              <span style={{ fontSize: 10, color: stale ? '#E65100' : T.text2, fontWeight: 600 }}>
                {E.clock + ' ' + formatTimeSince(plant.last_scanned_at)}
              </span>
              {stale && (
                <span style={{
                  fontSize: 8, color: '#E65100', fontWeight: 700,
                  background: 'rgba(230,81,0,0.08)', padding: '2px 6px', borderRadius: 4,
                }}>
                  该复查
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom confirm modal */}
      {confirming && (
        <div
          onClick={handleCancelDelete}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: '24px 20px 16px',
              width: '100%', maxWidth: 280,
              boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
              animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{E.wilted}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 6 }}>
              确定放弃「{plant.fun_name}」？
            </div>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 20, lineHeight: 1.5 }}>
              删除后无法恢复，相关记录也会一并清除
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  flex: 1, padding: '12px 0', background: T.bg, color: T.text2,
                  border: '1px solid ' + T.border, borderRadius: 12,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                再想想
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1, padding: '12px 0', background: '#E53935', color: '#fff',
                  border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                确认删除
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}
    </>
  );
}
