-- 1) Move billing identifiers out of organizations into an owner-scoped table
CREATE TABLE IF NOT EXISTS public.org_billing (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.org_billing (org_id, stripe_customer_id, stripe_subscription_id)
SELECT id, stripe_customer_id, stripe_subscription_id
FROM public.organizations
WHERE stripe_customer_id IS NOT NULL OR stripe_subscription_id IS NOT NULL
ON CONFLICT (org_id) DO NOTHING;

ALTER TABLE public.organizations DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS stripe_subscription_id;

GRANT SELECT ON public.org_billing TO authenticated;
GRANT ALL ON public.org_billing TO service_role;

ALTER TABLE public.org_billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_billing_read_owner_admin" ON public.org_billing;
CREATE POLICY "org_billing_read_owner_admin" ON public.org_billing
  FOR SELECT TO authenticated
  USING (
    org_id = public.current_org_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- 2) Prevent users from escalating privileges by modifying their own org_id/role
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
CREATE POLICY "profile_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.id THEN
    IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN
      RAISE EXCEPTION 'Changing org_id is not permitted';
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Changing role is not permitted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 3) Remove the self-serve organization INSERT policy.
DROP POLICY IF EXISTS "org_insert_when_missing_workspace" ON public.organizations;

GRANT EXECUTE ON FUNCTION public.ensure_user_workspace(text, text) TO authenticated;

-- 4) Restrict Realtime channel subscriptions to the user's own organization.
DROP POLICY IF EXISTS "realtime_org_scoped_read" ON realtime.messages;
CREATE POLICY "realtime_org_scoped_read" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    public.current_org_id() IS NOT NULL
    AND (
      realtime.topic() = ('org:' || public.current_org_id()::text)
      OR realtime.topic() LIKE ('org:' || public.current_org_id()::text || ':%')
      OR realtime.topic() LIKE 'realtime:%'
    )
  );

DROP POLICY IF EXISTS "realtime_org_scoped_write" ON realtime.messages;
CREATE POLICY "realtime_org_scoped_write" ON realtime.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_org_id() IS NOT NULL
    AND (
      realtime.topic() = ('org:' || public.current_org_id()::text)
      OR realtime.topic() LIKE ('org:' || public.current_org_id()::text || ':%')
    )
  );