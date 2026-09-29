/**
 * WeatherPulse India - Real-time Big Data Ingestion Mock Dataset
 * Simulating real-time feeds from Social Media (#IMD), Citizen Reports, Official AWS, and SDMA
 */

const INITIAL_WEATHER_REPORTS = [
  {
    report_id: "wp-2026-mum-001",
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    source_type: "SOCIAL_MEDIA",
    source_name: "X / Twitter",
    author_handle: "@mumbai_monsoon_tracker",
    author_reputation: 0.92,
    raw_text: "🚨 Milan Subway, Santacruz completely inundated under 4.5 feet water! BEST buses diverted via SV Road. Continuous heavy downpour since 2 hrs. Avoid Western Express Highway! #MumbaiRains #IMD #TrafficAlert",
    location: {
      latitude: 19.0832,
      longitude: 72.8421,
      sub_locality: "Milan Subway, Santacruz",
      city: "Mumbai",
      district: "Mumbai Suburban",
      state: "Maharashtra",
      geo_resolution: "NER_RESOLVED_STREET"
    },
    category: "FLOODING_WATERLOGGING",
    severity: "EXTREME_RED",
    confidence: 0.98,
    metrics: {
      rainfall_mm: 78.4,
      water_depth_cm: 135,
      wind_speed_kmph: 42
    },
    verification_status: "AUTO_VERIFIED_HIGH_CONFIDENCE",
    trust_score: 96,
    corroboration_count: 18,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
        caption: "Submerged vehicles at Milan Subway"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 48.5,
      nearest_aws_rain_1h_mm: 74.0,
      physical_plausibility_pass: true,
      notes: "Doppler Radar Colaba confirms convective cloud cell (>45 dBZ) over Santacruz."
    }
  },
  {
    report_id: "wp-2026-blr-002",
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    source_type: "CITIZEN_REPORT",
    source_name: "WeatherPulse App",
    author_handle: "Citizen_KarthikR",
    author_reputation: 0.88,
    raw_text: "Heavy lightning and intense rain on Outer Ring Road, Bellandur. Waterlogging up to knee height near Ecospace tech park. Commuters stranded. #BengaluruRains #IMD",
    location: {
      latitude: 12.9260,
      longitude: 77.6762,
      sub_locality: "Ecospace, Bellandur ORR",
      city: "Bengaluru",
      district: "Bengaluru Urban",
      state: "Karnataka",
      geo_resolution: "EXACT_GPS"
    },
    category: "THUNDERSTORM_LIGHTNING",
    severity: "SEVERE_ORANGE",
    confidence: 0.94,
    metrics: {
      rainfall_mm: 52.0,
      water_depth_cm: 45,
      wind_speed_kmph: 38
    },
    verification_status: "COMMUNITY_CORROBORATED",
    trust_score: 89,
    corroboration_count: 9,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=600&q=80",
        caption: "Waterlogging along Bellandur Tech Corridor"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 42.0,
      nearest_aws_rain_1h_mm: 48.5,
      physical_plausibility_pass: true,
      notes: "HAL AWS station confirms 48.5mm rainfall in 60 mins."
    }
  },
  {
    report_id: "wp-2026-del-003",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    source_type: "OFFICIAL_IMD",
    source_name: "IMD Nowcast Bulletins",
    author_handle: "@Indiametdept",
    author_reputation: 1.0,
    raw_text: "OFFICIAL NOWCAST: Thunderstorm accompanied with squall (wind speed 50-60 km/h) and moderate rainfall likely over Delhi-NCR (Noida, Ghaziabad, Gurugram, Central Delhi) during next 2 hours. #IMD #DelhiWeather",
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      sub_locality: "Central Delhi & NCR",
      city: "New Delhi",
      district: "New Delhi",
      state: "Delhi",
      geo_resolution: "NER_RESOLVED_CITY"
    },
    category: "HIGH_WINDS_CYCLONE",
    severity: "SEVERE_ORANGE",
    confidence: 1.0,
    metrics: {
      rainfall_mm: 22.0,
      water_depth_cm: 0,
      wind_speed_kmph: 58
    },
    verification_status: "OFFICIAL_VERIFIED",
    trust_score: 100,
    corroboration_count: 45,
    is_duplicate: false,
    media: [],
    imd_cross_check: {
      radar_reflectivity_dbz: 40.2,
      nearest_aws_rain_1h_mm: 19.5,
      physical_plausibility_pass: true,
      notes: "Palam Radar indicates gust front advancing from Haryana border."
    }
  },
  {
    report_id: "wp-2026-chn-004",
    timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    source_type: "SOCIAL_MEDIA",
    source_name: "X / Twitter",
    author_handle: "@viral_news_chennai",
    author_reputation: 0.24,
    raw_text: "MASSIVE FLOODS! T. Nagar completely drowned in 10 feet water! Indian Army boats deployed right now! Stay home! #ChennaiRains #IMD #Disaster",
    location: {
      latitude: 13.0418,
      longitude: 80.2341,
      sub_locality: "T. Nagar, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      geo_resolution: "NER_RESOLVED_STREET"
    },
    category: "FLOODING_WATERLOGGING",
    severity: "EXTREME_RED",
    confidence: 0.42,
    metrics: {
      rainfall_mm: 0.0,
      water_depth_cm: 0,
      wind_speed_kmph: 12
    },
    verification_status: "CONFIRMED_FAKE",
    trust_score: 12,
    corroboration_count: 0,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
        caption: "Claimed current flood in T Nagar"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 8.0,
      nearest_aws_rain_1h_mm: 0.0,
      physical_plausibility_pass: false,
      notes: "FLAGGED BY SYSTEM: pHash matched 2015 historical flood archive. Nungambakkam AWS indicates 0.0mm rain, clear skies (Radar <10 dBZ)."
    },
    flag_reasons: [
      "Perceptual Hash match with archived Dec 2015 Chennai floods",
      "IMD AWS confirms zero precipitation in Chennai district",
      "No corroborating posts in 5km radius"
    ]
  },
  {
    report_id: "wp-2026-kol-005",
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    source_type: "SOCIAL_MEDIA",
    source_name: "X / Twitter",
    author_handle: "@kolkata_weather",
    author_reputation: 0.85,
    raw_text: "Nor'wester (Kalbaishakhi) squall hits Kolkata! Severe thunder, gale winds up to 65kmph, tree branches down near Park Street & College Street. #KolkataRains #IMD #Kalbaishakhi",
    location: {
      latitude: 22.5726,
      longitude: 88.3639,
      sub_locality: "Park Street & Central Kolkata",
      city: "Kolkata",
      district: "Kolkata",
      state: "West Bengal",
      geo_resolution: "NER_RESOLVED_CITY"
    },
    category: "THUNDERSTORM_LIGHTNING",
    severity: "SEVERE_ORANGE",
    confidence: 0.95,
    metrics: {
      rainfall_mm: 36.5,
      water_depth_cm: 15,
      wind_speed_kmph: 64
    },
    verification_status: "AUTO_VERIFIED_HIGH_CONFIDENCE",
    trust_score: 93,
    corroboration_count: 14,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80",
        caption: "Squall clouds over Kolkata skyline"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 51.0,
      nearest_aws_rain_1h_mm: 34.0,
      physical_plausibility_pass: true,
      notes: "Alipore Radar detected deep squall line traversing South Bengal."
    }
  },
  {
    report_id: "wp-2026-raj-006",
    timestamp: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
    source_type: "CITIZEN_REPORT",
    source_name: "Citizen Web Portal",
    author_handle: "Bikaner_Observer",
    author_reputation: 0.79,
    raw_text: "Blinding dust storm (Andhi) in Bikaner. Day turned into night, visibility dropped below 50 meters on NH-11. Scorching winds. #RajasthanWeather #DustStorm #IMD",
    location: {
      latitude: 28.0229,
      longitude: 73.3119,
      sub_locality: "NH-11 Bikaner Bypass",
      city: "Bikaner",
      district: "Bikaner",
      state: "Rajasthan",
      geo_resolution: "EXACT_GPS"
    },
    category: "DUST_STORM",
    severity: "SEVERE_ORANGE",
    confidence: 0.91,
    metrics: {
      rainfall_mm: 0.0,
      water_depth_cm: 0,
      wind_speed_kmph: 55,
      visibility_meters: 45
    },
    verification_status: "COMMUNITY_CORROBORATED",
    trust_score: 87,
    corroboration_count: 7,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
        caption: "Dust wall approaching Bikaner highway"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 22.0,
      nearest_aws_rain_1h_mm: 0.0,
      physical_plausibility_pass: true,
      notes: "INSAT-3DR dust aerosol index shows heavy particulate suspension over Western Rajasthan."
    }
  },
  {
    report_id: "wp-2026-hyd-007",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    source_type: "PUBLIC_DATASET",
    source_name: "GHMC Flood Sensor Network",
    author_handle: "@GHMCOnline",
    author_reputation: 0.96,
    raw_text: "GHMC Sensor Alert: Inundation detected at Begumpet Railway Underbridge (Water level: 65cm). Automatic pump stations active. Traffic advisory issued. #HyderabadRains #IMD",
    location: {
      latitude: 17.4443,
      longitude: 78.4682,
      sub_locality: "Begumpet Underbridge",
      city: "Hyderabad",
      district: "Hyderabad",
      state: "Telangana",
      geo_resolution: "EXACT_GPS"
    },
    category: "FLOODING_WATERLOGGING",
    severity: "MODERATE_YELLOW",
    confidence: 0.99,
    metrics: {
      rainfall_mm: 41.2,
      water_depth_cm: 65,
      wind_speed_kmph: 24
    },
    verification_status: "OFFICIAL_VERIFIED",
    trust_score: 98,
    corroboration_count: 11,
    is_duplicate: false,
    media: [],
    imd_cross_check: {
      radar_reflectivity_dbz: 38.0,
      nearest_aws_rain_1h_mm: 42.0,
      physical_plausibility_pass: true,
      notes: "Begumpet AWS records 42mm in past 90 minutes."
    }
  },
  {
    report_id: "wp-2026-gwh-008",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    source_type: "SOCIAL_MEDIA",
    source_name: "X / Twitter",
    author_handle: "@assam_disaster_update",
    author_reputation: 0.81,
    raw_text: "Continuous torrential rainfall in Guwahati. Flash waterlogging near Zoo Road and Anil Nagar. Brahmaputra water level nearing warning mark at DC Court ghat. #AssamFloods #GuwahatiRains #IMD",
    location: {
      latitude: 26.1445,
      longitude: 91.7362,
      sub_locality: "Zoo Road, Anil Nagar",
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      geo_resolution: "NER_RESOLVED_STREET"
    },
    category: "RAINFALL",
    severity: "SEVERE_ORANGE",
    confidence: 0.96,
    metrics: {
      rainfall_mm: 86.0,
      water_depth_cm: 50,
      wind_speed_kmph: 30
    },
    verification_status: "AUTO_VERIFIED_HIGH_CONFIDENCE",
    trust_score: 92,
    corroboration_count: 15,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=600&q=80",
        caption: "Waterlogging along Zoo Road, Guwahati"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 46.0,
      nearest_aws_rain_1h_mm: 82.5,
      physical_plausibility_pass: true,
      notes: "Borjhar Radar confirms active monsoon trough over Kamrup valley."
    }
  },
  {
    report_id: "wp-2026-ahm-009",
    timestamp: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
    source_type: "SOCIAL_MEDIA",
    source_name: "X / Twitter",
    author_handle: "@ahmedabad_voice",
    author_reputation: 0.45,
    raw_text: "Extremely severe cyclonic storm with 140kmph winds entering Sabarmati riverfront right now! Sky is blood red! Evacuate city immediately! #AhmedabadWeather #IMD #Cyclone",
    location: {
      latitude: 23.0225,
      longitude: 72.5714,
      sub_locality: "Sabarmati Riverfront",
      city: "Ahmedabad",
      district: "Ahmedabad",
      state: "Gujarat",
      geo_resolution: "NER_RESOLVED_CITY"
    },
    category: "HIGH_WINDS_CYCLONE",
    severity: "EXTREME_RED",
    confidence: 0.35,
    metrics: {
      rainfall_mm: 0.0,
      water_depth_cm: 0,
      wind_speed_kmph: 15
    },
    verification_status: "SUSPECTED_MISLEADING",
    trust_score: 28,
    corroboration_count: 1,
    is_duplicate: false,
    media: [],
    imd_cross_check: {
      radar_reflectivity_dbz: 5.0,
      nearest_aws_rain_1h_mm: 0.0,
      physical_plausibility_pass: false,
      notes: "MISLEADING HOAX: Nearest cyclone center is 850km away in Central Arabian Sea. Ahmedabad AWS reports calm 12km/h breeze, 38°C clear skies."
    },
    flag_reasons: [
      "Physical impossibility with synoptic chart & Radar data",
      "Panic-inducing sensationalism detected by NLP triage",
      "Low author trust score (0.45)"
    ]
  },
  {
    report_id: "wp-2026-shm-010",
    timestamp: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
    source_type: "NEWS_PORTAL",
    source_name: "Himachal Tribune / SDMA",
    author_handle: "@HP_Disaster_Mgmt",
    author_reputation: 0.98,
    raw_text: "Dense Fog Alert on Shimla-Kalka National Highway (NH-5). Visibility dropped below 30 meters between Barog and Solan due to cloud condensation. Drive with hazard lamps. #HimachalWeather #DenseFog #IMD",
    location: {
      latitude: 31.1048,
      longitude: 77.1734,
      sub_locality: "NH-5 Barog-Solan Stretch",
      city: "Shimla",
      district: "Shimla",
      state: "Himachal Pradesh",
      geo_resolution: "NER_RESOLVED_STREET"
    },
    category: "DENSE_FOG",
    severity: "SEVERE_ORANGE",
    confidence: 0.97,
    metrics: {
      rainfall_mm: 2.0,
      water_depth_cm: 0,
      wind_speed_kmph: 8,
      visibility_meters: 25
    },
    verification_status: "OFFICIAL_VERIFIED",
    trust_score: 99,
    corroboration_count: 8,
    is_duplicate: false,
    media: [
      {
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=600&q=80",
        caption: "Dense fog enveloping NH-5 hills"
      }
    ],
    imd_cross_check: {
      radar_reflectivity_dbz: 14.0,
      nearest_aws_rain_1h_mm: 1.2,
      physical_plausibility_pass: true,
      notes: "Shimla AWS relative humidity 98%, temperature 11.2°C, visibility sensor 28m."
    }
  }
];

