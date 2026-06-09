import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createSupabaseClient(withAuth: boolean = true) {
  if (typeof window !== "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  if (!withAuth) {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    });
  }

  try {
    const { cookies } = require("next/headers");
    const cookieStorePromise = cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        async get(name: string) {
          try {
            const cookieStore = await cookieStorePromise;
            const cookie = cookieStore.get(name);
            if (typeof cookie === 'string') {
              return cookie;
            }
            return cookie?.value;
          } catch {
            return undefined;
          }
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookieStorePromise;
            if (typeof cookieStore.set === 'function') {
              cookieStore.set({
                name,
                value,
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
            }
          } catch {}
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookieStorePromise;
            if (typeof cookieStore.set === 'function') {
              cookieStore.set({
                name,
                value: "",
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
            }
          } catch {}
        },
      },
    });
  } catch {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    });
  }
}

export function createClient() {
  return createSupabaseClient(true);
}

export function createPublicClient() {
  return createSupabaseClient(false);
}
