from flask import Flask, render_template, jsonify, request
import os
import time
from sensor_simulator import get_real_storm_data

app = Flask(__name__)
data_log = [] 
user_corrections = {} 

@app.route("/")
def index():
    return render_template("dashboard.html")

@app.route("/override", methods=["POST"])
def override_data():
    data = request.json
    location = data.get("location")
    if location:
        if location not in user_corrections:
            user_corrections[location] = {}
        if data.get("status"): user_corrections[location]["status"] = data["status"]
        if data.get("temp"): user_corrections[location]["temp"] = data["temp"]
        if data.get("rain_chance"): user_corrections[location]["rain_chance"] = data["rain_chance"]
    return jsonify({"success": True})

@app.route("/data")
def get_data():
    global data_log
    
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    live_data = get_real_storm_data(city=city, lat=lat, lon=lon)
    
    if "error" in live_data:
        return jsonify({"error": live_data["error"]})
        
    loc = live_data["location"]
    if loc in user_corrections:
        override = user_corrections[loc]
        if "status" in override: live_data["status"] = override["status"] + " (User Corrected)"
        if "temp" in override: live_data["temperature"] = override["temp"]
        if "rain_chance" in override: live_data["rain_chance"] = override["rain_chance"]
    
    timestamp = time.time()
    data_log.append((timestamp, live_data["chart_val"]))
    if len(data_log) > 30:
        data_log.pop(0)

    labels = [point[0] for point in data_log]
    values = [point[1] for point in data_log]
    
    return jsonify({
        "labels": labels,
        "values": values,
        "location": live_data["location"],
        "timezone": live_data["timezone"],
        "timezone_abbr": live_data["timezone_abbr"],
        "risk": live_data["risk"],
        "status": live_data["status"],
        "temp": live_data["temperature"],
        "wind": live_data["wind"],
        "humidity": live_data["humidity"],
        "pressure": live_data["pressure"],
        "cape": live_data["cape"],
        "rain_chance": live_data["rain_chance"]
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
    
