import requests
import time

# ⚡ Bolt Optimization: In-memory TTL cache to prevent rate limiting and reduce latency.
# The frontend polls every 5 seconds, but external API weather data changes slowly.
_weather_cache = {}
CACHE_TTL = 60  # Cache duration in seconds
MAX_CACHE_SIZE = 100 # Prevent unbounded memory growth

def get_real_storm_data(city=None, lat=None, lon=None):
    cache_key = f"{city}_{lat}_{lon}"
    current_time = time.time()

    if cache_key in _weather_cache:
        cached_data, timestamp = _weather_cache[cache_key]
        if current_time - timestamp < CACHE_TTL:
            return cached_data.copy()

    try:
        location_name = "Unknown"
        
        if city:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
            geo_res = requests.get(geo_url, timeout=5).json()
            if "results" in geo_res and len(geo_res["results"]) > 0:
                lat = geo_res["results"][0]["latitude"]
                lon = geo_res["results"][0]["longitude"]
                location_name = geo_res["results"][0]["name"]
            else:
                return {"error": "City not found"}
        elif lat and lon:
            location_name = "Precise GPS Location"
        else:
            loc_res = requests.get("http://ip-api.com/json/", timeout=5).json()
            lat = loc_res.get("lat", 20.59)
            lon = loc_res.get("lon", 78.96)
            location_name = loc_res.get("city", "Unknown")

        # Added relative_humidity_2m, surface_pressure, and cape
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,weather_code,wind_speed_10m&hourly=precipitation_probability,cape&forecast_hours=1&timezone=auto"
        weather_res = requests.get(url, timeout=5).json()
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
            
        result = {
            "location": location_name,
            "timezone": tz_name,
            "timezone_abbr": tz_abbr,
            "temperature": current.get("temperature_2m", 0),
            "wind": current.get("wind_speed_10m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "pressure": current.get("surface_pressure", 0),
            "cape": cape_val,
            "rain_chance": rain_chance,
            "status": storm_status,
            "risk": risk_level,
            "chart_val": chart_val
        }

        # Enforce max cache size by removing oldest entry
        if len(_weather_cache) >= MAX_CACHE_SIZE:
            oldest_key = min(_weather_cache.keys(), key=lambda k: _weather_cache[k][1])
            del _weather_cache[oldest_key]

        _weather_cache[cache_key] = (result, current_time)
        return result.copy()
    except Exception as e:
        return {
            "location": "Offline/Error", 
            "timezone": "UTC",
            "timezone_abbr": "UTC",
            "temperature": 0, 
            "wind": 0, 
            "humidity": 0,
            "pressure": 0,
            "cape": 0,
            "rain_chance": 0,
            "status": "API Error", 
            "risk": "UNKNOWN", 
            "chart_val": 0
        }
        
