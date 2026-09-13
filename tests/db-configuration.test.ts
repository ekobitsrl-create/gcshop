import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import test from "node:test";
import { Client } from "pg";
import { databasePoolConfig } from "../db/config";
import { supabaseCa } from "../db/supabase-ca";

test("Supabase URL SSL options retain the official CA and certificate verification in pg", () => {
  const client = new Client(databasePoolConfig("postgresql://postgres.project:test%40password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&uselibpqcompat=true"));
  assert.equal(client.host, "aws-0-us-east-1.pooler.supabase.com");
  assert.equal(client.password, "test@password");
  assert.ok(client.ssl && typeof client.ssl === "object");
  assert.equal(client.ssl.rejectUnauthorized, true);
  assert.ok(Array.isArray(client.ssl.ca) && client.ssl.ca.includes(supabaseCa));
});

test("bundled public Supabase root certificate is authentic and unexpired", () => {
  const cert = new X509Certificate(supabaseCa);
  assert.equal(cert.fingerprint256, "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA");
  assert.ok(cert.ca);
  assert.ok(Date.parse(cert.validTo) > Date.now());
});

test("non-Supabase connections keep their own SSL configuration", () => {
  const local = new Client(databasePoolConfig("postgresql://user:password@localhost:5432/store?sslmode=disable"));
  assert.equal(local.ssl, false);
  const other = new Client(databasePoolConfig("postgresql://user:password@db.example.com/store?sslmode=verify-full"));
  assert.ok(other.ssl);
  assert.ok(!("ca" in other.ssl));
});
