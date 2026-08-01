import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    parentId: text("parent_id").references((): any => categories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_categories_slug").on(table.slug),
    index("idx_categories_parent_id").on(table.parentId),
    index("idx_categories_active_sort").on(table.isActive, table.sortOrder),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
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
    currency: text("currency").notNull().default("EUR"),
    taxRateBps: integer("tax_rate_bps").notNull().default(2200),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    metadataJson: text("metadata_json"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_products_slug").on(table.slug),
    uniqueIndex("idx_products_sku").on(table.sku),
    index("idx_products_category_id").on(table.categoryId),
    index("idx_products_status_created").on(table.status, table.createdAt),
    index("idx_products_featured_status").on(table.isFeatured, table.status),
  ],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("idx_product_images_product_sort").on(table.productId, table.sortOrder)],
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    title: text("title").notNull().default("Standard"),
    color: text("color"),
    size: text("size"),
    priceCents: integer("price_cents"),
    compareAtPriceCents: integer("compare_at_price_cents"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(2),
    weightGrams: integer("weight_grams"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_product_variants_sku").on(table.sku),
    index("idx_product_variants_product_active").on(table.productId, table.isActive),
    index("idx_product_variants_low_stock").on(table.stockQuantity, table.lowStockThreshold),
  ],
);

export const inventoryMovements = sqliteTable(
  "inventory_movements",
  {
    id: text("id").primaryKey(),
    variantId: text("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    quantityDelta: integer("quantity_delta").notNull(),
    reason: text("reason").notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    note: text("note"),
    actorId: text("actor_id"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_inventory_movements_variant_created").on(table.variantId, table.createdAt),
    index("idx_inventory_movements_reference").on(table.referenceType, table.referenceId),
  ],
);

export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    acceptsMarketing: integer("accepts_marketing", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },
  (table) => [uniqueIndex("idx_customers_email").on(table.email)],
);

export const customerAddresses = sqliteTable(
  "customer_addresses",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("shipping"),
    recipientName: text("recipient_name").notNull(),
    company: text("company"),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    province: text("province"),
    countryCode: text("country_code").notNull().default("IT"),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },
  (table) => [index("idx_customer_addresses_customer_type").on(table.customerId, table.type)],
);

export const carts = sqliteTable(
  "carts",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull(),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"),
    currency: text("currency").notNull().default("EUR"),
    expiresAt: text("expires_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_carts_token").on(table.token),
    index("idx_carts_customer_status").on(table.customerId, table.status),
  ],
);

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPriceCents: integer("unit_price_cents").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_cart_items_cart_variant").on(table.cartId, table.variantId),
    index("idx_cart_items_product_id").on(table.productId),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull(),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    cartId: text("cart_id").references(() => carts.id, { onDelete: "set null" }),
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
    paidAt: text("paid_at"),
    cancelledAt: text("cancelled_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_orders_order_number").on(table.orderNumber),
    index("idx_orders_customer_created").on(table.customerId, table.createdAt),
    index("idx_orders_status_created").on(table.status, table.createdAt),
    index("idx_orders_payment_status").on(table.paymentStatus),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    variantName: text("variant_name"),
    sku: text("sku").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    taxRateBps: integer("tax_rate_bps").notNull().default(2200),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_order_items_order_id").on(table.orderId)],
);

export const paymentMethods = sqliteTable(
  "payment_methods",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    provider: text("provider").notNull(),
    isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(false),
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

export const paymentTransactions = sqliteTable(
  "payment_transactions",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    paymentMethodCode: text("payment_method_code").notNull(),
    providerReference: text("provider_reference"),
    type: text("type").notNull().default("authorization"),
    status: text("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    responseJson: text("response_json"),
    processedAt: text("processed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_payment_transactions_order_id").on(table.orderId),
    index("idx_payment_transactions_provider_ref").on(table.providerReference),
    index("idx_payment_transactions_status_created").on(table.status, table.createdAt),
  ],
);

export const coupons = sqliteTable(
  "coupons",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    type: text("type").notNull().default("percentage"),
    value: integer("value").notNull(),
    minimumOrderCents: integer("minimum_order_cents"),
    maximumDiscountCents: integer("maximum_discount_cents"),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),
    startsAt: text("starts_at"),
    endsAt: text("ends_at"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("idx_coupons_code").on(table.code),
    index("idx_coupons_active_dates").on(table.isActive, table.startsAt, table.endsAt),
  ],
);

export const couponUses = sqliteTable(
  "coupon_uses",
  {
    id: text("id").primaryKey(),
    couponId: text("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    discountCents: integer("discount_cents").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_coupon_uses_coupon_order").on(table.couponId, table.orderId),
    index("idx_coupon_uses_customer").on(table.customerId),
  ],
);

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminAuditLogs = sqliteTable(
  "admin_audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").notNull(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadataJson: text("metadata_json"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
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
