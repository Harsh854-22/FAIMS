-- Create bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  frequency TEXT CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
  is_recurring BOOLEAN DEFAULT TRUE,
  auto_pay BOOLEAN DEFAULT FALSE,
  labels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bill payments table
CREATE TABLE IF NOT EXISTS public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create EMI table
CREATE TABLE IF NOT EXISTS public.emis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  monthly_emi DECIMAL(12,2) NOT NULL,
  remaining_amount DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'closed')) DEFAULT 'active',
  lender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;

-- Create policies for bills
CREATE POLICY "bills_select_own" ON public.bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bills_insert_own" ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bills_update_own" ON public.bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bills_delete_own" ON public.bills FOR DELETE USING (auth.uid() = user_id);

-- Create policies for bill_payments
CREATE POLICY "payments_select_own" ON public.bill_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert_own" ON public.bill_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update_own" ON public.bill_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payments_delete_own" ON public.bill_payments FOR DELETE USING (auth.uid() = user_id);

-- Create policies for emis
CREATE POLICY "emis_select_own" ON public.emis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "emis_insert_own" ON public.emis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "emis_update_own" ON public.emis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "emis_delete_own" ON public.emis FOR DELETE USING (auth.uid() = user_id);
