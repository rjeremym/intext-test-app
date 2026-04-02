-- Convenience view for the warehouse priority queue page.

create or replace view public.vw_priority_queue as
select
  o.order_id,
  o.order_datetime,
  o.order_total,
  o.customer_id,
  c.full_name as customer_name,
  p.late_delivery_probability,
  p.predicted_late_delivery,
  p.scored_at
from public.order_predictions p
join public.orders o on o.order_id = p.order_id
join public.customers c on c.customer_id = o.customer_id;

