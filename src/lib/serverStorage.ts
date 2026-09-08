import fs from 'fs';
import path from 'path';
import { AppCounters, DocumentData } from '@/types';
import { DEFAULT_COUNTERS } from './storage';

export interface ServerSystemData {
  pin: string | null;
  counters: AppCounters;
  history: DocumentData[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'system.json');

// Memory store fallback
let memoryStore: ServerSystemData = {
  pin: null,
  counters: DEFAULT_COUNTERS,
  history: [],
};

export function getServerData(): ServerSystemData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryStore = {
        pin: parsed.pin ?? memoryStore.pin,
        counters: parsed.counters ?? memoryStore.counters,
        history: parsed.history ?? memoryStore.history,
      };
      return memoryStore;
    }
  } catch (e) {
    console.error('Error reading server data file:', e);
  }
  return memoryStore;
}

export function saveServerData(data: Partial<ServerSystemData>): ServerSystemData {
  const current = getServerData();
  const updated: ServerSystemData = {
    pin: data.pin !== undefined ? data.pin : current.pin,
    counters: data.counters !== undefined ? data.counters : current.counters,
    history: data.history !== undefined ? data.history : current.history,
  };

  memoryStore = updated;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving server data file:', e);
  }

  return updated;
}
