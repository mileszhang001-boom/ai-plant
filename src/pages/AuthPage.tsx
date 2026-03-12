import { useState } from 'react';
import { T, E, FONTS } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import PixelPlant from '../components/PixelPlant';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setError(null);
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (isSignUp) {
      setSignUpSuccess(true);
    }
  };

  if (signUpSuccess) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: T.bg,
        minHeight: '100vh',
      }}>
        <div style={{ marginBottom: 20 }}>
          <PixelPlant hp={90} size={80} species="绿萝" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text1, marginBottom: 8 }}>
          {E.sparkle} 注册成功！
        </div>
        <div style={{ fontSize: 13, color: T.text2, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          请查看邮箱完成验证，然后登录
        </div>
        <button
          onClick={() => { setIsSignUp(false); setSignUpSuccess(false); }}
          style={{
            padding: '12px 32px',
            background: T.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          去登录
        </button>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: T.bg,
      minHeight: '100vh',
    }}>
      {/* Logo area */}
      <div style={{ marginBottom: 8 }}>
        <PixelPlant hp={85} size={72} species="仙人掌" />
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 800,
        color: T.text1,
        fontFamily: FONTS.pixel,
        letterSpacing: 2,
        marginBottom: 4,
      }}>
        PLANT.OS
      </div>
      <div style={{ fontSize: 12, color: T.text3, marginBottom: 32 }}>
        植物健康管家
      </div>

      {/* Form card */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        background: T.card,
        border: '1px solid ' + T.border,
        borderRadius: 18,
        padding: '24px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: T.text1,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          {isSignUp ? '创建账号' : '欢迎回来'}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.text2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid ' + T.border,
                borderRadius: 10,
                fontSize: 14,
                lineHeight: '1.4',
                color: T.text1,
                background: T.bg,
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = T.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = T.border}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: T.text2, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? '至少6位' : '输入密码'}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid ' + T.border,
                borderRadius: 10,
                fontSize: 14,
                lineHeight: '1.4',
                color: T.text1,
                background: T.bg,
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = T.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = T.border}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 12,
              color: '#C62828',
              background: 'rgba(198,40,40,0.06)',
              padding: '8px 12px',
              borderRadius: 10,
              marginBottom: 14,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              background: loading ? '#81C784' : T.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '请稍候...' : (isSignUp ? E.seedling + ' 注册' : E.heart + ' 登录')}
          </button>
        </form>
      </div>

      {/* Toggle */}
      <div style={{ marginTop: 20, fontSize: 13, color: T.text2 }}>
        {isSignUp ? '已有账号？' : '还没有账号？'}
        <span
          onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          style={{
            color: T.accent,
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: 4,
          }}
        >
          {isSignUp ? '去登录' : '注册'}
        </span>
      </div>
    </div>
  );
}
