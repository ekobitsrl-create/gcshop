import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const luxury = pgSchema("luxury");

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
};

export const categories = luxury.table(
  "categories",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_categories_slug").on(table.slug),
    index("idx_categories_parent_id").on(table.parentId),
    index("idx_categories_active_sort").on(table.isActive, table.sortOrder),
  ],
);

export const products = luxury.table(
  "products",
  {
    id: uuid("id").primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    brand: text("brand"),
    gender: text("gender").notNull().default("unisex"),
    status: text("status").notNull().default("draft"),
    basePriceCents: integer("base_price_cents").notNull().default(0),
    compareAtPriceCents: integer("compare_at_price_cents"),
    supplierRetailPriceCents: integer("supplier_retail_price_cents"),
    supplierCostCents: integer("supplier_cost_cents"),
    currency: text("currency").notNull().default("EUR"),
    taxRateBps: integer("tax_rate_bps").notNull().default(2200),
    isFeatured: boolean("is_featured").notNull().default(false),
    priceLocked: boolean("price_locked").notNull().default(false),
    statusLocked: boolean("status_locked").notNull().default(false),
    catalogSource: text("catalog_source").notNull().default("manual"),
    supplierProductId: text("supplier_product_id"),
    supplierIsOnline: boolean("supplier_is_online"),
    originCountry: text("origin_country"),
    hsCode: text("hs_code"),
    weightGrams: integer("weight_grams"),
    feedUpdatedAt: timestamp("feed_updated_at", { withTimezone: true, mode: "string" }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: "string" }),
    metadataJson: text("metadata_json"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_products_slug").on(table.slug),
    uniqueIndex("idx_products_sku").on(table.sku),
    index("idx_products_category_id").on(table.categoryId),
    index("idx_products_status_created").on(table.status, table.createdAt),
    index("idx_products_featured_status").on(table.isFeatured, table.status),
    uniqueIndex("idx_products_source_supplier_id").on(table.catalogSource, table.supplierProductId),
    index("idx_products_brand_status").on(table.brand, table.status),
    index("idx_products_gender_status").on(table.gender, table.status),
  ],
);

export const productImages = luxury.table(
  "product_images",
  {
    id: uuid("id").primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    sourceImageId: text("source_image_id"),
    ...timestamps,
  },
  (table) => [index("idx_product_images_product_sort").on(table.productId, table.sortOrder)],
);

export const productVariants = luxury.table(
  "product_variants",
  {
    id: uuid("id").primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    title: text("title").notNull().default("Standard"),
    color: text("color"),
    size: text("size"),
    priceCents: integer("price_cents"),
    compareAtPriceCents: integer("compare_at_price_cents"),
    supplierRetailPriceCents: integer("supplier_retail_price_cents"),
    supplierCostCents: integer("supplier_cost_cents"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    supplierStockQuantity: integer("supplier_stock_quantity").notNull().default(0),
    stockLocked: boolean("stock_locked").notNull().default(false),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(2),
    weightGrams: integer("weight_grams"),
    supplierVariantId: text("supplier_variant_id"),
    supplierCode: text("supplier_code"),
    barcode: text("barcode"),
    backorder: boolean("backorder").notNull().default(false),
    feedUpdatedAt: timestamp("feed_updated_at", { withTimezone: true, mode: "string" }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: "string" }),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_product_variants_sku").on(table.sku),
    index("idx_product_variants_product_active").on(table.productId, table.isActive),
    index("idx_product_variants_low_stock").on(table.stockQuantity, table.lowStockThreshold),
    uniqueIndex("idx_product_variants_supplier_id").on(table.supplierVariantId),
    index("idx_product_variants_barcode").on(table.barcode),
  ],
);

export const catalogImports = luxury.table(
  "catalog_imports",
  {
    id: uuid("id").primaryKey(),
    source: text("source").notNull(),
    filename: text("filename").notNull(),
    sourceLastUpdate: timestamp("source_last_update", { withTimezone: true, mode: "string" }),
    status: text("status").notNull().default("running"),
    productsReceived: integer("products_received").notNull().default(0),
    productsImported: integer("products_imported").notNull().default(0),
    variantsImported: integer("variants_imported").notNull().default(0),
    imagesImported: integer("images_imported").notNull().default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [index("idx_catalog_imports_source_started").on(table.source, table.startedAt)],
);

export const inventoryMovements = luxury.table(
  "inventory_movements",
  {
    id: uuid("id").primaryKey(),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    quantityDelta: integer("quantity_delta").notNull(),
    reason: text("reason").notNull(),
    referenceType: text("reference_type"),
    referenceId: uuid("reference_id"),
    note: text("note"),
    actorId: text("actor_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_inventory_movements_variant_created").on(table.variantId, table.createdAt),
    index("idx_inventory_movements_reference").on(table.referenceType, table.referenceId),
  ],
);

export const customers = luxury.table(
  "customers",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    acceptsMarketing: boolean("accepts_marketing").notNull().default(false),
    ...timestamps,
  },
  (table) => [uniqueIndex("idx_customers_email").on(table.email)],
);

