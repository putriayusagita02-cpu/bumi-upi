/**
 * BUMI UPI CRM & ORDERING MONOREPO
 * Supabase Client & Dual-Mode Detection Guard
 * Location: packages/db/src/supabaseClient.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function isMockMode(url?: string, key?: string, forceMock?: boolean | string): boolean {
  if (forceMock === true || forceMock === 'true') return true;

  const envForceMock = process.env.NEXT_PUBLIC_USE_MOCK || process.env.USE_MOCK;
  if (envForceMock === 'true') return true;

  const targetUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const targetKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!targetUrl || !targetKey) return true;
  if (
    targetUrl.includes('placeholder') ||
    targetUrl.includes('your-project') ||
    targetUrl.includes('demo') ||
    targetKey.includes('placeholder')
  ) {
    return true;
  }

  return false;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (isMockMode()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    supabaseInstance = createClient(url, key);
  }

  return supabaseInstance;
}

// Fallback safe client export
export const supabase = isMockMode()
  ? null
  : getSupabaseClient();
