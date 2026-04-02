-- Class demo: avoid PostgREST "insert + returning" returning zero rows when RLS is on
-- but policies only allow INSERT (common if anon key was mistaken for service_role).
-- Service role bypasses RLS, but this keeps local/dev mistakes obvious.
-- For production you'd use proper policies instead.

alter table if exists public.customers disable row level security;
alter table if exists public.products disable row level security;
alter table if exists public.orders disable row level security;
alter table if exists public.order_items disable row level security;
alter table if exists public.shipments disable row level security;
alter table if exists public.product_reviews disable row level security;
alter table if exists public.order_predictions disable row level security;
