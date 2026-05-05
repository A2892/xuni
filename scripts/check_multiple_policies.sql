-- Check tables that have multiple policies for same role(s) and command
SELECT schemaname, tablename, roles, cmd, count(*) AS policy_count, array_agg(policyname ORDER BY policyname) AS policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename, roles, cmd
HAVING count(*) > 1
ORDER BY tablename, roles, cmd;
