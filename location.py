import subprocess
import json
import requests
import platform
import os

CACHE_FILE = "data/last_location.txt"
last_location = "Unknown"

def cache_location(location):
    try:
        with open(CACHE_FILE, "w") as f:
            f.write(location)
    except:
        pass

def load_cached_location():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return f.read().strip()
    return "Unknown"

def get_location():
    global last_location
    system = platform.system()

    # --- 1. Try Termux GPS (Android only) ---
    if system == "Linux":
        try:
            output = subprocess.check_output(["termux-location", "--provider", "gps", "--request", "once"], stderr=subprocess.DEVNULL)
            data = json.loads(output)
            lat = round(data["latitude"], 5)
            lon = round(data["longitude"], 5)
            location = f"GPS ({lat},{lon})"
            cache_location(location)
            return location
        except:
            pass

    # --- 2. Try IP-based geolocation ---
    try:
        res = requests.get("https://ipinfo.io/json", timeout=3)
        data = res.json()
        city = data.get("city", "").strip()
        region = data.get("region", "").strip()

        if city and region:
            location = f"{city}, {region}"
            cache_location(location)
            return location
    except:
        pass

    # --- 3. Manual fallback: Ask for city and region only ---
    print("⚠️ Unable to auto-detect location.")
    city = input("📍 Enter your city: ").strip()
    region = input("🗺️ Enter your state/region: ").strip()
    location = f"{city}, {region}"
    cache_location(location)
    return location
