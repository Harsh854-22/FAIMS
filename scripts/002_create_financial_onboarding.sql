-- Create financial onboarding responses table
CREATE TABLE IF NOT EXISTS public.financial_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income DECIMAL(12,2),
  monthly_spending DECIMAL(12,2),
  current_savings DECIMAL(12,2),
  monthly_emi DECIMAL(12,2),
  financial_goals TEXT[],
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  investment_experience TEXT CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced')),
  five_year_plan TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.financial_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "onboarding_select_own" ON public.financial_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "onboarding_insert_own" ON public.financial_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "onboarding_update_own" ON public.financial_onboarding FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "onboarding_delete_own" ON public.financial_onboarding FOR DELETE USING (auth.uid() = user_id);
