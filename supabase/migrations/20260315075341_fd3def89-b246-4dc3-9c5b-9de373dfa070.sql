
-- Allow authenticated users to insert their own role (for seller self-registration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can insert own role'
  ) THEN
    CREATE POLICY "Users can insert own role" ON public.user_roles
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
