import fs from 'fs';
import path from 'path';

// File-based database selection storage
const DB_STATE_FILE = path.join(process.cwd(), '.database-state');

// Read database selection from file
export const getGlobalDatabase = (): 'UAT' | 'PROD' => {
  try {
    if (fs.existsSync(DB_STATE_FILE)) {
      const data = fs.readFileSync(DB_STATE_FILE, 'utf8').trim();
      if (data === 'UAT' || data === 'PROD') {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to read database state file:', error);
  }
  return 'UAT'; // Default to UAT
};

// Write database selection to file
export const setGlobalDatabase = (database: 'UAT' | 'PROD') => {
  try {
    fs.writeFileSync(DB_STATE_FILE, database, 'utf8');
  } catch (error) {
    console.error('Failed to write database state file:', error);
  }
};
