/**
 * WeatherPulse Global Reference Dataset & Observatories
 * Embeds full catalog for instant 0ms latency with automated PostgreSQL persistence
 */

const GLOBAL_COUNTRIES = [
  { iso2: 'IN', iso3: 'IND', name: 'India', continent: 'Asia', region: 'Southern Asia', capital: 'New Delhi', latitude: 28.6139, longitude: 77.2090, population: 1428627663, avg_temp: 31.5, min_temp: 24.0, max_temp: 38.2, active_alerts_count: 3 },
  { iso2: 'US', iso3: 'USA', name: 'United States', continent: 'North America', region: 'Northern America', capital: 'Washington, D.C.', latitude: 38.9072, longitude: -77.0369, population: 339996563, avg_temp: 22.4, min_temp: 16.0, max_temp: 29.5, active_alerts_count: 1 },
  { iso2: 'CN', iso3: 'CHN', name: 'China', continent: 'Asia', region: 'Eastern Asia', capital: 'Beijing', latitude: 39.9042, longitude: 116.4074, population: 1425671352, avg_temp: 19.8, min_temp: 12.5, max_temp: 26.0, active_alerts_count: 0 },
  { iso2: 'GB', iso3: 'GBR', name: 'United Kingdom', continent: 'Europe', region: 'Northern Europe', capital: 'London', latitude: 51.5074, longitude: -0.1278, population: 67736802, avg_temp: 15.2, min_temp: 9.8, max_temp: 20.4, active_alerts_count: 0 },
  { iso2: 'FR', iso3: 'FRA', name: 'France', continent: 'Europe', region: 'Western Europe', capital: 'Paris', latitude: 48.8566, longitude: 2.3522, population: 64756584, avg_temp: 17.6, min_temp: 11.2, max_temp: 23.5, active_alerts_count: 0 },
  { iso2: 'DE', iso3: 'DEU', name: 'Germany', continent: 'Europe', region: 'Western Europe', capital: 'Berlin', latitude: 52.5200, longitude: 13.4050, population: 83294633, avg_temp: 16.4, min_temp: 10.0, max_temp: 22.8, active_alerts_count: 0 },
  { iso2: 'JP', iso3: 'JPN', name: 'Japan', continent: 'Asia', region: 'Eastern Asia', capital: 'Tokyo', latitude: 35.6762, longitude: 139.6503, population: 123294513, avg_temp: 24.1, min_temp: 18.0, max_temp: 29.5, active_alerts_count: 1 },
  { iso2: 'CA', iso3: 'CAN', name: 'Canada', continent: 'North America', region: 'Northern America', capital: 'Ottawa', latitude: 45.4215, longitude: -75.6972, population: 38781291, avg_temp: 14.8, min_temp: 7.5, max_temp: 21.0, active_alerts_count: 0 },
  { iso2: 'AU', iso3: 'AUS', name: 'Australia', continent: 'Oceania', region: 'Australia and New Zealand', capital: 'Canberra', latitude: -35.2809, longitude: 149.1300, population: 26439111, avg_temp: 18.9, min_temp: 11.0, max_temp: 26.2, active_alerts_count: 0 },
  { iso2: 'BR', iso3: 'BRA', name: 'Brazil', continent: 'South America', region: 'South America', capital: 'Brasília', latitude: -15.7975, longitude: -47.8919, population: 216422446, avg_temp: 27.3, min_temp: 20.5, max_temp: 33.0, active_alerts_count: 2 },
  { iso2: 'RU', iso3: 'RUS', name: 'Russia', continent: 'Europe', region: 'Eastern Europe', capital: 'Moscow', latitude: 55.7558, longitude: 37.6173, population: 144444359, avg_temp: 11.5, min_temp: 4.2, max_temp: 18.0, active_alerts_count: 0 },
  { iso2: 'ZA', iso3: 'ZAF', name: 'South Africa', continent: 'Africa', region: 'Southern Africa', capital: 'Pretoria', latitude: -25.7479, longitude: 28.2293, population: 60414495, avg_temp: 23.0, min_temp: 14.8, max_temp: 30.5, active_alerts_count: 0 },
  { iso2: 'AE', iso3: 'ARE', name: 'United Arab Emirates', continent: 'Asia', region: 'Western Asia', capital: 'Abu Dhabi', latitude: 24.4539, longitude: 54.3773, population: 9516871, avg_temp: 36.8, min_temp: 28.5, max_temp: 42.0, active_alerts_count: 1 },
  { iso2: 'SA', iso3: 'SAU', name: 'Saudi Arabia', continent: 'Asia', region: 'Western Asia', capital: 'Riyadh', latitude: 24.7136, longitude: 46.6753, population: 36947025, avg_temp: 38.4, min_temp: 29.0, max_temp: 44.5, active_alerts_count: 1 },
  { iso2: 'SG', iso3: 'SGP', name: 'Singapore', continent: 'Asia', region: 'South-Eastern Asia', capital: 'Singapore', latitude: 1.3521, longitude: 103.8198, population: 5970400, avg_temp: 29.5, min_temp: 25.0, max_temp: 33.2, active_alerts_count: 0 },
  { iso2: 'ID', iso3: 'IDN', name: 'Indonesia', continent: 'Asia', region: 'South-Eastern Asia', capital: 'Jakarta', latitude: -6.2088, longitude: 106.8456, population: 277534122, avg_temp: 31.0, min_temp: 24.5, max_temp: 34.0, active_alerts_count: 1 },
  { iso2: 'MY', iso3: 'MYS', name: 'Malaysia', continent: 'Asia', region: 'South-Eastern Asia', capital: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869, population: 34308525, avg_temp: 30.2, min_temp: 24.0, max_temp: 33.5, active_alerts_count: 0 },
  { iso2: 'TH', iso3: 'THA', name: 'Thailand', continent: 'Asia', region: 'South-Eastern Asia', capital: 'Bangkok', latitude: 13.7563, longitude: 100.5018, population: 71801279, avg_temp: 32.6, min_temp: 26.0, max_temp: 36.5, active_alerts_count: 1 },
  { iso2: 'VN', iso3: 'VNM', name: 'Vietnam', continent: 'Asia', region: 'South-Eastern Asia', capital: 'Hanoi', latitude: 21.0285, longitude: 105.8542, population: 98858914, avg_temp: 28.9, min_temp: 23.0, max_temp: 34.0, active_alerts_count: 0 },
  { iso2: 'BD', iso3: 'BGD', name: 'Bangladesh', continent: 'Asia', region: 'Southern Asia', capital: 'Dhaka', latitude: 23.8103, longitude: 90.4125, population: 172954319, avg_temp: 31.2, min_temp: 25.5, max_temp: 35.8, active_alerts_count: 1 },
  { iso2: 'PK', iso3: 'PAK', name: 'Pakistan', continent: 'Asia', region: 'Southern Asia', capital: 'Islamabad', latitude: 33.6844, longitude: 73.0479, population: 240485658, avg_temp: 29.8, min_temp: 21.5, max_temp: 37.0, active_alerts_count: 0 },
  { iso2: 'LK', iso3: 'LKA', name: 'Sri Lanka', continent: 'Asia', region: 'Southern Asia', capital: 'Colombo', latitude: 6.9271, longitude: 79.8612, population: 22181000, avg_temp: 29.1, min_temp: 24.8, max_temp: 32.4, active_alerts_count: 0 },
  { iso2: 'NP', iso3: 'NPL', name: 'Nepal', continent: 'Asia', region: 'Southern Asia', capital: 'Kathmandu', latitude: 27.7172, longitude: 85.3240, population: 30896590, avg_temp: 21.4, min_temp: 14.0, max_temp: 27.5, active_alerts_count: 0 },
  { iso2: 'KR', iso3: 'KOR', name: 'South Korea', continent: 'Asia', region: 'Eastern Asia', capital: 'Seoul', latitude: 37.5665, longitude: 126.9780, population: 51784059, avg_temp: 21.0, min_temp: 14.5, max_temp: 26.8, active_alerts_count: 0 },
  { iso2: 'IT', iso3: 'ITA', name: 'Italy', continent: 'Europe', region: 'Southern Europe', capital: 'Rome', latitude: 41.9028, longitude: 12.4964, population: 58870762, avg_temp: 23.5, min_temp: 16.0, max_temp: 29.8, active_alerts_count: 0 },
  { iso2: 'ES', iso3: 'ESP', name: 'Spain', continent: 'Europe', region: 'Southern Europe', capital: 'Madrid', latitude: 40.4168, longitude: -3.7038, population: 47519628, avg_temp: 25.8, min_temp: 17.5, max_temp: 32.5, active_alerts_count: 0 },
  { iso2: 'NL', iso3: 'NLD', name: 'Netherlands', continent: 'Europe', region: 'Western Europe', capital: 'Amsterdam', latitude: 52.3676, longitude: 4.9041, population: 17618299, avg_temp: 15.0, min_temp: 9.5, max_temp: 19.8, active_alerts_count: 0 },
  { iso2: 'CH', iso3: 'CHE', name: 'Switzerland', continent: 'Europe', region: 'Western Europe', capital: 'Bern', latitude: 46.9480, longitude: 7.4474, population: 8796669, avg_temp: 16.2, min_temp: 8.8, max_temp: 22.0, active_alerts_count: 0 },
  { iso2: 'SE', iso3: 'SWE', name: 'Sweden', continent: 'Europe', region: 'Northern Europe', capital: 'Stockholm', latitude: 59.3293, longitude: 18.0686, population: 10612086, avg_temp: 12.8, min_temp: 6.5, max_temp: 18.5, active_alerts_count: 0 },
  { iso2: 'NO', iso3: 'NOR', name: 'Norway', continent: 'Europe', region: 'Northern Europe', capital: 'Oslo', latitude: 59.9139, longitude: 10.7522, population: 5474360, avg_temp: 11.4, min_temp: 5.0, max_temp: 17.0, active_alerts_count: 0 },
  { iso2: 'DK', iso3: 'DNK', name: 'Denmark', continent: 'Europe', region: 'Northern Europe', capital: 'Copenhagen', latitude: 55.6761, longitude: 12.5683, population: 5910913, avg_temp: 14.2, min_temp: 8.5, max_temp: 19.0, active_alerts_count: 0 },
  { iso2: 'FI', iso3: 'FIN', name: 'Finland', continent: 'Europe', region: 'Northern Europe', capital: 'Helsinki', latitude: 60.1699, longitude: 24.9384, population: 5545475, avg_temp: 12.0, min_temp: 6.0, max_temp: 17.5, active_alerts_count: 0 },
  { iso2: 'PL', iso3: 'POL', name: 'Poland', continent: 'Europe', region: 'Eastern Europe', capital: 'Warsaw', latitude: 52.2297, longitude: 21.0122, population: 41026067, avg_temp: 17.1, min_temp: 10.5, max_temp: 23.0, active_alerts_count: 0 },
  { iso2: 'TR', iso3: 'TUR', name: 'Turkey', continent: 'Asia', region: 'Western Asia', capital: 'Ankara', latitude: 39.9334, longitude: 32.8597, population: 85816199, avg_temp: 22.8, min_temp: 13.0, max_temp: 30.0, active_alerts_count: 0 },
  { iso2: 'EG', iso3: 'EGY', name: 'Egypt', continent: 'Africa', region: 'Northern Africa', capital: 'Cairo', latitude: 30.0444, longitude: 31.2357, population: 112716598, avg_temp: 33.5, min_temp: 24.0, max_temp: 39.2, active_alerts_count: 1 },
  { iso2: 'NG', iso3: 'NGA', name: 'Nigeria', continent: 'Africa', region: 'Western Africa', capital: 'Abuja', latitude: 9.0765, longitude: 7.3986, population: 223804632, avg_temp: 28.4, min_temp: 22.0, max_temp: 33.5, active_alerts_count: 0 },
  { iso2: 'KE', iso3: 'KEN', name: 'Kenya', continent: 'Africa', region: 'Eastern Africa', capital: 'Nairobi', latitude: -1.2921, longitude: 36.8219, population: 55100586, avg_temp: 22.1, min_temp: 15.0, max_temp: 27.5, active_alerts_count: 0 },
  { iso2: 'MX', iso3: 'MEX', name: 'Mexico', continent: 'North America', region: 'Central America', capital: 'Mexico City', latitude: 19.4326, longitude: -99.1332, population: 128455567, avg_temp: 22.8, min_temp: 14.5, max_temp: 29.0, active_alerts_count: 0 },
  { iso2: 'AR', iso3: 'ARG', name: 'Argentina', continent: 'South America', region: 'South America', capital: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816, population: 45773884, avg_temp: 19.5, min_temp: 12.0, max_temp: 26.5, active_alerts_count: 0 },
  { iso2: 'CL', iso3: 'CHL', name: 'Chile', continent: 'South America', region: 'South America', capital: 'Santiago', latitude: -33.4489, longitude: -70.6693, population: 19629590, avg_temp: 20.2, min_temp: 11.5, max_temp: 28.0, active_alerts_count: 0 },
  { iso2: 'CO', iso3: 'COL', name: 'Colombia', continent: 'South America', region: 'South America', capital: 'Bogota', latitude: 4.7110, longitude: -74.0721, population: 52085168, avg_temp: 18.0, min_temp: 11.0, max_temp: 23.5, active_alerts_count: 0 },
  { iso2: 'PE', iso3: 'PER', name: 'Peru', continent: 'South America', region: 'South America', capital: 'Lima', latitude: -12.0464, longitude: -77.0428, population: 34352719, avg_temp: 21.3, min_temp: 16.5, max_temp: 26.0, active_alerts_count: 0 },
  { iso2: 'NZ', iso3: 'NZL', name: 'New Zealand', continent: 'Oceania', region: 'Australia and New Zealand', capital: 'Wellington', latitude: -41.2865, longitude: 174.7762, population: 5228100, avg_temp: 14.5, min_temp: 9.0, max_temp: 19.5, active_alerts_count: 0 },
  { iso2: 'PH', iso3: 'PHL', name: 'Philippines', continent: 'Asia', region: 'South-Eastern Asia', capital: 'Manila', latitude: 14.5995, longitude: 120.9842, population: 117337368, avg_temp: 31.8, min_temp: 25.5, max_temp: 35.0, active_alerts_count: 1 },
  { iso2: 'GR', iso3: 'GRC', name: 'Greece', continent: 'Europe', region: 'Southern Europe', capital: 'Athens', latitude: 37.9838, longitude: 23.7275, population: 10341277, avg_temp: 26.4, min_temp: 19.0, max_temp: 32.8, active_alerts_count: 0 },
  { iso2: 'PT', iso3: 'PRT', name: 'Portugal', continent: 'Europe', region: 'Southern Europe', capital: 'Lisbon', latitude: 38.7223, longitude: -9.1393, population: 10247605, avg_temp: 22.0, min_temp: 15.5, max_temp: 27.5, active_alerts_count: 0 },
  { iso2: 'IE', iso3: 'IRL', name: 'Ireland', continent: 'Europe', region: 'Northern Europe', capital: 'Dublin', latitude: 53.3498, longitude: -6.2603, population: 5056935, avg_temp: 14.0, min_temp: 8.5, max_temp: 18.5, active_alerts_count: 0 },
  { iso2: 'BE', iso3: 'BEL', name: 'Belgium', continent: 'Europe', region: 'Western Europe', capital: 'Brussels', latitude: 50.8503, longitude: 4.3517, population: 11655930, avg_temp: 16.8, min_temp: 10.5, max_temp: 22.5, active_alerts_count: 0 },
  { iso2: 'AT', iso3: 'AUT', name: 'Austria', continent: 'Europe', region: 'Western Europe', capital: 'Vienna', latitude: 48.2082, longitude: 16.3738, population: 8958960, avg_temp: 18.5, min_temp: 11.8, max_temp: 24.2, active_alerts_count: 0 },
  { iso2: 'IL', iso3: 'ISR', name: 'Israel', continent: 'Asia', region: 'Western Asia', capital: 'Jerusalem', latitude: 31.7683, longitude: 35.2137, population: 9174520, avg_temp: 28.0, min_temp: 19.5, max_temp: 34.0, active_alerts_count: 0 },
  { iso2: 'QA', iso3: 'QAT', name: 'Qatar', continent: 'Asia', region: 'Western Asia', capital: 'Doha', latitude: 25.2854, longitude: 51.5310, population: 2716391, avg_temp: 37.2, min_temp: 28.0, max_temp: 43.5, active_alerts_count: 1 },
  { iso2: 'KW', iso3: 'KWT', name: 'Kuwait', continent: 'Asia', region: 'Western Asia', capital: 'Kuwait City', latitude: 29.3759, longitude: 47.9774, population: 4310108, avg_temp: 39.1, min_temp: 29.5, max_temp: 46.0, active_alerts_count: 1 },
  { iso2: 'OM', iso3: 'OMN', name: 'Oman', continent: 'Asia', region: 'Western Asia', capital: 'Muscat', latitude: 23.5859, longitude: 58.4059, population: 4644384, avg_temp: 35.6, min_temp: 27.5, max_temp: 41.0, active_alerts_count: 0 },
  { iso2: 'MA', iso3: 'MAR', name: 'Morocco', continent: 'Africa', region: 'Northern Africa', capital: 'Rabat', latitude: 34.0209, longitude: -6.8416, population: 37840000, avg_temp: 24.5, min_temp: 16.8, max_temp: 30.2, active_alerts_count: 0 },
  { iso2: 'ET', iso3: 'ETH', name: 'Ethiopia', continent: 'Africa', region: 'Eastern Africa', capital: 'Addis Ababa', latitude: 9.0300, longitude: 38.7400, population: 126500000, avg_temp: 20.8, min_temp: 13.0, max_temp: 26.0, active_alerts_count: 0 },
  { iso2: 'GH', iso3: 'GHA', name: 'Ghana', continent: 'Africa', region: 'Western Africa', capital: 'Accra', latitude: 5.6037, longitude: -0.1870, population: 34121985, avg_temp: 29.4, min_temp: 24.0, max_temp: 33.0, active_alerts_count: 0 },
  { iso2: 'TZ', iso3: 'TZA', name: 'Tanzania', continent: 'Africa', region: 'Eastern Africa', capital: 'Dodoma', latitude: -6.1630, longitude: 35.7516, population: 67438106, avg_temp: 27.2, min_temp: 18.5, max_temp: 32.0, active_alerts_count: 0 },
  { iso2: 'DZ', iso3: 'DZA', name: 'Algeria', continent: 'Africa', region: 'Northern Africa', capital: 'Algiers', latitude: 36.7538, longitude: 3.0588, population: 45606480, avg_temp: 26.0, min_temp: 18.0, max_temp: 32.5, active_alerts_count: 0 },
  { iso2: 'IS', iso3: 'ISL', name: 'Iceland', continent: 'Europe', region: 'Northern Europe', capital: 'Reykjavik', latitude: 64.1466, longitude: -21.9426, population: 387800, avg_temp: 8.5, min_temp: 3.0, max_temp: 13.5, active_alerts_count: 0 },
  { iso2: 'CZ', iso3: 'CZE', name: 'Czech Republic', continent: 'Europe', region: 'Eastern Europe', capital: 'Prague', latitude: 50.0755, longitude: 14.4378, population: 10827529, avg_temp: 16.0, min_temp: 9.5, max_temp: 21.8, active_alerts_count: 0 }
];

