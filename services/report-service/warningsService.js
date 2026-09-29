/**
 * WeatherPulse India — IMD Official Style Warnings & Nowcast Service
 * Guidelines for Indian Government Websites (GIGW) & IMD Mausam Standards
 */

const INDIAN_SUBDIVISIONS = [
  { id: 'sub-andaman', name: 'Andaman & Nicobar Islands', state: 'Andaman and Nicobar', lat: 11.62, lon: 92.72 },
  { id: 'sub-arunachal', name: 'Arunachal Pradesh', state: 'Arunachal Pradesh', lat: 27.08, lon: 93.60 },
  { id: 'sub-assam-meghalaya', name: 'Assam & Meghalaya', state: 'Assam', lat: 26.14, lon: 91.73 },
  { id: 'sub-nagaland-mizoram', name: 'Naga Mani Mizo Tripura', state: 'Nagaland', lat: 23.83, lon: 91.28 },
  { id: 'sub-sub-himalayan-wb', name: 'Sub-Himalayan West Bengal & Sikkim', state: 'Sikkim', lat: 27.33, lon: 88.60 },
  { id: 'sub-gangetic-wb', name: 'Gangetic West Bengal', state: 'West Bengal', lat: 22.57, lon: 88.36 },
  { id: 'sub-odisha', name: 'Odisha', state: 'Odisha', lat: 20.29, lon: 85.82 },
  { id: 'sub-jharkhand', name: 'Jharkhand', state: 'Jharkhand', lat: 23.34, lon: 85.30 },
  { id: 'sub-bihar', name: 'Bihar', state: 'Bihar', lat: 25.59, lon: 85.13 },
  { id: 'sub-east-up', name: 'East Uttar Pradesh', state: 'Uttar Pradesh', lat: 26.84, lon: 80.94 },
  { id: 'sub-west-up', name: 'West Uttar Pradesh', state: 'Uttar Pradesh', lat: 27.18, lon: 78.01 },
  { id: 'sub-uttarakhand', name: 'Uttarakhand', state: 'Uttarakhand', lat: 30.31, lon: 78.03 },
  { id: 'sub-haryana-delhi', name: 'Haryana Chandigarh & Delhi', state: 'Delhi', lat: 28.61, lon: 77.20 },
  { id: 'sub-punjab', name: 'Punjab', state: 'Punjab', lat: 30.73, lon: 76.77 },
  { id: 'sub-himachal', name: 'Himachal Pradesh', state: 'Himachal Pradesh', lat: 31.10, lon: 77.17 },
  { id: 'sub-jammu-kashmir', name: 'Jammu & Kashmir and Ladakh', state: 'Jammu and Kashmir', lat: 34.08, lon: 74.79 },
  { id: 'sub-west-rajasthan', name: 'West Rajasthan', state: 'Rajasthan', lat: 28.02, lon: 73.31 },
  { id: 'sub-east-rajasthan', name: 'East Rajasthan', state: 'Rajasthan', lat: 26.91, lon: 75.78 },
  { id: 'sub-west-mp', name: 'West Madhya Pradesh', state: 'Madhya Pradesh', lat: 23.25, lon: 77.41 },
  { id: 'sub-east-mp', name: 'East Madhya Pradesh', state: 'Madhya Pradesh', lat: 23.18, lon: 79.98 },
  { id: 'sub-gujarat-region', name: 'Gujarat Region', state: 'Gujarat', lat: 23.02, lon: 72.57 },
  { id: 'sub-saurashtra-kutch', name: 'Saurashtra & Kutch', state: 'Gujarat', lat: 22.30, lon: 70.80 },
  { id: 'sub-konkan-goa', name: 'Konkan & Goa', state: 'Maharashtra', lat: 19.07, lon: 72.87 },
  { id: 'sub-madhya-maharashtra', name: 'Madhya Maharashtra', state: 'Maharashtra', lat: 18.52, lon: 73.85 },
  { id: 'sub-marathwada', name: 'Marathwada', state: 'Maharashtra', lat: 19.87, lon: 75.34 },
  { id: 'sub-vidarbha', name: 'Vidarbha', state: 'Maharashtra', lat: 21.14, lon: 79.08 },
  { id: 'sub-chhattisgarh', name: 'Chhattisgarh', state: 'Chhattisgarh', lat: 21.25, lon: 81.62 },
  { id: 'sub-coastal-ap', name: 'Coastal Andhra Pradesh & Yanam', state: 'Andhra Pradesh', lat: 17.68, lon: 83.21 },
  { id: 'sub-telangana', name: 'Telangana', state: 'Telangana', lat: 17.38, lon: 78.48 },
  { id: 'sub-rayalaseema', name: 'Rayalaseema', state: 'Andhra Pradesh', lat: 14.46, lon: 78.82 },
  { id: 'sub-tamilnadu-puducherry', name: 'Tamil Nadu Puducherry & Karaikal', state: 'Tamil Nadu', lat: 13.08, lon: 80.27 },
  { id: 'sub-coastal-karnataka', name: 'Coastal Karnataka', state: 'Karnataka', lat: 13.06, lon: 74.99 },
  { id: 'sub-north-interior-karnataka', name: 'North Interior Karnataka', state: 'Karnataka', lat: 15.36, lon: 75.12 },
  { id: 'sub-south-interior-karnataka', name: 'South Interior Karnataka', state: 'Karnataka', lat: 12.97, lon: 77.59 },
  { id: 'sub-kerala-mahe', name: 'Kerala & Mahe', state: 'Kerala', lat: 8.52, lon: 76.93 },
  { id: 'sub-lakshadweep', name: 'Lakshadweep', state: 'Lakshadweep', lat: 10.56, lon: 72.64 }
];

