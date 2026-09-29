-- ==============================================================================
-- WeatherPulse India - PostGIS Database Migration Script 02
-- Migration: Spatial GiST Index, Category Composite Index, Verification Index,
--            Source URL audit column, and Moderation Log Schema.
-- ==============================================================================

-- 1. Add source_url column to reports table if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'source_url'
    ) THEN
        ALTER TABLE reports ADD COLUMN source_url VARCHAR(500);
    END IF;
END $$;

-- 2. Create / Verify moderation_log table
CREATE TABLE IF NOT EXISTS moderation_log (
    id UUID PRIMARY KEY DEFAULT wp_generate_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    admin_id UUID,
    moderator_id UUID,
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVE', 'VERIFY', 'FLAG_MISLEADING', 'REJECT_FAKE', 'MERGE_DUPLICATE', 'REJECT')),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Spatial GiST Index on Geometry column if PostGIS is active
DO $$
DECLARE
    has_postgis BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') INTO has_postgis;
    IF has_postgis THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reports_geom_gist ON reports USING GIST(geom);';
    END IF;
END $$;

-- 4. Composite Index on Category and Creation Timestamp (High-traffic filtering)
CREATE INDEX IF NOT EXISTS idx_reports_category_created ON reports(category, created_at DESC);

-- 5. B-Tree Index on Verification Status (Queue triage & public feed separation)
CREATE INDEX IF NOT EXISTS idx_reports_verification_status ON reports(verification_status);

-- 6. Composite Index on State, City and Timestamp
CREATE INDEX IF NOT EXISTS idx_reports_state_city_time ON reports(state, city, timestamp DESC);

-- 7. Moderation Log indexing for rapid report audit lookup
CREATE INDEX IF NOT EXISTS idx_moderation_log_report_id ON moderation_log(report_id, timestamp DESC);
