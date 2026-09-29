# WeatherPulse India — Demo-Day Runbook & Dry-Run Script
**Judge-Proof Walkthrough, Pre-Seeded Fraud Scenario & Emergency Fallback Plan**

---

## 1. Demo-Day Pre-Flight Checklist (15 Minutes Before Pitch)

```
[ ] 1. Verify Docker containers are running healthy: `docker compose ps`
[ ] 2. Confirm Web App is live at `http://localhost:80` (or your live demo URL)
[ ] 3. Open Chrome in Incognito / Full-Screen Mode (F11) with zoom set to 100%
[ ] 4. Open Developer Console (F12) to verify ZERO JavaScript console errors
[ ] 5. Confirm Audio / Screen Share is crisp and ready
[ ] 6. Keep Backup Tab open with pre-loaded offline mode (`USE_MOCK_DATA=true`)
```

---

## 2. 5-Minute Minute-by-Minute Pitch Script & Click Sequence

```
+---------------------------------------------------------------------------------------------------------+
|                                    DEMO WALKTHROUGH SCRIPT & TIMELINE                                   |
+----------+------------------------------------+---------------------------------------------------------+
| Timeline | Screen & Action                    | Talking Points for Judges / Audience                    |
+----------+------------------------------------+---------------------------------------------------------+
| 0:00-1:00| Landing Dashboard (National View)  | "During monsoon disasters, authorities face two issues: |
|          | - Point to live Kafka counter      |  information delay and social media misinformation.     |
|          |   (2,418 evt/s)                    |  WeatherPulse India is a national real-time big data    |
|          | - Point to IMD Synced badge        |  intelligence platform fusing data.gov.in, IMD Doppler  |
|          | - Highlight Red Alert Marquee      |  Radar, AWS sensors, and crowdsourced citizen ground    |
|          |                                    |  observations into a mission-control command center."   |
+----------+------------------------------------+---------------------------------------------------------+
| 1:00-2:00| Spatial & Hazard Filtering         | "Let's zoom into Maharashtra during peak monsoon.       |
|          | - Select State: 'Maharashtra'      |  Notice the real-time filter response without page     |
|          | - Click Chip: '🌊 Flooding'        |  reflow. Clicking the Milan Subway report shows 78.4mm  |
|          | - Click Milan Subway red marker    |  of rain confirmed by IMD Santacruz Doppler Radar       |
|          | - Toggle Doppler Radar layer       |  reflectivity at 48.5 dBZ."                             |
+----------+------------------------------------+---------------------------------------------------------+
| 2:00-3:15| ML Fake Detection & Moderation     | "Here is our core innovation: AI-driven fraud triage.   |
|          | - Click 'ML Moderation Queue (2)'  |  A viral tweet claims extreme flash flooding in Chennai.|
|          | - Select 'wp-2026-chn-004'         |  Our multimodal pipeline cross-referenced IMD radar     |
|          | - Point out: 0 dBZ radar echo &    |  (0 dBZ — clear sky) and flagged a recycled 2015 image  |
|          |   pHash recycled photo match       |  using perceptual hashing. Watch as we reject it,       |
|          | - Click 'Reject as Confirmed Fake' |  instantly cleansing the public feed."                 |
+----------+------------------------------------+---------------------------------------------------------+
| 3:15-4:15| Citizen Report Submission Wizard   | "Now, a citizen on the ground in Mumbai submits an      |
|          | - Click 'Report Weather'           |  urgent observation. We lock GPS, validate EXIF data,   |
|          | - Enter 'Dadar Circle, 2ft water'  |  run an instant AI plausibility pre-flight scan, and    |
|          | - Click 'Publish to Pipeline'      |  publish it. Within 50ms, it streams across all         |
|          | - Watch new pin pulse on map       |  connected dashboard clients via WebSockets."           |
+----------+------------------------------------+---------------------------------------------------------+
| 4:15-5:00| Big Data Analytics & Wrap-up       | "Switching to the Big Data Analytics view reveals       |
|          | - Click 'Analytics View'           |  ingestion surge trends, IndicBERT triage breakdowns,   |
|          | - Showcase Hourly Ingestion chart  |  and our District Vulnerability Matrix.                 |
|          | - Showcase Vulnerability Matrix    |  WeatherPulse turns chaotic crisis noise into verified, |
|          |                                    |  life-saving actionable intelligence."                  |
+----------+------------------------------------+---------------------------------------------------------+
```

---

## 3. Pre-Seeded Fraud Demo Scenario Details

| Field | Value / Details |
| :--- | :--- |
| **Report ID** | `wp-2026-chn-004` |
| **Claimed Hazard** | Catastrophic Flash Flooding in T. Nagar, Chennai |
| **Submitted Media** | Submerged car photo claiming live 2026 disaster |
| **AI IndicBERT NLP Scan** | High urgency panic markers (`0.96`) |
| **IMD Doppler Cross-Check** | **0.0 dBZ** (Clear skies confirmed by Chennai Doppler Weather Radar) |
| **IMD AWS Rain Gauge** | **0.0 mm/h** (Meenambakkam & Nungambakkam AWS stations) |
| **Perceptual Hash (pHash)** | **Exact match** (`0.00` hamming distance) to December 2015 archive |
| **System Recommendation** | `🚨 CONFIRMED_FAKE (Trust Score: 4%)` |
| **Moderator Action to Demo**| Click **`Reject as Confirmed Fake`** (Turns badge red & removes from public stream) |

---

## 4. Emergency Backup & Resilience Plan

If external networks, government APIs, or third-party rate limits fail during the live demo:

### Plan A: Instant Toggle to Local Ground-Truth Dataset (0-second downtime)
If live data APIs time out, click the green button in the header:
```
[ Sync data.gov.in & IMD ]
```
The application will automatically activate the pre-bundled [`government_verified_weather_dataset.json`](file:///c:/Users/radhi/Downloads/WeatherPulse/government_verified_weather_dataset.json) with zero network dependency.

### Plan B: Force Offline Mock Ingestion Mode
If running via Docker:
```bash
# In .env file:
USE_MOCK_DATA=true
```
Then restart the frontend:
```bash
docker compose restart frontend
```

### Plan C: Offline Recorded Demo Video
In the unlikely event of total laptop hardware failure, have the 1080p demo walkthrough video stored locally on a USB drive and uploaded to Google Drive.
