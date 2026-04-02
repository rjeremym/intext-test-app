-- Helper RPCs used by the app.

create or replace function public.dashboard_customer_agg(p_customer_id bigint)
returns table (
  total_orders bigint,
  total_spend double precision
)
language sql
stable
as $$
  select
    count(*) as total_orders,
    coalesce(sum(o.order_total), 0)::double precision as total_spend
  from public.orders o
  where o.customer_id = p_customer_id;
$$;

