-- TrendLoot database schema (Supabase / Postgres)
-- Run in Supabase SQL editor, top to bottom.

create extension if not exists "uuid-ossp";

-- ============ CATEGORIES ============
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============ PRODUCTS ============
create table products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  brand text,
  mrp numeric(10,2) not null,           -- original price
  sale_price numeric(10,2) not null,    -- current selling price
  stock_total int not null default 0,   -- used for "loot meter" scarcity display
  stock_remaining int not null default 0,
  rating numeric(2,1) default 0,
  rating_count int default 0,
  is_active boolean default true,
  is_flash_deal boolean default false,
  flash_deal_ends_at timestamptz,
  dispatch_hours int default 48,        -- "Dispatch in 24 Hours" style badge
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_products_category on products(category_id);
create index idx_products_flash on products(is_flash_deal) where is_flash_deal = true;

-- ============ PRODUCT IMAGES ============
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  is_primary boolean default false
);

-- ============ PRODUCT VARIANTS (size/color) ============
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  size text,               -- e.g. XS/S/M/L/XL or 34-42 for shoes
  color text,
  stock int not null default 0,
  sku text unique,
  created_at timestamptz default now()
);

-- ============ DEAL COLLECTIONS (curated rails like "Buy More Save More") ============
create table collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  banner_url text,
  sort_order int default 0,
  is_active boolean default true
);

create table collection_products (
  collection_id uuid references collections(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  sort_order int default 0,
  primary key (collection_id, product_id)
);

-- ============ USERS (extends Supabase auth.users) ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- ============ ADDRESSES ============
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false
);

-- ============ CART ============
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null default 1,
  created_at timestamptz default now(),
  unique(user_id, variant_id)
);

-- ============ COUPONS ============
create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text check (discount_type in ('flat','percent')) not null,
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  max_discount numeric(10,2),
  valid_from timestamptz default now(),
  valid_until timestamptz,
  usage_limit int,
  times_used int default 0,
  is_active boolean default true
);

-- ============ ORDERS ============
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  address_id uuid references addresses(id),
  status text check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')) default 'pending',
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  shipping_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  coupon_id uuid references coupons(id),
  razorpay_order_id text,
  razorpay_payment_id text,
  payment_status text check (payment_status in ('pending','paid','failed')) default 'pending',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  title_snapshot text not null,   -- preserve name/price at time of order
  price_snapshot numeric(10,2) not null,
  quantity int not null
);

-- ============ ROW LEVEL SECURITY ============
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);

create policy "Users manage own addresses" on addresses
  for all using (auth.uid() = user_id);

create policy "Users manage own cart" on cart_items
  for all using (auth.uid() = user_id);

create policy "Users view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users view own order items" on order_items
  for select using (
    order_id in (select id from orders where user_id = auth.uid())
  );

-- Public read access for catalog tables (no RLS needed, but keep explicit)
-- products, categories, collections, product_images, product_variants stay public-read
-- via the anon key — no RLS enabled on those by design.
