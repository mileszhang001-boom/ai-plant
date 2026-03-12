import { useReducer, useEffect, useCallback, createContext, useContext, useRef, type Dispatch } from 'react';
import type { AppState, AppAction, PageName, Plant } from './types';
import { T, E, FONTS } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { fetchPlants, fetchScanRecords, upsertPlant, insertScanRecord } from './services/supabaseStorageService';
import PlantListPage from './pages/PlantListPage';
import PlantDetailPage from './pages/PlantDetailPage';
import AlbumPage from './pages/AlbumPage';
import CameraPage from './pages/CameraPage';
import AnalyzingPage from './pages/AnalyzingPage';
import MatchConfirmPage from './pages/MatchConfirmPage';
import CreatePlantPage from './pages/CreatePlantPage';
import AuthPage from './pages/AuthPage';

// ===== Hash Routing Helpers =====
const PAGE_ROUTES: PageName[] = ['list', 'detail', 'album', 'camera', 'analyzing', 'match', 'create'];

function parseHash(): { page: PageName; plantId: string | null } {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return { page: 'list', plantId: null };

  const [pagePart, idPart] = hash.split('/');
  const page = PAGE_ROUTES.includes(pagePart as PageName) ? (pagePart as PageName) : 'list';
  return { page, plantId: idPart || null };
}

function pushHash(page: PageName, plantId?: string | null) {
  const hash = plantId ? `#${page}/${plantId}` : `#${page}`;
  if (window.location.hash !== hash) {
    window.history.pushState(null, '', hash);
  }
}

// ===== Initial State =====
function getInitialState(): AppState {
  const { page, plantId } = parseHash();
  return {
    plants: [],
    scanRecords: [],
    currentPage: page,
    selectedPlantId: plantId,
    pendingScan: null,
    dataLoading: true,
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

    case 'SET_DATA_LOADING':
      return { ...state, dataLoading: action.loading };

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

  if (state.dataLoading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        <div style={{ fontSize: 36 }}>{E.seedling}</div>
        <div style={{
          fontSize: 12,
          color: T.text3,
          fontFamily: FONTS.pixel,
          letterSpacing: 2,
        }}>
          LOADING...
        </div>
      </div>
    );
  }

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

// ===== Main App (wrapped in auth) =====
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const skipHashSync = useRef(false);
  const prevPlantsRef = useRef<Plant[]>([]);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    async function loadData() {
      try {
        const [plants, scans] = await Promise.all([
          fetchPlants(),
          fetchScanRecords(),
        ]);
        if (cancelled) return;
        dispatch({ type: 'SET_PLANTS', plants });
        dispatch({ type: 'SET_SCAN_RECORDS', records: scans });
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        if (!cancelled) dispatch({ type: 'SET_DATA_LOADING', loading: false });
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Persist plant changes to Supabase (fire-and-forget)
  useEffect(() => {
    if (state.dataLoading || !user) return;
    const prev = prevPlantsRef.current;
    // Find changed plants
    for (const plant of state.plants) {
      const old = prev.find(p => p.id === plant.id);
      if (!old || JSON.stringify(old) !== JSON.stringify(plant)) {
        upsertPlant(plant).catch(err => console.error('Failed to save plant:', err));
      }
    }
    prevPlantsRef.current = state.plants;
  }, [state.plants, state.dataLoading, user]);

  // Persist new scan records to Supabase
  useEffect(() => {
    if (state.dataLoading || !user) return;
    // When a scan record is added, the last one is the newest
    const latest = state.scanRecords[state.scanRecords.length - 1];
    if (latest && latest.id) {
      insertScanRecord(latest).catch(err => {
        // Ignore duplicate key errors (record already saved)
        if (!String(err).includes('duplicate')) {
          console.error('Failed to save scan record:', err);
        }
      });
    }
  }, [state.scanRecords.length, state.dataLoading, user]);

  // Sync state → hash
  useEffect(() => {
    if (skipHashSync.current) {
      skipHashSync.current = false;
      return;
    }
    const plantId = (state.currentPage === 'detail' || state.currentPage === 'album')
      ? state.selectedPlantId
      : null;
    pushHash(state.currentPage, plantId);
  }, [state.currentPage, state.selectedPlantId]);

  // Listen to browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const { page, plantId } = parseHash();
      skipHashSync.current = true;
      if (plantId) {
        dispatch({ type: 'SELECT_PLANT', id: plantId });
        if (page === 'album') {
          dispatch({ type: 'NAVIGATE', page: 'album' });
        }
      } else {
        dispatch({ type: 'NAVIGATE', page });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((page: PageName) => {
    dispatch({ type: 'NAVIGATE', page });
  }, []);

  // Show auth page if not logged in
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: T.bg,
        fontFamily: FONTS.body,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 36 }}>{E.seedling}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: T.bg,
        fontFamily: FONTS.body,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}>
        <div style={{ width: '100%', maxWidth: 393 }}>
          <AuthPage />
        </div>
      </div>
    );
  }

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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
