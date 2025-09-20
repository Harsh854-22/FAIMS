-- Create template purchases table
CREATE TABLE IF NOT EXISTS public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.savings_plans(id) ON DELETE CASCADE,
  purchase_price DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template ratings table
CREATE TABLE IF NOT EXISTS public.template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.savings_plans(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for template_purchases
CREATE POLICY "purchases_select_own" ON public.template_purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "purchases_insert_own" ON public.template_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create policies for template_ratings
CREATE POLICY "ratings_select_all" ON public.template_ratings FOR SELECT TO authenticated;
CREATE POLICY "ratings_insert_own" ON public.template_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own" ON public.template_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ratings_delete_own" ON public.template_ratings FOR DELETE USING (auth.uid() = user_id);
