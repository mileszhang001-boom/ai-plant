import { useState } from 'react';
import { T, E, FONTS } from '../theme';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { insertFeedback } from '../services/supabaseStorageService';
import PlantCard from '../components/PlantCard';
import Scanlines from '../components/Scanlines';

export default function PlantListPage() {
  const { state, dispatch, navigate } = useApp();
  const { signOut } = useAuth();
  const plants = state.plants;
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbContent, setFbContent] = useState('');
  const [fbContact, setFbContact] = useState('');
  const [fbSending, setFbSending] = useState(false);
  const [fbDone, setFbDone] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!fbContent.trim()) return;
    setFbSending(true);
    try {
      await insertFeedback(fbContent.trim(), fbContact.trim());
      setFbDone(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFbContent('');
        setFbContact('');
        setFbDone(false);
      }, 1500);
    } catch {
      alert('提交失败，请稍后重试');
    } finally {
      setFbSending(false);
    }
  };

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
          <div style={{ display: 'flex', gap: 6 }}>
            <div
              onClick={() => setShowFeedback(true)}
              style={{
                color: T.text3,
                fontSize: 9,
                letterSpacing: 1,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid ' + T.border,
              }}
            >
              {E.sparkle} 反馈
            </div>
            <div
              onClick={signOut}
              style={{
                color: T.text3,
                fontSize: 9,
                letterSpacing: 1,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid ' + T.border,
              }}
            >
              退出登录
            </div>
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

      {/* Feedback Modal */}
      {showFeedback && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFeedback(false); }}
        >
          <div
            style={{
              background: T.card,
              borderRadius: 18,
              padding: 20,
              width: '100%',
              maxWidth: 340,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            {fbDone ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{E.heart}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text1 }}>
                  感谢你的反馈！
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text1, marginBottom: 4 }}>
                  {E.sparkle} 问题反馈
                </div>
                <div style={{ fontSize: 11, color: T.text3, marginBottom: 14 }}>
                  告诉我们你的想法或遇到的问题
                </div>
                <textarea
                  value={fbContent}
                  onChange={(e) => setFbContent(e.target.value)}
                  placeholder="请描述你的问题或建议..."
                  maxLength={500}
                  style={{
                    width: '100%',
                    height: 100,
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid ' + T.border,
                    background: T.bg,
                    fontSize: 13,
                    color: T.text1,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: FONTS.body,
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  value={fbContact}
                  onChange={(e) => setFbContact(e.target.value)}
                  placeholder="联系方式（选填，方便我们回复你）"
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid ' + T.border,
                    background: T.bg,
                    fontSize: 12,
                    color: T.text1,
                    outline: 'none',
                    fontFamily: FONTS.body,
                    marginTop: 8,
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button
                    onClick={() => setShowFeedback(false)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      background: T.bg,
                      color: T.text2,
                      border: '1px solid ' + T.border,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={fbSending || !fbContent.trim()}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      background: !fbContent.trim() ? T.barBg : T.accent,
                      color: !fbContent.trim() ? T.text3 : '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: fbContent.trim() ? 'pointer' : 'default',
                    }}
                  >
                    {fbSending ? '提交中...' : '提交'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
