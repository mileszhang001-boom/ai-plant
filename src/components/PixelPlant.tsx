interface PixelPlantProps {
  hp: number;
  size?: number;
  species?: string;
}

type PlantType = 'pothos' | 'moneyTree' | 'cactus' | 'jasmine' | 'succulent' | 'orchid' | 'rose' | 'sunflower' | 'bamboo' | 'fern' | 'aloe' | 'lily' | 'palm' | 'ivy' | 'bonsai' | 'default';

interface Palette {
  leaf: string;
  leafDark: string;
  leafLight: string;
  stem: string;
  flower: string | null;
  flowerCenter: string | null;
}

interface Pixel {
  x: number;
  y: number;
  color: string;
}

function getPlantType(species?: string): PlantType {
  if (!species) return 'pothos';
  const map: Record<string, PlantType> = {
    '绿萝': 'pothos',
    '发财树': 'moneyTree',
    '仙人掌': 'cactus',
    '茉莉花': 'jasmine',
    '多肉植物': 'succulent',
    '多肉': 'succulent',
    '兰花': 'orchid',
    '玫瑰': 'rose',
    '玫瑰花': 'rose',
    '向日葵': 'sunflower',
    '竹子': 'bamboo',
    '蕨类': 'fern',
    '蕨类植物': 'fern',
    '蕨': 'fern',
    '芦荟': 'aloe',
    '百合': 'lily',
    '百合花': 'lily',
    '棕榈': 'palm',
    '棕榈树': 'palm',
    '常春藤': 'ivy',
    '盆栽松': 'bonsai',
    '盆栽': 'bonsai',
    '松树': 'bonsai',
    pothos: 'pothos',
    moneyTree: 'moneyTree',
    cactus: 'cactus',
    jasmine: 'jasmine',
    succulent: 'succulent',
    orchid: 'orchid',
    rose: 'rose',
    sunflower: 'sunflower',
    bamboo: 'bamboo',
    fern: 'fern',
    aloe: 'aloe',
    lily: 'lily',
    palm: 'palm',
    ivy: 'ivy',
    bonsai: 'bonsai',
  };

  // Exact match
  if (map[species]) return map[species];

  // Fuzzy match by Chinese keyword
  const fuzzyMap: [string, PlantType][] = [
    ['兰', 'orchid'],
    ['玫瑰', 'rose'],
    ['向日葵', 'sunflower'],
    ['葵', 'sunflower'],
    ['竹', 'bamboo'],
    ['蕨', 'fern'],
    ['芦荟', 'aloe'],
    ['百合', 'lily'],
    ['棕榈', 'palm'],
    ['棕', 'palm'],
    ['藤', 'ivy'],
    ['常春', 'ivy'],
    ['盆栽', 'bonsai'],
    ['松', 'bonsai'],
    ['绿萝', 'pothos'],
    ['发财', 'moneyTree'],
    ['仙人掌', 'cactus'],
    ['茉莉', 'jasmine'],
    ['多肉', 'succulent'],
  ];

  for (const [keyword, type] of fuzzyMap) {
    if (species.includes(keyword)) return type;
  }

  return 'pothos';
}

function getPalette(hp: number): Palette {
  if (hp >= 75) {
    return { leaf: '#4CAF50', leafDark: '#388E3C', leafLight: '#81C784', stem: '#6D9B3A', flower: '#FF7043', flowerCenter: '#FFF9C4' };
  }
  if (hp >= 50) {
    return { leaf: '#8BC34A', leafDark: '#689F38', leafLight: '#AED581', stem: '#8D9B3A', flower: '#FFB74D', flowerCenter: '#FFF9C4' };
  }
  if (hp >= 25) {
    return { leaf: '#CDDC39', leafDark: '#AFB42B', leafLight: '#DCE775', stem: '#A0A050', flower: null, flowerCenter: null };
  }
  return { leaf: '#9E9E9E', leafDark: '#757575', leafLight: '#BDBDBD', stem: '#8D8D6D', flower: null, flowerCenter: null };
}

function getFace(hp: number): string {
  if (hp >= 65) return '^_^';
  if (hp >= 40) return '-.-';
  if (hp >= 20) return 'T_T';
  return 'x_x';
}

function getPotPixels(hp: number): Pixel[] {
  const potColor = '#A0855B';
  const potDark = '#8B7046';
  const potHighlight = '#C4A97D';
  const soilColor = hp >= 40 ? '#5D4037' : '#8D6E63';

  const pixels: Pixel[] = [];

  // Soil - Row 11
  for (let x = 5; x <= 10; x++) {
    pixels.push({ x, y: 11, color: soilColor });
  }

  // Pot rim - Row 12
  for (let x = 5; x <= 10; x++) {
    pixels.push({ x, y: 12, color: potColor });
  }
  // Rim highlights
  pixels.push({ x: 6, y: 12, color: potHighlight });
  pixels.push({ x: 7, y: 12, color: potHighlight });

  // Pot body upper - Row 13
  for (let x = 5; x <= 10; x++) {
    const c = (x === 5 || x === 10) ? potDark : potColor;
    pixels.push({ x, y: 13, color: c });
  }

  // Pot body lower - Row 14
  for (let x = 6; x <= 9; x++) {
    pixels.push({ x, y: 14, color: potColor });
  }

  // Pot base - Row 15
  for (let x = 6; x <= 9; x++) {
    pixels.push({ x, y: 15, color: potDark });
  }

  return pixels;
}

function getPothosPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';

  // Main stem
  for (let y = 6; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  // Heart leaf helper: 3 pixels forming a heart shape
  const heartLeaf = (cx: number, cy: number, main: string, dark: string) => {
    pixels.push({ x: cx - 1, y: cy, color: main });
    pixels.push({ x: cx + 1, y: cy, color: main });
    pixels.push({ x: cx, y: cy + 1, color: main });
    pixels.push({ x: cx, y: cy, color: dark }); // center depth
  };

  if (hp >= 75) {
    // Top cluster
    pixels.push({ x: 6, y: 4, color: p.leaf });
    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 4, color: p.leaf });
    pixels.push({ x: 9, y: 3, color: p.leafDark });
    pixels.push({ x: 7, y: 2, color: p.leafLight });
    pixels.push({ x: 8, y: 3, color: p.leafLight });

    // Left vine
    pixels.push({ x: 6, y: 7, color: p.stem });
    pixels.push({ x: 5, y: 7, color: p.stem });
    pixels.push({ x: 4, y: 6, color: p.stem });
    pixels.push({ x: 3, y: 6, color: p.stem });
    pixels.push({ x: 3, y: 8, color: p.stem });
    pixels.push({ x: 2, y: 8, color: p.stem });
    pixels.push({ x: 2, y: 9, color: p.stem });
    pixels.push({ x: 1, y: 10, color: p.stem });

    heartLeaf(3, 5, p.leaf, p.leafDark);
    heartLeaf(2, 7, p.leaf, p.leafDark);
    heartLeaf(1, 9, p.leaf, p.leafDark);

    // Right vine
    pixels.push({ x: 9, y: 7, color: p.stem });
    pixels.push({ x: 10, y: 7, color: p.stem });
    pixels.push({ x: 11, y: 6, color: p.stem });
    pixels.push({ x: 12, y: 8, color: p.stem });
    pixels.push({ x: 11, y: 8, color: p.stem });

    heartLeaf(11, 5, p.leaf, p.leafDark);
    heartLeaf(12, 8, p.leafLight, p.leaf);

    // Extra leafy details
    pixels.push({ x: 5, y: 5, color: p.leafLight });
    pixels.push({ x: 10, y: 4, color: p.leafLight });

  } else if (hp >= 50) {
    // Top cluster (slightly sparse)
    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 4, color: p.leaf });
    pixels.push({ x: 6, y: 4, color: p.leafDark });
    pixels.push({ x: 9, y: 3, color: p.leafLight });

    // Left vine (shorter)
    pixels.push({ x: 6, y: 7, color: p.stem });
    pixels.push({ x: 5, y: 7, color: p.stem });
    pixels.push({ x: 4, y: 8, color: p.stem });
    heartLeaf(3, 5, p.leaf, p.leafDark);
    heartLeaf(3, 8, p.leaf, p.leafDark);

    // Right vine (shorter)
    pixels.push({ x: 9, y: 7, color: p.stem });
    pixels.push({ x: 10, y: 7, color: p.stem });
    heartLeaf(11, 6, p.leaf, p.leafDark);

  } else if (hp >= 25) {
    // Sparse, drooping
    pixels.push({ x: 7, y: 4, color: p.leaf });
    pixels.push({ x: 8, y: 5, color: p.leafDark });

    // One vine left
    pixels.push({ x: 6, y: 8, color: p.stem });
    pixels.push({ x: 5, y: 9, color: p.stem });
    heartLeaf(4, 9, p.leaf, p.leafDark);

    // Wilt spots
    pixels.push({ x: 9, y: 6, color: wilt });

  } else {
    // Nearly dead
    pixels.push({ x: 7, y: 5, color: p.leaf });
    pixels.push({ x: 6, y: 7, color: p.stem });
    pixels.push({ x: 5, y: 8, color: p.leafDark });

    // Wilt
    pixels.push({ x: 8, y: 4, color: wilt });
    pixels.push({ x: 9, y: 7, color: wilt });
    pixels.push({ x: 6, y: 6, color: wilt });
  }

  return pixels;
}

function getMoneyTreePixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const trunk = '#8B6914';
  const trunkDark = '#6B5010';
  const trunkLight = '#A88B2A';

  // Trunk (always visible)
  for (let y = 8; y <= 11; y++) {
    pixels.push({ x: 7, y, color: y % 2 === 0 ? trunk : trunkDark });
    pixels.push({ x: 8, y, color: y % 2 === 0 ? trunkDark : trunkLight });
  }

  if (hp >= 75) {
    // Full canopy dome
    // Row 2
    for (let x = 5; x <= 10; x++) {
      pixels.push({ x, y: 2, color: p.leafDark });
    }
    // Row 3
    for (let x = 4; x <= 11; x++) {
      pixels.push({ x, y: 3, color: p.leaf });
    }
    pixels.push({ x: 5, y: 3, color: p.leafDark });
    pixels.push({ x: 10, y: 3, color: p.leafDark });
    // Row 4
    for (let x = 3; x <= 12; x++) {
      pixels.push({ x, y: 4, color: p.leaf });
    }
    pixels.push({ x: 6, y: 4, color: p.leafLight });
    pixels.push({ x: 9, y: 4, color: p.leafLight });
    // Row 5
    for (let x = 3; x <= 12; x++) {
      pixels.push({ x, y: 5, color: p.leaf });
    }
    pixels.push({ x: 4, y: 5, color: p.leafDark });
    pixels.push({ x: 11, y: 5, color: p.leafDark });
    pixels.push({ x: 7, y: 5, color: p.leafLight });
    // Row 6
    for (let x = 4; x <= 11; x++) {
      pixels.push({ x, y: 6, color: p.leaf });
    }
    pixels.push({ x: 5, y: 6, color: p.leafLight });
    pixels.push({ x: 10, y: 6, color: p.leafDark });
    // Row 7
    for (let x = 5; x <= 10; x++) {
      pixels.push({ x, y: 7, color: p.leaf });
    }
    pixels.push({ x: 6, y: 7, color: p.leafDark });

  } else if (hp >= 50) {
    // Thinner canopy
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 3, color: p.leafDark });
    for (let x = 4; x <= 11; x++) pixels.push({ x, y: 4, color: p.leaf });
    for (let x = 4; x <= 11; x++) pixels.push({ x, y: 5, color: p.leaf });
    pixels.push({ x: 6, y: 5, color: p.leafLight });
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 6, color: p.leaf });
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 7, color: p.leafDark });

  } else if (hp >= 25) {
    // Sparse canopy
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 4, color: p.leaf });
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 5, color: p.leaf });
    pixels.push({ x: 7, y: 5, color: p.leafDark });
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 6, color: p.leafDark });
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 7, color: p.leaf });
    // Yellow-brown spots
    pixels.push({ x: 5, y: 5, color: '#795548' });
    pixels.push({ x: 10, y: 6, color: '#795548' });

  } else {
    // Bare branches
    pixels.push({ x: 6, y: 5, color: p.leafDark });
    pixels.push({ x: 9, y: 5, color: p.leafDark });
    pixels.push({ x: 7, y: 6, color: p.leaf });
    pixels.push({ x: 8, y: 6, color: p.leaf });
    pixels.push({ x: 5, y: 7, color: p.stem });
    pixels.push({ x: 10, y: 7, color: p.stem });
    pixels.push({ x: 7, y: 4, color: '#795548' });
    pixels.push({ x: 8, y: 4, color: '#795548' });
  }

  return pixels;
}

function getCactusPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];

  // Main column
  if (hp >= 75) {
    for (let y = 3; y <= 11; y++) {
      pixels.push({ x: 6, y, color: p.leafDark });
      pixels.push({ x: 7, y, color: p.leaf });
      pixels.push({ x: 8, y, color: p.leaf });
      pixels.push({ x: 9, y, color: p.leafDark });
    }
    // Round top
    pixels.push({ x: 7, y: 2, color: p.leaf });
    pixels.push({ x: 8, y: 2, color: p.leaf });

    // Left arm going up
    pixels.push({ x: 5, y: 6, color: p.leaf });
    pixels.push({ x: 5, y: 5, color: p.leaf });
    pixels.push({ x: 4, y: 5, color: p.leafDark });
    pixels.push({ x: 4, y: 4, color: p.leaf });
    pixels.push({ x: 4, y: 3, color: p.leaf });
    pixels.push({ x: 5, y: 3, color: p.leafLight });

    // Right arm going up
    pixels.push({ x: 10, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 6, color: p.leaf });
    pixels.push({ x: 11, y: 6, color: p.leafDark });
    pixels.push({ x: 11, y: 5, color: p.leaf });
    pixels.push({ x: 11, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 4, color: p.leafLight });

    // Spines
    pixels.push({ x: 5, y: 4, color: p.leafLight });
    pixels.push({ x: 10, y: 3, color: p.leafLight });
    pixels.push({ x: 5, y: 8, color: p.leafLight });
    pixels.push({ x: 10, y: 9, color: p.leafLight });

    // Flower on top (only if very healthy)
    if (hp >= 85) {
      pixels.push({ x: 7, y: 1, color: '#FF7043' });
      pixels.push({ x: 8, y: 1, color: '#FF7043' });
      pixels.push({ x: 7, y: 0, color: '#FF8A65' });
      pixels.push({ x: 8, y: 0, color: '#FFF9C4' });
    }

  } else if (hp >= 50) {
    for (let y = 3; y <= 11; y++) {
      pixels.push({ x: 6, y, color: p.leafDark });
      pixels.push({ x: 7, y, color: p.leaf });
      pixels.push({ x: 8, y, color: p.leaf });
      pixels.push({ x: 9, y, color: p.leafDark });
    }
    pixels.push({ x: 7, y: 2, color: p.leaf });
    pixels.push({ x: 8, y: 2, color: p.leaf });

    // Arms slightly lower
    pixels.push({ x: 5, y: 6, color: p.leaf });
    pixels.push({ x: 5, y: 5, color: p.leaf });
    pixels.push({ x: 4, y: 5, color: p.leafDark });
    pixels.push({ x: 4, y: 4, color: p.leaf });

    pixels.push({ x: 10, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 6, color: p.leaf });
    pixels.push({ x: 11, y: 6, color: p.leafDark });
    pixels.push({ x: 11, y: 5, color: p.leaf });

  } else if (hp >= 25) {
    for (let y = 4; y <= 11; y++) {
      pixels.push({ x: 6, y, color: p.leafDark });
      pixels.push({ x: 7, y, color: p.leaf });
      pixels.push({ x: 8, y, color: p.leaf });
      pixels.push({ x: 9, y, color: p.leafDark });
    }
    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 3, color: p.leaf });

    // Arms drooping down
    pixels.push({ x: 5, y: 7, color: p.leaf });
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 4, y: 9, color: p.leafDark });

    pixels.push({ x: 10, y: 8, color: p.leaf });
    pixels.push({ x: 10, y: 9, color: p.leaf });
    pixels.push({ x: 11, y: 10, color: p.leafDark });

    // Brown spots
    pixels.push({ x: 7, y: 5, color: '#795548' });

  } else {
    // Gray, wilted
    for (let y = 5; y <= 11; y++) {
      pixels.push({ x: 7, y, color: p.leaf });
      pixels.push({ x: 8, y, color: p.leafDark });
    }
    pixels.push({ x: 6, y: 6, color: p.leafDark });
    pixels.push({ x: 9, y: 7, color: p.leafDark });

    // Arms fully drooped
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 5, y: 9, color: p.leafDark });
    pixels.push({ x: 10, y: 9, color: p.leaf });
    pixels.push({ x: 10, y: 10, color: p.leafDark });

    // Brown decay
    pixels.push({ x: 7, y: 6, color: '#795548' });
    pixels.push({ x: 8, y: 8, color: '#795548' });
  }

  return pixels;
}

function getJasminePixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];

  // Bottom stem
  for (let y = 9; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Dense bush oval shape
    // Row 3
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 3, color: p.leafDark });
    // Row 4
    for (let x = 4; x <= 11; x++) pixels.push({ x, y: 4, color: p.leaf });
    // Row 5
    for (let x = 3; x <= 12; x++) pixels.push({ x, y: 5, color: p.leaf });
    // Row 6
    for (let x = 3; x <= 12; x++) pixels.push({ x, y: 6, color: p.leaf });
    // Row 7
    for (let x = 4; x <= 11; x++) pixels.push({ x, y: 7, color: p.leaf });
    // Row 8
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 8, color: p.leafDark });
    // Row 9
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 9, color: p.leaf });

    // Leaf depth variation
    pixels.push({ x: 5, y: 5, color: p.leafLight });
    pixels.push({ x: 9, y: 4, color: p.leafLight });
    pixels.push({ x: 4, y: 6, color: p.leafDark });
    pixels.push({ x: 11, y: 6, color: p.leafDark });
    pixels.push({ x: 6, y: 7, color: p.leafLight });
    pixels.push({ x: 10, y: 5, color: p.leafDark });

    // White flowers scattered (5 flowers)
    pixels.push({ x: 5, y: 4, color: '#FFFFFF' });
    pixels.push({ x: 8, y: 3, color: '#FFFFFF' });
    pixels.push({ x: 10, y: 5, color: '#FFFFFF' });
    pixels.push({ x: 4, y: 7, color: '#FFFFFF' });
    pixels.push({ x: 9, y: 7, color: '#FFFFFF' });

    // Flower centers
    pixels.push({ x: 6, y: 5, color: '#FFF9C4' });
    pixels.push({ x: 11, y: 6, color: '#FFF9C4' });

  } else if (hp >= 50) {
    // Slightly sparser
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 4, color: p.leaf });
    for (let x = 4; x <= 11; x++) pixels.push({ x, y: 5, color: p.leaf });
    for (let x = 4; x <= 11; x++) pixels.push({ x, y: 6, color: p.leaf });
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 7, color: p.leafDark });
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 8, color: p.leaf });

    pixels.push({ x: 6, y: 5, color: p.leafLight });
    pixels.push({ x: 9, y: 6, color: p.leafLight });

    // Fewer flowers (3)
    pixels.push({ x: 6, y: 4, color: '#FFFFFF' });
    pixels.push({ x: 9, y: 5, color: '#FFFFFF' });
    pixels.push({ x: 5, y: 7, color: '#FFB74D' });

  } else if (hp >= 25) {
    // Sparse, yellowing, no flowers
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 5, color: p.leaf });
    for (let x = 5; x <= 10; x++) pixels.push({ x, y: 6, color: p.leaf });
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 7, color: p.leafDark });
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 8, color: p.leaf });

    pixels.push({ x: 5, y: 5, color: p.leafDark });
    pixels.push({ x: 10, y: 6, color: '#795548' });

  } else {
    // Nearly bare
    pixels.push({ x: 6, y: 6, color: p.leaf });
    pixels.push({ x: 7, y: 6, color: p.leafDark });
    pixels.push({ x: 8, y: 6, color: p.leaf });
    pixels.push({ x: 9, y: 6, color: p.leafDark });
    pixels.push({ x: 7, y: 7, color: p.leaf });
    pixels.push({ x: 8, y: 7, color: p.leafDark });
    pixels.push({ x: 6, y: 5, color: '#795548' });
    pixels.push({ x: 9, y: 5, color: '#795548' });
    pixels.push({ x: 7, y: 8, color: p.stem });
  }

  return pixels;
}

function getSucculentPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];

  // Stem to pot
  pixels.push({ x: 7, y: 10, color: p.stem });
  pixels.push({ x: 8, y: 10, color: p.stem });
  pixels.push({ x: 7, y: 11, color: p.stem });
  pixels.push({ x: 8, y: 11, color: p.stem });

  if (hp >= 75) {
    // Full rosette
    // Center (7-8, 7-8)
    pixels.push({ x: 7, y: 7, color: p.leafLight });
    pixels.push({ x: 8, y: 7, color: p.leafLight });
    pixels.push({ x: 7, y: 8, color: p.leafLight });
    pixels.push({ x: 8, y: 8, color: p.leafLight });

    // Inner petals (4 around center)
    pixels.push({ x: 6, y: 7, color: p.leafLight });
    pixels.push({ x: 9, y: 7, color: p.leafLight });
    pixels.push({ x: 7, y: 6, color: p.leafLight });
    pixels.push({ x: 8, y: 9, color: p.leafLight });

    // Middle ring (leaf color)
    pixels.push({ x: 5, y: 7, color: p.leaf });
    pixels.push({ x: 6, y: 6, color: p.leaf });
    pixels.push({ x: 9, y: 6, color: p.leaf });
    pixels.push({ x: 10, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 8, color: p.leaf });
    pixels.push({ x: 9, y: 9, color: p.leaf });
    pixels.push({ x: 6, y: 9, color: p.leaf });
    pixels.push({ x: 5, y: 8, color: p.leaf });

    // Outer ring (leafDark)
    pixels.push({ x: 4, y: 7, color: p.leafDark });
    pixels.push({ x: 4, y: 8, color: p.leafDark });
    pixels.push({ x: 5, y: 6, color: p.leafDark });
    pixels.push({ x: 5, y: 9, color: p.leafDark });
    pixels.push({ x: 6, y: 5, color: p.leafDark });
    pixels.push({ x: 7, y: 5, color: p.leafDark });
    pixels.push({ x: 8, y: 5, color: p.leafDark });
    pixels.push({ x: 9, y: 5, color: p.leafDark });
    pixels.push({ x: 10, y: 6, color: p.leafDark });
    pixels.push({ x: 11, y: 7, color: p.leafDark });
    pixels.push({ x: 11, y: 8, color: p.leafDark });
    pixels.push({ x: 10, y: 9, color: p.leafDark });
    pixels.push({ x: 9, y: 10, color: p.leafDark });
    pixels.push({ x: 6, y: 10, color: p.leafDark });
    pixels.push({ x: 8, y: 6, color: p.leaf });

    // Flower stalk (very healthy)
    if (hp >= 90) {
      pixels.push({ x: 8, y: 4, color: p.stem });
      pixels.push({ x: 8, y: 3, color: p.stem });
      pixels.push({ x: 8, y: 2, color: '#FF8A80' });
      pixels.push({ x: 9, y: 2, color: '#FF8A80' });
      pixels.push({ x: 8, y: 1, color: '#FFCDD2' });
    }

  } else if (hp >= 50) {
    // Slightly smaller rosette
    pixels.push({ x: 7, y: 7, color: p.leafLight });
    pixels.push({ x: 8, y: 7, color: p.leafLight });
    pixels.push({ x: 7, y: 8, color: p.leafLight });
    pixels.push({ x: 8, y: 8, color: p.leafLight });

    pixels.push({ x: 6, y: 7, color: p.leaf });
    pixels.push({ x: 9, y: 7, color: p.leaf });
    pixels.push({ x: 7, y: 6, color: p.leaf });
    pixels.push({ x: 8, y: 9, color: p.leaf });

    pixels.push({ x: 5, y: 7, color: p.leafDark });
    pixels.push({ x: 5, y: 8, color: p.leafDark });
    pixels.push({ x: 6, y: 6, color: p.leafDark });
    pixels.push({ x: 9, y: 6, color: p.leafDark });
    pixels.push({ x: 10, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leafDark });
    pixels.push({ x: 6, y: 9, color: p.leafDark });
    pixels.push({ x: 9, y: 9, color: p.leafDark });

  } else if (hp >= 25) {
    // Shriveled, gaps
    pixels.push({ x: 7, y: 7, color: p.leafLight });
    pixels.push({ x: 8, y: 8, color: p.leafLight });

    pixels.push({ x: 6, y: 7, color: p.leaf });
    pixels.push({ x: 9, y: 8, color: p.leaf });
    pixels.push({ x: 7, y: 9, color: p.leaf });
    pixels.push({ x: 8, y: 6, color: p.leaf });

    pixels.push({ x: 5, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leafDark });
    pixels.push({ x: 6, y: 9, color: '#795548' });
    pixels.push({ x: 9, y: 6, color: '#795548' });

  } else {
    // Very shriveled
    pixels.push({ x: 7, y: 8, color: p.leaf });
    pixels.push({ x: 8, y: 8, color: p.leafDark });
    pixels.push({ x: 7, y: 7, color: p.leafDark });
    pixels.push({ x: 8, y: 7, color: p.leaf });
    pixels.push({ x: 6, y: 8, color: '#795548' });
    pixels.push({ x: 9, y: 7, color: '#795548' });
  }

  return pixels;
}

function getOrchidPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';

  // Leaves from base
  for (let y = 8; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Long leaves arching out
    pixels.push({ x: 5, y: 9, color: p.leaf });
    pixels.push({ x: 4, y: 8, color: p.leaf });
    pixels.push({ x: 3, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 9, color: p.leaf });
    pixels.push({ x: 11, y: 8, color: p.leaf });
    pixels.push({ x: 12, y: 7, color: p.leafDark });
    pixels.push({ x: 6, y: 10, color: p.leafLight });
    pixels.push({ x: 9, y: 10, color: p.leafLight });

    // Flower stem
    pixels.push({ x: 8, y: 7, color: p.stem });
    pixels.push({ x: 9, y: 6, color: p.stem });
    pixels.push({ x: 9, y: 5, color: p.stem });
    pixels.push({ x: 10, y: 4, color: p.stem });
    pixels.push({ x: 10, y: 3, color: p.stem });

    // Flowers along stem
    pixels.push({ x: 9, y: 4, color: p.flower ?? '#E040FB' });
    pixels.push({ x: 10, y: 2, color: p.flower ?? '#E040FB' });
    pixels.push({ x: 11, y: 3, color: p.flower ?? '#E040FB' });
    pixels.push({ x: 11, y: 2, color: p.flowerCenter ?? '#FFF9C4' });
    pixels.push({ x: 10, y: 1, color: p.flower ?? '#E040FB' });
    pixels.push({ x: 8, y: 4, color: p.flower ?? '#E040FB' });
    pixels.push({ x: 9, y: 3, color: p.flowerCenter ?? '#FFF9C4' });

  } else if (hp >= 50) {
    pixels.push({ x: 5, y: 9, color: p.leaf });
    pixels.push({ x: 4, y: 8, color: p.leafDark });
    pixels.push({ x: 10, y: 9, color: p.leaf });
    pixels.push({ x: 11, y: 8, color: p.leafDark });

    // Shorter stem, fewer flowers
    pixels.push({ x: 9, y: 6, color: p.stem });
    pixels.push({ x: 9, y: 5, color: p.stem });
    pixels.push({ x: 10, y: 4, color: p.stem });
    pixels.push({ x: 10, y: 3, color: p.flower ?? '#E040FB' });
    pixels.push({ x: 11, y: 3, color: p.flowerCenter ?? '#FFF9C4' });
    pixels.push({ x: 9, y: 4, color: p.flower ?? '#E040FB' });

  } else if (hp >= 25) {
    pixels.push({ x: 5, y: 9, color: p.leaf });
    pixels.push({ x: 10, y: 9, color: p.leafDark });
    pixels.push({ x: 9, y: 7, color: p.stem });
    pixels.push({ x: 9, y: 6, color: p.stem });
    pixels.push({ x: 10, y: 5, color: wilt });

  } else {
    pixels.push({ x: 6, y: 9, color: p.leafDark });
    pixels.push({ x: 9, y: 9, color: wilt });
    pixels.push({ x: 9, y: 7, color: wilt });
    pixels.push({ x: 10, y: 6, color: wilt });
  }

  return pixels;
}

function getRosePixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';
  const thorn = '#5D4037';
  const roseRed = p.flower ?? '#E53935';
  const roseCenter = p.flowerCenter ?? '#FFCDD2';

  // Main stem
  for (let y = 5; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Thorns
    pixels.push({ x: 6, y: 7, color: thorn });
    pixels.push({ x: 9, y: 9, color: thorn });
    pixels.push({ x: 6, y: 10, color: thorn });

    // Leaves
    pixels.push({ x: 5, y: 7, color: p.leaf });
    pixels.push({ x: 6, y: 8, color: p.leaf });
    pixels.push({ x: 5, y: 8, color: p.leafDark });
    pixels.push({ x: 9, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leaf });

    // Rose bloom (round)
    pixels.push({ x: 6, y: 2, color: roseRed });
    pixels.push({ x: 7, y: 1, color: roseRed });
    pixels.push({ x: 8, y: 1, color: roseRed });
    pixels.push({ x: 9, y: 2, color: roseRed });
    pixels.push({ x: 6, y: 3, color: roseRed });
    pixels.push({ x: 7, y: 2, color: roseCenter });
    pixels.push({ x: 8, y: 2, color: roseCenter });
    pixels.push({ x: 9, y: 3, color: roseRed });
    pixels.push({ x: 7, y: 3, color: roseRed });
    pixels.push({ x: 8, y: 3, color: roseRed });
    pixels.push({ x: 7, y: 4, color: p.leafDark });
    pixels.push({ x: 8, y: 4, color: p.leafDark });

    // Second bud
    pixels.push({ x: 5, y: 5, color: roseRed });
    pixels.push({ x: 4, y: 5, color: roseRed });
    pixels.push({ x: 5, y: 4, color: roseRed });

  } else if (hp >= 50) {
    pixels.push({ x: 6, y: 8, color: thorn });
    pixels.push({ x: 9, y: 9, color: thorn });

    pixels.push({ x: 5, y: 7, color: p.leaf });
    pixels.push({ x: 6, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leaf });

    // Smaller bloom
    pixels.push({ x: 7, y: 2, color: roseRed });
    pixels.push({ x: 8, y: 2, color: roseRed });
    pixels.push({ x: 7, y: 3, color: roseRed });
    pixels.push({ x: 8, y: 3, color: roseCenter });
    pixels.push({ x: 7, y: 4, color: p.leafDark });
    pixels.push({ x: 8, y: 4, color: p.leafDark });

  } else if (hp >= 25) {
    pixels.push({ x: 6, y: 7, color: p.leaf });
    pixels.push({ x: 9, y: 8, color: p.leafDark });
    pixels.push({ x: 7, y: 4, color: wilt });
    pixels.push({ x: 8, y: 3, color: wilt });

  } else {
    pixels.push({ x: 6, y: 6, color: wilt });
    pixels.push({ x: 9, y: 7, color: wilt });
    pixels.push({ x: 7, y: 4, color: wilt });
    pixels.push({ x: 8, y: 5, color: wilt });
  }

  return pixels;
}

function getSunflowerPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';
  const petalColor = p.flower ?? '#FDD835';
  const centerColor = p.flowerCenter ?? '#5D4037';

  // Thick stem
  for (let y = 6; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Leaves on stem
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 6, y: 8, color: p.leaf });
    pixels.push({ x: 5, y: 7, color: p.leafDark });
    pixels.push({ x: 9, y: 9, color: p.leaf });
    pixels.push({ x: 10, y: 9, color: p.leaf });
    pixels.push({ x: 10, y: 8, color: p.leafDark });

    // Big flower disc center
    pixels.push({ x: 7, y: 3, color: centerColor });
    pixels.push({ x: 8, y: 3, color: centerColor });
    pixels.push({ x: 7, y: 4, color: centerColor });
    pixels.push({ x: 8, y: 4, color: centerColor });

    // Petals around center
    pixels.push({ x: 6, y: 2, color: petalColor });
    pixels.push({ x: 7, y: 2, color: petalColor });
    pixels.push({ x: 8, y: 2, color: petalColor });
    pixels.push({ x: 9, y: 2, color: petalColor });
    pixels.push({ x: 6, y: 3, color: petalColor });
    pixels.push({ x: 9, y: 3, color: petalColor });
    pixels.push({ x: 6, y: 4, color: petalColor });
    pixels.push({ x: 9, y: 4, color: petalColor });
    pixels.push({ x: 6, y: 5, color: petalColor });
    pixels.push({ x: 7, y: 5, color: petalColor });
    pixels.push({ x: 8, y: 5, color: petalColor });
    pixels.push({ x: 9, y: 5, color: petalColor });
    pixels.push({ x: 5, y: 3, color: petalColor });
    pixels.push({ x: 5, y: 4, color: petalColor });
    pixels.push({ x: 10, y: 3, color: petalColor });
    pixels.push({ x: 10, y: 4, color: petalColor });
    pixels.push({ x: 7, y: 1, color: petalColor });
    pixels.push({ x: 8, y: 1, color: petalColor });

  } else if (hp >= 50) {
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 6, y: 8, color: p.leafDark });
    pixels.push({ x: 10, y: 9, color: p.leaf });

    // Smaller flower
    pixels.push({ x: 7, y: 3, color: centerColor });
    pixels.push({ x: 8, y: 3, color: centerColor });
    pixels.push({ x: 7, y: 4, color: centerColor });
    pixels.push({ x: 8, y: 4, color: centerColor });
    pixels.push({ x: 6, y: 3, color: petalColor });
    pixels.push({ x: 9, y: 3, color: petalColor });
    pixels.push({ x: 7, y: 2, color: petalColor });
    pixels.push({ x: 8, y: 2, color: petalColor });
    pixels.push({ x: 7, y: 5, color: petalColor });
    pixels.push({ x: 8, y: 5, color: petalColor });
    pixels.push({ x: 6, y: 4, color: petalColor });
    pixels.push({ x: 9, y: 4, color: petalColor });

  } else if (hp >= 25) {
    pixels.push({ x: 6, y: 8, color: p.leafDark });
    // Drooping, faded
    pixels.push({ x: 7, y: 4, color: centerColor });
    pixels.push({ x: 8, y: 4, color: centerColor });
    pixels.push({ x: 7, y: 3, color: petalColor });
    pixels.push({ x: 8, y: 5, color: petalColor });
    pixels.push({ x: 6, y: 4, color: wilt });
    pixels.push({ x: 9, y: 4, color: wilt });

  } else {
    pixels.push({ x: 7, y: 5, color: wilt });
    pixels.push({ x: 8, y: 4, color: wilt });
    pixels.push({ x: 7, y: 4, color: wilt });
    pixels.push({ x: 6, y: 5, color: wilt });
    pixels.push({ x: 9, y: 5, color: wilt });
  }

  return pixels;
}

function getBambooPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';
  const node = '#2E7D32';

  // Bamboo segments (main culm)
  for (let y = 2; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.leaf });
    pixels.push({ x: 8, y, color: p.leafDark });
  }

  if (hp >= 75) {
    // Nodes (joints)
    for (const ny of [3, 6, 9]) {
      pixels.push({ x: 6, y: ny, color: node });
      pixels.push({ x: 7, y: ny, color: node });
      pixels.push({ x: 8, y: ny, color: node });
      pixels.push({ x: 9, y: ny, color: node });
    }

    // Leaves from nodes
    // Top leaves
    pixels.push({ x: 5, y: 1, color: p.leaf });
    pixels.push({ x: 4, y: 0, color: p.leafDark });
    pixels.push({ x: 6, y: 1, color: p.leafLight });
    pixels.push({ x: 9, y: 1, color: p.leaf });
    pixels.push({ x: 10, y: 0, color: p.leafDark });
    pixels.push({ x: 10, y: 1, color: p.leafLight });

    // Mid leaves
    pixels.push({ x: 5, y: 4, color: p.leaf });
    pixels.push({ x: 4, y: 4, color: p.leafDark });
    pixels.push({ x: 3, y: 3, color: p.leaf });
    pixels.push({ x: 10, y: 5, color: p.leaf });
    pixels.push({ x: 11, y: 5, color: p.leafDark });
    pixels.push({ x: 11, y: 4, color: p.leaf });

    // Lower leaves
    pixels.push({ x: 5, y: 7, color: p.leaf });
    pixels.push({ x: 4, y: 7, color: p.leafLight });
    pixels.push({ x: 10, y: 8, color: p.leaf });
    pixels.push({ x: 11, y: 7, color: p.leafLight });

  } else if (hp >= 50) {
    for (const ny of [4, 7]) {
      pixels.push({ x: 6, y: ny, color: node });
      pixels.push({ x: 9, y: ny, color: node });
    }
    pixels.push({ x: 5, y: 2, color: p.leaf });
    pixels.push({ x: 6, y: 1, color: p.leafDark });
    pixels.push({ x: 10, y: 3, color: p.leaf });
    pixels.push({ x: 11, y: 2, color: p.leafDark });
    pixels.push({ x: 5, y: 5, color: p.leaf });
    pixels.push({ x: 10, y: 6, color: p.leaf });

  } else if (hp >= 25) {
    for (const ny of [5, 8]) {
      pixels.push({ x: 6, y: ny, color: node });
      pixels.push({ x: 9, y: ny, color: node });
    }
    pixels.push({ x: 5, y: 3, color: p.leafDark });
    pixels.push({ x: 10, y: 4, color: p.leafDark });
    pixels.push({ x: 6, y: 7, color: wilt });

  } else {
    pixels.push({ x: 6, y: 5, color: wilt });
    pixels.push({ x: 9, y: 6, color: wilt });
    pixels.push({ x: 5, y: 4, color: wilt });
    pixels.push({ x: 10, y: 7, color: wilt });
  }

  return pixels;
}

function getFernPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';

  // Central stem
  for (let y = 6; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Fronds unfurling outward - left
    pixels.push({ x: 6, y: 5, color: p.stem });
    pixels.push({ x: 5, y: 4, color: p.stem });
    pixels.push({ x: 4, y: 3, color: p.stem });
    pixels.push({ x: 3, y: 2, color: p.stem });
    // Leaflets on left frond
    pixels.push({ x: 5, y: 3, color: p.leaf });
    pixels.push({ x: 4, y: 2, color: p.leaf });
    pixels.push({ x: 3, y: 1, color: p.leafLight });
    pixels.push({ x: 6, y: 4, color: p.leaf });
    pixels.push({ x: 4, y: 4, color: p.leafDark });
    pixels.push({ x: 3, y: 3, color: p.leafLight });
    pixels.push({ x: 2, y: 2, color: p.leaf });

    // Fronds - right
    pixels.push({ x: 9, y: 5, color: p.stem });
    pixels.push({ x: 10, y: 4, color: p.stem });
    pixels.push({ x: 11, y: 3, color: p.stem });
    pixels.push({ x: 12, y: 2, color: p.stem });
    // Leaflets on right frond
    pixels.push({ x: 10, y: 3, color: p.leaf });
    pixels.push({ x: 11, y: 2, color: p.leaf });
    pixels.push({ x: 12, y: 1, color: p.leafLight });
    pixels.push({ x: 9, y: 4, color: p.leaf });
    pixels.push({ x: 11, y: 4, color: p.leafDark });
    pixels.push({ x: 12, y: 3, color: p.leafLight });
    pixels.push({ x: 13, y: 2, color: p.leaf });

    // Center frond going up
    pixels.push({ x: 7, y: 5, color: p.leaf });
    pixels.push({ x: 8, y: 4, color: p.leaf });
    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 2, color: p.leafLight });
    pixels.push({ x: 6, y: 6, color: p.leafDark });
    pixels.push({ x: 9, y: 6, color: p.leafDark });

    // Lower drooping fronds
    pixels.push({ x: 5, y: 7, color: p.leaf });
    pixels.push({ x: 4, y: 8, color: p.leafDark });
    pixels.push({ x: 10, y: 7, color: p.leaf });
    pixels.push({ x: 11, y: 8, color: p.leafDark });

  } else if (hp >= 50) {
    pixels.push({ x: 6, y: 5, color: p.stem });
    pixels.push({ x: 5, y: 4, color: p.stem });
    pixels.push({ x: 5, y: 3, color: p.leaf });
    pixels.push({ x: 4, y: 3, color: p.leafDark });
    pixels.push({ x: 6, y: 4, color: p.leaf });

    pixels.push({ x: 9, y: 5, color: p.stem });
    pixels.push({ x: 10, y: 4, color: p.stem });
    pixels.push({ x: 10, y: 3, color: p.leaf });
    pixels.push({ x: 11, y: 3, color: p.leafDark });
    pixels.push({ x: 9, y: 4, color: p.leaf });

    pixels.push({ x: 7, y: 4, color: p.leaf });
    pixels.push({ x: 8, y: 3, color: p.leafLight });

    pixels.push({ x: 5, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 7, color: p.leafDark });

  } else if (hp >= 25) {
    pixels.push({ x: 6, y: 5, color: p.leaf });
    pixels.push({ x: 5, y: 5, color: p.leafDark });
    pixels.push({ x: 9, y: 5, color: p.leaf });
    pixels.push({ x: 10, y: 5, color: p.leafDark });
    pixels.push({ x: 7, y: 4, color: p.leaf });
    pixels.push({ x: 5, y: 7, color: wilt });
    pixels.push({ x: 10, y: 7, color: wilt });

  } else {
    pixels.push({ x: 6, y: 6, color: p.leafDark });
    pixels.push({ x: 9, y: 6, color: p.leafDark });
    pixels.push({ x: 5, y: 7, color: wilt });
    pixels.push({ x: 10, y: 7, color: wilt });
    pixels.push({ x: 7, y: 5, color: wilt });
  }

  return pixels;
}

function getAloePixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';

  // Base stem
  pixels.push({ x: 7, y: 10, color: p.stem });
  pixels.push({ x: 8, y: 10, color: p.stem });
  pixels.push({ x: 7, y: 11, color: p.stem });
  pixels.push({ x: 8, y: 11, color: p.stem });

  if (hp >= 75) {
    // Thick pointed leaves fanning out
    // Center leaves
    pixels.push({ x: 7, y: 6, color: p.leafLight });
    pixels.push({ x: 8, y: 6, color: p.leafLight });
    pixels.push({ x: 7, y: 7, color: p.leaf });
    pixels.push({ x: 8, y: 7, color: p.leaf });
    pixels.push({ x: 7, y: 8, color: p.leaf });
    pixels.push({ x: 8, y: 8, color: p.leaf });
    pixels.push({ x: 7, y: 9, color: p.leaf });
    pixels.push({ x: 8, y: 9, color: p.leaf });

    // Left leaves (thick, pointed)
    pixels.push({ x: 6, y: 7, color: p.leaf });
    pixels.push({ x: 5, y: 6, color: p.leaf });
    pixels.push({ x: 4, y: 5, color: p.leafDark });
    pixels.push({ x: 3, y: 4, color: p.leafLight });
    pixels.push({ x: 6, y: 8, color: p.leafDark });
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 4, y: 7, color: p.leaf });
    pixels.push({ x: 6, y: 9, color: p.leaf });
    pixels.push({ x: 5, y: 9, color: p.leafDark });

    // Right leaves
    pixels.push({ x: 9, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 6, color: p.leaf });
    pixels.push({ x: 11, y: 5, color: p.leafDark });
    pixels.push({ x: 12, y: 4, color: p.leafLight });
    pixels.push({ x: 9, y: 8, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leaf });
    pixels.push({ x: 11, y: 7, color: p.leaf });
    pixels.push({ x: 9, y: 9, color: p.leaf });
    pixels.push({ x: 10, y: 9, color: p.leafDark });

    // Light spots (aloe pattern)
    pixels.push({ x: 5, y: 7, color: p.leafLight });
    pixels.push({ x: 10, y: 7, color: p.leafLight });
    pixels.push({ x: 7, y: 5, color: p.leafLight });
    pixels.push({ x: 8, y: 5, color: p.leafLight });

  } else if (hp >= 50) {
    pixels.push({ x: 7, y: 7, color: p.leaf });
    pixels.push({ x: 8, y: 7, color: p.leaf });
    pixels.push({ x: 7, y: 8, color: p.leaf });
    pixels.push({ x: 8, y: 8, color: p.leaf });
    pixels.push({ x: 7, y: 9, color: p.leaf });
    pixels.push({ x: 8, y: 9, color: p.leaf });

    pixels.push({ x: 6, y: 7, color: p.leaf });
    pixels.push({ x: 5, y: 6, color: p.leafDark });
    pixels.push({ x: 4, y: 5, color: p.leafLight });
    pixels.push({ x: 9, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 6, color: p.leafDark });
    pixels.push({ x: 11, y: 5, color: p.leafLight });

    pixels.push({ x: 6, y: 8, color: p.leafDark });
    pixels.push({ x: 9, y: 8, color: p.leafDark });

  } else if (hp >= 25) {
    pixels.push({ x: 7, y: 8, color: p.leaf });
    pixels.push({ x: 8, y: 8, color: p.leaf });
    pixels.push({ x: 7, y: 9, color: p.leaf });
    pixels.push({ x: 8, y: 9, color: p.leaf });
    pixels.push({ x: 6, y: 8, color: p.leafDark });
    pixels.push({ x: 9, y: 8, color: p.leafDark });
    pixels.push({ x: 5, y: 7, color: wilt });
    pixels.push({ x: 10, y: 7, color: wilt });

  } else {
    pixels.push({ x: 7, y: 9, color: p.leafDark });
    pixels.push({ x: 8, y: 9, color: p.leafDark });
    pixels.push({ x: 6, y: 9, color: wilt });
    pixels.push({ x: 9, y: 9, color: wilt });
    pixels.push({ x: 7, y: 8, color: wilt });
    pixels.push({ x: 8, y: 8, color: wilt });
  }

  return pixels;
}

function getLilyPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';
  const lilyWhite = p.flower ?? '#FFFFFF';
  const lilyCenter = p.flowerCenter ?? '#FFF9C4';

  // Stem
  for (let y = 5; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Long leaves
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 4, y: 7, color: p.leaf });
    pixels.push({ x: 3, y: 6, color: p.leafDark });
    pixels.push({ x: 6, y: 9, color: p.leaf });
    pixels.push({ x: 10, y: 8, color: p.leaf });
    pixels.push({ x: 11, y: 7, color: p.leaf });
    pixels.push({ x: 12, y: 6, color: p.leafDark });
    pixels.push({ x: 9, y: 9, color: p.leaf });
    pixels.push({ x: 6, y: 7, color: p.leafLight });
    pixels.push({ x: 9, y: 7, color: p.leafLight });

    // Trumpet-shaped flower
    // Petals flaring out
    pixels.push({ x: 5, y: 2, color: lilyWhite });
    pixels.push({ x: 6, y: 1, color: lilyWhite });
    pixels.push({ x: 7, y: 1, color: lilyWhite });
    pixels.push({ x: 8, y: 1, color: lilyWhite });
    pixels.push({ x: 9, y: 1, color: lilyWhite });
    pixels.push({ x: 10, y: 2, color: lilyWhite });
    pixels.push({ x: 6, y: 2, color: lilyWhite });
    pixels.push({ x: 9, y: 2, color: lilyWhite });
    // Throat
    pixels.push({ x: 7, y: 2, color: lilyCenter });
    pixels.push({ x: 8, y: 2, color: lilyCenter });
    pixels.push({ x: 7, y: 3, color: lilyWhite });
    pixels.push({ x: 8, y: 3, color: lilyWhite });
    pixels.push({ x: 7, y: 4, color: p.leafDark });
    pixels.push({ x: 8, y: 4, color: p.leafDark });

    // Stamens
    pixels.push({ x: 7, y: 0, color: lilyCenter });
    pixels.push({ x: 8, y: 0, color: lilyCenter });

  } else if (hp >= 50) {
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 4, y: 7, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leaf });
    pixels.push({ x: 11, y: 7, color: p.leafDark });

    // Smaller flower
    pixels.push({ x: 6, y: 2, color: lilyWhite });
    pixels.push({ x: 7, y: 2, color: lilyCenter });
    pixels.push({ x: 8, y: 2, color: lilyCenter });
    pixels.push({ x: 9, y: 2, color: lilyWhite });
    pixels.push({ x: 7, y: 3, color: lilyWhite });
    pixels.push({ x: 8, y: 3, color: lilyWhite });
    pixels.push({ x: 7, y: 4, color: p.leafDark });

  } else if (hp >= 25) {
    pixels.push({ x: 5, y: 8, color: p.leafDark });
    pixels.push({ x: 10, y: 8, color: p.leafDark });
    pixels.push({ x: 7, y: 3, color: wilt });
    pixels.push({ x: 8, y: 3, color: wilt });
    pixels.push({ x: 7, y: 4, color: p.leafDark });

  } else {
    pixels.push({ x: 6, y: 7, color: wilt });
    pixels.push({ x: 9, y: 7, color: wilt });
    pixels.push({ x: 7, y: 4, color: wilt });
    pixels.push({ x: 8, y: 5, color: wilt });
  }

  return pixels;
}

function getPalmPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';
  const trunk = '#8B6914';
  const trunkDark = '#6B5010';

  // Thick trunk
  for (let y = 6; y <= 11; y++) {
    pixels.push({ x: 7, y, color: trunk });
    pixels.push({ x: 8, y, color: trunkDark });
  }
  // Trunk texture
  pixels.push({ x: 7, y: 7, color: trunkDark });
  pixels.push({ x: 8, y: 8, color: trunk });
  pixels.push({ x: 7, y: 9, color: trunkDark });

  if (hp >= 75) {
    // Crown - fan leaves spreading out
    // Left drooping fronds
    pixels.push({ x: 6, y: 5, color: p.leaf });
    pixels.push({ x: 5, y: 4, color: p.leaf });
    pixels.push({ x: 4, y: 3, color: p.leaf });
    pixels.push({ x: 3, y: 3, color: p.leafDark });
    pixels.push({ x: 2, y: 4, color: p.leafDark });
    pixels.push({ x: 3, y: 4, color: p.leaf });
    pixels.push({ x: 4, y: 5, color: p.leafLight });
    pixels.push({ x: 5, y: 5, color: p.leaf });

    // Right drooping fronds
    pixels.push({ x: 9, y: 5, color: p.leaf });
    pixels.push({ x: 10, y: 4, color: p.leaf });
    pixels.push({ x: 11, y: 3, color: p.leaf });
    pixels.push({ x: 12, y: 3, color: p.leafDark });
    pixels.push({ x: 13, y: 4, color: p.leafDark });
    pixels.push({ x: 12, y: 4, color: p.leaf });
    pixels.push({ x: 11, y: 5, color: p.leafLight });
    pixels.push({ x: 10, y: 5, color: p.leaf });

    // Top fronds
    pixels.push({ x: 6, y: 3, color: p.leaf });
    pixels.push({ x: 7, y: 2, color: p.leaf });
    pixels.push({ x: 8, y: 2, color: p.leaf });
    pixels.push({ x: 9, y: 3, color: p.leaf });
    pixels.push({ x: 7, y: 1, color: p.leafDark });
    pixels.push({ x: 8, y: 1, color: p.leafLight });
    pixels.push({ x: 6, y: 2, color: p.leafLight });
    pixels.push({ x: 9, y: 2, color: p.leafDark });

    // Crown center
    pixels.push({ x: 7, y: 4, color: p.leafDark });
    pixels.push({ x: 8, y: 4, color: p.leafDark });
    pixels.push({ x: 7, y: 5, color: p.leaf });
    pixels.push({ x: 8, y: 5, color: p.leaf });

  } else if (hp >= 50) {
    pixels.push({ x: 6, y: 4, color: p.leaf });
    pixels.push({ x: 5, y: 3, color: p.leaf });
    pixels.push({ x: 4, y: 3, color: p.leafDark });
    pixels.push({ x: 3, y: 4, color: p.leafDark });

    pixels.push({ x: 9, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 3, color: p.leaf });
    pixels.push({ x: 11, y: 3, color: p.leafDark });
    pixels.push({ x: 12, y: 4, color: p.leafDark });

    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 3, color: p.leaf });
    pixels.push({ x: 7, y: 4, color: p.leafDark });
    pixels.push({ x: 8, y: 4, color: p.leaf });
    pixels.push({ x: 7, y: 5, color: p.leaf });
    pixels.push({ x: 8, y: 5, color: p.leafDark });

  } else if (hp >= 25) {
    pixels.push({ x: 5, y: 4, color: p.leafDark });
    pixels.push({ x: 6, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 4, color: p.leaf });
    pixels.push({ x: 11, y: 4, color: p.leafDark });
    pixels.push({ x: 7, y: 4, color: p.leaf });
    pixels.push({ x: 8, y: 4, color: p.leafDark });
    pixels.push({ x: 7, y: 5, color: p.leaf });
    pixels.push({ x: 8, y: 5, color: wilt });

  } else {
    pixels.push({ x: 6, y: 5, color: wilt });
    pixels.push({ x: 9, y: 5, color: wilt });
    pixels.push({ x: 7, y: 4, color: wilt });
    pixels.push({ x: 8, y: 4, color: wilt });
    pixels.push({ x: 7, y: 5, color: p.leafDark });
    pixels.push({ x: 8, y: 5, color: p.leafDark });
  }

  return pixels;
}

function getIvyPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';

  // Base at pot
  pixels.push({ x: 7, y: 10, color: p.stem });
  pixels.push({ x: 8, y: 10, color: p.stem });
  pixels.push({ x: 7, y: 11, color: p.stem });
  pixels.push({ x: 8, y: 11, color: p.stem });

  // Small leaf helper (3px)
  const smallLeaf = (cx: number, cy: number, main: string, dark: string) => {
    pixels.push({ x: cx, y: cy, color: main });
    pixels.push({ x: cx - 1, y: cy, color: dark });
    pixels.push({ x: cx, y: cy - 1, color: dark });
  };

  if (hp >= 75) {
    // Vine going up and left
    pixels.push({ x: 7, y: 9, color: p.stem });
    pixels.push({ x: 6, y: 8, color: p.stem });
    pixels.push({ x: 5, y: 7, color: p.stem });
    pixels.push({ x: 4, y: 6, color: p.stem });
    pixels.push({ x: 3, y: 5, color: p.stem });

    // Vine going up and right
    pixels.push({ x: 8, y: 9, color: p.stem });
    pixels.push({ x: 9, y: 8, color: p.stem });
    pixels.push({ x: 10, y: 7, color: p.stem });
    pixels.push({ x: 11, y: 6, color: p.stem });
    pixels.push({ x: 12, y: 5, color: p.stem });

    // Hanging vine left
    pixels.push({ x: 6, y: 9, color: p.stem });
    pixels.push({ x: 5, y: 10, color: p.stem });
    pixels.push({ x: 4, y: 11, color: p.stem });

    // Hanging vine right
    pixels.push({ x: 9, y: 9, color: p.stem });
    pixels.push({ x: 10, y: 10, color: p.stem });
    pixels.push({ x: 11, y: 11, color: p.stem });

    // Leaves along vines
    smallLeaf(5, 6, p.leaf, p.leafDark);
    smallLeaf(3, 4, p.leaf, p.leafDark);
    smallLeaf(11, 5, p.leaf, p.leafDark);
    smallLeaf(13, 4, p.leafLight, p.leafDark);
    smallLeaf(4, 10, p.leaf, p.leafDark);
    smallLeaf(11, 10, p.leaf, p.leafDark);
    smallLeaf(7, 8, p.leafLight, p.leaf);
    smallLeaf(8, 7, p.leafLight, p.leaf);

    // Top spray
    pixels.push({ x: 6, y: 4, color: p.leaf });
    pixels.push({ x: 7, y: 3, color: p.leafLight });
    pixels.push({ x: 9, y: 4, color: p.leaf });
    pixels.push({ x: 8, y: 3, color: p.leafDark });

  } else if (hp >= 50) {
    pixels.push({ x: 7, y: 9, color: p.stem });
    pixels.push({ x: 6, y: 8, color: p.stem });
    pixels.push({ x: 5, y: 7, color: p.stem });
    pixels.push({ x: 8, y: 9, color: p.stem });
    pixels.push({ x: 9, y: 8, color: p.stem });
    pixels.push({ x: 10, y: 7, color: p.stem });

    smallLeaf(5, 6, p.leaf, p.leafDark);
    smallLeaf(10, 6, p.leaf, p.leafDark);
    smallLeaf(7, 7, p.leafLight, p.leaf);

    pixels.push({ x: 7, y: 5, color: p.leaf });
    pixels.push({ x: 8, y: 5, color: p.leafDark });

  } else if (hp >= 25) {
    pixels.push({ x: 7, y: 9, color: p.stem });
    pixels.push({ x: 6, y: 8, color: p.stem });
    pixels.push({ x: 9, y: 8, color: p.stem });

    smallLeaf(6, 7, p.leafDark, wilt);
    smallLeaf(9, 7, p.leafDark, wilt);
    pixels.push({ x: 7, y: 6, color: p.leaf });

  } else {
    pixels.push({ x: 7, y: 9, color: wilt });
    pixels.push({ x: 6, y: 8, color: wilt });
    pixels.push({ x: 9, y: 8, color: wilt });
    pixels.push({ x: 7, y: 7, color: wilt });
    pixels.push({ x: 8, y: 7, color: wilt });
  }

  return pixels;
}

function getBonsaiPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];
  const wilt = '#795548';
  const trunk = '#8B6914';
  const trunkDark = '#6B5010';

  // Curved trunk - leans to right
  pixels.push({ x: 7, y: 11, color: trunk });
  pixels.push({ x: 8, y: 11, color: trunkDark });
  pixels.push({ x: 7, y: 10, color: trunk });
  pixels.push({ x: 8, y: 10, color: trunkDark });
  pixels.push({ x: 7, y: 9, color: trunk });
  pixels.push({ x: 8, y: 9, color: trunkDark });
  pixels.push({ x: 8, y: 8, color: trunk });
  pixels.push({ x: 9, y: 8, color: trunkDark });
  pixels.push({ x: 9, y: 7, color: trunk });
  pixels.push({ x: 10, y: 7, color: trunkDark });
  pixels.push({ x: 9, y: 6, color: trunk });
  pixels.push({ x: 10, y: 6, color: trunkDark });

  // Branch left
  pixels.push({ x: 7, y: 8, color: trunk });
  pixels.push({ x: 6, y: 7, color: trunk });
  pixels.push({ x: 5, y: 6, color: trunkDark });

  if (hp >= 75) {
    // Dense crown - right cluster
    for (let x = 8; x <= 13; x++) pixels.push({ x, y: 4, color: p.leafDark });
    for (let x = 7; x <= 13; x++) pixels.push({ x, y: 5, color: p.leaf });
    pixels.push({ x: 8, y: 5, color: p.leafLight });
    pixels.push({ x: 12, y: 5, color: p.leafLight });
    for (let x = 8; x <= 12; x++) pixels.push({ x, y: 3, color: p.leafDark });
    pixels.push({ x: 10, y: 2, color: p.leaf });
    pixels.push({ x: 11, y: 2, color: p.leafDark });
    pixels.push({ x: 9, y: 3, color: p.leafLight });

    // Left branch crown
    for (let x = 3; x <= 7; x++) pixels.push({ x, y: 5, color: p.leaf });
    for (let x = 3; x <= 7; x++) pixels.push({ x, y: 6, color: p.leafDark });
    pixels.push({ x: 4, y: 4, color: p.leaf });
    pixels.push({ x: 5, y: 4, color: p.leaf });
    pixels.push({ x: 6, y: 4, color: p.leafDark });
    pixels.push({ x: 4, y: 5, color: p.leafLight });
    pixels.push({ x: 6, y: 5, color: p.leafDark });

  } else if (hp >= 50) {
    // Thinner crown
    for (let x = 8; x <= 12; x++) pixels.push({ x, y: 4, color: p.leaf });
    for (let x = 8; x <= 12; x++) pixels.push({ x, y: 5, color: p.leafDark });
    pixels.push({ x: 10, y: 3, color: p.leaf });
    pixels.push({ x: 11, y: 3, color: p.leafDark });

    for (let x = 4; x <= 7; x++) pixels.push({ x, y: 5, color: p.leaf });
    for (let x = 4; x <= 7; x++) pixels.push({ x, y: 6, color: p.leafDark });
    pixels.push({ x: 5, y: 4, color: p.leaf });

  } else if (hp >= 25) {
    // Sparse
    pixels.push({ x: 9, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 4, color: p.leaf });
    pixels.push({ x: 11, y: 4, color: p.leafDark });
    pixels.push({ x: 9, y: 5, color: p.leafDark });
    pixels.push({ x: 10, y: 5, color: p.leaf });
    pixels.push({ x: 11, y: 5, color: wilt });

    pixels.push({ x: 5, y: 5, color: p.leaf });
    pixels.push({ x: 6, y: 5, color: p.leafDark });
    pixels.push({ x: 5, y: 6, color: wilt });

  } else {
    // Bare
    pixels.push({ x: 10, y: 5, color: p.leafDark });
    pixels.push({ x: 11, y: 5, color: wilt });
    pixels.push({ x: 5, y: 6, color: wilt });
    pixels.push({ x: 6, y: 6, color: wilt });
    pixels.push({ x: 9, y: 4, color: wilt });
  }

  return pixels;
}

