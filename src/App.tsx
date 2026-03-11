import { useReducer, useEffect, createContext, useContext, type Dispatch } from 'react';
import type { AppState, AppAction, PageName, Plant, ScanRecord } from './types';
import { T, E, FONTS } from './theme';
import { loadPlants, savePlants, loadScanRecords, saveScanRecords } from './services/storageService';
import PlantListPage from './pages/PlantListPage';
import PlantDetailPage from './pages/PlantDetailPage';
import AlbumPage from './pages/AlbumPage';
import CameraPage from './pages/CameraPage';
import AnalyzingPage from './pages/AnalyzingPage';
import MatchConfirmPage from './pages/MatchConfirmPage';
import CreatePlantPage from './pages/CreatePlantPage';

// ===== Mock Data =====
const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

const MOCK_PLANTS: Plant[] = [
  {
    id: 'gl',
    species: '绿萝',
    fun_name: '小绿同学',
    personality: '好养活的入门级植物',
    current_hp: 78,
    current_metrics: { water: 45, light: 82, nutrition: 65, pest: 95 },
    current_action: { type: 'water', label: '该浇水啦', icon: E.drop },
    created_at: now - 7 * DAY,
    last_scanned_at: now - 3 * HOUR,
  },
  {
    id: 'fc',
    species: '发财树',
    fun_name: '小小发财树',
    personality: '希望带来好运的吉祥物',
    current_hp: 52,
    current_metrics: { water: 38, light: 60, nutrition: 42, pest: 80 },
    current_action: { type: 'light', label: '让我晒晒太阳', icon: E.sun },
    created_at: now - 10 * DAY,
    last_scanned_at: now - 4 * DAY,
  },
  {
    id: 'xr',
    species: '仙人掌',
    fun_name: '删刺勇士',
    personality: '戒备！我会扎人的',
    current_hp: 91,
    current_metrics: { water: 90, light: 95, nutrition: 85, pest: 98 },
    current_action: { type: 'none', label: '状态很好，不用管我~', icon: E.sparkle },
    created_at: now - 5 * DAY,
    last_scanned_at: now - 1 * HOUR,
  },
  {
    id: 'ml',
    species: '茉莉花',
    fun_name: '香香小公主',
    personality: '全办公室最香的存在',
    current_hp: 33,
    current_metrics: { water: 20, light: 45, nutrition: 30, pest: 40 },
    current_action: { type: 'pest', label: '发现可疑斑点，检查叶片!', icon: E.bug },
    created_at: now - 8 * DAY,
    last_scanned_at: now - 5 * DAY,
  },
  {
    id: 'dr',
    species: '多肉植物',
    fun_name: '胖嘟嘟多肉',
    personality: '圆滚滚胖乎乎的可爱担当',
    current_hp: 15,
    current_metrics: { water: 10, light: 25, nutrition: 12, pest: 70 },
    current_action: { type: 'water', label: '快救救我!!', icon: E.drop },
    created_at: now - 9 * DAY,
    last_scanned_at: now - 7 * DAY,
  },
];

const MOCK_SCAN_RECORDS: ScanRecord[] = [
  // 小绿同学
  { id: 'sr1', plant_id: 'gl', hp: 26, metrics: { water: 20, light: 40, nutrition: 30, pest: 90 }, scanned_at: now - 7 * DAY },
  { id: 'sr2', plant_id: 'gl', hp: 52, metrics: { water: 35, light: 65, nutrition: 50, pest: 92 }, scanned_at: now - 4 * DAY },
  { id: 'sr3', plant_id: 'gl', hp: 78, metrics: { water: 45, light: 82, nutrition: 65, pest: 95 }, scanned_at: now - 3 * HOUR },
  // 发财树
  { id: 'sr4', plant_id: 'fc', hp: 48, metrics: { water: 40, light: 55, nutrition: 45, pest: 82 }, scanned_at: now - 10 * DAY },
  { id: 'sr5', plant_id: 'fc', hp: 52, metrics: { water: 38, light: 60, nutrition: 42, pest: 80 }, scanned_at: now - 4 * DAY },
  // 仙人掌
  { id: 'sr6', plant_id: 'xr', hp: 88, metrics: { water: 85, light: 92, nutrition: 80, pest: 96 }, scanned_at: now - 5 * DAY },
  { id: 'sr7', plant_id: 'xr', hp: 91, metrics: { water: 90, light: 95, nutrition: 85, pest: 98 }, scanned_at: now - 1 * HOUR },
  // 茉莉花
  { id: 'sr8', plant_id: 'ml', hp: 41, metrics: { water: 30, light: 50, nutrition: 38, pest: 50 }, scanned_at: now - 8 * DAY },
  { id: 'sr9', plant_id: 'ml', hp: 33, metrics: { water: 20, light: 45, nutrition: 30, pest: 40 }, scanned_at: now - 5 * DAY },
  // 多肉
  { id: 'sr10', plant_id: 'dr', hp: 22, metrics: { water: 18, light: 30, nutrition: 20, pest: 75 }, scanned_at: now - 9 * DAY },
  { id: 'sr11', plant_id: 'dr', hp: 15, metrics: { water: 10, light: 25, nutrition: 12, pest: 70 }, scanned_at: now - 7 * DAY },
];

