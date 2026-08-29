import { and, asc, desc, eq, ilike, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Metadata } from "next";
import Image from "next/image";
import { getDb } from "@/db";
import { categories, productImages, products, productTranslations, productVariants } from "@/db/schema";
import { CommerceHeader } from "@/components/commerce-header";
import { BrandLogo } from "@/components/brand-logo";
import { StoreFooter } from "@/components/store-footer";
import { placeholderProducts } from "@/lib/placeholder-products";
import { formatMoney } from "@/lib/store-utils";
import { localeTags, translate, translateCatalogFallback } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "../commerce.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: translate(locale, "shop.title"), description: translate(locale, "shop.description"), alternates: { canonical: "/shop" } };
}
const PAGE_SIZE = 48;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  categoryName: string | null;
  categoryGroup: string | null;
  imageUrl: string | null;
  stockQuantity: number;
};

type CategoryRow = {
  slug: string;
  name: string;
  groupName: string;
  count: number;
};

type BrandRow = {
  name: string;
  count: number;
};

function shopUrl({ category, type = "", brand = "", query, page = 1 }: { category: string; type?: string; brand?: string; query: string; page?: number }) {
  const params = new URLSearchParams();
  if (category !== "tutto") params.set("categoria", category);
  if (type) params.set("tipologia", type);
  if (brand) params.set("marchio", brand);
  if (query) params.set("q", query);
  if (page > 1) params.set("pagina", String(page));
  const suffix = params.toString();
  return suffix ? `/shop?${suffix}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string; tipologia?: string; marchio?: string; q?: string; pagina?: string }> }) {
  const locale = await getRequestLocale();
  const localeTag = localeTags[locale];
  const t = (key: string, values?: Record<string, string | number>) => translate(locale, key, values);
  const filters = [
    { label: t("shop.all"), value: "tutto" },
    { label: t("common.woman"), value: "donna" },
    { label: t("common.man"), value: "uomo" },
    { label: t("shop.clothing"), value: "abbigliamento" },
    { label: t("shop.shoes"), value: "scarpe" },
    { label: t("shop.bags"), value: "borse" },
    { label: t("common.accessories"), value: "accessori" },
  ];
  const params = await searchParams;
  const activeFilter = filters.some((filter) => filter.value === params.categoria) ? params.categoria! : "tutto";
  const activeType = params.tipologia?.trim().slice(0, 120) ?? "";
  const activeBrand = params.marchio?.trim().slice(0, 120) ?? "";
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const db = getDb();
  const parentCategories = alias(categories, "parent_categories");
  let scopeCondition: SQL | undefined;
  if (activeFilter === "donna" || activeFilter === "uomo") scopeCondition = eq(products.gender, activeFilter);
  if (["abbigliamento", "scarpe", "borse", "accessori"].includes(activeFilter)) {
    const rootSlug = `romanelli-${activeFilter}`;
    scopeCondition = or(eq(categories.slug, rootSlug), eq(parentCategories.slug, rootSlug));
  }
  const conditions: SQL[] = [eq(products.status, "active")];
  if (scopeCondition) conditions.push(scopeCondition);
  if (activeType) conditions.push(eq(categories.slug, activeType));
  if (activeBrand) conditions.push(eq(products.brand, activeBrand));
  if (query) {
    const term = `%${query}%`;
    conditions.push(or(ilike(products.name, term), ilike(productTranslations.name, term), ilike(products.brand, term), ilike(products.sku, term))!);
  }
  const where = and(...conditions);
  let rows: ProductRow[] = [];
  let categoryRows: CategoryRow[] = [];
  let brandRows: BrandRow[] = [];
  let total = 0;

  try {
    const categoryConditions: SQL[] = [eq(products.status, "active"), isNotNull(categories.parentId)];
    if (scopeCondition) categoryConditions.push(scopeCondition);
    if (activeBrand) categoryConditions.push(eq(products.brand, activeBrand));
    const brandConditions: SQL[] = [eq(products.status, "active"), isNotNull(products.brand)];
    if (scopeCondition) brandConditions.push(scopeCondition);
    if (activeType) brandConditions.push(eq(categories.slug, activeType));
    const [databaseRows, countRows, databaseCategories, databaseBrands] = await Promise.all([
      db.select({
        id: products.id,
        name: sql<string>`coalesce(${productTranslations.name}, ${products.name})`,
        slug: products.slug,
        brand: products.brand,
        price: products.basePriceCents,
        compareAtPrice: products.compareAtPriceCents,
        currency: products.currency,
        categoryName: sql<string | null>`coalesce(${productTranslations.subcategory}, ${categories.name})`,
        categoryGroup: parentCategories.name,
        imageUrl: sql<string | null>`(select ${productImages.url} from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
        stockQuantity: sql<number>`coalesce((select sum(${productVariants.stockQuantity}) from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.isActive} = true), 0)`,
      }).from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
        .where(where)
        .orderBy(asc(products.brand), asc(sql`coalesce(${productTranslations.name}, ${products.name})`))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db.select({ value: sql<number>`count(*)` }).from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
        .where(where),
      db.select({
        slug: categories.slug,
        name: sql<string>`coalesce(min(${productTranslations.subcategory}), ${categories.name})`,
        groupName: sql<string>`coalesce(min(${productTranslations.category}), ${parentCategories.name}, ${categories.name})`,
        count: sql<number>`count(distinct ${products.id})`,
      }).from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .leftJoin(productTranslations, and(eq(productTranslations.productId, products.id), eq(productTranslations.locale, locale)))
        .where(and(...categoryConditions))
        .groupBy(categories.id, categories.slug, categories.name, parentCategories.name, parentCategories.sortOrder)
        .orderBy(asc(parentCategories.sortOrder), desc(sql`count(distinct ${products.id})`), asc(categories.name)),
      db.select({
        name: products.brand,
        count: sql<number>`count(distinct ${products.id})`,
      }).from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
        .where(and(...brandConditions))
        .groupBy(products.brand)
        .orderBy(asc(sql`lower(${products.brand})`)),
    ]);
    rows = databaseRows;
    categoryRows = databaseCategories.map((category) => ({ ...category, count: Number(category.count) }));
    brandRows = databaseBrands.flatMap((brand) => brand.name ? [{ name: brand.name, count: Number(brand.count) }] : []);
    total = Number(countRows[0]?.value ?? 0);
  } catch {
    // L’anteprima locale usa i segnaposto solo quando il database non è raggiungibile.
  }

  if (!rows.length && !query && !activeType && !activeBrand && activeFilter === "tutto" && total === 0) {
    rows = placeholderProducts.map((product) => ({
      id: product.id,
      name: translateCatalogFallback(locale, product.name) ?? product.name,
      slug: product.slug,
      brand: null,
      price: product.price,
      compareAtPrice: null,
      currency: product.currency,
      categoryName: translateCatalogFallback(locale, product.categoryName),
      categoryGroup: translateCatalogFallback(locale, product.categoryName),
      imageUrl: product.imageUrl,
      stockQuantity: 0,
    }));
    total = rows.length;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categoryGroups = Array.from(categoryRows.reduce((groups, category) => {
    const current = groups.get(category.groupName) ?? [];
    current.push(category);
    groups.set(category.groupName, current);
    return groups;
  }, new Map<string, CategoryRow[]>())).map(([name, items]) => ({
    name,
    items: items
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, localeTag))
      .slice(0, activeFilter === "tutto" || activeFilter === "donna" || activeFilter === "uomo" ? 7 : 18),
  }));
  const activeTypeLabel = categoryRows.find((category) => category.slug === activeType)?.name;
  const selectionTitle = query
    ? t("shop.results", { query })
    : activeBrand && activeTypeLabel
      ? `${activeBrand} / ${activeTypeLabel}`
      : activeBrand || activeTypeLabel || t("shop.complete");
  return (
    <div className="commerce-shell">
      <CommerceHeader />
      <main>
        <header className="commerce-hero shop-collection-hero">
          <p className="commerce-kicker">The selected edit / 2026</p>
          <h1>Shop<br /><em>the edit.</em></h1>
          <p className="commerce-hero-copy">{t("shop.heroCopy")}</p>
        </header>

        <nav className="shop-filters" aria-label={t("shop.filterLabel")}>
          {filters.map((filter) => <a className={activeFilter === filter.value ? "is-active" : ""} href={shopUrl({ category: filter.value, query })} key={filter.value}>{filter.label}</a>)}
          <span>{total.toLocaleString(localeTag)} {t("shop.items")}</span>
        </nav>

        {categoryGroups.length || brandRows.length ? (
          <section className="shop-taxonomy" aria-labelledby="shop-taxonomy-title">
            <header className="shop-taxonomy-heading">
              <div><p className="commerce-kicker">{t("shop.categories")}</p><h2 id="shop-taxonomy-title">{t("shop.browseCategories")}</h2></div>
              {activeType || activeBrand ? (
                <div className="shop-taxonomy-actions">
                  {activeType ? <a href={shopUrl({ category: activeFilter, brand: activeBrand, query })}>{t("shop.clearCategory")} <span>×</span></a> : null}
                  {activeBrand ? <a href={shopUrl({ category: activeFilter, type: activeType, query })}>{t("shop.clearBrand")} <span>×</span></a> : null}
                </div>
              ) : <p>{t("shop.categoryIntro")}</p>}
            </header>
            <div className="shop-taxonomy-groups">
              {categoryGroups.map((group) => (
                <section className="shop-taxonomy-group" key={group.name}>
                  <h3>{group.name}</h3>
                  <div>
                    {group.items.map((category) => (
                      <a className={activeType === category.slug ? "is-active" : ""} href={shopUrl({ category: activeFilter, type: category.slug, brand: activeBrand, query })} key={category.slug}>
                        <span>{category.name}</span><small>{category.count.toLocaleString(localeTag)}</small>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {brandRows.length ? (
              <details className="shop-brand-directory" open={Boolean(activeBrand)}>
                <summary>
                  <span><small>{t("shop.brands")}</small><strong>{t("shop.browseBrands")}</strong></span>
                  <span>{t("shop.brandsAvailable", { count: brandRows.length })}<b aria-hidden="true">+</b></span>
                </summary>
                <div className="shop-brand-grid">
                  {brandRows.map((brand) => (
                    <a className={activeBrand === brand.name ? "is-active" : ""} href={shopUrl({ category: activeFilter, type: activeType, brand: brand.name, query })} key={brand.name}>
                      <BrandLogo brand={brand.name} className="brand-filter-logo" />
                      <small>{brand.count.toLocaleString(localeTag)}</small>
                    </a>
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        ) : null}

        <section className="commerce-main shop-content">
          <div className="shop-tools">
            <div><p className="commerce-kicker">{activeBrand ? t("shop.brands") : activeTypeLabel ?? filters.find((filter) => filter.value === activeFilter)?.label}</p><h2>{selectionTitle}</h2></div>
            <form action="/shop" method="get"><input name="q" defaultValue={query} placeholder={t("shop.searchPlaceholder")} /><input type="hidden" name="categoria" value={activeFilter === "tutto" ? "" : activeFilter} /><input type="hidden" name="tipologia" value={activeType} /><input type="hidden" name="marchio" value={activeBrand} /><button>{t("common.search")}</button></form>
          </div>
          {rows.length ? (
            <div className="commerce-product-grid">
              {rows.map((product, index) => (
                <article className="commerce-product-card" key={product.id}>
                  <a className="product-card-link" href={`/prodotto/${product.slug}`}>
                    <div className="product-card-media">
                      {product.imageUrl ? <Image src={product.imageUrl} alt={`${product.brand ?? "LCS"} ${product.name}`} fill unoptimized sizes="(max-width: 430px) 100vw, (max-width: 760px) 50vw, 25vw" /> : <span>LCS</span>}
                      <small>{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}</small>
                      {product.stockQuantity <= 2 && product.stockQuantity > 0 ? <em>{t("shop.lastPieces")}</em> : null}
                    </div>
                    <div className="product-card-copy">
                      <BrandLogo brand={product.brand} />
                      <h2>{product.name}</h2>
                      <div className="product-card-price"><strong>{formatMoney(product.price, product.currency, localeTag)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price ? <del>{formatMoney(product.compareAtPrice, product.currency, localeTag)}</del> : null}</div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          ) : <div className="commerce-empty"><div className="empty-number">00</div><div><p className="commerce-kicker">{t("shop.noResults")}</p><h2>{t("shop.emptyTitle")}<br /><em>{t("shop.emptyEmphasis")}</em></h2><p>{t("shop.emptyCopy")}</p><a href="/shop">{t("shop.back")} <span>↗</span></a></div></div>}
          {pages > 1 ? <nav className="shop-pagination" aria-label={t("shop.pages")}><a aria-disabled={page <= 1} href={shopUrl({ category: activeFilter, type: activeType, brand: activeBrand, query, page: Math.max(1, page - 1) })}>← {t("shop.previous")}</a><span>{page} / {pages}</span><a aria-disabled={page >= pages} href={shopUrl({ category: activeFilter, type: activeType, brand: activeBrand, query, page: Math.min(pages, page + 1) })}>{t("shop.next")} →</a></nav> : null}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
