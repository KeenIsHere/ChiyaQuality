create or replace function public.get_table_by_qr_token(p_qr_token text)
returns table (id uuid, table_code text, seats integer, status text)
language sql
security definer
set search_path = public
as $$
  select t.id, t.table_code, t.seats, t.status
  from public.tables t
  where t.qr_token = p_qr_token
  limit 1;
$$;

revoke all on function public.get_table_by_qr_token(text) from public;
grant execute on function public.get_table_by_qr_token(text) to anon, authenticated;

create or replace function public.submit_customer_order(p_qr_token text, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_table_id uuid;
  v_session_id uuid;
  v_order_id uuid;
  v_table_code text;
  v_invalid_count integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  select id, current_session_id, table_code into v_table_id, v_session_id, v_table_code
  from public.tables where qr_token = p_qr_token;
  if v_table_id is null then raise exception 'Invalid table QR token'; end if;

  select count(*) into v_invalid_count
  from jsonb_array_elements(p_items) item
  left join public.menu_items mi on mi.id = (item->>'menu_item_id')::uuid
  where mi.id is null or mi.is_available = false or coalesce((item->>'quantity')::integer, 0) <= 0;
  if v_invalid_count > 0 then raise exception 'One or more selected items are unavailable or invalid'; end if;

  if v_session_id is null then
    insert into public.table_sessions (table_id) values (v_table_id) returning id into v_session_id;
    update public.tables set current_session_id = v_session_id, status = 'occupied' where id = v_table_id;
  end if;

  insert into public.orders (table_session_id, source, status)
  values (v_session_id, 'customer_qr', 'pending_confirmation') returning id into v_order_id;

  insert into public.order_items (order_id, menu_item_id, quantity, notes)
  select v_order_id, (item->>'menu_item_id')::uuid, (item->>'quantity')::integer, nullif(item->>'notes', '')
  from jsonb_array_elements(p_items) item;

  insert into public.notifications (recipient_role, event_type, message, related_table_id)
  values ('waiter', 'customer_order_submitted', 'New self-order request from table ' || v_table_code, v_table_id);
  return v_order_id;
end;
$$;

revoke all on function public.submit_customer_order(text, jsonb) from public;
grant execute on function public.submit_customer_order(text, jsonb) to anon;