// ===== Initial State =====
function getInitialState(): AppState {
  const savedPlants = loadPlants();
  const savedScans = loadScanRecords();
  // Use saved data if available, otherwise use mock data for first launch
  const plants = savedPlants.length > 0 ? savedPlants : MOCK_PLANTS;
  const scanRecords = savedScans.length > 0 ? savedScans : MOCK_SCAN_RECORDS;
  return {
    plants,
    scanRecords,
    currentPage: 'list',
    selectedPlantId: null,
    pendingScan: null,
  };
}

const initialState: AppState = getInitialState();

// ===== Reducer =====
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentPage: action.page };

    case 'SELECT_PLANT':
      return { ...state, selectedPlantId: action.id, currentPage: 'detail' };

    case 'ADD_PLANT':
      return {
        ...state,
        plants: [...state.plants, action.plant],
        selectedPlantId: action.plant.id,
        currentPage: 'detail',
      };

    case 'UPDATE_PLANT_HP':
      return {
        ...state,
        plants: state.plants.map((p) =>
          p.id === action.id
            ? {
                ...p,
                current_hp: action.scan.hp,
                current_metrics: action.scan.metrics,
                last_scanned_at: action.scan.scanned_at,
                ...(action.action ? { current_action: action.action } : {}),
              }
            : p
        ),
        scanRecords: [...state.scanRecords, action.scan],
        selectedPlantId: action.id,
        currentPage: 'detail',
      };

    case 'COMPLETE_ACTION':
      return {
        ...state,
        plants: state.plants.map((p) =>
          p.id === action.id
            ? { ...p, current_hp: Math.min(100, p.current_hp + 5) }
            : p
        ),
      };

    case 'SET_PENDING_SCAN':
      return { ...state, pendingScan: action.scan };

    case 'SET_PLANTS':
      return { ...state, plants: action.plants };

    case 'SET_SCAN_RECORDS':
      return { ...state, scanRecords: action.records };

    case 'ADD_SCAN_RECORD':
      return { ...state, scanRecords: [...state.scanRecords, action.record] };

    default:
      return state;
  }
}

// ===== Context =====
interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  navigate: (page: PageName) => void;
}

export const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
  navigate: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

// ===== Page Router =====
function PageRouter() {
  const { state } = useApp();

  switch (state.currentPage) {
    case 'list':
      return <PlantListPage />;
    case 'detail':
      return <PlantDetailPage />;
    case 'album':
      return <AlbumPage />;
    case 'camera':
      return <CameraPage />;
    case 'analyzing':
      return <AnalyzingPage />;
    case 'match':
      return <MatchConfirmPage />;
    case 'create':
      return <CreatePlantPage />;
    default:
      return <PlantListPage />;
  }
}

// ===== App Component =====
export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Persist plants and scan records to localStorage on change
  useEffect(() => {
    savePlants(state.plants);
  }, [state.plants]);

  useEffect(() => {
    saveScanRecords(state.scanRecords);
  }, [state.scanRecords]);

  const navigate = (page: PageName) => {
    dispatch({ type: 'NAVIGATE', page });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, navigate }}>
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          fontFamily: FONTS.body,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 393,
            minHeight: '100vh',
            background: T.bg,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PageRouter />
        </div>
      </div>
    </AppContext.Provider>
  );
}
