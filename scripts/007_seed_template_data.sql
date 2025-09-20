-- Insert sample template data for the marketplace
INSERT INTO public.savings_plans (
  id,
  user_id,
  title,
  description,
  target_amount,
  category,
  priority,
  is_template,
  template_price,
  created_by,
  created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Emergency Fund Starter',
  'A comprehensive 6-month emergency fund plan with step-by-step milestones. Perfect for beginners who want to build financial security.',
  15000.00,
  'Emergency',
  'high',
  true,
  9.99,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Dream Vacation Planner',
  'Plan and save for your perfect vacation with detailed budget breakdowns for flights, accommodation, activities, and more.',
  8000.00,
  'Travel',
  'medium',
  true,
  14.99,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Home Down Payment Strategy',
  'Strategic savings plan for accumulating a 20% down payment on your first home, including closing costs and moving expenses.',
  50000.00,
  'Home',
  'high',
  true,
  24.99,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Wedding Budget Planner',
  'Complete wedding savings plan with detailed breakdowns for venue, catering, photography, and all wedding essentials.',
  25000.00,
  'Wedding',
  'high',
  true,
  19.99,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Car Purchase Fund',
  'Smart savings strategy for buying your next car, including down payment, insurance, and first-year maintenance costs.',
  12000.00,
  'Transportation',
  'medium',
  true,
  12.99,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Education Investment Plan',
  'Comprehensive savings plan for continuing education, certifications, or advanced degrees to boost your career.',
  20000.00,
  'Education',
  'medium',
  true,
  16.99,
  (SELECT id FROM auth.users LIMIT 1),
  NOW()
);

-- Insert sample template items for the Emergency Fund template
INSERT INTO public.savings_plan_items (
  plan_id,
  title,
  amount,
  notes,
  created_at
) VALUES 
(
  (SELECT id FROM public.savings_plans WHERE title = 'Emergency Fund Starter' AND is_template = true LIMIT 1),
  'First $1,000 - Quick Start',
  1000.00,
  'Build your initial emergency buffer as fast as possible',
  NOW()
),
(
  (SELECT id FROM public.savings_plans WHERE title = 'Emergency Fund Starter' AND is_template = true LIMIT 1),
  'Month 1-2: Basic Living Expenses',
  2500.00,
  'Cover 1 month of essential expenses (rent, utilities, groceries)',
  NOW()
),
(
  (SELECT id FROM public.savings_plans WHERE title = 'Emergency Fund Starter' AND is_template = true LIMIT 1),
  'Month 3-4: Extended Coverage',
  2500.00,
  'Build up to 2 months of living expenses',
  NOW()
),
(
  (SELECT id FROM public.savings_plans WHERE title = 'Emergency Fund Starter' AND is_template = true LIMIT 1),
  'Month 5-6: Full Protection',
  4500.00,
  'Complete your 3-month emergency fund',
  NOW()
),
(
  (SELECT id FROM public.savings_plans WHERE title = 'Emergency Fund Starter' AND is_template = true LIMIT 1),
  'Extended Fund: 6-Month Security',
  4500.00,
  'Ultimate financial security with 6 months of expenses',
  NOW()
);

-- Insert sample ratings for templates
INSERT INTO public.template_ratings (
  user_id,
  template_id,
  rating,
  review,
  created_at
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.savings_plans WHERE title = 'Emergency Fund Starter' AND is_template = true LIMIT 1),
  5,
  'Excellent template! The step-by-step approach made building my emergency fund so much easier.',
  NOW()
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.savings_plans WHERE title = 'Dream Vacation Planner' AND is_template = true LIMIT 1),
  4,
  'Great breakdown of vacation costs. Helped me plan my Europe trip perfectly!',
  NOW()
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.savings_plans WHERE title = 'Home Down Payment Strategy' AND is_template = true LIMIT 1),
  5,
  'This template saved me months of planning. The detailed breakdown is incredibly helpful.',
  NOW()
);
