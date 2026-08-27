import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import postgres from "postgres";

const SOURCE = "romanelli";
const MEDIA_ORIGIN = "https://www.romanellib2b.com";
const CHUNK_SIZE = 150;
const SELLING_PRICE_MULTIPLIER = 2;

function stableUuid(namespace, value) {
  const bytes = createHash("sha256").update(`${namespace}:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function sentenceCase(value) {
  const text = cleanText(value);
  return text ? `${text.charAt(0).toLocaleUpperCase("it-IT")}${text.slice(1)}` : "Prodotto";
}

function cents(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

function grams(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 1000) : null;
}

function tagValue(tag) {
  return cleanText(tag?.value?.localeValues?.it_IT?.value ?? tag?.value?.value ?? "");
}

function tagsOf(product) {
  const values = {};
  for (const tag of product.tags ?? []) {
    const name = String(tag?.name ?? "").toLowerCase();
    const value = tagValue(tag);
    if (name && value && values[name] === undefined) values[name] = value;
  }
  return values;
}

function chunks(items, size = CHUNK_SIZE) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function normalizeFeed(feed) {
  if (!feed || !Array.isArray(feed.pageItems)) throw new Error("Il file non contiene un feed Romanelli valido.");
  const syncedAt = new Date().toISOString();
  const categories = new Map();
  const products = [];
  const variants = [];
  const images = [];

  for (const item of feed.pageItems) {
    const tags = tagsOf(item);
    const brand = tags.brand || "Selected brand";
    const gender = (tags.gender || "Unisex").toLocaleLowerCase("it-IT");
    const rootName = tags.category || "Selection";
    const rootSlug = `${SOURCE}-${slugify(rootName) || "selection"}`;
    const rootId = stableUuid("romanelli-category", rootSlug);
    categories.set(rootId, { id: rootId, name: rootName, slug: rootSlug, parent_id: null, sort_order: 0 });

    const subcategoryName = tags.subcategory || rootName;
    const subcategorySlug = `${rootSlug}-${slugify(subcategoryName) || "selection"}`.slice(0, 110);
    const categoryId = subcategoryName === rootName ? rootId : stableUuid("romanelli-category", subcategorySlug);
    if (categoryId !== rootId) {
      categories.set(categoryId, {
        id: categoryId,
        name: subcategoryName,
        slug: subcategorySlug,
        parent_id: rootId,
        sort_order: 10,
      });
    }

    const supplierProductId = String(item.id);
    const productId = stableUuid("romanelli-product", supplierProductId);
    const name = sentenceCase(item.name || tags.model || item.code);
    const description = cleanText(item.productLocalizations?.description?.it_IT?.value);
    const retailPriceCents = cents(item.streetPrice);
    const costPriceCents = cents(item.bestTaxable ?? item.taxable);
    const sellingPriceCents = costPriceCents > 0
      ? costPriceCents * SELLING_PRICE_MULTIPLIER
      : retailPriceCents;
    const status = item.online && Number(item.availability) > 0 ? "active" : "draft";
    const productSlug = `${slugify(`${brand}-${name}-${item.code}`) || "prodotto"}-${supplierProductId}`.slice(0, 125);
    const metadata = {
      attributes: {
        brand,
        category: rootName,
        subcategory: subcategoryName,
        gender: tags.gender || "Unisex",
        color: tags.color || null,
        composition: tags.composition || null,
        season: tags.season || null,
        model: tags.model || null,
        promo: tags.promo || null,
      },
      supplier: {
        source: SOURCE,
        productId: item.id,
        code: item.code,
        taxable: item.taxable ?? null,
        bestTaxable: item.bestTaxable ?? null,
        vatClassId: item.vatClassId ?? null,
        availability: item.availability ?? 0,
        intangible: Boolean(item.intangible),
      },
      pricing: {
        rule: "supplier_cost_plus_100_percent",
        multiplier: SELLING_PRICE_MULTIPLIER,
      },
    };

    products.push({
      id: productId,
      category_id: categoryId,
      name,
      slug: productSlug,
      sku: String(item.code || `ROM-${item.id}`).toUpperCase(),
      short_description: description.slice(0, 190) || `${brand} · ${subcategoryName}`,
      description: description || null,
      brand,
      gender,
      status,
      base_price_cents: sellingPriceCents,
      compare_at_price_cents: null,
      supplier_retail_price_cents: retailPriceCents,
      supplier_cost_cents: costPriceCents,
      currency: item.currency || "EUR",
      tax_rate_bps: 2200,
      is_featured: tags.home === "popularproducts",
      catalog_source: SOURCE,
      supplier_product_id: supplierProductId,
      supplier_is_online: Boolean(item.online),
      origin_country: cleanText(item.madein) || null,
      hs_code: cleanText(item.hs) || null,
      weight_grams: grams(item.weight),
      feed_updated_at: feed.lastUpdate || null,
      last_synced_at: syncedAt,
      metadata_json: JSON.stringify(metadata),
    });

    for (const [sortOrder, image] of (item.images ?? []).entries()) {
      const sourceImageId = String(image.id ?? `${item.id}-${sortOrder}`);
      images.push({
        id: stableUuid("romanelli-image", sourceImageId),
        product_id: productId,
        url: new URL(String(image.url), MEDIA_ORIGIN).toString(),
        alt_text: `${brand} ${name}`,
        sort_order: sortOrder,
        source_image_id: sourceImageId,
      });
    }

    const sourceVariants = Array.isArray(item.models) && item.models.length ? item.models : [{
      id: `${item.id}-standard`,
      code: item.code,
      model: "Standard",
      color: tags.color || null,
      size: null,
      availability: item.availability,
      streetPrice: item.streetPrice,
      bestTaxable: item.bestTaxable,
      taxable: item.taxable,
      modelWeight: item.weight,
      backorder: false,
    }];

    for (const variant of sourceVariants) {
      const supplierVariantId = String(variant.id);
      const size = cleanText(variant.size || variant.option1) || null;
      const color = cleanText(variant.color || tags.color) || null;
      const title = [size, color].filter(Boolean).join(" · ") || cleanText(variant.model) || "Standard";
      const stock = Math.max(0, Number.parseInt(String(variant.availability ?? 0), 10) || 0);
      const variantRetail = cents(variant.streetPrice ?? item.streetPrice);
      const variantCost = cents(variant.bestTaxable ?? variant.taxable ?? item.bestTaxable ?? item.taxable);
      const variantSellingPrice = variantCost > 0
        ? variantCost * SELLING_PRICE_MULTIPLIER
        : variantRetail;
      variants.push({
        id: stableUuid("romanelli-variant", supplierVariantId),
        product_id: productId,
        sku: `${String(variant.code || item.code).toUpperCase()}#${supplierVariantId}`,
        title,
        color,
        size,
        price_cents: variantSellingPrice,
        compare_at_price_cents: null,
        supplier_retail_price_cents: variantRetail,
        supplier_cost_cents: variantCost,
        stock_quantity: stock,
        supplier_stock_quantity: stock,
        low_stock_threshold: 2,
        weight_grams: grams(variant.modelWeight ?? item.weight),
        supplier_variant_id: supplierVariantId,
        supplier_code: cleanText(variant.code || item.code) || null,
        barcode: cleanText(variant.barcode) || null,
        backorder: Boolean(variant.backorder),
        feed_updated_at: variant.lastUpdate || feed.lastUpdate || null,
        last_synced_at: syncedAt,
        is_active: Boolean(item.online),
      });
    }
  }

  return { categories: [...categories.values()], products, variants, images };
}

