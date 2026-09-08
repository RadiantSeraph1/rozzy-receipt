import fs from 'fs';
import path from 'path';
import { AppCounters, DocumentData } from '@/types';
import { DEFAULT_COUNTERS } from './storage';

export const DEFAULT_MASTER_PIN = '0000';
const CLOUD_SYNC_URL = 'https://kvdb.io/RozzyTravelToursLtd_MasterStorage_2026/global_system_v1';

export interface ServerSystemData {
  pin: string;
  counters: AppCounters;
  history: DocumentData[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'system.json');

// Memory store fallback
let memoryStore: ServerSystemData = {
  pin: DEFAULT_MASTER_PIN,
  counters: DEFAULT_COUNTERS,
  history: [],
};

export async function getServerData(): Promise<ServerSystemData> {
  // 1. Try cloud KV store for cross-device & serverless persistence
  try {
    const res = await fetch(CLOUD_SYNC_URL, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        memoryStore = {
          pin: parsed.pin || DEFAULT_MASTER_PIN,
          counters: parsed.counters || DEFAULT_COUNTERS,
          history: parsed.history || [],
        };
        return memoryStore;
      }
    }
  } catch (e) {
    console.warn('Cloud KV fetch failed, falling back to local file/memory:', e);
  }

  // 2. Fallback to local file system
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryStore = {
        pin: parsed.pin || DEFAULT_MASTER_PIN,
        counters: parsed.counters || DEFAULT_COUNTERS,
        history: parsed.history || [],
      };
      return memoryStore;
    }
  } catch (e) {
    console.error('Error reading local server data file:', e);
  }

  return memoryStore;
}

export async function saveServerData(data: Partial<ServerSystemData>): Promise<ServerSystemData> {
  const current = await getServerData();
  const updated: ServerSystemData = {
    pin: data.pin !== undefined && data.pin !== null ? data.pin : current.pin,
    counters: data.counters !== undefined ? data.counters : current.counters,
    history: data.history !== undefined ? data.history : current.history,
  };

  memoryStore = updated;

  // 1. Save to cloud KV store for global instant sync across phone/PC
  try {
    await fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (e) {
    console.warn('Cloud KV post failed:', e);
  }

  // 2. Save to local file system
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local server data file:', e);
  }

  return updated;
}