function getDefaultPixels(hp: number, p: Palette): Pixel[] {
  const pixels: Pixel[] = [];

  // Main stem
  for (let y = 5; y <= 11; y++) {
    pixels.push({ x: 7, y, color: p.stem });
    pixels.push({ x: 8, y, color: p.stem });
  }

  if (hp >= 75) {
    // Left leaf pair
    pixels.push({ x: 4, y: 5, color: p.leaf });
    pixels.push({ x: 5, y: 5, color: p.leaf });
    pixels.push({ x: 5, y: 4, color: p.leafDark });
    pixels.push({ x: 6, y: 5, color: p.leaf });
    pixels.push({ x: 6, y: 4, color: p.leafLight });
    pixels.push({ x: 4, y: 6, color: p.leafLight });
    pixels.push({ x: 5, y: 6, color: p.leaf });

    // Right leaf pair
    pixels.push({ x: 9, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 3, color: p.leafDark });
    pixels.push({ x: 11, y: 4, color: p.leafLight });
    pixels.push({ x: 9, y: 3, color: p.leaf });
    pixels.push({ x: 11, y: 5, color: p.leaf });
    pixels.push({ x: 10, y: 5, color: p.leaf });

    // Top leaf
    pixels.push({ x: 6, y: 3, color: p.leaf });
    pixels.push({ x: 7, y: 2, color: p.leaf });
    pixels.push({ x: 8, y: 2, color: p.leafDark });
    pixels.push({ x: 9, y: 3, color: p.leafLight });
    pixels.push({ x: 7, y: 3, color: p.leafLight });
    pixels.push({ x: 8, y: 3, color: p.leaf });

    // Flower
    if (p.flower) {
      pixels.push({ x: 7, y: 1, color: p.flower });
      pixels.push({ x: 8, y: 1, color: p.flower });
      if (p.flowerCenter) pixels.push({ x: 7, y: 0, color: p.flowerCenter });
    }

    // Lower left leaf
    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 6, y: 8, color: p.leafDark });
    pixels.push({ x: 4, y: 8, color: p.leafLight });

    // Lower right leaf
    pixels.push({ x: 9, y: 7, color: p.leaf });
    pixels.push({ x: 10, y: 7, color: p.leaf });
    pixels.push({ x: 11, y: 7, color: p.leafDark });

  } else if (hp >= 50) {
    pixels.push({ x: 5, y: 5, color: p.leaf });
    pixels.push({ x: 6, y: 5, color: p.leafDark });
    pixels.push({ x: 5, y: 4, color: p.leaf });

    pixels.push({ x: 9, y: 4, color: p.leaf });
    pixels.push({ x: 10, y: 4, color: p.leafDark });
    pixels.push({ x: 10, y: 5, color: p.leaf });

    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 3, color: p.leafDark });
    pixels.push({ x: 7, y: 2, color: p.leafLight });

    if (p.flower) {
      pixels.push({ x: 7, y: 1, color: p.flower });
    }

    pixels.push({ x: 5, y: 8, color: p.leaf });
    pixels.push({ x: 10, y: 7, color: p.leaf });

  } else if (hp >= 25) {
    pixels.push({ x: 6, y: 5, color: p.leaf });
    pixels.push({ x: 5, y: 5, color: p.leafDark });
    pixels.push({ x: 9, y: 5, color: p.leaf });
    pixels.push({ x: 7, y: 3, color: p.leaf });
    pixels.push({ x: 8, y: 4, color: p.leafDark });
    pixels.push({ x: 10, y: 7, color: '#795548' });

  } else {
    pixels.push({ x: 6, y: 5, color: p.leaf });
    pixels.push({ x: 9, y: 6, color: p.leafDark });
    pixels.push({ x: 7, y: 4, color: '#795548' });
    pixels.push({ x: 10, y: 7, color: '#795548' });
    pixels.push({ x: 5, y: 6, color: '#795548' });
  }

  return pixels;
}

function getPixels(type: PlantType, hp: number, palette: Palette): Pixel[] {
  switch (type) {
    case 'pothos': return getPothosPixels(hp, palette);
    case 'moneyTree': return getMoneyTreePixels(hp, palette);
    case 'cactus': return getCactusPixels(hp, palette);
    case 'jasmine': return getJasminePixels(hp, palette);
    case 'succulent': return getSucculentPixels(hp, palette);
    case 'orchid': return getOrchidPixels(hp, palette);
    case 'rose': return getRosePixels(hp, palette);
    case 'sunflower': return getSunflowerPixels(hp, palette);
    case 'bamboo': return getBambooPixels(hp, palette);
    case 'fern': return getFernPixels(hp, palette);
    case 'aloe': return getAloePixels(hp, palette);
    case 'lily': return getLilyPixels(hp, palette);
    case 'palm': return getPalmPixels(hp, palette);
    case 'ivy': return getIvyPixels(hp, palette);
    case 'bonsai': return getBonsaiPixels(hp, palette);
    default: return getDefaultPixels(hp, palette);
  }
}

export default function PixelPlant({ hp, size = 80, species }: PixelPlantProps) {
  const type = getPlantType(species);
  const palette = getPalette(hp);
  const plantPixels = getPixels(type, hp, palette);
  const potPixels = getPotPixels(hp);
  const face = getFace(hp);

  const isHealthy = hp >= 75;
  const droopAngle = hp < 25 ? 8 : hp < 50 ? 3 : 0;
  const droopY = hp < 25 ? 1 : hp < 50 ? 0.5 : 0;

  const animationCSS = `
    @keyframes sway {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(2deg); }
    }
  `;

  const plantGroupStyle: React.CSSProperties = isHealthy
    ? {
        animation: 'sway 3s ease-in-out infinite',
        transformOrigin: '8px 11px',
      }
    : {
        transform: `rotate(${droopAngle}deg) translateY(${droopY}px)`,
        transformOrigin: '8px 11px',
        transition: 'transform 0.6s ease',
      };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ display: 'block', margin: '0 auto' }}
      shapeRendering="crispEdges"
    >
      <style>{animationCSS}</style>

      {/* Pot (always rendered beneath) */}
      {potPixels.map((px, i) => (
        <rect
          key={`pot-${i}`}
          x={px.x}
          y={px.y}
          width={1}
          height={1}
          fill={px.color}
        />
      ))}

      {/* Plant body with sway or droop */}
      <g style={plantGroupStyle}>
        {plantPixels.map((px, i) => (
          <rect
            key={`plant-${i}`}
            x={px.x}
            y={px.y}
            width={1}
            height={1}
            fill={px.color}
          />
        ))}
      </g>

      {/* Face on pot */}
      <text
        x="8"
        y="14.5"
        textAnchor="middle"
        fontSize="2"
        fontFamily="'Courier New', monospace"
        fill="rgba(255,255,255,0.75)"
      >
        {face}
      </text>
    </svg>
  );
}
