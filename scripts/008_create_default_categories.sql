-- Create default categories for new users
create or replace function public.create_default_categories(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Default expense categories
  insert into public.categories (user_id, name, type, color, icon, is_default) values
    (user_id, 'Food & Dining', 'expense', '#ef4444', 'UtensilsCrossed', true),
    (user_id, 'Transportation', 'expense', '#3b82f6', 'Car', true),
    (user_id, 'Shopping', 'expense', '#8b5cf6', 'ShoppingBag', true),
    (user_id, 'Entertainment', 'expense', '#f59e0b', 'Film', true),
    (user_id, 'Bills & Utilities', 'expense', '#10b981', 'Receipt', true),
    (user_id, 'Healthcare', 'expense', '#ec4899', 'Heart', true),
    (user_id, 'Education', 'expense', '#6366f1', 'GraduationCap', true),
    (user_id, 'Travel', 'expense', '#14b8a6', 'Plane', true),
    (user_id, 'Other', 'expense', '#6b7280', 'MoreHorizontal', true);
  
  -- Default income categories
  insert into public.categories (user_id, name, type, color, icon, is_default) values
    (user_id, 'Salary', 'income', '#22c55e', 'Briefcase', true),
    (user_id, 'Freelance', 'income', '#3b82f6', 'Laptop', true),
    (user_id, 'Investment', 'income', '#8b5cf6', 'TrendingUp', true),
    (user_id, 'Gift', 'income', '#f59e0b', 'Gift', true),
    (user_id, 'Other Income', 'income', '#6b7280', 'Plus', true);
end;
$$;
