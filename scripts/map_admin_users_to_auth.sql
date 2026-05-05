-- Map existing admin_users rows to auth.users by email where possible
-- Adds user_id column if missing, attempts to auto-fill by matching username -> auth.users.email

ALTER TABLE IF EXISTS public.admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Try automatic mapping when admin_users.username equals auth.users.email
UPDATE public.admin_users a
SET user_id = u.id
FROM auth.users u
WHERE a.user_id IS NULL
  AND lower(a.username) = lower(u.email);

-- Show results and any unmapped admin rows for manual handling
SELECT a.id AS admin_row_id, a.username, a.user_id, u.id AS matched_auth_id, u.email
FROM public.admin_users a
LEFT JOIN auth.users u ON a.user_id = u.id
ORDER BY a.id;

-- For any remaining rows with NULL user_id, update manually like:
-- UPDATE public.admin_users SET user_id = '<AUTH_USER_ID>' WHERE id = '<ADMIN_ROW_ID>';

-- After mapping, re-run RLS hardening script if needed:
--   psql "postgresql://<user>:<pass>@<host>:5432/postgres" -f scripts/fix_student_documents_rls.sql
