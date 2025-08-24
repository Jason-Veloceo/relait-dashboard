import { cookies } from 'next/headers';

// Use cookies to persist database selection across serverless invocations
export const getGlobalDatabase = (): 'UAT' | 'PROD' => {
  try {
    const cookieStore = cookies();
    const value = cookieStore.get('database')?.value as 'UAT' | 'PROD' | undefined;
    if (value === 'UAT' || value === 'PROD') return value;
  } catch (error) {
    console.warn('Failed to read database cookie:', error);
  }
  return 'UAT';
};

export const setGlobalDatabase = (database: 'UAT' | 'PROD') => {
  try {
    const cookieStore = cookies();
    cookieStore.set('database', database, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (error) {
    console.error('Failed to set database cookie:', error);
  }
};
