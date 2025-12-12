-- ============================================
-- SENTINEL Cyber Intelligence Platform
-- Database Initialization Script
-- ============================================

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE sentinel_core'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sentinel_core')\gexec

-- Connect to the database
\c sentinel_core

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For JSONB indexing

-- Create application user
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'sentinel_user') THEN
    CREATE USER sentinel_user WITH PASSWORD 'sentinel_secure_pass';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sentinel_core TO sentinel_user;
GRANT ALL ON SCHEMA public TO sentinel_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sentinel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sentinel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO sentinel_user;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE '✓ Database sentinel_core initialized';
  RAISE NOTICE '✓ Extensions enabled: uuid-ossp, pg_trgm, btree_gin';
  RAISE NOTICE '✓ User sentinel_user created with permissions';
END
$$;
