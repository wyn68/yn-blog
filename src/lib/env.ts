type EnvKeys =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'NEXT_PUBLIC_SITE_URL'
  | 'REDIS_URL'
  | 'GOOGLE_VERIFICATION_CODE';

type EnvValues = {
  [K in EnvKeys]: K extends 'REDIS_URL' | 'GOOGLE_VERIFICATION_CODE' 
    ? string | undefined 
    : string;
};

const requiredEnvVars: Array<EnvKeys> = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
];

const envCache: Partial<EnvValues> = {};

function validateEnv() {
  const missing: string[] = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.startsWith('http')) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must start with http:// or https://'
    );
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://'
    );
  }
}

export function getEnv<K extends EnvKeys>(key: K): EnvValues[K] {
  if (envCache[key] !== undefined) {
    return envCache[key] as EnvValues[K];
  }
  
  const value = process.env[key];
  
  if (requiredEnvVars.includes(key) && !value) {
    validateEnv();
  }
  
  envCache[key] = value as EnvValues[K];
  
  return envCache[key] as EnvValues[K];
}

export function getEnvSafe<K extends EnvKeys>(key: K): EnvValues[K] | null {
  try {
    return getEnv(key);
  } catch {
    return null;
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

if (typeof window === 'undefined') {
  const envErrors: string[] = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      envErrors.push(key);
    }
  }
  
  if (envErrors.length > 0 && isDevelopment()) {
    console.warn(
      `Environment validation warning: Missing required environment variables: ${envErrors.join(', ')}`
    );
  }
}

export { validateEnv };
