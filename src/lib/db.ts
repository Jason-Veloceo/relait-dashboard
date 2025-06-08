import { Pool } from 'pg';

// Load environment variables
const getDbConfig = () => {
  const activeDb = process.env.ACTIVE_DB || 'UAT';
  
  if (activeDb === 'UAT') {
    return {
      host: process.env.UAT_DB_HOST,
      user: process.env.UAT_DB_USER,
      password: process.env.UAT_DB_PASSWORD,
      database: process.env.UAT_DB_DATABASE,
      port: parseInt(process.env.UAT_DB_PORT || '5432'),
      ssl: {
        rejectUnauthorized: false
      }
    };
  } else if (activeDb === 'PROD') {
    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
  
  throw new Error('Invalid database configuration');
};

// Create a pool that we'll reuse
let pool: Pool;

// Initialize or reinitialize the pool with new configuration
export const initializePool = () => {
  if (pool) {
    pool.end(); // Close existing connections
  }
  pool = new Pool(getDbConfig());
  return pool;
};

// Initialize the pool with default configuration
pool = initializePool();

// Test query to verify connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now };
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
    const result = await pool.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Function to switch databases
export const switchDatabase = async (database: 'UAT' | 'PROD') => {
  process.env.ACTIVE_DB = database;
  initializePool();
  return testConnection();
};

// Cleanup function for when the application stops
export const closePool = async () => {
  await pool.end();
};

export default pool; 