import { rootCertificates } from "node:tls";
import type { PoolConfig } from "pg";
import { supabaseCa } from "./supabase-ca";

export function databasePoolConfig(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const isSupabase = url.hostname.endsWith(".supabase.com") || url.hostname.endsWith(".supabase.co");
  if (isSupabase) {
    // pg's URL parser would replace the explicit CA configuration if sslmode
    // remained in the connection string supplied by the hosting integration.
    url.searchParams.delete("sslmode");
    url.searchParams.delete("uselibpqcompat");
  }
  return {
    connectionString: isSupabase ? url.toString() : connectionString,
    ...(isSupabase ? { ssl: { ca: [...rootCertificates, supabaseCa], rejectUnauthorized: true } } : {}),
    application_name: "lcs-store",
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    maxLifetimeSeconds: 60,
    statement_timeout: 15_000,
  };
}
