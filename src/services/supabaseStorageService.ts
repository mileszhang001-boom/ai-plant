import { supabase } from './supabaseClient';
import type { Plant, ScanRecord, MatchLog, SimpleMetrics, PlantAction } from '../types';

// ===== Plants =====

export async function fetchPlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(dbToPlant);
}

export async function upsertPlant(plant: Plant): Promise<void> {
  const { error } = await supabase
    .from('plants')
    .upsert(plantToDb(plant), { onConflict: 'id' });

  if (error) throw error;
}

export async function deletePlant(id: string): Promise<void> {
  const { error } = await supabase
    .from('plants')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== Scan Records =====

export async function fetchScanRecords(plantId?: string): Promise<ScanRecord[]> {
  let query = supabase
    .from('scan_records')
    .select('*')
    .order('scanned_at', { ascending: false })
    .limit(100);

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToScanRecord);
}

export async function insertScanRecord(record: ScanRecord): Promise<void> {
  const { error } = await supabase
    .from('scan_records')
    .insert(scanRecordToDb(record));

  if (error) throw error;
}

// ===== Match Logs =====

export async function insertMatchLog(log: MatchLog): Promise<void> {
  const { error } = await supabase
    .from('match_logs')
    .insert({
      id: log.id,
      scan_id: log.scan_id,
      ai_suggestion: log.ai_suggestion,
      ai_confidence: log.ai_confidence,
      user_confirmed: log.user_confirmed,
      is_new_plant: log.is_new_plant,
    });

  if (error) throw error;
}

// ===== Photo Storage =====

export async function uploadPhoto(scanId: string, base64DataUrl: string): Promise<string | null> {
  try {
    // Convert data URL to blob
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();

    const path = `scan-photos/${scanId}.jpg`;
    const { error } = await supabase.storage
      .from('plant-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      console.warn('Photo upload failed:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('plant-photos')
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch {
    return null;
  }
}

export async function getPhotoUrl(scanId: string): Promise<string | null> {
  const path = `scan-photos/${scanId}.jpg`;
  const { data: urlData } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(path);

  // Check if the file actually exists by trying to download metadata
  const { error } = await supabase.storage
    .from('plant-photos')
    .list('scan-photos', { search: `${scanId}.jpg` });

  if (error) return null;
  return urlData.publicUrl;
}

// ===== DB ↔ App Type Converters =====

interface DbPlant {
  id: string;
  species: string;
  fun_name: string;
  personality: string;
  current_hp: number;
  current_metrics: SimpleMetrics;
  current_action: PlantAction;
  created_at: string;
  last_scanned_at: string;
}

function dbToPlant(row: DbPlant): Plant {
  return {
    id: row.id,
    species: row.species,
    fun_name: row.fun_name,
    personality: row.personality,
    current_hp: row.current_hp,
    current_metrics: row.current_metrics,
    current_action: row.current_action,
    created_at: new Date(row.created_at).getTime(),
    last_scanned_at: new Date(row.last_scanned_at).getTime(),
  };
}

function plantToDb(plant: Plant) {
  return {
    id: plant.id,
    species: plant.species,
    fun_name: plant.fun_name,
    personality: plant.personality,
    current_hp: plant.current_hp,
    current_metrics: plant.current_metrics,
    current_action: plant.current_action,
    created_at: new Date(plant.created_at).toISOString(),
    last_scanned_at: new Date(plant.last_scanned_at).toISOString(),
  };
}

interface DbScanRecord {
  id: string;
  plant_id: string;
  hp: number;
  metrics: SimpleMetrics;
  scanned_at: string;
  ai_raw_response?: unknown;
}

function dbToScanRecord(row: DbScanRecord): ScanRecord {
  return {
    id: row.id,
    plant_id: row.plant_id,
    hp: row.hp,
    metrics: row.metrics,
    scanned_at: new Date(row.scanned_at).getTime(),
  };
}

function scanRecordToDb(record: ScanRecord) {
  return {
    id: record.id,
    plant_id: record.plant_id,
    hp: record.hp,
    metrics: record.metrics,
    scanned_at: new Date(record.scanned_at).toISOString(),
    ai_raw_response: record.ai_raw_response || null,
  };
}
