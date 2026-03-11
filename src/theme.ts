// ===== Emoji Constants =====
export const E = {
  herb: String.fromCodePoint(0x1f33f),
  tree: String.fromCodePoint(0x1f332),
  cactus: String.fromCodePoint(0x1f335),
  flower: String.fromCodePoint(0x1f33a),
  clover: String.fromCodePoint(0x2618, 0xfe0f),
  seedling: String.fromCodePoint(0x1f331),
  wilted: String.fromCodePoint(0x1f940),
  leaf: String.fromCodePoint(0x1f342),
  drop: String.fromCodePoint(0x1f4a7),
  sun: String.fromCodePoint(0x2600, 0xfe0f),
  tube: String.fromCodePoint(0x1f9ea),
  bug: String.fromCodePoint(0x1f41b),
  camera: String.fromCodePoint(0x1f4f7),
  book: String.fromCodePoint(0x1f4d6),
  sparkle: String.fromCodePoint(0x2728),
  trophy: String.fromCodePoint(0x1f3c6),
  heart: String.fromCodePoint(0x1f49a),
  fire: String.fromCodePoint(0x1f525),
  skull: String.fromCodePoint(0x1f480),
  check: String.fromCodePoint(0x2714),
  tri: String.fromCodePoint(0x25b8),
  circle: String.fromCodePoint(0x25cf),
  shield: String.fromCodePoint(0x1f6e1, 0xfe0f),
  clock: String.fromCodePoint(0x1f552),
  warn: String.fromCodePoint(0x26a0, 0xfe0f),
  arrowUp: String.fromCodePoint(0x2191),
  arrowDown: String.fromCodePoint(0x2193),
} as const;

// ===== Theme Tokens =====
export const T = {
  bg: '#F2F0EB',
  card: '#FFFFFF',
  border: '#E0DDD5',
  accent: '#2E7D32',
  accentLight: 'rgba(46,125,50,0.06)',
  accentBorder: 'rgba(46,125,50,0.12)',
  text1: '#1A1A1A',
  text2: '#666655',
  text3: '#AAAAAA',
  barBg: '#E8E5DD',
  barBorder: '#D5D0C8',
  scanline: 'rgba(46,125,50,0.015)',
} as const;

// ===== HP Status Colors =====
export const HP_COLORS = {
  healthy: '#2E7D32',
  moderate: '#F9A825',
  warning: '#E65100',
  danger: '#C62828',
} as const;

// ===== Font Families =====
export const FONTS = {
  pixel: "'Courier New', monospace",
  body: "'Noto Sans SC', sans-serif",
} as const;
