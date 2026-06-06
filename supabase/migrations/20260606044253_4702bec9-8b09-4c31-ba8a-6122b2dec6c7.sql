GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;

GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.specs TO authenticated;
GRANT ALL ON public.specs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_servers TO authenticated;
GRANT ALL ON public.mock_servers TO service_role;

GRANT SELECT ON public.mock_requests TO authenticated;
GRANT ALL ON public.mock_requests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drift_reports TO authenticated;
GRANT ALL ON public.drift_reports TO service_role;

GRANT SELECT ON public.org_billing TO authenticated;
GRANT ALL ON public.org_billing TO service_role;