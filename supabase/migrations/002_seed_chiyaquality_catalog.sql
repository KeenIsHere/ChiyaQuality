insert into public.categories (name, display_order)
values
  ('Tea & Coffee', 1),
  ('Momo', 2),
  ('Noodles', 3),
  ('Rice & Curry', 4),
  ('Snacks', 5),
  ('Beverages', 6),
  ('Desserts', 7)
on conflict (name) do update set display_order = excluded.display_order;

insert into public.menu_items (category_id, name, description, price, is_available)
select c.id, seed.name, seed.description, seed.price, true
from (values
  ('Tea & Coffee', 'Milk Tea', 'Traditional Nepali chiya with fresh milk', 45::numeric),
  ('Tea & Coffee', 'Black Tea', 'Strong black tea without milk', 35::numeric),
  ('Momo', 'Steamed Momo', '10 pieces with sesame sauce', 140::numeric),
  ('Momo', 'Fried Momo', '10 pieces with tomato chutney', 160::numeric),
  ('Noodles', 'Veg Chowmein', 'Stir-fried noodles with seasonal vegetables', 100::numeric),
  ('Noodles', 'Chicken Chowmein', 'Stir-fried noodles with chicken and vegetables', 120::numeric),
  ('Rice & Curry', 'Dal Bhat Tarkari', 'Lentil soup, rice, and seasonal curry', 150::numeric),
  ('Snacks', 'Samosa (2 pcs)', 'Crispy pastry with spiced potato filling', 50::numeric),
  ('Beverages', 'Fresh Lime Soda', 'Sweet or salted with mint', 70::numeric),
  ('Desserts', 'Chocolate Brownie', 'Warm fudgy brownie', 120::numeric)
) as seed(category_name, name, description, price)
join public.categories c on c.name = seed.category_name
where not exists (select 1 from public.menu_items existing where existing.name = seed.name);

insert into public.tables (table_code, seats)
select table_number::text, case when table_number in (2, 5, 8, 12) then 6 else 4 end
from generate_series(1, 12) as table_number
on conflict (table_code) do nothing;
