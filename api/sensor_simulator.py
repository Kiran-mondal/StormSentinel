import requests
import re

def sanitize_city(city_name):
    if not city_name:
        return ""
    # শুধু অক্ষর, সংখ্যা, স্পেস, কমা এবং ড্যাশ অনুমোদিত (ইনজেকশন প্রতিরোধে)
    cleaned = re.sub(r'[^a-zA-Z0-9\s,\-\.]', '', str(city_name))
    return cleaned.strip()[:50]

def get_real_storm_data(city=None, lat=None, lon=None):
    try:
        location_name = "Unknown"
        clean_city = sanitize_city(city)
        
        if clean_city:
            geo_url = "https://geocoding-api.open-meteo.com/v1/search"
            # SECURITY FIX: Using params dictionary to prevent URL Parameter Pollution
            geo_res = requests.get(geo_url, params={"name": clean_city, "count": 1}, timeout=5).json()
            if "results" in geo_res and len(geo_res["results"]) > 0:
                lat = float(geo_res["results"][0]["latitude"])
                lon = float(geo_res["results"][0]["longitude"])
                location_name = sanitize_city(geo_res["results"][0]["name"])
            else:
                return {"error": "City not found"}
        elif lat is not None and lon is not None:
            # SECURITY FIX: Ensure lat and lon are valid floats within geographical bounds
            lat = max(-90.0, min(90.0, float(lat)))
            lon = max(-180.0, min(180.0, float(lon)))
            location_name = "Precise GPS Location"
        else:
            # SECURITY FIX: Switched to HTTPS endpoint (ipinfo.io) instead of unencrypted HTTP
            loc_res = requests.get("https://ipinfo.io/json", timeout=5).json()
            loc_coords = loc_res.get("loc", "20.59,78.96").split(",")
            lat = float(loc_coords[0]) if len(loc_coords) == 2 else 20.59
            lon = float(loc_coords[1]) if len(loc_coords) == 2 else 78.96
            location_name = sanitize_city(loc_res.get("city", "Unknown"))

        url = "https://api.open-meteo.com/v1/forecast"
        weather_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,surface_pressure,weather_code,wind_speed_10m",
            "hourly": "precipitation_probability,cape",
            "forecast_hours": 1,
            "timezone": "auto"
        }
        weather_res = requests.get(url, params=weather_params, timeout=5).json()
        current = weather_res.get("current", {})
        hourly = weather_res.get("hourly", {})
        
        tz_name = weather_res.get("timezone", "UTC")
        tz_abbr = weather_res.get("timezone_abbreviation", "UTC")
        
        wmo_code = current.get("weather_code", 0)
        
        if wmo_code in [95, 96, 99]:
            storm_status = "THUNDERSTORM DETECTED ⚡"
            risk_level = "CRITICAL"
            chart_val = 100 
        elif wmo_code >= 50:
            storm_status = "Rain / Heavy Precipitation 🌧️"
            risk_level = "ELEVATED"
            chart_val = 50   
        else:
            storm_status = "Clear / No Storm Activity ☀️"
            risk_level = "LOW"
            chart_val = 10   
            
        rain_chance = hourly.get("precipitation_probability", [0])[0] if "precipitation_probability" in hourly else 0
        cape_val = hourly.get("cape", [0])[0] if "cape" in hourly else 0
            
        return {
            "location": location_name,
            "timezone": tz_name,
            "timezone_abbr": tz_abbr,
            "temperature": current.get("temperature_2m", 0),
            "temp": current.get("temperature_2m", 0),
            "wind": current.get("wind_speed_10m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "pressure": current.get("surface_pressure", 0),
            "cape": cape_val,
            "rain_chance": rain_chance,
            "status": storm_status,
            "risk": risk_level,
            "chart_val": chart_val,
            "lat": lat,
            "lon": lon
        }
    except Exception:
        # SECURITY FIX: Do not expose raw exception details to the client
        return {
            "location": "Offline/Error", 
            "timezone": "UTC",
            "timezone_abbr": "UTC",
            "temperature": 0, 
            "temp": 0,
            "wind": 0, 
            "humidity": 0,
            "pressure": 0,
            "cape": 0,
            "rain_chance": 0,
            "status": "API Error", 
            "risk": "UNKNOWN", 
            "chart_val": 0
    }
