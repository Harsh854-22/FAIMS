-- Create financial goals table
create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  target_amount decimal(12,2) not null,
  current_amount decimal(12,2) default 0.00,
  target_date date,
  category text check (category in ('emergency_fund', 'vacation', 'house', 'car', 'education', 'retirement', 'other')),
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  is_achieved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.financial_goals enable row level security;

-- RLS policies for financial goals
create policy "goals_select_own"
  on public.financial_goals for select
  using (auth.uid() = user_id);

create policy "goals_insert_own"
  on public.financial_goals for insert
  with check (auth.uid() = user_id);

create policy "goals_update_own"
  on public.financial_goals for update
  using (auth.uid() = user_id);

create policy "goals_delete_own"
  on public.financial_goals for delete
  using (auth.uid() = user_id);
