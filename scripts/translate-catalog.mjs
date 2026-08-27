import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const SUPPORTED_LOCALES = ["en", "fr", "es", "de"];
const requested = process.argv.find((argument) => argument.startsWith("--locales="))?.split("=")[1];
const targetLocales = requested ? requested.split(",").filter((locale) => SUPPORTED_LOCALES.includes(locale)) : SUPPORTED_LOCALES;
const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("POSTGRES_URL or DATABASE_URL is required");
if (!targetLocales.length) throw new Error("No supported target locale selected");

const sql = postgres(connectionString, { max: 1, prepare: false, idle_timeout: 20 });
const cacheDirectory = path.resolve("translation-cache");
const namedEntities = {
  amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">", agrave: "à", aacute: "á",
  acirc: "â", auml: "ä", egrave: "è", eacute: "é", ecirc: "ê", euml: "ë", igrave: "ì",
  iacute: "í", icirc: "î", iuml: "ï", ograve: "ò", oacute: "ó", ocirc: "ô", ouml: "ö",
  ugrave: "ù", uacute: "ú", ucirc: "û", uuml: "ü", ccedil: "ç", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", hellip: "…", reg: "®", trade: "™", deg: "°",
};

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => namedEntities[name.toLowerCase()] ?? match)
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function attributesFrom(metadataJson) {
  if (!metadataJson) return {};
  try {
    const parsed = JSON.parse(metadataJson);
    return parsed?.attributes ?? {};
  } catch {
    return {};
  }
}

async function readCache(locale) {
  try {
    return JSON.parse(await readFile(path.join(cacheDirectory, `${locale}.json`), "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(locale, cache) {
  await mkdir(cacheDirectory, { recursive: true });
  await writeFile(path.join(cacheDirectory, `${locale}.json`), `${JSON.stringify(cache)}\n`, "utf8");
}

async function fetchTranslation(text, locale, attempt = 1) {
  const params = new URLSearchParams({ client: "gtx", sl: "it", tl: locale, dt: "t", q: text });
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
      headers: { "User-Agent": "LCS catalog translation import/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`translation service returned ${response.status}`);
    const payload = await response.json();
    return (payload[0] ?? []).map((segment) => segment[0] ?? "").join("").trim();
  } catch (error) {
    if (attempt >= 4) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
    return fetchTranslation(text, locale, attempt + 1);
  }
}

function makeBatches(values, maxCharacters = 2800) {
  const batches = [];
  let batch = [];
  let length = 0;
  for (const item of values) {
    const markerLength = `[[[LCS${item.index}]]]\n`.length;
    if (batch.length && length + markerLength + item.source.length > maxCharacters) {
      batches.push(batch);
      batch = [];
      length = 0;
    }
    batch.push(item);
    length += markerLength + item.source.length + 1;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

function splitBatchTranslation(translated, batch) {
  const matches = [...translated.matchAll(/\[\[\[LCS(\d+)\]\]\]\s*([\s\S]*?)(?=\[\[\[LCS\d+\]\]\]|$)/g)];
  const values = new Map(matches.map((match) => [Number(match[1]), match[2].trim()]));
  return values.size === batch.length ? values : null;
}

async function translateValues(values, locale, cache) {
  const missing = values.filter(({ source }) => !cache[source]);
  const batches = makeBatches(missing);
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex];
    const request = batch.map((item) => `[[[LCS${item.index}]]]\n${item.source}`).join("\n");
    const translated = await fetchTranslation(request, locale);
    const parsed = splitBatchTranslation(translated, batch);
    if (parsed) {
      for (const item of batch) cache[item.source] = parsed.get(item.index);
    } else {
      for (const item of batch) cache[item.source] = await fetchTranslation(item.source, locale);
    }
    if ((batchIndex + 1) % 10 === 0 || batchIndex === batches.length - 1) {
      await saveCache(locale, cache);
      process.stdout.write(`[${locale}] ${Math.min(batchIndex + 1, batches.length)}/${batches.length} batches translated\n`);
    }
  }
}

async function upsertTranslations(products, locale, cache) {
  const rows = products.map((product) => {
    const attributes = attributesFrom(product.metadata_json);
    const source = {
      name: decodeEntities(product.name),
      short_description: decodeEntities(product.short_description),
      description: decodeEntities(product.description),
      color: decodeEntities(attributes.color),
      composition: decodeEntities(attributes.composition),
      category: decodeEntities(attributes.category),
      subcategory: decodeEntities(attributes.subcategory),
      season: decodeEntities(attributes.season),
    };
    const translated = (value) => value ? cache[value] ?? value : null;
    return {
      product_id: product.id,
      locale,
      name: translated(source.name),
      short_description: translated(source.short_description),
      description: translated(source.description),
      color: translated(source.color),
      composition: translated(source.composition),
      category: translated(source.category),
      subcategory: translated(source.subcategory),
      season: translated(source.season),
    };
  });
  const columns = ["product_id", "locale", "name", "short_description", "description", "color", "composition", "category", "subcategory", "season"];
  for (let start = 0; start < rows.length; start += 250) {
    const chunk = rows.slice(start, start + 250);
    await sql`
      insert into luxury.product_translations ${sql(chunk, ...columns)}
      on conflict (product_id, locale) do update set
        name = excluded.name,
        short_description = excluded.short_description,
        description = excluded.description,
        color = excluded.color,
        composition = excluded.composition,
        category = excluded.category,
        subcategory = excluded.subcategory,
        season = excluded.season,
        updated_at = now()
    `;
  }
}

try {
  const products = await sql`
    select id, name, short_description, description, metadata_json
    from luxury.products
    where status = 'active'
    order by id
  `;
  const sources = [...new Set(products.flatMap((product) => {
    const attributes = attributesFrom(product.metadata_json);
    return [product.name, product.short_description, product.description, attributes.color, attributes.composition, attributes.category, attributes.subcategory, attributes.season]
      .map(decodeEntities)
      .filter(Boolean);
  }))].map((source, index) => ({ index, source }));
  process.stdout.write(`${products.length} products, ${sources.length} unique source texts\n`);

  for (const locale of targetLocales) {
    const cache = await readCache(locale);
    await translateValues(sources, locale, cache);
    await upsertTranslations(products, locale, cache);
    process.stdout.write(`[${locale}] ${products.length} product translations saved\n`);
  }
} finally {
  await sql.end();
}
