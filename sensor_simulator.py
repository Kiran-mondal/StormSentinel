import requests

def get_real_storm_data(city=None, lat=None, lon=None):
    try:
        location_name = "Unknown"
        
        # 1. If city name is provided manually
        if city:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
            geo_res = requests.get(geo_url, timeout=5).json()
            if "results" in geo_res and len(geo_res["results"]) > 0:
                lat = geo_res["results"][0]["latitude"]
                lon = geo_res["results"][0]["longitude"]
                location_name = geo_res["results"][0]["name"]
            else:
                return {"error": "City not found"}
                
        # 2. If precise GPS coordinates are provided
        elif lat and lon:
            location_name = "Precise GPS Location"
            
        # 3. Fallback to IP address location
        else:
            loc_res = requests.get("http://ip-api.com/json/", timeout=5).json()
            lat = loc_res.get("lat", 20.59)
            lon = loc_res.get("lon", 78.96)
            location_name = loc_res.get("city", "Unknown")

        # Fetch weather and ask API to auto-resolve the timezone
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto"
        weather_res = requests.get(url, timeout=5).json()
        current = weather_res.get("current", {})
        
        # Extract timezone information
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
            
        return {
            "location": location_name,
            "timezone": tz_name,
            "timezone_abbr": tz_abbr,
            "temperature": current.get("temperature_2m", 0),
            "wind": current.get("wind_speed_10m", 0),
            "status": storm_status,
            "risk": risk_level,
            "chart_val": chart_val
        }
    except Exception as e:
        return {
            "location": "Offline/Error", 
            "timezone": "UTC",
            "timezone_abbr": "UTC",
            "temperature": 0, 
            "wind": 0, 
            "status": "API Error", 
            "risk": "UNKNOWN", 
            "chart_val": 0
        }
        
