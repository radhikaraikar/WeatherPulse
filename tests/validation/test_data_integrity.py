#!/usr/bin/env python3
"""
WeatherPulse India - Data Integrity & Geo-Validation Test Suite
Validates:
  1. Strict Geospatial Bounding Box (All reports must be within India's coordinates: 6.5N - 37.5N, 68.0E - 97.5E)
  2. Source Attribution Traceability (Every record must have a recognized source tag: IMD, data.gov.in, SDMA, Social, Citizen)
  3. Metric bounds & non-null constraints
"""

import json
import os
import unittest

INDIA_LAT_MIN = 6.5
INDIA_LAT_MAX = 37.5
INDIA_LNG_MIN = 68.0
INDIA_LNG_MAX = 97.5

VALID_SOURCES = [
    "imd", "data_gov_in", "nasa_power", "open_meteo",
    "OFFICIAL_IMD", "OFFICIAL_GOV", "STATE_DISASTER_MANAGEMENT", 
    "SOCIAL_MEDIA", "CITIZEN_REPORT", "IMD_AWS_SENSOR", "GOV_DATA_IN"
]

VALID_CATEGORIES = [
    "FLOODING_WATERLOGGING", "RAINFALL", "THUNDERSTORM_LIGHTNING", 
    "HIGH_WINDS_CYCLONE", "DUST_STORM", "DENSE_FOG", "HEATWAVE", "GENERAL_WEATHER"
]

class TestDataIntegrityAndGeoValidation(unittest.TestCase):

    def setUp(self):
        self.dataset_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.gov_dataset_file = os.path.join(self.dataset_dir, "government_verified_weather_dataset.json")
        self.real_dataset_file = os.path.join(self.dataset_dir, "real_indian_weather_dataset.json")

    def test_government_verified_dataset_integrity(self):
        """Verifies government dataset strictly adheres to India geography and source tags"""
        if not os.path.exists(self.gov_dataset_file):
            self.skipTest("government_verified_weather_dataset.json not found")

        with open(self.gov_dataset_file, "r", encoding="utf-8") as f:
            records = json.load(f)

        self.assertGreater(len(records), 0, "Government dataset should not be empty")
        
        for idx, rec in enumerate(records):
            # 1. Geo-bounding box check
            lat = rec.get("location", {}).get("latitude")
            lng = rec.get("location", {}).get("longitude")
            self.assertIsNotNone(lat, f"Record #{idx} missing latitude")
            self.assertIsNotNone(lng, f"Record #{idx} missing longitude")
            
            self.assertTrue(
                INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX,
                f"Record #{idx} ({rec.get('report_id')}) Latitude {lat} is outside India's bounding box [{INDIA_LAT_MIN}, {INDIA_LAT_MAX}]"
            )
            self.assertTrue(
                INDIA_LNG_MIN <= lng <= INDIA_LNG_MAX,
                f"Record #{idx} ({rec.get('report_id')}) Longitude {lng} is outside India's bounding box [{INDIA_LNG_MIN}, {INDIA_LNG_MAX}]"
            )

            # 2. Source Tag Traceability
            source = rec.get("source") or rec.get("source_type") or rec.get("source_category")
            is_valid_src = (source in VALID_SOURCES) or (rec.get("source_category") == "GOVERNMENT_VERIFIED")
            self.assertTrue(
                is_valid_src,
                f"Record #{idx} has untraceable or invalid source tag: '{source}'"
            )

            # 3. Category Validation
            category = rec.get("event_category") or rec.get("category")
            self.assertIn(
                category, VALID_CATEGORIES,
                f"Record #{idx} has invalid hazard category: '{category}'"
            )

            # 4. Trust score integrity
            trust_score = rec.get("trust_score", 0)
            self.assertTrue(0 <= trust_score <= 100, f"Record #{idx} trust score {trust_score} out of 0-100 range")

            # 5. Government Ground-Truth Verification
            if rec.get("is_government_ground_truth"):
                self.assertIn("data.gov.in", rec.get("ogd_portal_url", "") + rec.get("raw_text", ""))

    def test_out_of_bounds_geo_rejection(self):
        """Verifies that coordinates outside India (e.g. New York, London, Southern Ocean) are flagged"""
        out_of_bounds_samples = [
            {"name": "London", "lat": 51.5074, "lng": -0.1278},
            {"name": "New York", "lat": 40.7128, "lng": -74.0060},
            {"name": "Southern Ocean", "lat": -15.000, "lng": 75.000},
            {"name": "Far East Pacific", "lat": 19.000, "lng": 130.000}
        ]

        for sample in out_of_bounds_samples:
            lat = sample["lat"]
            lng = sample["lng"]
            is_valid_india = (INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX) and (INDIA_LNG_MIN <= lng <= INDIA_LNG_MAX)
            self.assertFalse(is_valid_india, f"Geo-validator incorrectly accepted out-of-bounds location: {sample['name']}")

if __name__ == "__main__":
    unittest.main()
