CREATE INDEX "idx_cart_items_variant_id" ON "luxury"."cart_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_coupon_uses_order_id" ON "luxury"."coupon_uses" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product_id" ON "luxury"."order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_variant_id" ON "luxury"."order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_orders_cart_id" ON "luxury"."orders" USING btree ("cart_id");