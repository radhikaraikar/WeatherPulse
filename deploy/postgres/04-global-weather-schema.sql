-- =============================================================================
-- Migration 04: WeatherPulse Global Weather Analytics & Early Warning Schema
-- Extends the spatial schema from India to Global (World -> Continent -> Country -> State -> City)
-- =============================================================================

-- 1. Extend the reference cities table with global taxonomy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='country_code') THEN
    ALTER TABLE cities ADD COLUMN country_code VARCHAR(2) DEFAULT 'IN';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='country') THEN
    ALTER TABLE cities ADD COLUMN country VARCHAR(100) DEFAULT 'India';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='continent') THEN
    ALTER TABLE cities ADD COLUMN continent VARCHAR(50) DEFAULT 'Asia';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='timezone') THEN
    ALTER TABLE cities ADD COLUMN timezone VARCHAR(100) DEFAULT 'Asia/Kolkata';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='population') THEN
    ALTER TABLE cities ADD COLUMN population BIGINT DEFAULT 1000000;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='admin1') THEN
    ALTER TABLE cities ADD COLUMN admin1 VARCHAR(100);
  END IF;
END $$;

-- Populate existing Indian cities with admin1 from state
UPDATE cities SET admin1 = state WHERE admin1 IS NULL AND state IS NOT NULL;
UPDATE cities SET continent = 'Asia', country = 'India', country_code = 'IN' WHERE country_code IS NULL OR country_code = '';

-- 2. Countries Reference Table
CREATE TABLE IF NOT EXISTS countries (
  iso2 VARCHAR(2) PRIMARY KEY,
  iso3 VARCHAR(3) NOT NULL,
  name VARCHAR(100) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  region VARCHAR(100),
  capital VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  population BIGINT
);

CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent);
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);

-- 3. GeoJSON Country Boundaries for World Map Visualization
CREATE TABLE IF NOT EXISTS country_boundaries (
  iso2 VARCHAR(2) PRIMARY KEY,
  iso3 VARCHAR(3),
  name VARCHAR(100),
  geojson JSONB NOT NULL
);

-- 4. Global Disasters & Extreme Hazard Events (GDACS + USGS)
CREATE TABLE IF NOT EXISTS disasters (
  id VARCHAR(100) PRIMARY KEY,
  source VARCHAR(50) NOT NULL, -- GDACS, USGS
  type VARCHAR(50) NOT NULL,   -- earthquake, cyclone, flood, drought, volcano
  title TEXT NOT NULL,
  severity VARCHAR(50),        -- Red, Orange, Green / magnitude
  magnitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  event_date TIMESTAMPTZ NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disasters_type_date ON disasters(type, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_disasters_country ON disasters(country_code);

-- 5. API Keys & Per-Key Rate Limiting
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  key_hash VARCHAR(64) UNIQUE NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  rate_limit_per_min INT DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. API Usage Logging
CREATE TABLE IF NOT EXISTS api_usage_log (
  id BIGSERIAL PRIMARY KEY,
  api_key_id INT REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  response_time_ms INT NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_log(created_at DESC);

-- 7. Monsoon & Rainfall Outlook Predictions (ml-service)
CREATE TABLE IF NOT EXISTS monsoon_predictions (
  id BIGSERIAL PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  target_date DATE NOT NULL,
  predicted_mm DOUBLE PRECISION NOT NULL,
  confidence DOUBLE PRECISION,
  category VARCHAR(50), -- deficient, normal, excess
  model_version VARCHAR(50) NOT NULL,
  actual_mm DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_monsoon_region_date ON monsoon_predictions(region, target_date DESC);

-- 8. SMS & Email Alert Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(30),
  country_code VARCHAR(2) DEFAULT 'IN',
  state VARCHAR(100),
  city_id VARCHAR(100) REFERENCES cities(id) ON DELETE SET NULL,
  event_types TEXT[] DEFAULT '{"ALL"}',
  min_severity VARCHAR(50) DEFAULT 'ORANGE',
  channel VARCHAR(20) DEFAULT 'EMAIL', -- EMAIL, SMS, BOTH
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
  verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(64),
  sms_otp VARCHAR(6),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active, country_code);

-- 9. Notification Dispatch Queue & Delivery Logs
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  subscriber_id BIGINT REFERENCES subscribers(id) ON DELETE CASCADE,
  alert_id VARCHAR(100),
  channel VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'QUEUED', -- QUEUED, SENT, FAILED, DRY_RUN
  attempts INT DEFAULT 0,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status, created_at DESC);

-- 10. Climate 30-Year Normals & Anomalies (NASA POWER / Open-Meteo)
CREATE TABLE IF NOT EXISTS climate_anomalies (
  id BIGSERIAL PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  month INT NOT NULL,
  avg_temp_30yr DOUBLE PRECISION NOT NULL,
  avg_precip_30yr DOUBLE PRECISION NOT NULL,
  current_temp DOUBLE PRECISION,
  current_precip DOUBLE PRECISION,
  temp_anomaly DOUBLE PRECISION,
  precip_anomaly DOUBLE PRECISION,
  calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_climate_country_month ON climate_anomalies(country_code, month);

-- 11. Extend Reports table with global taxonomy & hashtags
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='country_code') THEN
    ALTER TABLE reports ADD COLUMN country_code VARCHAR(2) DEFAULT 'IN';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='language') THEN
    ALTER TABLE reports ADD COLUMN language VARCHAR(10) DEFAULT 'en';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='hashtags') THEN
    ALTER TABLE reports ADD COLUMN hashtags TEXT[] DEFAULT '{}';
  END IF;
END $$;
