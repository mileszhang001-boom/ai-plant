import type { Plant, ScanRecord, MatchLog } from '../types';

const STORAGE_KEYS = {
  PLANTS: 'plantos_plants',
  SCAN_RECORDS: 'plantos_scans',
  MATCH_LOGS: 'plantos_match_logs',
} as const;

const MAX_SCAN_RECORDS = 50;
const STORAGE_WARN_SIZE = 4 * 1024 * 1024; // 4MB

function safeSetItem(key: string, data: unknown): boolean {
  try {
    const json = JSON.stringify(data);
    if (json.length > STORAGE_WARN_SIZE) {
      console.warn('Storage approaching limit, pruning old scans...');
      pruneOldScans();
    }
    localStorage.setItem(key, json);
    return true;
  } catch (e) {
    console.error('Storage write failed:', e);
    return false;
  }
}

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ===== Plants =====

export function loadPlants(): Plant[] {
  return safeGetItem<Plant[]>(STORAGE_KEYS.PLANTS, []);
}

export function savePlants(plants: Plant[]): boolean {
  return safeSetItem(STORAGE_KEYS.PLANTS, plants);
}

// ===== Scan Records =====

export function loadScanRecords(): ScanRecord[] {
  return safeGetItem<ScanRecord[]>(STORAGE_KEYS.SCAN_RECORDS, []);
}

export function saveScanRecords(records: ScanRecord[]): boolean {
  return safeSetItem(STORAGE_KEYS.SCAN_RECORDS, records);
}

export function saveScanRecord(record: ScanRecord): boolean {
  const records = loadScanRecords();
  records.push(record);
  if (records.length > MAX_SCAN_RECORDS) {
    records.splice(0, records.length - MAX_SCAN_RECORDS);
  }
  return saveScanRecords(records);
}

// ===== Match Logs =====

export function loadMatchLogs(): MatchLog[] {
  return safeGetItem<MatchLog[]>(STORAGE_KEYS.MATCH_LOGS, []);
}

export function saveMatchLog(log: MatchLog): boolean {
  const logs = loadMatchLogs();
  logs.push(log);
  return safeSetItem(STORAGE_KEYS.MATCH_LOGS, logs);
}

// ===== Maintenance =====

function pruneOldScans(): void {
  const records = loadScanRecords();
  if (records.length > MAX_SCAN_RECORDS) {
    const pruned = records.slice(records.length - MAX_SCAN_RECORDS);
    saveScanRecords(pruned);
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