async function seedGlobalReferenceData(pool) {
  try {
    for (const c of GLOBAL_COUNTRIES) {
      // 1. Country
      await pool.query(`
        INSERT INTO countries (iso2, iso3, name, continent, region, capital, latitude, longitude, population)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (iso2) DO UPDATE SET
          name = EXCLUDED.name,
          continent = EXCLUDED.continent,
          region = EXCLUDED.region,
          capital = EXCLUDED.capital,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          population = EXCLUDED.population;
      `, [c.iso2, c.iso3, c.name, c.continent, c.region, c.capital, c.latitude, c.longitude, c.population]);

      // 2. Capital City in cities table
      const cityId = `wp-city-${c.iso2.toLowerCase()}-${c.capital.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.substring(0, 80);
      await pool.query(`
        INSERT INTO cities (id, name, state, latitude, longitude, country_code, country, continent, timezone, is_capital, population)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'UTC', TRUE, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          country_code = EXCLUDED.country_code,
          country = EXCLUDED.country,
          continent = EXCLUDED.continent;
      `, [cityId, c.capital, c.capital, c.latitude, c.longitude, c.iso2, c.name, c.continent, c.population]);

      // 3. Baseline observation
      await pool.query(`
        INSERT INTO weather_observations (city_id, fetched_at, temperature, humidity, precipitation, wind_speed, weather_code, source)
        VALUES ($1, CURRENT_TIMESTAMP, $2, 60, 0.0, 10.0, 1, 'Open-Meteo Global NWP')
        ON CONFLICT (city_id, fetched_at) DO NOTHING;
      `, [cityId, c.avg_temp]);
    }
    console.log(`[GLOBAL SEED] Seeded ${GLOBAL_COUNTRIES.length} global countries & observatories.`);
  } catch (err) {
    console.warn('[GLOBAL SEED NOTICE]', err.message);
  }
}

module.exports = { GLOBAL_COUNTRIES, seedGlobalReferenceData };
