import { query } from '@/lib/db';

export interface Business {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string;
  user_type: string;
  created_on: Date;
  is_investor_hub: boolean;
  status: string;
}

export async function getBusinesses(): Promise<Business[]> {
  return query<Business>(
    `SELECT 
      id,
      first_name,
      last_name,
      email,
      business_name,
      user_type,
      created_on,
      is_investor_hub,
      status
    FROM users 
    WHERE user_type = $1 
      AND deleted IS NOT TRUE 
      AND active = TRUE 
    ORDER BY business_name`,
    ['BUSINESS']
  );
}

export async function getBusinessCount(): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM users WHERE user_type = $1 AND deleted IS NOT TRUE AND active = TRUE',
    ['BUSINESS']
  );
  return parseInt(result[0].count);
} 