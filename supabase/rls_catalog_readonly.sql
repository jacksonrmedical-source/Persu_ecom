-- Run this now in Supabase SQL Editor.
-- Closes a gap: catalog tables currently have RLS disabled, which means
-- the public anon key can INSERT/UPDATE/DELETE products directly, not just
-- read them. This makes them read-only for anon/authenticated, while the
-- backend's service_role key (used by admin endpoints) still has full access
-- since service_role bypasses RLS entirely.

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table collections enable row level security;
alter table collection_products enable row level security;
alter table coupons enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);
create policy "Public read product_variants" on product_variants for select using (true);
create policy "Public read collections" on collections for select using (true);
create policy "Public read collection_products" on collection_products for select using (true);
create policy "Public read coupons" on coupons for select using (true);

-- No insert/update/delete policies are added for anon/authenticated on purpose —
-- writes to these tables should only happen via the backend's service_role key.
