-- Create financial goals table
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE NOT NULL,
  category TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal deposits table (for tracking deposits)
CREATE TABLE IF NOT EXISTS public.goal_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  deposit_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_deposits ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_goals
CREATE POLICY "goals_select_own" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_insert_own" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Create policies for goal_deposits
CREATE POLICY "deposits_select_own" ON public.goal_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "deposits_insert_own" ON public.goal_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "deposits_update_own" ON public.goal_deposits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "deposits_delete_own" ON public.goal_deposits FOR DELETE USING (auth.uid() = user_id);
