-- Create periods table for gamification system
CREATE TABLE public.periods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  year integer NOT NULL,
  period_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(year, period_number)
);

-- Create achievements table for badge definitions
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  badge_icon text NOT NULL,
  criteria jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned badges
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id),
  period_id uuid NOT NULL REFERENCES public.periods(id),
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id, period_id)
);

-- Enable RLS
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for periods
CREATE POLICY "Everyone can view periods" ON public.periods FOR SELECT USING (true);
CREATE POLICY "Admins can manage periods" ON public.periods FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for achievements
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage user achievements" ON public.user_achievements FOR ALL USING (is_admin(auth.uid()));

-- Insert 2025 periods (13 four-week periods)
INSERT INTO public.periods (name, start_date, end_date, year, period_number) VALUES
('2025 P1', '2025-01-01', '2025-01-28', 2025, 1),
('2025 P2', '2025-01-29', '2025-02-25', 2025, 2),
('2025 P3', '2025-02-26', '2025-03-25', 2025, 3),
('2025 P4', '2025-03-26', '2025-04-22', 2025, 4),
('2025 P5', '2025-04-23', '2025-05-20', 2025, 5),
('2025 P6', '2025-05-21', '2025-06-17', 2025, 6),
('2025 P7', '2025-06-18', '2025-07-15', 2025, 7),
('2025 P8', '2025-07-16', '2025-08-12', 2025, 8),
('2025 P9', '2025-08-13', '2025-09-09', 2025, 9),
('2025 P10', '2025-09-10', '2025-10-07', 2025, 10),
('2025 P11', '2025-10-08', '2025-11-04', 2025, 11),
('2025 P12', '2025-11-05', '2025-12-02', 2025, 12),
('2025 P13', '2025-12-03', '2025-12-30', 2025, 13);

-- Insert achievement definitions
INSERT INTO public.achievements (name, description, badge_icon, criteria) VALUES
('Sniper Badge', 'No Sandwich Made Wrong or Missing Item complaints for a whole period', '🎯', '{"no_categories": ["Sandwich Made Wrong", "Missing item"]}'),
('Speed Demon', 'No Slow Service complaints for a whole period', '🏃', '{"no_categories": ["Slow service"]}'),
('Red Carpet', 'More than 3 praise feedbacks in a period', '🌟', '{"min_praise_count": 3}');

-- Add triggers for updated_at
CREATE TRIGGER update_periods_updated_at BEFORE UPDATE ON public.periods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user earned Sniper Badge for a period
CREATE OR REPLACE FUNCTION public.check_sniper_badge(user_uuid uuid, period_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM customer_feedback cf
    JOIN periods p ON cf.feedback_date >= p.start_date AND cf.feedback_date <= p.end_date
    WHERE cf.user_id = user_uuid 
    AND p.id = period_uuid
    AND cf.complaint_category IN ('Sandwich Made Wrong', 'Missing item')
  );
$$;

-- Function to check if user earned Speed Demon Badge for a period
CREATE OR REPLACE FUNCTION public.check_speed_demon_badge(user_uuid uuid, period_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM customer_feedback cf
    JOIN periods p ON cf.feedback_date >= p.start_date AND cf.feedback_date <= p.end_date
    WHERE cf.user_id = user_uuid 
    AND p.id = period_uuid
    AND cf.complaint_category = 'Slow service'
  );
$$;

-- Function to check if user earned Red Carpet Badge for a period
CREATE OR REPLACE FUNCTION public.check_red_carpet_badge(user_uuid uuid, period_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM customer_feedback cf
    JOIN periods p ON cf.feedback_date >= p.start_date AND cf.feedback_date <= p.end_date
    WHERE cf.user_id = user_uuid 
    AND p.id = period_uuid
    AND cf.complaint_category = 'Praise'
  ) > 3;
$$;