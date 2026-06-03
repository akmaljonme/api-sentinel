-- Revoke broad EXECUTE on SECURITY DEFINER functions, keep only what's needed.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_user_workspace(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.current_org_id() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.ensure_user_workspace(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_org_id() TO authenticated;