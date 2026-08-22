INSERT INTO "luxury"."categories" ("id", "name", "slug", "description", "sort_order", "is_active") VALUES
  ('11000000-0000-4000-8000-000000000004', 'Pantaloni', 'pantaloni', 'Jeans, pantaloni cargo e modelli sportivi.', 40, true),
  ('11000000-0000-4000-8000-000000000005', 'Camicie e polo', 'camicie-e-polo', 'Camicie a maniche corte e polo.', 50, true),
  ('11000000-0000-4000-8000-000000000006', 'Giacche', 'giacche', 'Giacche leggere, tecniche e con cappuccio.', 60, true)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = true,
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."products" (
  "id", "category_id", "name", "slug", "sku", "short_description", "description",
  "brand", "gender", "status", "base_price_cents", "currency", "is_featured", "metadata_json"
) VALUES
  (
    '21000000-0000-4000-8000-000000000004',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'pantaloni'),
    'Jeans cargo Dior in twill di cotone blu',
    'dior-jeans-cargo-twill-cotone-blu',
    'DIOR-PAN-001',
    'Jeans cargo blu dalla gamba ampia con tasche applicate laterali.',
    'Un modello ispirato al guardaroba utility, realizzato in denim blu con passanti in vita e ampie tasche cargo sui lati. La linea è dritta e rilassata. Composizione, taglia, codice articolo e condizioni saranno verificati direttamente sul capo prima della vendita.',
    'Dior', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"683D182B3062_C530"}'
  ),
  (
    '21000000-0000-4000-8000-000000000005',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'camicie-e-polo'),
    'Camicia bowling Gucci in seta jacquard GG nera',
    'gucci-camicia-bowling-seta-jacquard-gg-nera',
    'GUCCI-CAM-001',
    'Camicia nera a maniche corte con motivo GG jacquard all-over.',
    'Camicia bowling con colletto aperto, chiusura frontale con bottoni e tasca applicata sul petto. Il motivo GG tono su tono attraversa l''intera superficie. Materiale, taglia, riferimento e condizioni del capo fotografato saranno confermati prima della vendita.',
    'Gucci', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"864366_ZATF9_1000"}'
  ),
  (
    '21000000-0000-4000-8000-000000000006',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'camicie-e-polo'),
    'Camicia bowling Gucci in canvas GG beige',
    'gucci-camicia-bowling-canvas-gg-beige',
    'GUCCI-CAM-002',
    'Camicia beige a maniche corte con monogramma GG blu all-over.',
    'Camicia dalla costruzione bowling, con colletto aperto, bottoni frontali e motivo GG ripetuto in contrasto. La linea appare morbida e adatta alla stagione calda. Composizione, taglia, codice esatto e condizioni saranno verificati sul prodotto.',
    'Gucci', 'uomo', 'active', 0, 'EUR', false,
    '{"pricePending":true,"verificationRequired":true,"reference":"794907_ZAM7G"}'
  ),
  (
    '21000000-0000-4000-8000-000000000007',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 't-shirt'),
    'T-shirt Gucci in jersey con ricamo logo',
    'gucci-t-shirt-jersey-ricamo-logo',
    'GUCCI-TSH-001',
    'T-shirt girocollo con grande ricamo Gucci nelle varianti bianca e nera.',
    'T-shirt a maniche corte dalla linea essenziale, caratterizzata dal ricamo Gucci frontale nei toni rosso e verde. La foto mostra le varianti bianca e nera. Composizione, vestibilità, taglie disponibili e autenticità saranno verificate prima della vendita.',
    'Gucci', 'unisex', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"logo-embroidery-image-match"}'
  ),
  (
    '21000000-0000-4000-8000-000000000008',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 't-shirt'),
    'T-shirt Balenciaga con logo distorto',
    'balenciaga-t-shirt-logo-distorto-nera',
    'BAL-TSH-001',
    'T-shirt nera a maniche corte con grafica Balenciaga distorta.',
    'T-shirt girocollo nera con stampa frontale grigia dall''effetto mosso e distorto. La silhouette appare ampia e rilassata. Tessuto, taglia, codice modello, condizioni e autenticità saranno confermati direttamente sul capo.',
    'Balenciaga', 'unisex', 'active', 0, 'EUR', false,
    '{"pricePending":true,"verificationRequired":true,"reference":"distorted-logo-image-match"}'
  ),
  (
    '21000000-0000-4000-8000-000000000009',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'pantaloni'),
    'Pantaloni tuta Balenciaga Loop Sports Icon',
    'balenciaga-loop-sports-icon-track-pants',
    'BAL-PAN-001',
    'Pantaloni sportivi blu e neri con pannelli e bande laterali a contrasto.',
    'Pantaloni da tuta in tessuto tecnico con vita elasticizzata e coulisse, costruzione a pannelli e gamba ampia. Le bande laterali chiare e il ricamo Loop Sports Icon completano il modello. Taglia, composizione, codice e condizioni saranno verificati prima della vendita.',
    'Balenciaga', 'unisex', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"831393_TRO31_1055"}'
  ),
  (
    '21000000-0000-4000-8000-000000000010',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'felpe-e-cardigan'),
    'Felpa Balenciaga Flipped Uni con zip',
    'balenciaga-flipped-uni-felpa-zip-nera',
    'BAL-FEL-001',
    'Felpa nera con cappuccio, zip e logo Balenciaga capovolto sul petto.',
    'Felpa con cappuccio dalla vestibilità rilassata, chiusura frontale con zip e due tasche applicate. Il piccolo logo ricamato con effetto capovolto firma il davanti. Composizione, taglia, riferimento e condizioni saranno controllati sul capo.',
    'Balenciaga', 'unisex', 'active', 0, 'EUR', false,
    '{"pricePending":true,"verificationRequired":true,"reference":"803264_TSVU7_1750"}'
  ),
  (
    '21000000-0000-4000-8000-000000000011',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'giacche'),
    'Giacca tuta Balenciaga Soccer nera',
    'balenciaga-soccer-tracksuit-jacket-nera',
    'BAL-GIA-001',
    'Giacca sportiva nera con collo alto, profili riflettenti e stemma ricamato.',
    'Giacca Soccer con collo alto, zip frontale e profili a contrasto. Lo stemma con corona d''alloro e le grafiche Balenciaga sul davanti richiamano l''abbigliamento da squadra. Taglia, composizione e condizioni saranno verificate prima della vendita.',
    'Balenciaga', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"A003GGTPQ381000"}'
  ),
  (
    '21000000-0000-4000-8000-000000000012',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'camicie-e-polo'),
    'Polo Burberry con motivo Icon Stripe',
    'burberry-polo-icon-stripe',
    'BUR-POL-001',
    'Polo a maniche corte con dettaglio Icon Stripe, bianca o nera.',
    'Polo con colletto classico e abbottonatura frontale, caratterizzata dal motivo a righe nei toni beige, rosso, bianco e nero. La foto mostra due varianti colore. Materiale, vestibilità, taglie e riferimento esatto saranno verificati sul capo.',
    'Burberry', 'uomo', 'active', 0, 'EUR', false,
    '{"pricePending":true,"verificationRequired":true,"reference":"icon-stripe-image-match"}'
  ),
  (
    '21000000-0000-4000-8000-000000000013',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'giacche'),
    'Giacca Burberry con cappuccio Vintage Check',
    'burberry-giacca-cappuccio-vintage-check',
    'BUR-GIA-001',
    'Giacca leggera con cappuccio e motivo Vintage Check color beige archivio.',
    'Giacca con cappuccio e chiusura frontale con zip, costruita attorno al riconoscibile motivo Vintage Check. Il taglio è lineare e pensato come strato leggero. Composizione, eventuale reversibilità, taglia e condizioni saranno confermate prima della vendita.',
    'Burberry', 'uomo', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"80617361"}'
  ),
  (
    '21000000-0000-4000-8000-000000000014',
    (SELECT "id" FROM "luxury"."categories" WHERE "slug" = 'cinture'),
    'Cintura Burberry reversibile in pelle con fibbia TB',
    'burberry-cintura-reversibile-pelle-fibbia-tb',
    'BUR-BEL-001',
    'Cintura nera in pelle con fibbia Thomas Burberry Monogram dorata.',
    'Cintura in pelle con fibbia TB in metallo color oro e costruzione reversibile. La linea pulita la rende adatta sia a pantaloni formali sia a denim. Misura, larghezza, materiali e condizioni saranno verificati direttamente sul prodotto.',
    'Burberry', 'unisex', 'active', 0, 'EUR', true,
    '{"pricePending":true,"verificationRequired":true,"reference":"80718341"}'
  )
