import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a random short code
export function generateShortCode(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// Save a query plan and get a short URL
export async function saveQueryPlan(queryPlanText: string) {
  try {
    const shortCode = generateShortCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const { data, error } = await supabase
      .from('query_plans')
      .insert({
        query_plan: queryPlanText,
        short_code: shortCode,
        expires_at: expiresAt.toISOString(),
      })
      .select('short_code')
      .single();

    if (error) throw error;
    return { shortCode: data.short_code };
  } catch (error) {
    console.error('Error saving query plan:', error);
    throw error;
  }
}

// Get a query plan by short code
export async function getQueryPlan(shortCode: string) {
  try {
    const { data, error } = await supabase
      .from('query_plans')
      .select('query_plan, expires_at')
      .eq('short_code', shortCode)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Query plan not found');
    
    // Check if plan has expired
    if (new Date(data.expires_at) < new Date()) {
      throw new Error('Query plan has expired');
    }

    return data.query_plan;
  } catch (error) {
    console.error('Error retrieving query plan:', error);
    throw error;
  }
}