
-- Contact messages table (customer inquiries)
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert messages" ON public.contact_messages
  FOR INSERT TO public WITH CHECK (true);

-- Business contact info table
CREATE TABLE public.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact info is publicly readable" ON public.contact_info
  FOR SELECT USING (true);

CREATE POLICY "Admins can update contact info" ON public.contact_info
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert contact info" ON public.contact_info
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact info" ON public.contact_info
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed default contact info
INSERT INTO public.contact_info (key, value) VALUES
  ('email', 'info@example.com'),
  ('phone', '+1 (555) 000-0000'),
  ('address', '123 Main St, City, Country'),
  ('business_hours', 'Mon-Fri 9am-5pm');

-- Team members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text,
  image_url text,
  email text,
  sort_order integer NOT NULL DEFAULT 0,
  is_founder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are publicly readable" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert team members" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team members" ON public.team_members
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team members" ON public.team_members
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add status column to reviews for moderation
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Admin policy on reviews for moderation
CREATE POLICY "Admins can update reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
