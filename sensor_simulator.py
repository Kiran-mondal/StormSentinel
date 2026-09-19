import requests

def get_real_storm_data():
    try:
        # 1. Fetch geographic coordinates based on IP
        loc_res = requests.get("http://ip-api.com/json/", timeout=5).json()
        lat = loc_res.get("lat", 20.59)
        lon = loc_res.get("lon", 78.96)
        city = loc_res.get("city", "Unknown")
        
        # 2. Fetch live weather and storm data from Open-Meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m"
        weather_res = requests.get(url, timeout=5).json()
        current = weather_res.get("current", {})
        
        # 3. Map WMO weather codes to storm risk levels
        wmo_code = current.get("weather_code", 0)
        
        if wmo_code in [95, 96, 99]:
            storm_status = "THUNDERSTORM DETECTED ⚡"
            risk_level = "CRITICAL"
            chart_val = 100  # High chart spike for lightning
        elif wmo_code >= 50:
            storm_status = "Rain / Heavy Precipitation 🌧️"
            risk_level = "ELEVATED"
            chart_val = 50   # Medium chart activity
        else:
            storm_status = "Clear / No Storm Activity ☀️"
            risk_level = "LOW"
            chart_val = 10   # Low baseline chart activity
            
        return {
            "location": city,
            "temperature": current.get("temperature_2m", 0),
            "wind": current.get("wind_speed_10m", 0),
            "status": storm_status,
            "risk": risk_level,
            "chart_val": chart_val
        }
    except Exception as e:
        # Fallback if APIs fail or timeout
        return {
            "location": "Offline", 
            "temperature": 0, 
            "wind": 0, 
            "status": "API Error", 
            "risk": "UNKNOWN", 
            "chart_val": 0
        }
        
