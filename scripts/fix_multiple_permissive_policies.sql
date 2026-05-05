-- Fix multiple permissive policies
-- This script finds groups of policies on the same table with the same role(s) and command
-- where there are more than one permissive policies, and drops all but one.
-- Rule: prefer keeping policy whose name contains 'unified'; otherwise keep the lexicographically first.
-- Run this on your database (psql or Supabase SQL editor).

DO $$
DECLARE
  grp RECORD;
  pname text;
  keep_policy text;
BEGIN
  FOR grp IN
    SELECT schemaname, tablename, roles, cmd, array_agg(policyname ORDER BY policyname) AS policies, count(*) AS cnt
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, roles, cmd
    HAVING count(*) > 1
  LOOP
    -- choose keep policy: prefer one with 'unified' in name
    keep_policy := NULL;
    FOREACH pname IN ARRAY grp.policies LOOP
      IF pname ILIKE '%unified%' THEN
        keep_policy := pname;
        EXIT;
      END IF;
    END LOOP;

    IF keep_policy IS NULL THEN
      keep_policy := grp.policies[1];
    END IF;

    RAISE NOTICE 'Table %.% roles=% cmd=% has % policies; keeping %', grp.schemaname, grp.tablename, grp.roles, grp.cmd, array_length(grp.policies,1), keep_policy;

    FOREACH pname IN ARRAY grp.policies LOOP
      IF pname <> keep_policy THEN
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pname, grp.schemaname, grp.tablename);
        RAISE NOTICE 'Dropped policy % on %.%', pname, grp.schemaname, grp.tablename;
      END IF;
    END LOOP;
  END LOOP;
END $$;
