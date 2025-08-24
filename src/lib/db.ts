import { Pool } from 'pg';
import { getGlobalDatabase, setGlobalDatabase } from './session';
import { ensureForward } from './fixieWrench';

// Choose fixed local ports for UAT and PROD forwards
const LOCAL_UAT_PORT = 15432;
const LOCAL_PROD_PORT = 15433;

// Database configurations
const getUATConfig = () => {
  const config: any = {
    host: process.env.UAT_DB_HOST,
    user: process.env.UAT_DB_USER,
    password: process.env.UAT_DB_PASSWORD,
    database: process.env.UAT_DB_DATABASE,
    port: parseInt(process.env.UAT_DB_PORT || '5432'),
    ssl: {
      rejectUnauthorized: false
    }
  };

  // Add SOCKS proxy stream if Fixie is configured
  if (process.env.FIXIE_SOCKS_HOST) {
    // Start/ensure fixie-wrench forward and connect to localhost
    config.host = '127.0.0.1';
    config.port = LOCAL_UAT_PORT;
  }

  return config;
};

const getPRODConfig = () => {
  const config: any = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
      rejectUnauthorized: false
    }
  };

  // Add SOCKS proxy stream if Fixie is configured
  if (process.env.FIXIE_SOCKS_HOST) {
    config.host = '127.0.0.1';
    config.port = LOCAL_PROD_PORT;
  }

  return config;
};

// Create separate pools for each database with reuse-friendly settings
let uatPool: Pool | null = null;
let prodPool: Pool | null = null;

// Get current database from session or default to UAT
const getCurrentDatabaseSetting = (): 'UAT' | 'PROD' => {
  return getGlobalDatabase();
};

// Get the appropriate pool based on current database setting
const getCurrentPool = () => {
  const currentDatabase = getCurrentDatabaseSetting();
  if (currentDatabase === 'UAT') {
    if (!uatPool) {
      uatPool = new Pool({
        ...getUATConfig(),
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
      } as any);
    }
    return uatPool;
  } else {
    if (!prodPool) {
      prodPool = new Pool({
        ...getPRODConfig(),
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
      } as any);
    }
    return prodPool;
  }
};

// Test query to verify connection
export const testConnection = async () => {
  try {
    // Ensure forward for the selected DB if Fixie is present
    if (process.env.FIXIE_SOCKS_HOST) {
      const current = getCurrentDatabaseSetting();
      if (current === 'UAT') {
        await ensureForward(LOCAL_UAT_PORT, process.env.UAT_DB_HOST as string, parseInt(process.env.UAT_DB_PORT || '5432', 10));
      } else {
        await ensureForward(LOCAL_PROD_PORT, process.env.DB_HOST as string, parseInt(process.env.DB_PORT || '5432', 10));
      }
    }
    const pool = getCurrentPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now, database: getCurrentDatabaseSetting() };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Generic query function with type safety
export async function query<T>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    if (process.env.FIXIE_SOCKS_HOST) {
      const current = getCurrentDatabaseSetting();
      if (current === 'UAT') {
        await ensureForward(LOCAL_UAT_PORT, process.env.UAT_DB_HOST as string, parseInt(process.env.UAT_DB_PORT || '5432', 10));
      } else {
        await ensureForward(LOCAL_PROD_PORT, process.env.DB_HOST as string, parseInt(process.env.DB_PORT || '5432', 10));
      }
    }
    const pool = getCurrentPool();
    const result = await pool.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Function to switch databases
export const switchDatabase = async (database: 'UAT' | 'PROD') => {
  setGlobalDatabase(database);
  return { success: true, database };
};

// Get current database
export const getCurrentDatabase = () => getCurrentDatabaseSetting();

// Cleanup function for when the application stops
export const closePool = async () => {
  if (uatPool) await uatPool.end();
  if (prodPool) await prodPool.end();
};

// Default export for backward compatibility
const pool = {
  query: async (text: string, params?: any[]) => {
    const currentPool = getCurrentPool();
    return await currentPool.query(text, params);
  },
  connect: async () => {
    const currentPool = getCurrentPool();
    return await currentPool.connect();
  },
  end: async () => {
    return await closePool();
  }
};

export default pool; 