import { Pool } from 'pg';
import { setGlobalDatabase } from './session';
import { ensureForward } from './fixieWrench';

// Choose fixed local port for PROD forward
const LOCAL_PROD_PORT = 15433;

// UAT removed

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

// Single PROD pool with reuse-friendly settings
let prodPool: Pool | null = null;

const getCurrentPool = () => {
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
};

// Test query to verify connection
export const testConnection = async () => {
  try {
    // Ensure forward for PROD if Fixie is present
    if (process.env.FIXIE_SOCKS_HOST) {
      await ensureForward(LOCAL_PROD_PORT, process.env.DB_HOST as string, parseInt(process.env.DB_PORT || '5432', 10));
    }
    const pool = getCurrentPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now, database: 'PROD' as const };
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
      await ensureForward(LOCAL_PROD_PORT, process.env.DB_HOST as string, parseInt(process.env.DB_PORT || '5432', 10));
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
export const getCurrentDatabase = () => 'PROD' as const;

// Cleanup function for when the application stops
export const closePool = async () => {
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