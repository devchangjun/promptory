import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Clerk 로그인 후 users 테이블에 upsert하는 함수
export interface SupabaseUserUpsert {
  email: string;
  name?: string;
  avatar_url?: string;
  clerk_user_id: string;
}

/**
 * Clerk 로그인 후 Supabase users 테이블에 clerk_user_id 포함 upsert
 */
export async function supabaseUpsertUser(user: SupabaseUserUpsert) {
  return supabase.from("users").upsert(
    {
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      clerk_user_id: user.clerk_user_id,
    },
    { onConflict: "email" }
  );
}
