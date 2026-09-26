create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'waiter', 'kitchen', 'billing')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null,
  waiter_id uuid references public.profiles(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'closed'))
);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  table_code text not null unique,
  seats integer not null default 2 check (seats > 0),
  qr_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  status text not null default 'available' check (status in ('available', 'occupied', 'order_placed', 'preparing', 'ready', 'served', 'bill_requested')),
  current_session_id uuid references public.table_sessions(id),
  created_at timestamptz not null default now()
);

alter table public.table_sessions add constraint table_sessions_table_id_fkey foreign key (table_id) references public.tables(id);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_session_id uuid not null references public.table_sessions(id),
  waiter_id uuid references public.profiles(id),
  source text not null check (source in ('waiter', 'customer_qr')),
  status text not null default 'draft' check (status in ('draft', 'pending_confirmation', 'confirmed', 'preparing', 'ready', 'served', 'cancelled', 'rejected')),
  cancel_reason text,
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  quantity integer not null check (quantity > 0),
  notes text,
  item_status text not null default 'pending' check (item_status in ('pending', 'preparing', 'ready', 'unavailable'))
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  table_session_id uuid not null unique references public.table_sessions(id),
  subtotal numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  service_charge numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  payment_method text check (payment_method in ('cash', 'qr', 'card')),
  status text not null default 'open' check (status in ('open', 'paid')),
  paid_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text not null check (recipient_role in ('waiter', 'kitchen', 'billing', 'admin')),
  recipient_id uuid references public.profiles(id),
  event_type text not null,
  message text not null,
  related_table_id uuid references public.tables(id),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  tax_percent numeric(5, 2) not null default 0,
  service_charge_percent numeric(5, 2) not null default 0,
  payment_qr_url text
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true limit 1 $$;

create or replace function public.submit_customer_order(p_qr_token text, p_items jsonb)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_table_id uuid;
  v_session_id uuid;
  v_order_id uuid;
  v_table_code text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  select id, current_session_id, table_code into v_table_id, v_session_id, v_table_code
  from public.tables where qr_token = p_qr_token;
  if v_table_id is null then raise exception 'Invalid table QR token'; end if;

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
exception when invalid_text_representation or foreign_key_violation or check_violation then
  raise exception 'Invalid order item payload';
end;
$$;

revoke all on function public.submit_customer_order(text, jsonb) from public;
grant execute on function public.submit_customer_order(text, jsonb) to anon;

create or replace function public.recalculate_bill(p_session_id uuid)
returns public.bills language plpgsql security definer set search_path = public
as $$
declare
  v_bill public.bills;
  v_subtotal numeric(10, 2);
  v_tax_rate numeric(5, 2);
  v_service_rate numeric(5, 2);
begin
  select coalesce(sum(oi.quantity * mi.price), 0) into v_subtotal
  from public.order_items oi join public.menu_items mi on mi.id = oi.menu_item_id
  join public.orders o on o.id = oi.order_id
  where o.table_session_id = p_session_id and o.status in ('confirmed', 'preparing', 'ready', 'served') and oi.item_status <> 'unavailable';
  select tax_percent, service_charge_percent into v_tax_rate, v_service_rate from public.settings where id = 1;
  insert into public.bills (table_session_id, subtotal, tax, service_charge, total)
  values (p_session_id, v_subtotal, round(v_subtotal * v_tax_rate / 100, 2), round(v_subtotal * v_service_rate / 100, 2), round(v_subtotal * (1 + (v_tax_rate + v_service_rate) / 100), 2))
  on conflict (table_session_id) do update set subtotal = excluded.subtotal, tax = excluded.tax, service_charge = excluded.service_charge, total = excluded.total
  returning * into v_bill;
  return v_bill;
end;
$$;

create or replace function public.handle_order_workflow()
returns trigger language plpgsql security definer set search_path = public
as $$
declare v_table_id uuid; v_code text; v_all_ready boolean;
begin
  select ts.table_id, t.table_code into v_table_id, v_code from public.table_sessions ts join public.tables t on t.id = ts.table_id where ts.id = new.table_session_id;
  if new.status = 'confirmed' and (old.status is distinct from new.status) then
    update public.tables set status = 'preparing' where id = v_table_id;
    perform public.recalculate_bill(new.table_session_id);
    insert into public.notifications (recipient_role, event_type, message, related_table_id) values ('kitchen', 'order_confirmed', 'New KOT for table ' || v_code, v_table_id);
  elsif new.status = 'ready' and (old.status is distinct from new.status) then
    update public.tables set status = 'ready' where id = v_table_id;
    insert into public.notifications (recipient_role, event_type, message, related_table_id) values ('waiter', 'order_ready', 'Order for table ' || v_code || ' is ready', v_table_id), ('billing', 'order_ready', 'Order for table ' || v_code || ' is ready', v_table_id);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_workflow_trigger on public.orders;