export const customerAddresses = luxury.table(
  "customer_addresses",
  {
    id: uuid("id").primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("shipping"),
    recipientName: text("recipient_name").notNull(),
    company: text("company"),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    province: text("province"),
    countryCode: text("country_code").notNull().default("IT"),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps,
  },
  (table) => [index("idx_customer_addresses_customer_type").on(table.customerId, table.type)],
);

export const carts = luxury.table(
  "carts",
  {
    id: uuid("id").primaryKey(),
    token: uuid("token").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"),
    currency: text("currency").notNull().default("EUR"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_carts_token").on(table.token),
    index("idx_carts_customer_status").on(table.customerId, table.status),
  ],
);

export const cartItems = luxury.table(
  "cart_items",
  {
    id: uuid("id").primaryKey(),
    cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPriceCents: integer("unit_price_cents").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_cart_items_cart_variant").on(table.cartId, table.variantId),
    index("idx_cart_items_product_id").on(table.productId),
    index("idx_cart_items_variant_id").on(table.variantId),
  ],
);

export const orders = luxury.table(
  "orders",
  {
    id: uuid("id").primaryKey(),
    orderNumber: text("order_number").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    cartId: uuid("cart_id").references(() => carts.id, { onDelete: "set null" }),
    status: text("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("pending"),
    fulfillmentStatus: text("fulfillment_status").notNull().default("unfulfilled"),
    email: text("email").notNull(),
    phone: text("phone"),
    currency: text("currency").notNull().default("EUR"),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    paymentMethodCode: text("payment_method_code").notNull(),
    shippingAddressJson: text("shipping_address_json").notNull(),
    billingAddressJson: text("billing_address_json").notNull(),
    customerNote: text("customer_note"),
    internalNote: text("internal_note"),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "string" }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "string" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_orders_order_number").on(table.orderNumber),
    index("idx_orders_customer_created").on(table.customerId, table.createdAt),
    index("idx_orders_status_created").on(table.status, table.createdAt),
    index("idx_orders_payment_status").on(table.paymentStatus),
    index("idx_orders_cart_id").on(table.cartId),
  ],
);

export const shipments = luxury.table(
  "shipments",
  {
    id: uuid("id").primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("preparing"),
    carrier: text("carrier"),
    service: text("service"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    labelUrl: text("label_url"),
    note: text("note"),
    shippedAt: timestamp("shipped_at", { withTimezone: true, mode: "string" }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: "string" }),
    ...timestamps,
  },
  (table) => [
    index("idx_shipments_order_status").on(table.orderId, table.status),
    index("idx_shipments_tracking_number").on(table.trackingNumber),
  ],
);

export const orderItems = luxury.table(
  "order_items",
  {
    id: uuid("id").primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    variantName: text("variant_name"),
    sku: text("sku").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    taxRateBps: integer("tax_rate_bps").notNull().default(2200),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_order_items_order_id").on(table.orderId),
    index("idx_order_items_product_id").on(table.productId),
    index("idx_order_items_variant_id").on(table.variantId),
  ],
);

export const paymentMethods = luxury.table(
  "payment_methods",
  {
    id: uuid("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    provider: text("provider").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    publicConfigJson: text("public_config_json"),
    instructions: text("instructions"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_payment_methods_code").on(table.code),
    index("idx_payment_methods_enabled_sort").on(table.isEnabled, table.sortOrder),
  ],
);

export const paymentTransactions = luxury.table(
  "payment_transactions",
  {
    id: uuid("id").primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    paymentMethodCode: text("payment_method_code").notNull(),
    providerReference: text("provider_reference"),
    type: text("type").notNull().default("authorization"),
    status: text("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    responseJson: text("response_json"),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_payment_transactions_order_id").on(table.orderId),
    index("idx_payment_transactions_provider_ref").on(table.providerReference),
    index("idx_payment_transactions_status_created").on(table.status, table.createdAt),
  ],
);

export const coupons = luxury.table(
  "coupons",
  {
    id: uuid("id").primaryKey(),
    code: text("code").notNull(),
    type: text("type").notNull().default("percentage"),
    value: integer("value").notNull(),
    minimumOrderCents: integer("minimum_order_cents"),
    maximumDiscountCents: integer("maximum_discount_cents"),
    firstOrderOnly: boolean("first_order_only").notNull().default(false),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "string" }),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "string" }),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_coupons_code").on(table.code),
    index("idx_coupons_active_dates").on(table.isActive, table.startsAt, table.endsAt),
  ],
);

export const couponUses = luxury.table(
  "coupon_uses",
  {
    id: uuid("id").primaryKey(),
    couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    discountCents: integer("discount_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_coupon_uses_coupon_order").on(table.couponId, table.orderId),
    uniqueIndex("idx_coupon_uses_coupon_customer").on(table.couponId, table.customerId),
    index("idx_coupon_uses_customer").on(table.customerId),
    index("idx_coupon_uses_order_id").on(table.orderId),
  ],
);

export const siteSettings = luxury.table("site_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const adminAuditLogs = luxury.table(
  "admin_audit_logs",
  {
    id: uuid("id").primaryKey(),
    actorUserId: text("actor_user_id").notNull(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadataJson: text("metadata_json"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_admin_audit_actor_created").on(table.actorUserId, table.createdAt),
    index("idx_admin_audit_entity").on(table.entityType, table.entityId),
  ],
);

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
