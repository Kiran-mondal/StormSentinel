import requests

def get_location():
    try:
        res = requests.get("https://ipinfo.io/json")
        data = res.json()
        city = data.get("city", "Unknown")
        region = data.get("region", "")
        loc = data.get("loc", "")  # Latitude,Longitude
        return f"{city}, {region} ({loc})"
    except:
        return "Location unknown"
