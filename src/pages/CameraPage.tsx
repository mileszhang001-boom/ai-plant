import { useRef, useState, useEffect } from 'react';
import { T, E, FONTS } from '../theme';
import { useApp } from '../App';

export default function CameraPage() {
  const { state, navigate, dispatch } = useApp();
  const existingTargetId = state.pendingScan?.targetPlantId || null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        });
        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        if (mounted) {
          setError('无法访问摄像头，请检查权限设置');
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    // Compress to JPEG
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCapturing(false);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Stop camera
          stream?.getTracks().forEach((t) => t.stop());
          // Set pending scan and navigate to analyzing
          dispatch({
            type: 'SET_PENDING_SCAN',
            scan: {
              photoBase64: base64,
              aiResult: null,
              matchResults: [],
              targetPlantId: existingTargetId,
            },
          });
          navigate('analyzing');
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.8
    );
  };

  // Also support file input as fallback (desktop)
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      stream?.getTracks().forEach((t) => t.stop());
      dispatch({
        type: 'SET_PENDING_SCAN',
        scan: {
          photoBase64: base64,
          aiResult: null,
          matchResults: [],
          targetPlantId: null,
        },
      });
      navigate('analyzing');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Back button */}
      <div
        onClick={() => {
          stream?.getTracks().forEach((t) => t.stop());
          navigate('list');
        }}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.4)',
          padding: '6px 14px',
          borderRadius: 8,
        }}
      >
        ← 返回
      </div>

      {/* Camera view */}
      {error ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 16 }}>{E.camera}</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>{error}</div>
          <label
            style={{
              padding: '12px 24px',
              background: T.accent,
              color: '#fff',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {E.camera + ' 选择照片'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Bottom controls */}
      <div
        style={{
          padding: '20px 0 32px',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: FONTS.pixel,
            letterSpacing: 1,
          }}
        >
          对准植物拍照
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={capturing || !!error}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '3px solid #fff',
              background: capturing ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              cursor: capturing ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              transition: 'all 0.2s',
            }}
          >
            {capturing ? '...' : E.camera}
          </button>
          {/* File input fallback */}
          <label
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            {E.book}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
