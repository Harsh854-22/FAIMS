-- Create savings plans table (Notion-like functionality)
CREATE TABLE IF NOT EXISTS public.savings_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  category TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  is_template BOOLEAN DEFAULT FALSE,
  template_price DECIMAL(10,2),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings plan items table (for detailed breakdown)
CREATE TABLE IF NOT EXISTS public.savings_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.savings_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_plan_items ENABLE ROW LEVEL SECURITY;

-- Create policies for savings_plans
CREATE POLICY "plans_select_own_or_template" ON public.savings_plans FOR SELECT USING (auth.uid() = user_id OR is_template = TRUE);
CREATE POLICY "plans_insert_own" ON public.savings_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plans_update_own" ON public.savings_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "plans_delete_own" ON public.savings_plans FOR DELETE USING (auth.uid() = user_id);

-- Create policies for savings_plan_items
CREATE POLICY "plan_items_select_own" ON public.savings_plan_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.savings_plans WHERE id = plan_id AND (user_id = auth.uid() OR is_template = TRUE))
);
CREATE POLICY "plan_items_insert_own" ON public.savings_plan_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.savings_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "plan_items_update_own" ON public.savings_plan_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.savings_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "plan_items_delete_own" ON public.savings_plan_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.savings_plans WHERE id = plan_id AND user_id = auth.uid())
);
