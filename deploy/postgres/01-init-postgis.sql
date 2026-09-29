-- ==============================================================================
-- WeatherPulse India - PostGIS & UUID Core Database Initialization (Migration 01)
-- ==============================================================================

-- 1. Enable Extensions (uuid-ossp / pgcrypto and PostGIS if installed)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'uuid-ossp extension notice: %', SQLERRM;
END $$;

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgcrypto extension notice: %', SQLERRM;
END $$;

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "postgis";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'PostGIS extension not available in environment. Spatial columns will use fallback geometry types. Fix: Install PostGIS via PostgreSQL StackBuilder or package manager.';
END $$;

-- Helper function to generate UUIDs regardless of extension availability
CREATE OR REPLACE FUNCTION wp_generate_uuid() RETURNS uuid AS $$
BEGIN
    RETURN gen_random_uuid();
EXCEPTION WHEN OTHERS THEN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- 2. SOURCES TABLE
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT wp_generate_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('GOV', 'SOCIAL', 'CITIZEN', 'SENSOR')),
    trust_baseline NUMERIC(4, 3) NOT NULL DEFAULT 0.500 CHECK (trust_baseline BETWEEN 0 AND 1),
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed Baseline Sources
INSERT INTO sources (id, name, type, trust_baseline, api_endpoint) VALUES
('a0000000-0000-0000-0000-000000000001', 'India Meteorological Department (IMD)', 'GOV', 1.000, 'https://data.gov.in/api'),
('a0000000-0000-0000-0000-000000000002', 'State Disaster Management Authority (SDMA)', 'GOV', 1.000, 'https://mahasdma.maharashtra.gov.in'),
('a0000000-0000-0000-0000-000000000003', 'Verified Social Signals (X / Twitter)', 'SOCIAL', 0.850, 'https://api.twitter.com/2/tweets'),
('a0000000-0000-0000-0000-000000000004', 'WeatherPulse Citizen Ground Network', 'CITIZEN', 0.700, 'https://weatherpulse.in/api/reports')
ON CONFLICT (id) DO NOTHING;

-- 3. USERS TABLE (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT wp_generate_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('VIEWER', 'CITIZEN', 'FIRST_RESPONDER', 'ADMIN')),
    reputation_score NUMERIC(4, 3) DEFAULT 0.500 CHECK (reputation_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. REPORTS TABLE
DO $$
DECLARE
    has_postgis BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') INTO has_postgis;

    IF has_postgis THEN
        CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT wp_generate_uuid(),
            source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            category VARCHAR(60) NOT NULL CHECK (category IN (
                'FLOODING_WATERLOGGING', 'RAINFALL', 'THUNDERSTORM_LIGHTNING', 
                'HIGH_WINDS_CYCLONE', 'DUST_STORM', 'DENSE_FOG', 'HEATWAVE', 'GENERAL_WEATHER'
            )),
            severity VARCHAR(30) NOT NULL CHECK (severity IN (
                'EXTREME_RED', 'SEVERE_ORANGE', 'MODERATE_YELLOW', 'LOW_GREEN'
            )),
            geom GEOMETRY(Point, 4326),
            location_name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            district VARCHAR(100),
            state VARCHAR(100) NOT NULL,
            raw_text TEXT NOT NULL,
            trust_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (trust_score BETWEEN 0 AND 100),
            verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_MANUAL_REVIEW' CHECK (verification_status IN (
                'OFFICIAL_VERIFIED', 'AUTO_VERIFIED_HIGH_CONFIDENCE', 
                'COMMUNITY_CORROBORATED', 'PENDING_MANUAL_REVIEW', 'CONFIRMED_FAKE'
            )),
            duplicate_of UUID REFERENCES reports(id) ON DELETE SET NULL,
            phash_signature VARCHAR(64),
            metrics JSONB DEFAULT '{}'::jsonb,
            ml_metadata JSONB DEFAULT '{}'::jsonb,
            media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
            source_url VARCHAR(500),
            timestamp TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_reports_geom ON reports USING GIST(geom);
    ELSE
        CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT wp_generate_uuid(),
            source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            category VARCHAR(60) NOT NULL CHECK (category IN (
                'FLOODING_WATERLOGGING', 'RAINFALL', 'THUNDERSTORM_LIGHTNING', 
                'HIGH_WINDS_CYCLONE', 'DUST_STORM', 'DENSE_FOG', 'HEATWAVE', 'GENERAL_WEATHER'
            )),
            severity VARCHAR(30) NOT NULL CHECK (severity IN (
                'EXTREME_RED', 'SEVERE_ORANGE', 'MODERATE_YELLOW', 'LOW_GREEN'
            )),
            geom VARCHAR(255),
            latitude NUMERIC(8, 4),
            longitude NUMERIC(8, 4),
            location_name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            district VARCHAR(100),
            state VARCHAR(100) NOT NULL,
            raw_text TEXT NOT NULL,
            trust_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (trust_score BETWEEN 0 AND 100),
            verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_MANUAL_REVIEW' CHECK (verification_status IN (
                'OFFICIAL_VERIFIED', 'AUTO_VERIFIED_HIGH_CONFIDENCE', 
                'COMMUNITY_CORROBORATED', 'PENDING_MANUAL_REVIEW', 'CONFIRMED_FAKE'
            )),
            duplicate_of UUID REFERENCES reports(id) ON DELETE SET NULL,
            phash_signature VARCHAR(64),
            metrics JSONB DEFAULT '{}'::jsonb,
            ml_metadata JSONB DEFAULT '{}'::jsonb,
            media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
            source_url VARCHAR(500),
            timestamp TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- 5. MODERATION LOG
CREATE TABLE IF NOT EXISTS moderation_log (
    id UUID PRIMARY KEY DEFAULT wp_generate_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    admin_id UUID,
    moderator_id UUID,
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVE', 'VERIFY', 'FLAG_MISLEADING', 'REJECT_FAKE', 'MERGE_DUPLICATE', 'REJECT')),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_reports_status_timestamp ON reports(verification_status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reports_state_city ON reports(state, city);
CREATE INDEX IF NOT EXISTS idx_reports_phash ON reports(phash_signature) WHERE phash_signature IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_metrics_gin ON reports USING GIN(metrics);
SELECT * FROM sources;
SELECT COUNT(*) FROM sources;