ON CONFLICT ("slug") DO UPDATE SET
  "category_id" = EXCLUDED."category_id",
  "name" = EXCLUDED."name",
  "sku" = EXCLUDED."sku",
  "short_description" = EXCLUDED."short_description",
  "description" = EXCLUDED."description",
  "brand" = EXCLUDED."brand",
  "gender" = EXCLUDED."gender",
  "status" = 'active',
  "base_price_cents" = 0,
  "currency" = 'EUR',
  "is_featured" = EXCLUDED."is_featured",
  "metadata_json" = EXCLUDED."metadata_json",
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."product_variants" (
  "id", "product_id", "sku", "title", "color", "size", "price_cents", "stock_quantity", "is_active"
) VALUES
  ('31000000-0000-4000-8000-000000000005', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-jeans-cargo-twill-cotone-blu'), 'DIOR-PAN-001-BLU', 'Blu · taglia da definire', 'Blu', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000006', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-camicia-bowling-seta-jacquard-gg-nera'), 'GUCCI-CAM-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000007', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-camicia-bowling-canvas-gg-beige'), 'GUCCI-CAM-002-BGE', 'Beige · taglia da definire', 'Beige', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000008', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-t-shirt-jersey-ricamo-logo'), 'GUCCI-TSH-001-WHT', 'Bianca · taglia da definire', 'Bianco', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000009', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-t-shirt-jersey-ricamo-logo'), 'GUCCI-TSH-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000010', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-t-shirt-logo-distorto-nera'), 'BAL-TSH-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000011', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-loop-sports-icon-track-pants'), 'BAL-PAN-001-BLU', 'Blu e nero · taglia da definire', 'Blu e nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000012', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-flipped-uni-felpa-zip-nera'), 'BAL-FEL-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000013', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-soccer-tracksuit-jacket-nera'), 'BAL-GIA-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000014', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-polo-icon-stripe'), 'BUR-POL-001-WHT', 'Bianca · taglia da definire', 'Bianco', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000015', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-polo-icon-stripe'), 'BUR-POL-001-BLK', 'Nera · taglia da definire', 'Nero', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000016', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-giacca-cappuccio-vintage-check'), 'BUR-GIA-001-BGE', 'Beige archivio · taglia da definire', 'Beige archivio', NULL, NULL, 0, true),
  ('31000000-0000-4000-8000-000000000017', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-cintura-reversibile-pelle-fibbia-tb'), 'BUR-BEL-001-BLK', 'Nera e oro · misura da definire', 'Nero e oro', NULL, NULL, 0, true)
ON CONFLICT ("sku") DO UPDATE SET
  "product_id" = EXCLUDED."product_id",
  "title" = EXCLUDED."title",
  "color" = EXCLUDED."color",
  "size" = EXCLUDED."size",
  "price_cents" = NULL,
  "stock_quantity" = 0,
  "is_active" = true,
  "updated_at" = CURRENT_TIMESTAMP;--> statement-breakpoint

INSERT INTO "luxury"."product_images" ("id", "product_id", "url", "alt_text", "sort_order") VALUES
  ('51000000-0000-4000-8000-000000000004', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'dior-jeans-cargo-twill-cotone-blu'), '/images/catalog/dior-cargo-jeans-blue.png', 'Jeans cargo Dior blu con tasche laterali', 0),
  ('51000000-0000-4000-8000-000000000005', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-camicia-bowling-seta-jacquard-gg-nera'), '/images/catalog/gucci-gg-silk-jacquard-bowling-shirt-black.png', 'Camicia bowling Gucci nera con motivo GG jacquard', 0),
  ('51000000-0000-4000-8000-000000000006', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-camicia-bowling-canvas-gg-beige'), '/images/catalog/gucci-gg-canvas-bowling-shirt-beige.png', 'Camicia bowling Gucci beige con motivo GG blu', 0),
  ('51000000-0000-4000-8000-000000000007', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'gucci-t-shirt-jersey-ricamo-logo'), '/images/catalog/gucci-logo-embroidered-tshirt.png', 'T-shirt Gucci bianca e nera con ricamo logo', 0),
  ('51000000-0000-4000-8000-000000000008', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-t-shirt-logo-distorto-nera'), '/images/catalog/balenciaga-distorted-logo-tshirt-black.png', 'T-shirt Balenciaga nera con logo distorto', 0),
  ('51000000-0000-4000-8000-000000000009', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-loop-sports-icon-track-pants'), '/images/catalog/balenciaga-loop-sports-icon-track-pants.png', 'Pantaloni tuta Balenciaga blu e neri con bande laterali', 0),
  ('51000000-0000-4000-8000-000000000010', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-flipped-uni-felpa-zip-nera'), '/images/catalog/balenciaga-flipped-uni-zip-hoodie.png', 'Felpa Balenciaga nera con zip e cappuccio', 0),
  ('51000000-0000-4000-8000-000000000011', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'balenciaga-soccer-tracksuit-jacket-nera'), '/images/catalog/balenciaga-soccer-tracksuit-jacket.png', 'Giacca tuta Balenciaga Soccer nera', 0),
  ('51000000-0000-4000-8000-000000000012', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-polo-icon-stripe'), '/images/catalog/burberry-icon-stripe-polo.png', 'Polo Burberry Icon Stripe bianca e nera', 0),
  ('51000000-0000-4000-8000-000000000013', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-giacca-cappuccio-vintage-check'), '/images/catalog/burberry-check-hooded-jacket.png', 'Giacca Burberry con cappuccio e motivo Vintage Check', 0),
  ('51000000-0000-4000-8000-000000000014', (SELECT "id" FROM "luxury"."products" WHERE "slug" = 'burberry-cintura-reversibile-pelle-fibbia-tb'), '/images/catalog/burberry-tb-belt.png', 'Cintura Burberry nera con fibbia TB dorata', 0)
ON CONFLICT ("id") DO UPDATE SET
  "product_id" = EXCLUDED."product_id",
  "url" = EXCLUDED."url",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;
