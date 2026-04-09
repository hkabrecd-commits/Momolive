
// NOTE: Since we don't have actual env keys here, we use a robust local fallback system.
// In a real app, you'd use createClient from '@supabase/supabase-js'.

const STORAGE_KEY = 'sofia_ai_local_db';

const getLocalDb = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { users: {}, transactions: [], logs: [] };
};

const saveLocalDb = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const supabase = {
  auth: {
    getUser: () => ({ data: { user: { id: 'dev-user', email: 'user@sofia.ai' } }, error: null }),
  },
  from: (table: string) => ({
    select: (query: string = '*') => ({
      eq: (col: string, val: any) => ({
        single: () => {
          const db = getLocalDb();
          if (table === 'profiles') return { data: db.users[val] || { id: val, tokens: 10, role: 'admin' }, error: null };
          return { data: null, error: 'Not found' };
        }
      }),
      order: (col: string, { ascending = false } = {}) => ({
        data: [],
        error: null
      })
    }),
    update: (data: any) => ({
      eq: (col: string, val: any) => {
        const db = getLocalDb();
        if (table === 'profiles') db.users[val] = { ...db.users[val], ...data };
        saveLocalDb(db);
        return { error: null };
      }
    }),
    insert: (data: any) => {
      const db = getLocalDb();
      if (table === 'transactions') db.transactions.push(data);
      saveLocalDb(db);
      return { error: null };
    }
  })
};
