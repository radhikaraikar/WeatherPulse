/**
 * WeatherPulse Global API — OpenAPI 3.0.3 Specification & Swagger UI Generator
 */

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "WeatherPulse Global Meteorological & Disaster Analytics API",
    version: "2.0.0",
    description: "Enterprise-grade REST API providing real-time global weather observations, 7-day numerical forecasts, historical climatology, extreme hazard alerts, and disaster intelligence from PostgreSQL. Conforms to GIGW open-data standards.",
    contact: {
      name: "WeatherPulse Developer Team",
      email: "api@weatherpulse.gov.in",
      url: "https://weatherpulse.gov.in"
    },
    license: {
      name: "Government Open Data License - India (GODL)",
      url: "https://data.gov.in"
    }
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Local Development & Production Server"
    }
  ],
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "Standard WeatherPulse API Key (Default demo key: wp_live_global_key_2026_gov)"
      }
    },
    schemas: {
      WeatherCurrent: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              id: { type: "string", example: "wp-city-new-delhi" },
              city: { type: "string", example: "New Delhi" },
              state: { type: "string", example: "Delhi" },
              country: { type: "string", example: "India" },
              country_code: { type: "string", example: "IN" },
              continent: { type: "string", example: "Asia" },
              latitude: { type: "number", example: 28.6139 },
              longitude: { type: "number", example: 77.2090 },
              temperature: { type: "number", example: 24.5 },
              humidity: { type: "number", example: 62 },
              precipitation: { type: "number", example: 0.0 },
              wind_speed: { type: "number", example: 9.4 },
              weather_code: { type: "integer", example: 0 },
              condition: { type: "string", example: "Clear Sky" },
              source: { type: "string", example: "open-meteo-imd" },
              fetched_at: { type: "string", format: "date-time", example: "2026-09-29T10:00:00.000Z" },
              stale: { type: "boolean", example: false },
              units: { type: "string", example: "metric" }
            }
          }
        }
      },
      WeatherForecast: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          city: { type: "string", example: "New Delhi" },
          country: { type: "string", example: "India" },
          days: { type: "integer", example: 7 },
          forecasts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                forecast_date: { type: "string", format: "date", example: "2026-09-30" },
                temp_max: { type: "number", example: 34.2 },
                temp_min: { type: "number", example: 21.0 },
                precipitation_probability: { type: "integer", example: 10 },
                precipitation_sum: { type: "number", example: 0.0 },
                wind_max: { type: "number", example: 14.5 },
                weather_code: { type: "integer", example: 1 },
                condition: { type: "string", example: "Mainly Clear" }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "UNAUTHORIZED" },
              message: { type: "string", example: "Missing or invalid API key in X-API-Key header" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/v1/weather/current": {
      get: {
        summary: "Get Real-Time Current Weather Observation",
        description: "Returns live weather telemetry from PostgreSQL for a given city, coordinate pair, or country. Supports metric or imperial units.",
        parameters: [
          { name: "city", in: "query", schema: { type: "string" }, description: "City name or slug (e.g. New Delhi, London, Tokyo, Mumbai)" },
          { name: "lat", in: "query", schema: { type: "number" }, description: "Latitude (e.g. 28.6139)" },
          { name: "lon", in: "query", schema: { type: "number" }, description: "Longitude (e.g. 77.2090)" },
          { name: "country", in: "query", schema: { type: "string" }, description: "ISO2 country code (e.g. IN, US, GB, JP)" },
          { name: "units", in: "query", schema: { type: "string", enum: ["metric", "imperial"], default: "metric" }, description: "Units of measurement" }
        ],
        responses: {
          "200": { description: "Current weather observation", content: { "application/json": { schema: { $ref: "#/components/schemas/WeatherCurrent" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "City or location not found" }
        }
      }
    },
    "/api/v1/weather/forecast": {
      get: {
        summary: "Get 7-Day Numerical Weather Forecast",
        description: "Returns 7-day daily forecasts from PostgreSQL for the selected city.",
        parameters: [
          { name: "city", in: "query", required: true, schema: { type: "string" }, description: "City name (e.g. Mumbai, New Delhi, Paris)" },
          { name: "days", in: "query", schema: { type: "integer", default: 7 }, description: "Number of forecast days (1-7)" },
          { name: "units", in: "query", schema: { type: "string", enum: ["metric", "imperial"], default: "metric" } }
        ],
        responses: {
          "200": { description: "7-Day forecast data", content: { "application/json": { schema: { $ref: "#/components/schemas/WeatherForecast" } } } }
        }
      }
    },
    "/api/v1/weather/history": {
      get: {
        summary: "Get Historical Weather & Climatology",
        description: "Returns historical weather observations or NASA POWER 30-year climatological monthly averages for a city or country.",
        parameters: [
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", format: "date" }, description: "Start date (YYYY-MM-DD)" },
          { name: "to", in: "query", schema: { type: "string", format: "date" }, description: "End date (YYYY-MM-DD)" }
        ],
        responses: {
          "200": { description: "Historical telemetry records" }
        }
      }
    },
    "/api/v1/weather/countries": {
      get: {
        summary: "Get All Global Countries Weather Summary",
        description: "Returns regional summaries, average temperature, and active alert counts across 250 countries.",
        parameters: [
          { name: "continent", in: "query", schema: { type: "string" }, description: "Filter by continent (e.g. Asia, Europe, Americas, Africa, Oceania)" }
        ],
        responses: { "200": { description: "List of countries with live telemetry" } }
      }
    },
    "/api/v1/weather/continents": {
      get: {
        summary: "Get Continent-Level Weather Analytics",
        description: "Returns continental meteorological metrics, temperature extremes, and hazard counts.",
        responses: { "200": { description: "Continental summaries" } }
      }
    },
    "/api/v1/weather/states": {
      get: {
        summary: "Get State-Wise Weather Summaries (India / Global)",
        description: "Returns state-level weather averages for all 28 states and 8 UTs of India (or specified country).",
        parameters: [
          { name: "country", in: "query", schema: { type: "string", default: "IN" }, description: "ISO2 country code" }
        ],
        responses: { "200": { description: "State-wise weather summaries" } }
      }
    },
    "/api/v1/reports": {
      get: {
        summary: "Get Paginated Ground Weather Reports",
        description: "Returns filterable crowdsourced and government ground weather observations with hashtag and language support.",
        parameters: [
          { name: "event", in: "query", schema: { type: "string" } },
          { name: "country", in: "query", schema: { type: "string" } },
          { name: "state", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "hashtag", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
        ],
        responses: { "200": { description: "Paginated reports collection" } }
      }
    },
    "/api/v1/alerts/active": {
      get: {
        summary: "Get Active 72-Hour Hazard Alerts",
        description: "Returns active model-derived and IMD meteorological warnings filterable by country, state, or severity.",
        parameters: [
          { name: "country", in: "query", schema: { type: "string" } },
          { name: "severity", in: "query", schema: { type: "string", enum: ["ALL", "EXTREME_RED", "ORANGE", "YELLOW"] } }
        ],
        responses: { "200": { description: "Active alert list" } }
      }
    },
    "/api/v1/disasters": {
      get: {
        summary: "Get Global Live Disasters (GDACS & USGS)",
        description: "Returns live global earthquakes, tropical cyclones, floods, volcanoes, and droughts.",
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["all", "earthquake", "cyclone", "flood", "drought", "volcano"] } },
          { name: "country", in: "query", schema: { type: "string" } }
        ],
        responses: { "200": { description: "Active global disaster events" } }
      }
    },
    "/api/v1/analytics/trends": {
      get: {
        summary: "Get Weather Trends Over Time",
        description: "Returns aggregated historical and recent telemetry trends filterable by country, continent, and date range.",
        responses: { "200": { description: "Trends data series" } }
      }
    },
    "/api/v1/analytics/events": {
      get: {
        summary: "Get Event Counts by Category",
        description: "Returns counts for extreme weather events (rainfall, heatwave, thunderstorm, fog, cyclones) per day, week, or month.",
        responses: { "200": { description: "Event distribution metrics" } }
      }
    },
    "/api/v1/analytics/compare": {
      get: {
        summary: "Compare 2 to 5 Countries Side by Side",
        description: "Returns comparative metrics for temperature, rainfall, hazard counts, and disaster resilience.",
        parameters: [
          { name: "countries", in: "query", schema: { type: "string", default: "IN,US,GB,JP,AU" }, description: "Comma-separated ISO2 country codes" }
        ],
        responses: { "200": { description: "Comparative analytics dataset" } }
      }
    },
    "/api/v1/monsoon/tracker": {
      get: {
        summary: "Get Monsoon Progression & Rainfall Departure",
        description: "Returns Indian monsoon status (onset, progress, cumulative rainfall vs normal) and global monsoon systems.",
        responses: { "200": { description: "Monsoon analytics dataset" } }
      }
    },
    "/api/v1/monsoon/predictions": {
      get: {
        summary: "Get 7-Day ML Rainfall Predictions",
        description: "Returns machine learning rainfall forecasts, confidence levels, baseline comparisons, and predictions vs actuals.",
        responses: { "200": { description: "Predictions dataset" } }
      }
    },
    "/api/v1/subscribers": {
      post: {
        summary: "Subscribe to SMS / Email Early Warnings",
        description: "Registers a subscriber for localized severe weather and disaster alerts in E.164 phone format or email.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Radhika Raikar" },
                  email: { type: "string", example: "radhika@example.com" },
                  phone: { type: "string", example: "+919876543210" },
                  country_code: { type: "string", example: "IN" },
                  state: { type: "string", example: "Karnataka" },
                  city_id: { type: "string", example: "wp-city-bengaluru" },
                  channel: { type: "string", enum: ["EMAIL", "SMS", "BOTH"], default: "EMAIL" },
                  min_severity: { type: "string", enum: ["YELLOW", "ORANGE", "EXTREME_RED"], default: "ORANGE" },
                  language: { type: "string", default: "en" },
                  timezone: { type: "string", default: "Asia/Kolkata" }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Subscriber created & verification triggered" } }
      }
    }
  }
};

function getSwaggerUiHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WeatherPulse Global Weather API — OpenAPI 3.0 Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .topbar { background-color: #0b2e5c !important; border-bottom: 3px solid #ff671f; padding: 10px 0; }
    .topbar-wrapper img { content: url('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg'); height: 40px; }
    .swagger-ui .topbar a { font-weight: 700; color: #ffffff !important; font-size: 1.2rem; }
    .gov-api-banner { background: #0B2E5C; color: #fff; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 4px solid #FF671F; }
    .gov-api-banner h1 { margin: 0; font-size: 1.3rem; font-weight: 700; }
    .gov-api-banner span { font-size: 0.85rem; color: #E2E8F0; }
    .api-key-badge { background: #046A38; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="gov-api-banner">
    <div>
      <h1>WeatherPulse Global API (OpenAPI 3.0 / Swagger UI)</h1>
      <span>Government Open Meteorological & Disaster Early Warning API Specification</span>
    </div>
    <div>
      <span class="api-key-badge">Demo Key: wp_live_global_key_2026_gov</span>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    };
  </script>
</body>
</html>`;
}

module.exports = {
  openApiSpec,
  getSwaggerUiHtml
};