create trigger orders_workflow_trigger after update of status on public.orders for each row execute function public.handle_order_workflow();

create or replace function public.handle_item_status_workflow()
returns trigger language plpgsql security definer set search_path = public
as $$
declare v_order_id uuid; v_session_id uuid; v_table_id uuid; v_all_ready boolean;
begin
  if new.item_status = 'ready' and old.item_status is distinct from new.item_status then
    select o.id, o.table_session_id, ts.table_id into v_order_id, v_session_id, v_table_id from public.orders o join public.table_sessions ts on ts.id = o.table_session_id where o.id = new.order_id;
    select bool_and(item_status in ('ready', 'unavailable')) into v_all_ready from public.order_items where order_id = v_order_id;
    if v_all_ready then update public.orders set status = 'ready', ready_at = now() where id = v_order_id and status <> 'ready'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_workflow_trigger on public.order_items;
create trigger order_items_workflow_trigger after update of item_status on public.order_items for each row execute function public.handle_item_status_workflow();

do $$ declare t text; begin
  foreach t in array array['profiles','tables','table_sessions','categories','menu_items','orders','order_items','bills','notifications','settings'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid() or public.current_user_role() = 'admin');
create policy profiles_admin_write on public.profiles for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy tables_staff_read on public.tables for select to authenticated using (public.current_user_role() is not null);
create policy tables_staff_write on public.tables for all to authenticated using (public.current_user_role() in ('admin','waiter')) with check (public.current_user_role() in ('admin','waiter'));
create policy sessions_staff_access on public.table_sessions for all to authenticated using (public.current_user_role() is not null) with check (public.current_user_role() is not null);
create policy categories_public_read on public.categories for select using (true);
create policy categories_admin_write on public.categories for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy menu_public_read on public.menu_items for select using (true);
create policy menu_admin_write on public.menu_items for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy orders_staff_read on public.orders for select to authenticated using (public.current_user_role() is not null);
create policy orders_waiter_write on public.orders for insert to authenticated with check (public.current_user_role() in ('admin','waiter'));
create policy orders_staff_update on public.orders for update to authenticated using (public.current_user_role() in ('admin','waiter','kitchen')) with check (public.current_user_role() in ('admin','waiter','kitchen'));
create policy items_staff_read on public.order_items for select to authenticated using (public.current_user_role() is not null);
create policy items_staff_write on public.order_items for all to authenticated using (public.current_user_role() in ('admin','waiter','kitchen')) with check (public.current_user_role() in ('admin','waiter','kitchen'));
create policy bills_staff_access on public.bills for all to authenticated using (public.current_user_role() is not null) with check (public.current_user_role() in ('admin','billing','waiter'));
create policy notifications_role_read on public.notifications for select to authenticated using (recipient_role = public.current_user_role() or recipient_id = auth.uid() or public.current_user_role() = 'admin');
create policy notifications_role_update on public.notifications for update to authenticated using (recipient_role = public.current_user_role() or recipient_id = auth.uid() or public.current_user_role() = 'admin');
create policy settings_staff_read on public.settings for select to authenticated using (public.current_user_role() is not null);
create policy settings_admin_write on public.settings for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

alter table public.tables replica identity full;
alter table public.orders replica identity full;
alter table public.order_items replica identity full;
alter table public.bills replica identity full;
alter table public.notifications replica identity full;
alter table public.menu_items replica identity full;

do $$ declare table_name text; begin
  foreach table_name in array array['tables','orders','order_items','bills','notifications','menu_items'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true), ('payment-qr', 'payment-qr', true), ('table-qrs', 'table-qrs', true)
on conflict (id) do update set public = excluded.public;

create policy menu_images_public_read on storage.objects for select using (bucket_id = 'menu-images');
create policy payment_qr_public_read on storage.objects for select using (bucket_id = 'payment-qr');
create policy table_qrs_public_read on storage.objects for select using (bucket_id = 'table-qrs');
create policy menu_images_admin_write on storage.objects for all to authenticated using (bucket_id = 'menu-images' and public.current_user_role() = 'admin') with check (bucket_id = 'menu-images' and public.current_user_role() = 'admin');
create policy payment_qr_admin_write on storage.objects for all to authenticated using (bucket_id = 'payment-qr' and public.current_user_role() = 'admin') with check (bucket_id = 'payment-qr' and public.current_user_role() = 'admin');
create policy table_qrs_admin_write on storage.objects for all to authenticated using (bucket_id = 'table-qrs' and public.current_user_role() = 'admin') with check (bucket_id = 'table-qrs' and public.current_user_role() = 'admin');