-- After importing SQLite/CSV data with explicit IDs, Postgres identity sequences
-- stay at 1..N. The next DEFAULT nextval would reuse IDs → duplicate key on PK.
-- Resync each sequence to MAX(id) so new rows get fresh IDs.

select setval(
  pg_get_serial_sequence('public.customers', 'customer_id'),
  coalesce((select max(customer_id) from public.customers), 0)
);

select setval(
  pg_get_serial_sequence('public.products', 'product_id'),
  coalesce((select max(product_id) from public.products), 0)
);

select setval(
  pg_get_serial_sequence('public.orders', 'order_id'),
  coalesce((select max(order_id) from public.orders), 0)
);

select setval(
  pg_get_serial_sequence('public.order_items', 'order_item_id'),
  coalesce((select max(order_item_id) from public.order_items), 0)
);

select setval(
  pg_get_serial_sequence('public.shipments', 'shipment_id'),
  coalesce((select max(shipment_id) from public.shipments), 0)
);

select setval(
  pg_get_serial_sequence('public.product_reviews', 'review_id'),
  coalesce((select max(review_id) from public.product_reviews), 0)
);
