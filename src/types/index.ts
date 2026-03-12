// ===== Metric Types =====
export interface MetricValue {
  value: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface Metrics {
  water: MetricValue;
  light: MetricValue;
  nutrition: MetricValue;
  pest: MetricValue;
}

export interface SimpleMetrics {
  water: number;
  light: number;
  nutrition: number;
  pest: number;
}

// ===== Action Types =====
export interface PlantAction {
  type: 'water' | 'light' | 'nutrition' | 'pest' | 'none';
  label: string;
  icon: string;
  urgency?: 'high' | 'medium' | 'low';
}

// ===== Plant Entity =====
export interface Plant {
  id: string;
  species: string;
  fun_name: string;
  personality: string;
  current_hp: number;
  current_metrics: SimpleMetrics;
  current_action: PlantAction;
  created_at: number;
  last_scanned_at: number;
}

// ===== Scan Record =====
export interface ScanRecord {
  id: string;
  plant_id: string;
  photo_data?: string; // stored separately in IndexedDB
  hp: number;
  metrics: SimpleMetrics;
  scanned_at: number;
  ai_raw_response?: AIResult;
}

// ===== Match Log =====
export interface MatchLog {
  id: string;
  scan_id: string;
  ai_suggestion: string | null;
  ai_confidence: number;
  user_confirmed: string | null;
  is_new_plant: boolean;
}

// ===== AI Response =====
export interface AIResult {
  species: string;
  species_confidence: number;
  fun_name?: string;
  personality?: string;
  hp: number;
  metrics: Metrics;
  primary_action: {
    type: string;
    label: string;
    urgency: string;
  };
  diagnosis_summary: string;
}

// ===== Pending Scan (in-flight data between pages) =====
export interface PendingScan {
  photoBase64: string;
  aiResult: AIResult | null;
  matchResults: MatchResult[];
  targetPlantId: string | null; // if updating existing plant
}

export interface MatchResult {
  plantId: string;
  confidence: number;
}

// ===== App State =====
export type PageName =
  | 'list'
  | 'detail'
  | 'album'
  | 'camera'
  | 'analyzing'
  | 'match'
  | 'create';

export interface AppState {
  plants: Plant[];
  scanRecords: ScanRecord[];
  currentPage: PageName;
  selectedPlantId: string | null;
  pendingScan: PendingScan | null;
  dataLoading: boolean;
}

export type AppAction =
  | { type: 'NAVIGATE'; page: PageName }
  | { type: 'SELECT_PLANT'; id: string }
  | { type: 'ADD_PLANT'; plant: Plant }
  | { type: 'UPDATE_PLANT_HP'; id: string; scan: ScanRecord; action?: PlantAction }
  | { type: 'COMPLETE_ACTION'; id: string }
  | { type: 'SET_PENDING_SCAN'; scan: PendingScan | null }
  | { type: 'SET_PLANTS'; plants: Plant[] }
  | { type: 'SET_SCAN_RECORDS'; records: ScanRecord[] }
  | { type: 'ADD_SCAN_RECORD'; record: ScanRecord }
  | { type: 'SET_DATA_LOADING'; loading: boolean };
