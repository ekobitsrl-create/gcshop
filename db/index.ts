import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { databasePoolConfig } from "./config";
import * as schema from "./schema";

function createDb() {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL non configurato. Collega Supabase al progetto Vercel e sincronizza le variabili d'ambiente.");
  }

  // Queue queries on each connection: transaction poolers cannot safely
  // multiplex the pipelined queries used by the previous postgres-js driver.
  const pool = new Pool(databasePoolConfig(connectionString));
  pool.on("error", (error) => {
    console.error("Idle database connection failed", { type: error.name });
  });
  attachDatabasePool(pool);
  return drizzle(pool, { schema });
}

let database: ReturnType<typeof createDb> | null = null;

export function getDb() {
  database ??= createDb();
  return database;
}
