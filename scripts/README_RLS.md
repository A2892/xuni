# RLS Hardening Scripts

This folder contains SQL scripts to harden Row-Level Security (RLS) for the project.

Files:
- `fix_student_documents_rls.sql`: Drops permissive policies on `student_documents`, creates `public.is_admin()` and secure policies.

How to run (recommended on staging first):
1. Open Supabase Console → SQL Editor.
2. Paste the script content and Run.

Or via psql:
```bash
psql "postgresql://<user>:<pass>@<host>:5432/postgres" -f scripts/fix_student_documents_rls.sql
```

Notes:
- These scripts create/replace `public.is_admin()` with `SET search_path = public, pg_temp` to avoid search_path-related warnings.
- Review `setup_database.sql` and `QUICK_FIX.md` before running; they have been updated to use admin+owner policies.
- Test app flows (read/write) for `student_media`, `student_profiles`, and `student_documents` after applying.
