import { T } from '../theme';

export default function Scanlines() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, ' +
          T.scanline +
          ' 2px, ' +
          T.scanline +
          ' 4px)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
