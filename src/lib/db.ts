import { Pool } from 'pg';
import { getGlobalDatabase, setGlobalDatabase } from './session';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - socksjs has no types
import SocksConnection from 'socksjs';

// Create a SOCKS stream compatible with pg using socksjs (sync Duplex)
const createSocksStream = (host: string, port: number) => {
  if (!process.env.FIXIE_SOCKS_HOST) return undefined;

  const fixieUrl = process.env.FIXIE_SOCKS_HOST;
  const [auth, hostPort] = fixieUrl.split('@');
  const [username, password] = auth.split(':');
  const [proxyHost, proxyPort] = hostPort.split(':');

  const pgServer = { host, port } as const;
  const proxy = {
    user: username,
    pass: password,
    host: proxyHost,
    port: parseInt(proxyPort, 10)
  } as const;

  // socksjs returns a Duplex stream immediately
  const socket = new (SocksConnection as any)(pgServer, proxy);
  return socket;
};

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
  const socksStream = createSocksStream(
    process.env.UAT_DB_HOST || 'localhost',
    parseInt(process.env.UAT_DB_PORT || '5432', 10)
  );

  if (socksStream) {
    config.stream = socksStream;
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
  const socksStream = createSocksStream(
    process.env.DB_HOST || 'localhost',
    parseInt(process.env.DB_PORT || '5432', 10)
  );

  if (socksStream) {
    config.stream = socksStream;
  }

  return config;
};

// Create separate pools for each database
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
      uatPool = new Pool(getUATConfig());
    }
    return uatPool;
  } else {
    if (!prodPool) {
      prodPool = new Pool(getPRODConfig());
    }
    return prodPool;
  }
};

// Test query to verify connection
export const testConnection = async () => {
  try {
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
  return testConnection();
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