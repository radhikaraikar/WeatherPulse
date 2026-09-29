-- ==============================================================================
-- WeatherPulse India - PostGIS Migration 03: Cities, Observations & Sync Log
-- Guidelines for Indian Government Websites (GIGW) Local PostgreSQL Integration
-- ==============================================================================

-- 1. Reference Cities Table (State Capitals & Major Observatories)
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude NUMERIC(8, 4) NOT NULL,
    longitude NUMERIC(8, 4) NOT NULL,
    is_capital BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed Reference Cities
INSERT INTO cities (id, name, state, latitude, longitude, is_capital) VALUES
('wp-city-new-delhi', 'New Delhi', 'Delhi', 28.6139, 77.2090, TRUE),
('wp-city-mumbai', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, TRUE),
('wp-city-bengaluru', 'Bengaluru', 'Karnataka', 12.9716, 77.5946, TRUE),
('wp-city-kolkata', 'Kolkata', 'West Bengal', 22.5726, 88.3639, TRUE),
('wp-city-chennai', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, TRUE),
('wp-city-hyderabad', 'Hyderabad', 'Telangana', 17.3850, 78.4867, TRUE),
('wp-city-ahmedabad', 'Ahmedabad', 'Gujarat', 23.0225, 72.5714, FALSE),
('wp-city-pune', 'Pune', 'Maharashtra', 18.5204, 73.8567, FALSE),
('wp-city-jaipur', 'Jaipur', 'Rajasthan', 26.9124, 75.7873, TRUE),
('wp-city-lucknow', 'Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, TRUE),
('wp-city-bhopal', 'Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, TRUE),
('wp-city-patna', 'Patna', 'Bihar', 25.5941, 85.1376, TRUE),
('wp-city-chandigarh', 'Chandigarh', 'Punjab & Haryana', 30.7333, 76.7794, TRUE),
('wp-city-thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, TRUE),
('wp-city-bhubaneswar', 'Bhubaneswar', 'Odisha', 20.2961, 85.8245, TRUE),
('wp-city-guwahati', 'Guwahati', 'Assam', 26.1445, 91.7362, FALSE),
('wp-city-dehradun', 'Dehradun', 'Uttarakhand', 30.3165, 78.0322, TRUE),
('wp-city-shimla', 'Shimla', 'Himachal Pradesh', 31.1048, 77.1734, TRUE),
('wp-city-ranchi', 'Ranchi', 'Jharkhand', 23.3441, 85.3096, TRUE),
('wp-city-raipur', 'Raipur', 'Chhattisgarh', 21.2514, 81.6296, TRUE),
('wp-city-srinagar', 'Srinagar', 'Jammu & Kashmir', 34.0837, 74.7973, TRUE),
('wp-city-panaji', 'Panaji', 'Goa', 15.4909, 73.8278, TRUE),
('wp-city-agartala', 'Agartala', 'Tripura', 23.8315, 91.2868, TRUE),
('wp-city-imphal', 'Imphal', 'Manipur', 24.8170, 93.9368, TRUE),
('wp-city-shillong', 'Shillong', 'Meghalaya', 25.5788, 91.8933, TRUE),
('wp-city-aizawl', 'Aizawl', 'Mizoram', 23.7271, 92.7176, TRUE),
('wp-city-kohima', 'Kohima', 'Nagaland', 25.6751, 94.1086, TRUE),
('wp-city-gangtok', 'Gangtok', 'Sikkim', 27.3389, 88.6065, TRUE),
('wp-city-itanagar', 'Itanagar', 'Arunachal Pradesh', 27.0844, 93.6053, TRUE),
('wp-city-leh', 'Leh', 'Ladakh', 34.1526, 77.5771, TRUE),
('wp-city-port-blair', 'Port Blair', 'Andaman & Nicobar', 11.6234, 92.7265, TRUE),
('wp-city-kavaratti', 'Kavaratti', 'Lakshadweep', 10.5667, 72.6417, TRUE),
('wp-city-puducherry', 'Puducherry', 'Puducherry', 11.9416, 79.8083, TRUE),
('wp-city-daman', 'Daman', 'Dadra & Nagar Haveli and Daman & Diu', 20.3974, 72.8328, TRUE),
('wp-city-silvassa', 'Silvassa', 'Dadra and Nagar Haveli', 20.2763, 73.0083, FALSE),
('wp-city-moodubidire', 'Moodubidire', 'Karnataka', 13.0694, 74.9967, FALSE),
('wp-city-dispur', 'Dispur', 'Assam', 26.1433, 91.7898, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    state = EXCLUDED.state,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_capital = EXCLUDED.is_capital;

-- 2. Weather Observations Table (Historical & Latest Telemetry)
CREATE TABLE IF NOT EXISTS weather_observations (
    city_id VARCHAR(100) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    precipitation NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    wind_speed NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    weather_code INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(150) NOT NULL DEFAULT 'Open-Meteo & IMD CDSP Telemetry',
    PRIMARY KEY (city_id, fetched_at)
);

-- 3. Weather Forecasts Table (7-Day Horizon)
CREATE TABLE IF NOT EXISTS weather_forecasts (
    city_id VARCHAR(100) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    forecast_date DATE NOT NULL,
    temp_max NUMERIC(5, 2) NOT NULL,
    temp_min NUMERIC(5, 2) NOT NULL,
    precipitation_probability NUMERIC(5, 2) DEFAULT 0,
    precipitation_sum NUMERIC(6, 2) DEFAULT 0.0,
    wind_max NUMERIC(6, 2) DEFAULT 0.0,
    weather_code INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (city_id, forecast_date, fetched_at)
);

-- 4. Sync Log Table (Audit Track for All Synchronization Jobs)
CREATE TABLE IF NOT EXISTS sync_log (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    cities_updated INTEGER DEFAULT 0,
    error TEXT
);

-- 5. Alerts Table (72-Hour Early Warnings)
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(120) PRIMARY KEY,
    city_id VARCHAR(100) REFERENCES cities(id) ON DELETE SET NULL,
    hazard VARCHAR(60) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    severity_color VARCHAR(30) NOT NULL,
    severity_level VARCHAR(30) NOT NULL CHECK (severity_level IN ('EXTREME_RED', 'SEVERE_ORANGE', 'MODERATE_YELLOW', 'LOW_GREEN')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    headline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    safety_advice TEXT NOT NULL,
    forecast_value VARCHAR(100) NOT NULL,
    threshold VARCHAR(100) NOT NULL,
    source VARCHAR(150) NOT NULL DEFAULT 'Open-Meteo & IMD Radar NWP Model',
    source_type VARCHAR(50) NOT NULL DEFAULT 'model-derived' CHECK (source_type IN ('model-derived', 'official')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Legacy compatibility tables / views for existing code
CREATE TABLE IF NOT EXISTS weather_current (
    id VARCHAR(100) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    lat NUMERIC(8, 4) NOT NULL,
    lon NUMERIC(8, 4) NOT NULL,
    is_capital BOOLEAN DEFAULT FALSE,
    temperature_c NUMERIC(5, 2) NOT NULL,
    relative_humidity_pct NUMERIC(5, 2) NOT NULL,
    precipitation_mm NUMERIC(6, 2) NOT NULL,
    wind_speed_kmph NUMERIC(6, 2) NOT NULL,
    weather_code INTEGER NOT NULL,
    condition VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'sun',
    warning_severity VARCHAR(30) NOT NULL DEFAULT 'LOW_GREEN',
    warning_label VARCHAR(100) NOT NULL DEFAULT 'No Warning',
    today_max_c NUMERIC(5, 2),
    today_min_c NUMERIC(5, 2),
    tomorrow_max_c NUMERIC(5, 2),
    tomorrow_min_c NUMERIC(5, 2),
    tomorrow_rain_prob_pct NUMERIC(5, 2),
    source VARCHAR(150) NOT NULL DEFAULT 'Open-Meteo & IMD CDSP Telemetry',
    license VARCHAR(150) NOT NULL DEFAULT 'Government Open Data Licence – India (GODL)',
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_forecast_daily (
    id VARCHAR(120) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    forecast_date DATE NOT NULL,
    temp_max NUMERIC(5, 2) NOT NULL,
    temp_min NUMERIC(5, 2) NOT NULL,
    precipitation_sum_mm NUMERIC(6, 2) NOT NULL,
    precipitation_prob_pct NUMERIC(5, 2) DEFAULT 0,
    weather_code INTEGER NOT NULL,
    condition VARCHAR(100) NOT NULL,
    source VARCHAR(150) NOT NULL DEFAULT 'Open-Meteo NWP Model',
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_forecast_hourly (
    id VARCHAR(120) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    forecast_time TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(5, 2) NOT NULL,
    precipitation_mm NUMERIC(6, 2) NOT NULL,
    precipitation_prob_pct NUMERIC(5, 2) DEFAULT 0,
    source VARCHAR(150) NOT NULL DEFAULT 'Open-Meteo NWP Model',
    fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. High Performance Spatial & B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_weather_obs_city_fetched ON weather_observations(city_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_city_date ON weather_forecasts(city_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON sync_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active_sev ON alerts(is_active, severity_level);
