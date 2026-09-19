from flask import Flask, render_template, jsonify, request
import os
import time
from sensor_simulator import get_real_storm_data

app = Flask(__name__)
data_log = [] 

@app.route("/")
def index():
    return render_template("dashboard.html")

@app.route("/data")
def get_data():
    global data_log
    
    # Read optional location parameters from the web request
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    live_data = get_real_storm_data(city=city, lat=lat, lon=lon)
    
    if "error" in live_data:
        return jsonify({"error": live_data["error"]})
    
    timestamp = time.strftime("%H:%M:%S")
    data_log.append((timestamp, live_data["chart_val"]))
    if len(data_log) > 30:
        data_log.pop(0)

    labels = [point[0] for point in data_log]
    values = [point[1] for point in data_log]
    
    return jsonify({
        "labels": labels,
        "values": values,
        "location": live_data["location"],
        "risk": live_data["risk"],
        "status": live_data["status"],
        "temp": live_data["temperature"],
        "wind": live_data["wind"]
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
    
