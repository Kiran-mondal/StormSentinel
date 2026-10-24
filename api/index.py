import os
import sys
import re
import time
from flask import Flask, jsonify, request

# Vercel-কে বলে দেওয়া হচ্ছে যেন সে 'api' ফোল্ডারের ভেতরের ফাইলগুলোকেও চিনে নেয়
sys.path.append(os.path.dirname(__file__))

from sensor_simulator import get_real_storm_data

app = Flask(__name__)

# মেমোরি স্টোরেজ (লিমিটেড)
data_log = []
user_corrections = {}
rate_limit_store = {}

# --- সিকিউরিটি কনফিগারেশন ---
MAX_CORRECTIONS_CACHE = 50
RATE_LIMIT_WINDOW = 60  # ৬০ সেকেন্ড
MAX_REQUESTS_PER_WINDOW = 30  # প্রতি মিনিটে সর্বোচ্চ ৩০টি রিকোয়েস্ট

def sanitize_string(text, max_len=40):
    if not text:
        return ""
    # XSS এবং ইনজেকশন প্রতিরোধে ক্ষতিকর ক্যারেক্টার রিমুভ করা
    cleaned = re.sub(r'[<>"\';()&]', '', str(text))
    return cleaned.strip()[:max_len]

def is_rate_limited(client_ip):
    now = time.time()
    # পুরোনো আইপি রেকর্ড পরিষ্কার করা (Memory leak রোধে)
    if len(rate_limit_store) > 500:
        rate_limit_store.clear()
        
    records = rate_limit_store.get(client_ip, [])
    records = [t for t in records if now - t < RATE_LIMIT_WINDOW]
    
    if len(records) >= MAX_REQUESTS_PER_WINDOW:
        rate_limit_store[client_ip] = records
        return True
        
    records.append(now)
    rate_limit_store[client_ip] = records
    return False

@app.after_request
def add_security_headers(response):
    # ব্রাউজার সিকিউরিটি হেডার যুক্ত করা
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

@app.route("/override", methods=["POST"])
def override_data():
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if is_rate_limited(client_ip):
        return jsonify({"error": "Too many requests. Please try again later."}), 429

    # ১. Admin Secret Key যাচাই করা (যদি Vercel Environment Variable-এ সেট করা থাকে)
    expected_admin_key = os.environ.get("ADMIN_SECRET_KEY")
    provided_key = request.headers.get("X-Admin-Key", "")
    
    if expected_admin_key and provided_key != expected_admin_key:
        return jsonify({"error": "Unauthorized: Invalid Admin Key"}), 403

    # ২. JSON Payload নিরাপদভাবে গ্রহণ করা
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON payload"}), 400

    location = sanitize_string(data.get("location"), max_len=50)
    if not location:
        return jsonify({"error": "Valid location is required"}), 400

    # ৩. মেমোরি ওভারফ্লো (DoS) রোধ করা
    if len(user_corrections) >= MAX_CORRECTIONS_CACHE and location not in user_corrections:
        oldest_key = next(iter(user_corrections))
        del user_corrections[oldest_key]

    if location not in user_corrections:
        user_corrections[location] = {}

    # ৪. ইনপুট ভ্যালিডেশন ও রেঞ্জ চেকিং
    if "status" in data and data["status"]:
        clean_status = sanitize_string(data["status"], max_len=25)
        if clean_status:
            user_corrections[location]["status"] = clean_status

    if "temp" in data and data["temp"] != "":
        try:
            temp_val = float(data["temp"])
            if -90.0 <= temp_val <= 65.0:
                user_corrections[location]["temp"] = round(temp_val, 1)
            else:
                return jsonify({"error": "Temperature out of realistic bounds (-90 to 65)"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid temperature value"}), 400

    if "rain_chance" in data and data["rain_chance"] != "":
        try:
            rain_val = float(data["rain_chance"])
            if 0.0 <= rain_val <= 100.0:
                user_corrections[location]["rain_chance"] = round(rain_val, 1)
            else:
                return jsonify({"error": "Rain chance must be between 0 and 100"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid rain chance value"}), 400

    return jsonify({"success": True})

@app.route("/data", methods=["GET"])
def get_data():
    global data_log
    
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if is_rate_limited(client_ip):
        return jsonify({"error": "Rate limit exceeded"}), 429

    city = sanitize_string(request.args.get('city'), max_len=50)
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    # কোঅর্ডিনেট ভ্যালিডেশন
    try:
        lat = float(lat) if lat is not None and lat != "" else None
        lon = float(lon) if lon is not None and lon != "" else None
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid coordinates"}), 400

    live_data = get_real_storm_data(city=city, lat=lat, lon=lon)
    
    if "error" in live_data:
        return jsonify({"error": live_data["error"]}), 404
        
    loc = live_data.get("location", "Unknown")
    if loc in user_corrections:
        override = user_corrections[loc]
        if "status" in override: 
            live_data["status"] = f"{override['status']} (Verified)"
        if "temp" in override: 
            live_data["temperature"] = override["temp"]
        if "rain_chance" in override: 
            live_data["rain_chance"] = override["rain_chance"]
    
    timestamp = time.time()
    data_log.append((timestamp, live_data.get("chart_val", 0)))
    if len(data_log) > 30:
        data_log.pop(0)

    labels = [point[0] for point in data_log]
    values = [point[1] for point in data_log]
    
    # API Response Filtering: শুধুমাত্র ক্লায়েন্টের প্রয়োজনীয় এবং নিরাপদ ডেটা রিটার্ন করা হচ্ছে
    return jsonify({
        "labels": labels,
        "values": values,
        "location": loc,
        "timezone": live_data.get("timezone", "UTC"),
        "timezone_abbr": live_data.get("timezone_abbr", "UTC"),
        "risk": live_data.get("risk", "LOW"),
        "status": live_data.get("status", "Clear"),
        "temp": live_data.get("temperature", 0),
        "wind": live_data.get("wind", 0),
        "humidity": live_data.get("humidity", 0),
        "pressure": live_data.get("pressure", 0),
        "cape": live_data.get("cape", 0),
        "rain_chance": live_data.get("rain_chance", 0),
        "lat": live_data.get("lat", lat),
        "lon": live_data.get("lon", lon)
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    # SECURITY FIX: প্রোডাকশনে debug=False রাখা বাধ্যতামূলক যাতে স্ট্যাক ট্রেস বা এনভায়রনমেন্ট ভেরিয়েবল লিক না হয়
    app.run(host='0.0.0.0', port=port, debug=False)
        
