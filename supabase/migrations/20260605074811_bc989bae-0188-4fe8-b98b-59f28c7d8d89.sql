DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users that don't have a profile yet
INSERT INTO public.organizations (name, slug)
SELECT
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) || '''s workspace',
  substr(u.id::text, 1, 8)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, org_id, full_name, role)
SELECT
  u.id,
  o.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'owner'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
JOIN public.organizations o ON o.slug = substr(u.id::text, 1, 8)
WHERE p.id IS NULL;