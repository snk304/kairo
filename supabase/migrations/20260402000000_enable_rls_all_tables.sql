-- Enable Row-Level Security on all tables in the public schema
-- This blocks all direct PostgREST API access (anon/authenticated roles).
-- Laravel connects via a direct database connection (not PostgREST),
-- so it is not affected by these policies.

-- =========================================================
-- 1. Enable RLS on every table
-- =========================================================
ALTER TABLE public.users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobseeker_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prefectures              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disability_types         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_access_tokens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_locks              ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 2. Deny all access to anon and authenticated roles
--    (No permissive policies = default deny)
--    Explicitly revoke to make intent clear.
-- =========================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- =========================================================
-- 3. Ensure the Laravel DB user (postgres) bypasses RLS
--    Supabase's postgres role is a superuser and already
--    bypasses RLS by default — this is just documentation.
-- =========================================================
-- ALTER ROLE postgres BYPASSRLS;  -- already the default on Supabase
