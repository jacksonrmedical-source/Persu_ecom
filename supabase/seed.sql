-- Sample seed data to get the UI rendering end-to-end.
-- Run after schema.sql.

insert into categories (name, slug, sort_order) values
  ('Dresses', 'dresses', 1),
  ('Shoes', 'shoes', 2),
  ('Bags', 'bags', 3),
  ('Accessories', 'accessories', 4);

insert into collections (name, slug, description, sort_order) values
  ('Flash Deals', 'flash-deals', 'Live now, gone by midnight', 1),
  ('Buy More Save More', 'buy-more-save-more', 'Stack the savings', 2),
  ('New Arrivals', 'new-arrivals', 'Fresh drops this week', 3);

-- Sample products
with cat as (select id from categories where slug = 'dresses')
insert into products (title, slug, description, category_id, mrp, sale_price, stock_total, stock_remaining, rating, rating_count, is_flash_deal, flash_deal_ends_at, dispatch_hours)
select
  'Floral Wrap Midi Dress', 'floral-wrap-midi-dress', 'Breezy cotton-blend wrap dress with a tie waist.',
  id, 1999, 899, 40, 6, 4.5, 128, true, now() + interval '5 hours', 24
from cat
union all
select
  'Corset Bodycon Dress', 'corset-bodycon-dress', 'Structured bodycon with boning detail, side slit.',
  id, 1999, 999, 30, 18, 4.2, 64, false, null, 24
from cat
union all
select
  'Gingham Tiered Mini Dress', 'gingham-tiered-mini-dress', 'Tiered ruffle mini in classic gingham check.',
  id, 1999, 899, 50, 41, 4.6, 210, false, null, 48
from cat;

with cat as (select id from categories where slug = 'shoes')
insert into products (title, slug, description, category_id, mrp, sale_price, stock_total, stock_remaining, rating, rating_count, is_flash_deal, flash_deal_ends_at, dispatch_hours)
select
  'Studded Pointed-Toe Flats', 'studded-pointed-toe-flats', 'Vegan leather flats with gold stud trim.',
  id, 999, 799, 60, 9, 4.3, 87, true, now() + interval '3 hours', 24
from cat
union all
select
  'Strappy Block Heels', 'strappy-block-heels', 'Comfort block heel with ankle strap.',
  id, 1499, 999, 25, 22, 4.1, 45, false, null, 48
from cat;

with cat as (select id from categories where slug = 'accessories')
insert into products (title, slug, description, category_id, mrp, sale_price, stock_total, stock_remaining, rating, rating_count, is_flash_deal, dispatch_hours)
select
  'Gold Hoop Earrings', 'gold-hoop-earrings', 'Waterproof, tarnish-free plated hoops.',
  id, 999, 199, 200, 34, 4.4, 302, false, 24
from cat
union all
select
  'Chain Waist Belt', 'chain-waist-belt', 'Adjustable metal chain belt for dresses & jeans.',
  id, 999, 299, 80, 12, 4.0, 19, false, 24
from cat;

-- Variants for the dresses (sizes)
insert into product_variants (product_id, size, stock, sku)
select id, size, 5, slug || '-' || size
from products, unnest(array['XS','S','M','L','XL']) as size
where slug in ('floral-wrap-midi-dress', 'corset-bodycon-dress', 'gingham-tiered-mini-dress');

-- Product images (placeholder — replace with real CDN URLs)
insert into product_images (product_id, url, is_primary, sort_order)
select id, 'https://placehold.co/600x800/FFF8F0/131A2B?text=' || replace(title, ' ', '+'), true, 0
from products;

-- Wire products into collections
insert into collection_products (collection_id, product_id, sort_order)
select c.id, p.id, row_number() over ()
from collections c, products p
where c.slug = 'flash-deals' and p.is_flash_deal = true;

insert into collection_products (collection_id, product_id, sort_order)
select c.id, p.id, row_number() over ()
from collections c, products p
where c.slug = 'buy-more-save-more' and p.sale_price < 1000;

insert into collection_products (collection_id, product_id, sort_order)
select c.id, p.id, row_number() over ()
from collections c, products p
where c.slug = 'new-arrivals';

-- Sample coupon
insert into coupons (code, discount_type, discount_value, min_order_value, max_discount, is_active)
values ('LOOT100', 'flat', 100, 999, null, true);
