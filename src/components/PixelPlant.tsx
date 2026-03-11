interface PixelPlantProps {
  hp: number;
  size?: number;
}

export default function PixelPlant({ hp, size = 80 }: PixelPlantProps) {
  const s = size / 10;
  const potColor = '#A0855B';
  const potDark = '#8B7046';
  const soilColor = hp >= 40 ? '#5D4037' : '#8D6E63';
  const leafColor =
    hp >= 75 ? '#4CAF50' : hp >= 50 ? '#8BC34A' : hp >= 25 ? '#CDDC39' : '#9E9E9E';
  const leafDark =
    hp >= 75 ? '#388E3C' : hp >= 50 ? '#689F38' : hp >= 25 ? '#AFB42B' : '#757575';
  const stemColor = hp >= 50 ? '#6D9B3A' : '#A0A050';
  const flowerColor = hp >= 75 ? '#FF7043' : hp >= 50 ? '#FFB74D' : null;
  const droopY = hp < 25 ? s * 0.6 : hp < 50 ? s * 0.3 : 0;
  const droopR = hp < 25 ? 15 : hp < 50 ? 5 : 0;

  const px = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    key?: string
  ) => (
    <div
      key={key || `${x}-${y}-${color}`}
      style={{
        position: 'absolute',
        left: x * s,
        top: y * s,
        width: w * s,
        height: h * s,
        background: color,
        borderRadius: 1,
      }}
    />
  );

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {/* Pot */}
      {px(2.5, 7, 5, 0.8, potColor)}
      {px(3, 7.8, 4, 2, potColor)}
      {px(3.2, 7.8, 3.6, 0.5, potDark)}
      {px(3.5, 9.5, 3, 0.5, potDark)}
      {/* Soil */}
      {px(2.8, 6.8, 4.4, 0.6, soilColor)}

      {/* Stem + leaves group */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transform: `rotate(${droopR}deg) translateY(${droopY}px)`,
          transformOrigin: '50% 70%',
          transition: 'transform 0.6s ease',
        }}
      >
        {/* Main stem */}
        {px(4.7, 3.5, 0.6, 3.5, stemColor)}

        {/* Left leaf */}
        {px(2.2, 3.5, 2.5, 1.2, leafColor, 'll1')}
        {px(2.2, 3.5, 2.5, 0.4, leafDark, 'll2')}
        {px(1.8, 4, 1, 0.8, leafColor, 'll3')}

        {/* Right leaf */}
        {px(5.3, 2.5, 2.5, 1.2, leafColor, 'rl1')}
        {px(5.3, 2.5, 2.5, 0.4, leafDark, 'rl2')}
        {px(7.2, 3, 1, 0.8, leafColor, 'rl3')}

        {/* Top leaf / flower */}
        {px(3.8, 1.5, 2.4, 1.5, leafColor, 'tl1')}
        {px(3.8, 1.5, 2.4, 0.5, leafDark, 'tl2')}

        {/* Flower (only if healthy) */}
        {flowerColor && px(4.2, 0.5, 1.6, 1.2, flowerColor, 'f1')}
        {flowerColor && hp >= 75 && px(4.6, 0.8, 0.8, 0.6, '#FFF9C4', 'f2')}

        {/* Wilting marks (if low HP) */}
        {hp < 25 && px(2, 5, 0.4, 0.4, '#795548', 'w1')}
        {hp < 25 && px(7, 4, 0.4, 0.4, '#795548', 'w2')}
        {hp < 25 && px(5, 2.5, 0.3, 0.3, '#795548', 'w3')}
      </div>

      {/* Face on pot */}
      <div
        style={{
          position: 'absolute',
          top: s * 8.2,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: Math.max(6, size * 0.1),
          fontFamily: "'Courier New', monospace",
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {hp >= 65 ? '^_^' : hp >= 40 ? '-.-' : hp >= 20 ? 'T_T' : 'x_x'}
      </div>
    </div>
  );
}
