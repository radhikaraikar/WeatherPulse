# 🌦️ WeatherPulse — National Weather Big Data Analytics Platform

[![Design Standard](https://img.shields.io/badge/Design_Standard-GIGW_Government_Light_Theme-0B2E5C.svg)]()
[![Data Sources](https://img.shields.io/badge/Data-Open--Meteo%20%7C%20NASA%20POWER%20%7C%20GDACS%20%7C%20USGS%20%7C%20IMD-046A38.svg)]()
[![License](https://img.shields.io/badge/License-GODL%20India-FF671F.svg)](https://data.gov.in)
[![API Standard](https://img.shields.io/badge/Architecture-REST_%7C_PostgreSQL_PostGIS-046A38.svg)]()
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-blue.svg)]()

**WeatherPulse** is an enterprise-grade, real-time meteorological intelligence and early warning platform providing **hierarchical coverage across all 28 states & 8 UTs of India (and the globe)** backed by a local PostgreSQL database with **zero mock, hardcoded, or seeded data**.

> **Disclaimer**: Academic research project conforming to the Guidelines for Indian Government Websites (GIGW) & WCAG 2.1 Level AA Accessibility Standards. Not an official IMD, WMO, or Government of India service. For official warnings visit [mausam.imd.gov.in](https://mausam.imd.gov.in).

---

## 🚀 How to Run Locally

### 1. Database Setup
Ensure PostgreSQL is running locally (e.g. port `5433` or `5432`) and create the database `weatherpulse`:
```powershell
# Run versioned migrations
node deploy/postgres/run_migrations.js
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your local credentials:
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=weatherpulse
DB_USER=postgres
DB_PASSWORD=your_password

# SMS & Email Providers: twilio | fast2sms | msg91 | smtp | sendgrid | dryrun
SMS_PROVIDER=dryrun
EMAIL_PROVIDER=dryrun
SMS_DRY_RUN=true
EMAIL_DRY_RUN=true
```

### 3. Start the Backend Service
```powershell
$env:NODE_PATH="services/report-service/node_modules"
node services/report-service/server.js
```

### 4. Access the Web Application
Open your browser at:
```
http://localhost:8080/
```

---

## 📋 Key API Endpoints Reference

All endpoints query directly from local PostgreSQL and enforce zero mock data:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/weather/cities` | All Indian monitored cities with nested current observation, 7-day forecast, and IMD warning status |
| `GET` | `/api/alerts` | Active 72-hour early warnings derived from forecast thresholds and official bulletins |
| `GET` | `/api/alerts/stream` | Server-Sent Events (SSE) stream for live push warnings |
| `GET` | `/api/weather/location?lat=&lng=` | Centroid observation and 12-hour / 7-day forecast for GPS coordinates |
| `GET` | `/api/stats/pipeline` | Real pipeline ingestion rates and observation counts from PostgreSQL |
| `GET` | `/api/v1/analytics/trends?country=IN` | Historical and 30-day aggregated trends (temp, humidity, rain, wind) |
| `GET` | `/api/v1/analytics/verification` | Verification analytics (Verified vs Misinformation Rejected vs Pending) |
| `GET` | `/api/v1/analytics/sources` | Data source reliability metrics |
| `GET` | `/api/v1/weather/countries` | Global country-level summary across 250 countries |
| `POST` | `/api/v1/subscribers` | Register SMS / Email subscription with E.164 normalization & OTP |
| `POST` | `/api/v1/subscribers/verify-otp` | Verify SMS OTP for subscription activation |
| `POST` | `/api/v1/subscribers/unsubscribe` | Opt-out handler (STOP keyword honored) |
| `POST` | `/api/v1/notifications/broadcast` | Admin manual emergency broadcast to verified subscribers |

---

## 🔒 Security & Swagger Profile Policy

* **UI Swagger Tab Removed**: The Swagger tab is permanently removed from the user navigation menu.
* **Profile-Gated API Docs**: Swagger UI (`/swagger-ui`) and OpenAPI specs (`/openapi.json`, `/v3/api-docs`) are **disabled** by default in production. To enable during local API development:
  ```env
  SPRING_PROFILES_ACTIVE=dev
  # or
  ENABLE_SWAGGER=true
  ```

---

## 📱 SMS & Multi-Provider Alert Dispatch Engine

* **Phone Validation**: Automatic conversion to international E.164 format (e.g. `+919876543210`).
* **SMS Length Constraint**: Strict character count capping under **160 characters**.
* **Deduplication**: 6-hour deduplication window prevents sending duplicate alerts to the same subscriber.
* **Supported Gateways**:
  - `SMS_PROVIDER=twilio` (Twilio REST API)
  - `SMS_PROVIDER=fast2sms` (Fast2SMS Indian DLT Gateway)
  - `SMS_PROVIDER=msg91` (MSG91 DLT API)
  - `SMS_PROVIDER=dryrun` (Zero-cost safe database audit logging)