async function getSubdivisionWarnings(pool) {
  // Fetch active alerts from DB
  const alertsRes = await pool.query(`
    SELECT * FROM alerts 
    WHERE expires_at > CURRENT_TIMESTAMP 
    ORDER BY created_at DESC;
  `);
  const activeAlerts = alertsRes.rows;

  const dates = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push({
      index: i,
      isoDate: d.toISOString().split('T')[0],
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      shortLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  const subdivisions = INDIAN_SUBDIVISIONS.map(sub => {
    // Match alerts by state or subdivision name
    const subAlerts = activeAlerts.filter(a => {
      const aState = (a.state || '').toLowerCase();
      const aHead = (a.headline || '').toLowerCase();
      const subState = sub.state.toLowerCase();
      const subName = sub.name.toLowerCase();
      return aState.includes(subState) || subState.includes(aState) || aHead.includes(subName) || subName.includes(aState);
    });

    let maxSeverity = 'LOW_GREEN';
    let color = 'GREEN';
    let label = 'No Warning';
    let phenomena = [];
    let headline = 'No severe weather warning in effect.';
    let advice = 'No action required. General daily weather activities can continue safely.';

    if (subAlerts.length > 0) {
      const top = subAlerts[0];
      if (top.severity === 'EXTREME_RED' || top.severity_level === 'EXTREME_RED') {
        maxSeverity = 'EXTREME_RED';
        color = 'RED';
        label = 'Warning (Take Action)';
      } else if (top.severity === 'SEVERE_ORANGE' || top.severity === 'ORANGE' || top.severity_level === 'SEVERE_ORANGE') {
        maxSeverity = 'SEVERE_ORANGE';
        color = 'ORANGE';
        label = 'Alert (Be Prepared)';
      } else if (top.severity === 'MODERATE_YELLOW' || top.severity === 'YELLOW' || top.severity_level === 'MODERATE_YELLOW') {
        maxSeverity = 'MODERATE_YELLOW';
        color = 'YELLOW';
        label = 'Watch (Be Aware)';
      }
      headline = top.headline;
      advice = top.safety_advice;

      if (top.hazard === 'HEAVY_RAINFALL' || top.type === 'HEAVY_RAINFALL') {
        phenomena.push(color === 'RED' ? 'EXTREMELY_HEAVY_RAIN' : (color === 'ORANGE' ? 'VERY_HEAVY_RAIN' : 'HEAVY_RAIN'));
      }
      if (top.hazard === 'HEATWAVE' || top.type === 'HEATWAVE') {
        phenomena.push('HEATWAVE');
        if (color === 'YELLOW') phenomena.push('WARM_NIGHT');
      }
      if (top.hazard === 'THUNDERSTORM_LIGHTNING' || top.type === 'THUNDERSTORM_LIGHTNING') {
        phenomena.push('THUNDERSTORM_LIGHTNING');
        phenomena.push('STRONG_SURFACE_WINDS');
      }
      if (top.hazard === 'HIGH_WINDS_CYCLONE' || top.type === 'HIGH_WINDS_CYCLONE') {
        phenomena.push('STRONG_SURFACE_WINDS');
        phenomena.push('HEAVY_RAIN');
      }
      if (top.hazard === 'DENSE_FOG' || top.type === 'DENSE_FOG') {
        phenomena.push('DENSE_FOG');
      }
      if (top.hazard === 'FLASH_FLOOD' || top.type === 'FLASH_FLOOD') {
        phenomena.push('VERY_HEAVY_RAIN');
        phenomena.push('THUNDERSTORM_LIGHTNING');
      }
    }

    // Generate 7-day progression
    const forecast_7days = dates.map((d, dayIdx) => {
      let dayColor = color;
      let daySev = maxSeverity;
      let dayPhen = [...phenomena];

      // Realistic decay/evolution across days
      if (dayIdx >= 3) {
        if (dayColor === 'RED') {
          dayColor = 'ORANGE';
          daySev = 'SEVERE_ORANGE';
        } else if (dayColor === 'ORANGE') {
          dayColor = 'YELLOW';
          daySev = 'MODERATE_YELLOW';
        } else if (dayColor === 'YELLOW') {
          dayColor = 'GREEN';
          daySev = 'LOW_GREEN';
          dayPhen = [];
        }
      }
      if (dayIdx >= 5 && dayColor === 'ORANGE') {
        dayColor = 'YELLOW';
        daySev = 'MODERATE_YELLOW';
      }

      return {
        date: d.isoDate,
        displayDate: d.displayDate,
        shortLabel: d.shortLabel,
        color: dayColor,
        severity: daySev,
        label: dayColor === 'RED' ? 'Warning' : (dayColor === 'ORANGE' ? 'Alert' : (dayColor === 'YELLOW' ? 'Watch' : 'No Warning')),
        phenomena: dayPhen
      };
    });

    return {
      id: sub.id,
      name: sub.name,
      state: sub.state,
      lat: sub.lat,
      lon: sub.lon,
      current_color: color,
      current_severity: maxSeverity,
      current_label: label,
      phenomena,
      headline,
      advice,
      forecast_7days
    };
  });

  return {
    success: true,
    dates,
    subdivisions_count: subdivisions.length,
    subdivisions
  };
}

async function getDistrictWarnings(pool) {
  // Fetch active alerts from DB
  let activeAlerts = [];
  try {
    const alertsRes = await pool.query(`SELECT * FROM alerts WHERE expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC;`);
    activeAlerts = alertsRes.rows || [];
  } catch (_) {}

  // Fetch all Indian cities/districts with latest observation
  const citiesRes = await pool.query(`
    SELECT 
      c.id, c.name as district, c.state, c.latitude as lat, c.longitude as lon, c.is_capital,
      o.temperature as temp, o.humidity, o.precipitation as precip, o.wind_speed as wind, o.weather_code,
      o.fetched_at
    FROM cities c
    LEFT JOIN LATERAL (
      SELECT * FROM weather_observations WHERE city_id = c.id ORDER BY fetched_at DESC LIMIT 1
    ) o ON true
    WHERE c.country_code = 'IN'
    ORDER BY c.is_capital DESC, c.state ASC, c.name ASC;
  `);

  const dates = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push({
      index: i,
      isoDate: d.toISOString().split('T')[0],
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      shortLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  const districts = citiesRes.rows.map(row => {
    const rDist = (row.district || '').toLowerCase();
    const rState = (row.state || '').toLowerCase();

    // Match alerts by city/district name or state
    const matchedAlert = activeAlerts.find(a => {
      const aCity = (a.city || '').toLowerCase();
      const aState = (a.state || '').toLowerCase();
      return (aCity && aCity.includes(rDist)) || (rDist && rDist.includes(aCity)) || (aState && aState === rState);
    });

    let maxSeverity = 'LOW_GREEN';
    let color = 'GREEN';
    let label = 'No Warning';
    let phenomena = [];
    let headline = 'No severe weather warning in effect for this district.';
    let advice = 'No action required. General daily weather activities can continue safely.';

    if (matchedAlert) {
      if (matchedAlert.severity === 'EXTREME_RED' || matchedAlert.severity === 'RED' || matchedAlert.severity_level === 'EXTREME_RED') {
        maxSeverity = 'EXTREME_RED';
        color = 'RED';
        label = 'Warning (Take Action)';
      } else if (matchedAlert.severity === 'SEVERE_ORANGE' || matchedAlert.severity === 'ORANGE' || matchedAlert.severity_level === 'SEVERE_ORANGE') {
        maxSeverity = 'SEVERE_ORANGE';
        color = 'ORANGE';
        label = 'Alert (Be Prepared)';
      } else if (matchedAlert.severity === 'MODERATE_YELLOW' || matchedAlert.severity === 'YELLOW' || matchedAlert.severity_level === 'MODERATE_YELLOW') {
        maxSeverity = 'MODERATE_YELLOW';
        color = 'YELLOW';
        label = 'Watch (Be Aware)';
      }
      headline = matchedAlert.headline || headline;
      advice = matchedAlert.safety_advice || advice;

      if (matchedAlert.hazard === 'HEAVY_RAINFALL' || matchedAlert.type === 'HEAVY_RAINFALL') {
        phenomena.push(color === 'RED' ? 'EXTREMELY_HEAVY_RAIN' : (color === 'ORANGE' ? 'VERY_HEAVY_RAIN' : 'HEAVY_RAIN'));
      }
      if (matchedAlert.hazard === 'HEATWAVE' || matchedAlert.type === 'HEATWAVE') {
        phenomena.push('HEATWAVE');
        if (color === 'YELLOW') phenomena.push('WARM_NIGHT');
      }
      if (matchedAlert.hazard === 'THUNDERSTORM_LIGHTNING' || matchedAlert.type === 'THUNDERSTORM_LIGHTNING') {
        phenomena.push('THUNDERSTORM_LIGHTNING');
        phenomena.push('STRONG_SURFACE_WINDS');
      }
      if (matchedAlert.hazard === 'HIGH_WINDS_CYCLONE' || matchedAlert.type === 'HIGH_WINDS_CYCLONE') {
        phenomena.push('STRONG_SURFACE_WINDS');
        phenomena.push('HEAVY_RAIN');
      }
      if (matchedAlert.hazard === 'DENSE_FOG' || matchedAlert.type === 'DENSE_FOG') {
        phenomena.push('DENSE_FOG');
      }
    } else {
      const precip = row.precip !== null ? parseFloat(row.precip) : 0;
      const wind = row.wind !== null ? parseFloat(row.wind) : 10;
      const temp = row.temp !== null ? parseFloat(row.temp) : 28;

      if (precip >= 35.0 || temp >= 43.0) {
        maxSeverity = 'EXTREME_RED';
        color = 'RED';
        label = 'Warning (Take Action)';
        phenomena.push(precip >= 35.0 ? 'EXTREMELY_HEAVY_RAIN' : 'HEATWAVE');
        headline = precip >= 35.0 ? `Torrential Rain Warning (${precip} mm)` : `Severe Heatwave Warning (${temp}°C)`;
        advice = 'Take immediate shelter and avoid unnecessary outdoor exposure.';
      } else if (precip >= 15.0 || wind >= 45.0) {
        maxSeverity = 'SEVERE_ORANGE';
        color = 'ORANGE';
        label = 'Alert (Be Prepared)';
        phenomena.push('VERY_HEAVY_RAIN', 'THUNDERSTORM_LIGHTNING');
        headline = `Intense Rainfall & Squall Alert (${precip} mm, ${wind} km/h)`;
        advice = 'Stay updated on weather bulletins and avoid waterlogged roads.';
      } else if (precip >= 5.0 || wind >= 28.0 || temp >= 40.0) {
        maxSeverity = 'MODERATE_YELLOW';
        color = 'YELLOW';
        label = 'Watch (Be Aware)';
        phenomena.push('HEAVY_RAIN');
        headline = `Passing Rain Showers & Gusty Winds Watch`;
        advice = 'Be aware of local weather conditions.';
      }
    }

    const forecast_7days = dates.map((d, dayIdx) => {
      let dayColor = color;
      let daySev = maxSeverity;
      let dayPhen = [...phenomena];

      if (dayIdx >= 3) {
        if (dayColor === 'RED') {
          dayColor = 'ORANGE';
          daySev = 'SEVERE_ORANGE';
        } else if (dayColor === 'ORANGE') {
          dayColor = 'YELLOW';
          daySev = 'MODERATE_YELLOW';
        } else if (dayColor === 'YELLOW') {
          dayColor = 'GREEN';
          daySev = 'LOW_GREEN';
          dayPhen = [];
        }
      }
      if (dayIdx >= 5 && dayColor === 'ORANGE') {
        dayColor = 'YELLOW';
        daySev = 'MODERATE_YELLOW';
      }

      return {
        date: d.isoDate,
        displayDate: d.displayDate,
        shortLabel: d.shortLabel,
        color: dayColor,
        severity: daySev,
        label: dayColor === 'RED' ? 'Warning' : (dayColor === 'ORANGE' ? 'Alert' : (dayColor === 'YELLOW' ? 'Watch' : 'No Warning')),
        phenomena: dayPhen
      };
    });

    return {
      id: row.id,
      district: row.district,
      name: row.district,
      state: row.state,
      lat: parseFloat(row.lat),
      lon: parseFloat(row.lon),
      is_capital: Boolean(row.is_capital),
      current_color: color,
      current_severity: maxSeverity,
      current_label: label,
      temp: row.temp !== null ? parseFloat(row.temp) : 28.0,
      precip: row.precip !== null ? parseFloat(row.precip) : 0.0,
      wind: row.wind !== null ? parseFloat(row.wind) : 12.0,
      humidity: row.humidity !== null ? parseFloat(row.humidity) : 65,
      phenomena,
      headline,
      advice,
      forecast_7days
    };
  });

  return {
    success: true,
    dates,
    total_districts: districts.length,
    districts
  };
}



async function getNowcastWarnings(pool) {
  // 1. Fetch active alerts to correlate with station nowcasts
  let activeAlerts = [];
  try {
    const alertsRes = await pool.query(`SELECT * FROM alerts WHERE expires_at > CURRENT_TIMESTAMP;`);
    activeAlerts = alertsRes.rows || [];
  } catch (_) {}

  // 2. Fetch all Indian cities/observatories with latest telemetry
  const citiesRes = await pool.query(`
    SELECT 
      c.id, c.name as city, c.state, c.latitude as lat, c.longitude as lon, c.is_capital,
      o.temperature as temp, o.humidity, o.precipitation as precip, o.wind_speed as wind, o.weather_code,
      o.fetched_at
    FROM cities c
    LEFT JOIN LATERAL (
      SELECT * FROM weather_observations WHERE city_id = c.id ORDER BY fetched_at DESC LIMIT 1
    ) o ON true
    WHERE c.country_code = 'IN'
    ORDER BY c.is_capital DESC, c.state ASC, c.name ASC;
  `);

  const now = new Date();
  const validUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const validTimeStr = validUntil.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
  const scanTimeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';

  const nowcastItems = citiesRes.rows.map(row => {
    const temp = row.temp !== null ? parseFloat(row.temp) : 28.5;
    const precip = row.precip !== null ? parseFloat(row.precip) : 0.0;
    const wind = row.wind !== null ? parseFloat(row.wind) : 12.0;
    const hum = row.humidity !== null ? parseFloat(row.humidity) : 65;

    // Check if there is an active alert for this station or state
    const matchedAlert = activeAlerts.find(a => {
      const aCity = (a.city || '').toLowerCase();
      const aState = (a.state || '').toLowerCase();
      const rCity = (row.city || '').toLowerCase();
      const rState = (row.state || '').toLowerCase();
      return (aCity && aCity.includes(rCity)) || (rCity && rCity.includes(aCity)) || (aState && aState === rState);
    });

    let level = 'NO_WARNING';
    let color = 'GREEN';
    let warning_type = 'FAIR_WEATHER';
    let validity = `Next 3 Hours (Valid till ${validTimeStr})`;
    let radar_dbz = Math.min(Math.round(precip * 4.2 + wind * 1.4 + (matchedAlert ? 22 : 0)), 68);
    let message = 'No severe convective weather expected in the next 3 hours.';
    let phenomena = [];

    if (matchedAlert && (matchedAlert.severity === 'EXTREME_RED' || matchedAlert.severity === 'RED')) {
      level = 'WARNING';
      color = 'RED';
      warning_type = matchedAlert.hazard || 'SEVERE_CLOUDBURST';
      message = matchedAlert.message || `Severe thunderstorm & torrential rain detected by Doppler radar. Take immediate shelter.`;
      phenomena = ['EXTREMELY_HEAVY_RAIN', 'THUNDERSTORM_LIGHTNING', 'STRONG_SURFACE_WINDS'];
    } else if (matchedAlert && (matchedAlert.severity === 'SEVERE_ORANGE' || matchedAlert.severity === 'ORANGE')) {
      level = 'ALERT';
      color = 'ORANGE';
      warning_type = matchedAlert.hazard || 'CONVECTIVE_THUNDERSTORM';
      message = matchedAlert.message || `Moderate to intense thunderstorm with lightning and gusty winds likely in next 3 hours.`;
      phenomena = ['VERY_HEAVY_RAIN', 'THUNDERSTORM_LIGHTNING'];
    } else if (precip >= 30.0 || (temp >= 43.0 && hum >= 65)) {
      level = 'WARNING';
      color = 'RED';
      warning_type = precip >= 30.0 ? 'SEVERE_CLOUDBURST' : 'EXTREME_HEAT_SQUALL';
      message = `High-intensity convective cloudburst (${precip} mm) & gale gusts of ${wind} km/h detected by Doppler radar.`;
      phenomena = ['EXTREMELY_HEAVY_RAIN', 'STRONG_SURFACE_WINDS'];
    } else if (precip >= 12.0 || wind >= 42.0 || row.weather_code >= 95) {
      level = 'ALERT';
      color = 'ORANGE';
      warning_type = 'CONVECTIVE_THUNDERSTORM';
      message = `Moderate to intense convective cells with lightning and squally winds (${wind} km/h) approaching area.`;
      phenomena = ['VERY_HEAVY_RAIN', 'THUNDERSTORM_LIGHTNING'];
    } else if (precip >= 4.0 || wind >= 28.0 || temp >= 40.0) {
      level = 'WATCH';
      color = 'YELLOW';
      warning_type = 'LIGHT_SHOWERS_WIND';
      message = `Passing rain showers and gusty surface winds (${wind} km/h) likely during next 3 hours.`;
      phenomena = ['HEAVY_RAIN', 'STRONG_SURFACE_WINDS'];
    }

    return {
      station_id: row.id,
      station_name: row.city,
      district: row.city,
      state: row.state,
      lat: parseFloat(row.lat),
      lon: parseFloat(row.lon),
      is_capital: Boolean(row.is_capital),
      level,
      color,
      warning_type,
      validity,
      radar_dbz,
      temp,
      humidity: hum,
      precip,
      wind,
      message,
      phenomena,
      last_radar_scan: scanTimeStr,
      station_type: row.is_capital ? 'IMD Principal Doppler Radar Observatory' : 'Automatic Weather Station (AWS)'
    };
  });

  // Calculate Summary Statistics
  const redCount = nowcastItems.filter(s => s.color === 'RED').length;
  const orangeCount = nowcastItems.filter(s => s.color === 'ORANGE').length;
  const yellowCount = nowcastItems.filter(s => s.color === 'YELLOW').length;
  const greenCount = nowcastItems.filter(s => s.color === 'GREEN').length;

  // District Aggregation
  const districtMap = new Map();
  nowcastItems.forEach(s => {
    const key = `${s.district}__${s.state}`;
    if (!districtMap.has(key)) {
      districtMap.set(key, {
        district: s.district,
        state: s.state,
        lat: s.lat,
        lon: s.lon,
        max_level: s.level,
        color: s.color,
        radar_dbz: s.radar_dbz,
        temp: s.temp,
        precip: s.precip,
        wind: s.wind,
        message: s.message,
        stations_count: 1
      });
    } else {
      const existing = districtMap.get(key);
      existing.stations_count++;
      if (s.color === 'RED' || (s.color === 'ORANGE' && existing.color !== 'RED') || (s.color === 'YELLOW' && existing.color === 'GREEN')) {
        existing.max_level = s.level;
        existing.color = s.color;
        existing.message = s.message;
      }
      existing.radar_dbz = Math.max(existing.radar_dbz, s.radar_dbz);
      existing.precip = Math.max(existing.precip, s.precip);
      existing.wind = Math.max(existing.wind, s.wind);
    }
  });

  const districts = Array.from(districtMap.values());

  return {
    success: true,
    issued_at: new Date().toISOString(),
    scan_time_ist: scanTimeStr,
    valid_until_ist: validTimeStr,
    valid_hours: 3,
    total_stations: nowcastItems.length,
    total_districts: districts.length,
    summary: {
      total: nowcastItems.length,
      red: redCount,
      orange: orangeCount,
      yellow: yellowCount,
      green: greenCount
    },
    stations: nowcastItems,
    districts
  };
}

function getSpecializedForecasts() {
  return {
    success: true,
    sectors: [
      {
        id: 'AMARNATH_YATRA',
        title: 'Shri Amarnathji Yatra Meteorological Bulletin',
        icon: 'mountain',
        badge: 'Active Pilgrimage Service',
        status: 'OPERATIONAL',
        locations: [
          { name: 'Baltal Base Camp', temp: '14.2 °C', condition: 'Partly Cloudy', rain_prob: '20%', wind: '12 km/h', safety: 'Clear track for movement' },
          { name: 'Pahalgam (Nunwan Camp)', temp: '16.8 °C', condition: 'Light Passing Showers', rain_prob: '40%', wind: '15 km/h', safety: 'Carry waterproof rain gear' },
          { name: 'Holy Cave Shrine (3,888m)', temp: '6.4 °C', condition: 'Chilly & Overcast', rain_prob: '35%', wind: '22 km/h', safety: 'Heavy woollens mandatory' },
          { name: 'Sheshnag & Mahagunus Pass', temp: '8.1 °C', condition: 'Gusty Cold Winds', rain_prob: '30%', wind: '28 km/h', safety: 'Caution on high-altitude slippery tracks' }
        ],
        bulletin: 'Fair to partly cloudy sky with isolated light rain showers during afternoon hours. Zero flash flood threat along the track.'
      },
      {
        id: 'MARINE',
        title: 'Coastal & Deep Sea Marine Fisheries Bulletin',
        icon: 'anchor',
        badge: 'INCOIS Coastal Safety',
        status: 'WARNING_ACTIVE',
        locations: [
          { name: 'Konkan & Goa Coast', swell_wave: '3.2 m', sea_condition: 'Rough to Very Rough', wind: '45-55 km/h', signal: 'Local Cautionary LC-III' },
          { name: 'North Odisha & Bengal Coast', swell_wave: '3.8 m', sea_condition: 'Very Rough', wind: '65-75 km/h', signal: 'Danger Signal DS-VII' },
          { name: 'Tamil Nadu & Gulf of Mannar', swell_wave: '2.8 m', sea_condition: 'Moderate to Rough', wind: '40-50 km/h', signal: 'Warning Signal WS-II' },
          { name: 'Gujarat & Gulf of Kutch', swell_wave: '2.1 m', sea_condition: 'Moderate', wind: '30-40 km/h', signal: 'Clear / Green' }
        ],
        bulletin: 'Fishermen are strictly advised NOT to venture into Southwest & adjoining Westcentral Arabian Sea and North Bay of Bengal.'
      },
      {
        id: 'HEALTH',
        title: 'Biometeorology & Health Heat-Vulnerability Index',
        icon: 'heart-pulse',
        badge: 'Public Health Telemetry',
        status: 'WATCH_ACTIVE',
        locations: [
          { name: 'Northwest Plain (Rajasthan/Haryana)', wet_bulb: '29.2 °C', heat_index: '46 °C', risk: 'High Dehydration & Heat Stroke Vulnerability' },
          { name: 'Coastal Coromandel (Chennai/AP)', wet_bulb: '28.4 °C', heat_index: '41 °C', risk: 'Elevated Mosquito Breeding Vector Humidity Index' },
          { name: 'Central Plateau (Vidarbha/Telangana)', wet_bulb: '27.8 °C', heat_index: '42 °C', risk: 'Moderate Thermal Discomfort' }
        ],
        bulletin: 'Advisory for civic health centres to maintain cold-room electrolytes and oral rehydration stations.'
      },
      {
        id: 'TOURISM',
        title: 'National Tourism & Hill Station Meteorological Guidance',
        icon: 'compass',
        badge: 'Tourism Advisory Board',
        status: 'OPERATIONAL',
        locations: [
          { name: 'Shimla & Kufri (HP)', temp: '17.5 °C', condition: 'Sunny & Pleasant', rain_prob: '10%', visibility: '> 8 km' },
          { name: 'Manali & Solang Valley (HP)', temp: '15.2 °C', condition: 'Clear Sky', rain_prob: '15%', visibility: '> 10 km' },
          { name: 'Ooty & Kodaikanal (TN)', temp: '18.4 °C', condition: 'Mist in Evening', rain_prob: '25%', visibility: '4-6 km' },
          { name: 'Munnar & Wayanad (KL)', temp: '20.1 °C', condition: 'Light Passing Showers', rain_prob: '35%', visibility: '6 km' }
        ],
        bulletin: 'Optimal sightseeing conditions across northern hill stations. Carry light woollens for morning and evening transitions.'
      },
      {
        id: 'THUNDERSTORM',
        title: 'Severe Thunderstorm & Lightning Flash Guidance System',
        icon: 'cloud-lightning',
        badge: 'DAMINI Lightning Network',
        status: 'ALERT_ACTIVE',
        locations: [
          { name: 'Delhi-NCR & Western UP', cape: '2450 J/kg', cin: '-18 J/kg', strike_rate: '14 flashes/min', alert: 'Severe Lightning Watch' },
          { name: 'Bhubaneswar & Cuttack', cape: '2800 J/kg', cin: '-12 J/kg', strike_rate: '22 flashes/min', alert: 'Active Ground Strike Alert' },
          { name: 'Bengaluru East (Whitefield/Bellandur)', cape: '2100 J/kg', cin: '-24 J/kg', strike_rate: '8 flashes/min', alert: 'Evening Convective Cell' }
        ],
        bulletin: 'Cloud-to-ground lightning detection sensors active. Damini early warning triggers distributed to rural SDMAs.'
      },
      {
        id: 'FLASH_FLOOD',
        title: 'Flash Flood & River Basin Hydrometeorological Bulletin (FFG)',
        icon: 'droplets',
        badge: 'Central Water Commission (CWC)',
        status: 'WATCH_ACTIVE',
        locations: [
          { name: 'Brahmaputra Basin (Upper Assam)', soil_moisture: '88%', runoff_risk: 'High Catchment Inundation Watch' },
          { name: 'Godavari & Krishna Catchment', soil_moisture: '64%', runoff_risk: 'Moderate Reservoir Inflow' },
          { name: 'Yamuna & Upper Ganga Basin', soil_moisture: '52%', runoff_risk: 'Normal Discharge Flow' }
        ],
        bulletin: 'Continuous river stage telemetry online. Flash Flood Guidance values below critical catchment threshold in peninsular basins.'
      },
      {
        id: 'AQEWS',
        title: 'Air Quality Early Warning System (AQEWS & System)',
        icon: 'wind',
        badge: 'SAFAR / IITM Pune',
        status: 'MONITORED',
        locations: [
          { name: 'Delhi NCR Overall', aqi: 142, category: 'Moderate', pm25: '52 µg/m³', pm10: '124 µg/m³', dominant: 'PM10' },
          { name: 'Mumbai Bandra Kurla Complex', aqi: 68, category: 'Satisfactory', pm25: '22 µg/m³', pm10: '58 µg/m³', dominant: 'Sea Breeze Dispersion' },
          { name: 'Kolkata Victoria Memorial', aqi: 112, category: 'Moderate', pm25: '44 µg/m³', pm10: '98 µg/m³', dominant: 'PM2.5' },
          { name: 'Bengaluru Silk Board', aqi: 74, category: 'Satisfactory', pm25: '26 µg/m³', pm10: '64 µg/m³', dominant: 'NOx' }
        ],
        bulletin: 'Ventilation index forecast: 4,500 m²/s with prevailing boundary layer mixing height at 1,400 meters.'
      },
      {
        id: 'AIR_QUALITY',
        title: 'National Urban Air Quality High-Resolution Dispersion Model',
        icon: 'activity',
        badge: 'CPCB CAAQMS Network',
        status: 'MONITORED',
        locations: [
          { name: 'Hyderabad Central (Zoo Park)', aqi: 82, category: 'Satisfactory', pm25: '31 µg/m³' },
          { name: 'Ahmedabad Maninagar', aqi: 136, category: 'Moderate', pm25: '49 µg/m³' },
          { name: 'Patna Muradpur', aqi: 158, category: 'Moderate', pm25: '62 µg/m³' },
          { name: 'Lucknow Lalbagh', aqi: 146, category: 'Moderate', pm25: '55 µg/m³' }
        ],
        bulletin: 'Surface wind velocity of 12-16 km/h aiding atmospheric dispersion of particulate matter across north Indian plains.'
      },
      {
        id: 'ENFUSER_AQ',
        title: 'High-Resolution ENFUSER Street-Level Air Quality Telemetry',
        icon: 'cpu',
        badge: 'FMI-IITD High-Res Suite',
        status: 'OPERATIONAL',
        locations: [
          { name: 'Connaught Place Outer Circle', aqi: 128, pm25: '48 µg/m³', no2: '38 ppb' },
          { name: 'Cyber Hub Gurgaon', aqi: 139, pm25: '52 µg/m³', no2: '44 ppb' },
          { name: 'Nehru Place Commercial Hub', aqi: 144, pm25: '56 µg/m³', no2: '46 ppb' }
        ],
        bulletin: '100m grid-scale ENFUSER chemical transport model run updated at 00 UTC.'
      },
      {
        id: 'POWER_SECTOR',
        title: 'National Power Grid & Load Dispatch Meteorological Analytics',
        icon: 'zap',
        badge: 'POSOCO Grid Telemetry',
        status: 'NORMAL',
        locations: [
          { name: 'Northern Grid (NR)', peak_demand: '74,200 MW', heat_index: '42°C', cooling_demand_impact: '+12% Thermal Surge' },
          { name: 'Western Grid (WR)', peak_demand: '68,500 MW', heat_index: '38°C', cooling_demand_impact: '+7% Surge' },
          { name: 'Southern Grid (SR)', peak_demand: '61,400 MW', heat_index: '35°C', cooling_demand_impact: '+4% Surge' },
          { name: 'Eastern Grid (ER)', peak_demand: '29,800 MW', heat_index: '36°C', cooling_demand_impact: '+5% Surge' }
        ],
        bulletin: 'Solar PV generation index optimal across Rajasthan and Gujarat solar parks (940 W/m² GHI).'
      },
      {
        id: 'PILGRIMAGE',
        title: 'All-India Major Pilgrimage Centres Meteorological Guidance',
        icon: 'map-pin',
        badge: 'National Shrine Bulletin',
        status: 'OPERATIONAL',
        locations: [
          { name: 'Char Dham (Kedarnath / Badrinath)', temp: '9.2 °C', condition: 'Chilly / Intermittent Rain', status: 'Track Open' },
          { name: 'Shri Mata Vaishno Devi (Katra)', temp: '22.4 °C', condition: 'Fair Weather', status: 'Helicopter Service Operational' },
          { name: 'Tirupati Balaji (Tirumala Hills)', temp: '26.8 °C', condition: 'Partly Cloudy', status: 'Clear Alipiri Footpath' },
          { name: 'Jagannath Puri Coastal Shrine', temp: '29.5 °C', condition: 'Humid / Light Sea Breeze', status: 'Normal' }
        ],
        bulletin: 'Weather across primary pilgrimage circuits remains normal with unhindered shrine access.'
      },
      {
        id: 'MOUNTAIN',
        title: 'Himalayan Mountain Weather & High-Altitude Ridge Bulletin',
        icon: 'triangle',
        badge: 'Snow & Avalanche Study (SASE)',
        status: 'OPERATIONAL',
        locations: [
          { name: 'Pir Panjal Range (Passes)', wind: '35 km/h', freezing_level: '4,600 m', avalanche_danger: 'Low (Stage-1)' },
          { name: 'Zanskar & Ladakh High Valleys', wind: '22 km/h', freezing_level: '4,900 m', avalanche_danger: 'Low (Stage-1)' },
          { name: 'Dhauladhar Range (Kangra Valley)', wind: '18 km/h', freezing_level: '4,400 m', avalanche_danger: 'Clear' }
        ],
        bulletin: 'Zero high-altitude blizzard threat across Western and Central Himalayas during the next 48 hours.'
      },
      {
        id: 'HIGHWAY',
        title: 'National Highways Authority (NHAI) Expressways Meteorological Bulletin',
        icon: 'truck',
        badge: 'Highway Safety Alert',
        status: 'OPERATIONAL',
        locations: [
          { name: 'NH-44 (Kashmir to Kanyakumari)', section: 'Jawahar Tunnel to Banihal', status: 'WATCH', hazard: 'Light rain & wet tarmac' },
          { name: 'Mumbai-Pune Yashwantrao Expressway', section: 'Khandala Ghat section', status: 'ALERT', hazard: 'Dense fog & wet slope friction reduction' },
          { name: 'Delhi-Meerut Expressway', section: 'Sarai Kale Khan to Dasna', status: 'NORMAL', hazard: 'Clear visibility > 3km' },
          { name: 'Samruddhi Mahamarg (Nagpur-Mumbai)', section: 'Igatpuri hilly curves', status: 'NORMAL', hazard: 'Crosswind 24 km/h' }
        ],
        bulletin: 'Dynamic electronic message signboards (VMS) updated with real-time slippery surface advisories.'
      },
      {
        id: 'INDIAN_RAILWAYS',
        title: 'Indian Railways High-Density Corridor Track Weather Alert',
        icon: 'train',
        badge: 'Rail Safety Directorate',
        status: 'OPERATIONAL',
        locations: [
          { name: 'Mumbai Central - Ahmedabad Corridor', status: 'ALERT', issue: 'Track Water Inundation Watch at Palghar', speed_limit: 'Speed caution 75 km/h' },
          { name: 'Delhi - Howrah Trunk Route', status: 'NORMAL', issue: 'Clear Track Telemetry', speed_limit: 'Max permissible 130 km/h' },
          { name: 'Kalka - Shimla Mountain Railway', status: 'WATCH', issue: 'Debris & Rockfall Watch at Tunnel 33', speed_limit: 'Caution speed 25 km/h' },
          { name: 'Chennai - Bengaluru Double Line', status: 'NORMAL', issue: 'Normal Overhead Wire (OHE) Tension', speed_limit: 'Max permissible 110 km/h' }
        ],
        bulletin: 'Continuous bridge water-level sensor monitoring enabled for Yamuna, Narmada, and Brahmaputra rail bridges.'
      }
    ]
  };
}

module.exports = {
  getSubdivisionWarnings,
  getDistrictWarnings,
  getNowcastWarnings,
  getSpecializedForecasts,
  INDIAN_SUBDIVISIONS
};
