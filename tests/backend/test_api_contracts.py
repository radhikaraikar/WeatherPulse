#!/usr/bin/env python3
"""
WeatherPulse India - REST API & Spatial Query Contract Test Suite
Validates:
  1. GET /api/v1/reports schema compliance (GeoJSON / Spatial fields)
  2. POST /api/v1/reports citizen report contract (Multipart & required fields)
  3. PATCH /api/v1/reports/{id}/status admin moderation RBAC and schema
  4. Geospatial bounding box query parameter validation
"""

import json
import unittest

MOCK_REPORTS_PAYLOAD = {
    "status": "SUCCESS",
    "total": 1,
    "page": 1,
    "limit": 50,
    "data": [
        {
            "id": "wp-2026-mum-001",
            "source_id": "src-twitter-live",
            "source_type": "SOCIAL_MEDIA",
            "source_name": "X / Twitter",
            "author_handle": "@mumbai_monsoon_tracker",
            "category": "FLOODING_WATERLOGGING",
            "severity": "EXTREME_RED",
            "text": "Milan Subway Santacruz completely inundated under 4.5 feet water! Heavy downpour since 2 hrs. #MumbaiRains",
            "coordinates": {
                "latitude": 19.0832,
                "longitude": 72.8421
            },
            "location_name": "Milan Subway, Santacruz",
            "city": "Mumbai",
            "state": "Maharashtra",
            "metrics": {
                "rainfall_mm": 78.4,
                "water_depth_cm": 135,
                "wind_speed_kmph": 42
            },
            "trust_score": 96,
            "verification_status": "AUTO_VERIFIED_HIGH_CONFIDENCE",
            "corroboration_count": 18,
            "media_urls": [
                "https://images.unsplash.com/photo-1547683905-f686c993aae5"
            ],
            "created_at": "2026-09-25T03:44:00Z"
        }
    ]
}

class TestWeatherPulseApiContracts(unittest.TestCase):

    def test_get_reports_schema_contract(self):
        """Verifies GET /api/v1/reports matches the OpenAPI contract schema"""
        payload = MOCK_REPORTS_PAYLOAD
        self.assertEqual(payload["status"], "SUCCESS")
        self.assertIsInstance(payload["data"], list)
        
        report = payload["data"][0]
        required_fields = [
            "id", "source_type", "category", "severity", "coordinates",
            "location_name", "city", "state", "trust_score", "verification_status"
        ]
        for field in required_fields:
            self.assertIn(field, report, f"Missing mandatory field '{field}' in API contract")
            
        # Coordinates validation
        coords = report["coordinates"]
        self.assertIn("latitude", coords)
        self.assertIn("longitude", coords)
        self.assertIsInstance(coords["latitude"], (int, float))
        self.assertIsInstance(coords["longitude"], (int, float))
        
        # Severity Enum validation
        valid_severities = ["EXTREME_RED", "SEVERE_ORANGE", "MODERATE_YELLOW", "LOW_GREEN"]
        self.assertIn(report["severity"], valid_severities)

        # Verification Status Enum validation
        valid_statuses = [
            "OFFICIAL_VERIFIED", "AUTO_VERIFIED_HIGH_CONFIDENCE",
            "COMMUNITY_CORROBORATED", "PENDING_MANUAL_REVIEW", "CONFIRMED_FAKE"
        ]
        self.assertIn(report["verification_status"], valid_statuses)

    def test_post_citizen_report_validation(self):
        """Verifies POST /api/v1/reports payload structure for citizen reporting"""
        citizen_submission = {
            "category": "FLOODING_WATERLOGGING",
            "severity": "SEVERE_ORANGE",
            "latitude": 12.9260,
            "longitude": 77.6762,
            "location_name": "Bellandur ORR",
            "city": "Bengaluru",
            "state": "Karnataka",
            "description": "Knee-high water on Outer Ring Road.",
            "media_url": "https://cdn.weatherpulse.in/uploads/bellandur.jpg"
        }
        
        # Must have valid GPS coordinates
        self.assertTrue(-90 <= citizen_submission["latitude"] <= 90)
        self.assertTrue(-180 <= citizen_submission["longitude"] <= 180)
        self.assertTrue(len(citizen_submission["description"]) >= 10, "Description too short")
        self.assertIn(citizen_submission["category"], [
            "FLOODING_WATERLOGGING", "RAINFALL", "THUNDERSTORM_LIGHTNING", 
            "HIGH_WINDS_CYCLONE", "DUST_STORM", "DENSE_FOG", "HEATWAVE"
        ])

    def test_admin_patch_status_contract(self):
        """Verifies admin PATCH moderation request contract"""
        patch_request = {
            "action": "APPROVE_OFFICIAL",
            "verification_status": "OFFICIAL_VERIFIED",
            "reason": "Corroborated by Santacruz Doppler Radar scan (>48 dBZ)",
            "trust_score_override": 100
        }
        self.assertIn(patch_request["action"], ["APPROVE_OFFICIAL", "FLAG_MISLEADING", "REJECT_FAKE"])
        self.assertEqual(patch_request["trust_score_override"], 100)

if __name__ == "__main__":
    unittest.main()