const STREAM_SIMULATION_TEMPLATES = [
  {
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0760,
    lon: 72.8777,
    sub_locality: "Hindmata Junction, Dadar",
    category: "FLOODING_WATERLOGGING",
    severity: "EXTREME_RED",
    text: "Hindmata submerged under 3ft water. Traffic moving at snail's pace. Pumping stations working full capacity. #MumbaiRains #Hindmata #IMD",
    author: "@dadar_resident_group",
    reputation: 0.85,
    source: "SOCIAL_MEDIA",
    radar_dbz: 46.2,
    rain_mm: 68.0,
    trust: 94,
    status: "AUTO_VERIFIED_HIGH_CONFIDENCE"
  },
  {
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lon: 73.8567,
    sub_locality: "Shivajinagar & JM Road",
    category: "THUNDERSTORM_LIGHTNING",
    severity: "SEVERE_ORANGE",
    text: "Sudden cloudburst-like rain over Shivajinagar Pune! Intense lightning strikes and water gushing on JM Road. #PuneRains #IMD",
    author: "@pune_weather_live",
    reputation: 0.89,
    source: "SOCIAL_MEDIA",
    radar_dbz: 49.0,
    rain_mm: 55.4,
    trust: 91,
    status: "AUTO_VERIFIED_HIGH_CONFIDENCE"
  },
  {
    city: "Nagpur",
    state: "Maharashtra",
    lat: 21.1458,
    lon: 79.0882,
    sub_locality: "Civil Lines, Nagpur",
    category: "HEATWAVE",
    severity: "SEVERE_ORANGE",
    text: "Nagpur temperature touches 45.8°C at 2:30 PM today. Severe heatwave (Loo) blowing. IMD issues Orange alert. Stay hydrated! #NagpurHeat #IMD",
    author: "@vidarbha_met",
    reputation: 0.94,
    source: "PUBLIC_DATASET",
    radar_dbz: 0.0,
    rain_mm: 0.0,
    trust: 97,
    status: "OFFICIAL_VERIFIED"
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lon: 75.7873,
    sub_locality: "MI Road, Jaipur",
    category: "DUST_STORM",
    severity: "MODERATE_YELLOW",
    text: "Gusty dust storm sweeping through Jaipur city. Visibility down to 200m near MI Road and Pink City markets. #JaipurWeather #IMD",
    author: "@citizen_rahul_jpr",
    reputation: 0.72,
    source: "CITIZEN_REPORT",
    radar_dbz: 20.5,
    rain_mm: 0.0,
    trust: 82,
    status: "COMMUNITY_CORROBORATED"
  },
  {
    city: "Patna",
    state: "Bihar",
    lat: 25.5941,
    lon: 85.1376,
    sub_locality: "Rajendra Nagar, Patna",
    category: "FLOODING_WATERLOGGING",
    severity: "SEVERE_ORANGE",
    text: "Heavy water accumulation near Rajendra Nagar railway terminal after 3 hours continuous rain. #PatnaRains #Waterlogging #IMD",
    author: "@bihar_flood_watch",
    reputation: 0.79,
    source: "SOCIAL_MEDIA",
    radar_dbz: 43.1,
    rain_mm: 61.2,
    trust: 86,
    status: "AUTO_VERIFIED_HIGH_CONFIDENCE"
  }
];