async function importFeed(filePath) {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("POSTGRES_URL non configurato.");

  const absolutePath = resolve(filePath);
  const feed = JSON.parse(await readFile(absolutePath, "utf8"));
  const normalized = normalizeFeed(feed);
  const importId = randomUUID();
  const sql = postgres(connectionString, { max: 1, prepare: false, connect_timeout: 20, idle_timeout: 30 });

  await sql`
    insert into luxury.catalog_imports (
      id, source, filename, source_last_update, status, products_received
    ) values (
      ${importId}, ${SOURCE}, ${basename(absolutePath)}, ${feed.lastUpdate || null}, 'running', ${feed.pageItems.length}
    )
  `;

  try {
    await sql.begin(async (tx) => {
      for (const batch of chunks(normalized.categories)) {
        await tx`
          insert into luxury.categories ${tx(batch, "id", "name", "slug", "parent_id", "sort_order")}
          on conflict (slug) do update set
            name = excluded.name,
            parent_id = excluded.parent_id,
            sort_order = excluded.sort_order,
            is_active = true,
            updated_at = current_timestamp
        `;
      }

      await tx`
        update luxury.products
        set supplier_is_online = false,
            status = case when status_locked then status else 'archived' end,
            updated_at = current_timestamp
        where catalog_source = ${SOURCE}
      `;
      await tx`
        update luxury.products
        set status = 'archived', updated_at = current_timestamp
        where catalog_source = 'manual' and sku like 'LCS-%'
      `;

      for (const batch of chunks(normalized.products)) {
        await tx`
          insert into luxury.products ${tx(batch,
            "id", "category_id", "name", "slug", "sku", "short_description", "description", "brand", "gender",
            "status", "base_price_cents", "compare_at_price_cents", "supplier_retail_price_cents", "supplier_cost_cents",
            "currency", "tax_rate_bps", "is_featured", "catalog_source", "supplier_product_id", "supplier_is_online",
            "origin_country", "hs_code", "weight_grams", "feed_updated_at", "last_synced_at", "metadata_json"
          )}
          on conflict (catalog_source, supplier_product_id) do update set
            category_id = excluded.category_id,
            name = excluded.name,
            slug = excluded.slug,
            sku = excluded.sku,
            short_description = excluded.short_description,
            description = excluded.description,
            brand = excluded.brand,
            gender = excluded.gender,
            status = case when luxury.products.status_locked then luxury.products.status else excluded.status end,
            base_price_cents = case when luxury.products.price_locked then luxury.products.base_price_cents else excluded.base_price_cents end,
            compare_at_price_cents = case when luxury.products.price_locked then luxury.products.compare_at_price_cents else excluded.compare_at_price_cents end,
            supplier_retail_price_cents = excluded.supplier_retail_price_cents,
            supplier_cost_cents = excluded.supplier_cost_cents,
            currency = excluded.currency,
            is_featured = excluded.is_featured,
            supplier_is_online = excluded.supplier_is_online,
            origin_country = excluded.origin_country,
            hs_code = excluded.hs_code,
            weight_grams = excluded.weight_grams,
            feed_updated_at = excluded.feed_updated_at,
            last_synced_at = excluded.last_synced_at,
            metadata_json = excluded.metadata_json,
            updated_at = current_timestamp
        `;
      }

      await tx`
        update luxury.product_variants as variant
        set is_active = false, updated_at = current_timestamp
        from luxury.products as product
        where variant.product_id = product.id and product.catalog_source = ${SOURCE}
      `;

      for (const batch of chunks(normalized.variants)) {
        await tx`
          insert into luxury.product_variants ${tx(batch,
            "id", "product_id", "sku", "title", "color", "size", "price_cents", "compare_at_price_cents",
            "supplier_retail_price_cents", "supplier_cost_cents", "stock_quantity", "supplier_stock_quantity",
            "low_stock_threshold", "weight_grams", "supplier_variant_id", "supplier_code", "barcode", "backorder",
            "feed_updated_at", "last_synced_at", "is_active"
          )}
          on conflict (supplier_variant_id) do update set
            product_id = excluded.product_id,
            sku = excluded.sku,
            title = excluded.title,
            color = excluded.color,
            size = excluded.size,
            price_cents = case
              when (select product.price_locked from luxury.products as product where product.id = excluded.product_id)
                then luxury.product_variants.price_cents
              else excluded.price_cents
            end,
            compare_at_price_cents = case
              when (select product.price_locked from luxury.products as product where product.id = excluded.product_id)
                then luxury.product_variants.compare_at_price_cents
              else excluded.compare_at_price_cents
            end,
            supplier_retail_price_cents = excluded.supplier_retail_price_cents,
            supplier_cost_cents = excluded.supplier_cost_cents,
            stock_quantity = case when luxury.product_variants.stock_locked then luxury.product_variants.stock_quantity else excluded.stock_quantity end,
            supplier_stock_quantity = excluded.supplier_stock_quantity,
            weight_grams = excluded.weight_grams,
            supplier_code = excluded.supplier_code,
            barcode = excluded.barcode,
            backorder = excluded.backorder,
            feed_updated_at = excluded.feed_updated_at,
            last_synced_at = excluded.last_synced_at,
            is_active = excluded.is_active,
            updated_at = current_timestamp
        `;
      }

      await tx`
        delete from luxury.product_images as image
        using luxury.products as product
        where image.product_id = product.id and product.catalog_source = ${SOURCE}
      `;
      for (const batch of chunks(normalized.images)) {
        await tx`
          insert into luxury.product_images ${tx(batch, "id", "product_id", "url", "alt_text", "sort_order", "source_image_id")}
        `;
      }

      await tx`
        update luxury.catalog_imports
        set status = 'completed',
            products_imported = ${normalized.products.length},
            variants_imported = ${normalized.variants.length},
            images_imported = ${normalized.images.length},
            completed_at = current_timestamp
        where id = ${importId}
      `;
    });

    console.log(JSON.stringify({
      importId,
      sourceLastUpdate: feed.lastUpdate,
      products: normalized.products.length,
      variants: normalized.variants.length,
      images: normalized.images.length,
      categories: normalized.categories.length,
    }, null, 2));
  } catch (error) {
    await sql`
      update luxury.catalog_imports
      set status = 'failed', error_message = ${String(error?.message ?? error).slice(0, 2000)}, completed_at = current_timestamp
      where id = ${importId}
    `;
    throw error;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: npm run catalog:import:romanelli -- "C:\\percorso\\products.json"');
  process.exitCode = 1;
} else {
  importFeed(filePath).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
