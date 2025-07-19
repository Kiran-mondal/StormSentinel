from flask import Flask, render_template, jsonify
import threading
import time
from sensor_simulator import get_frequency
from location import get_location
from risk_zone import get_risk_level
from utils import log_event

app = Flask(__name__)
data_log = []  # Store tuples: (timestamp, frequency)
latest_info = {"location": "Unknown", "risk": "Unknown", "freq": 0}

def monitor():
    while True:
        freq = get_frequency()
        location = get_location()
        region = location.split(",")[1].strip() if "," in location else "Unknown"
        risk = get_risk_level(region, freq)
        log_event(freq, location)

        # Limit to last 30 points
        if len(data_log) >= 30:
            data_log.pop(0)
        timestamp = time.strftime("%H:%M:%S")
        data_log.append((timestamp, freq))

        latest_info["location"] = location
        latest_info["risk"] = risk
        latest_info["freq"] = freq

        time.sleep(1)

@app.route("/")
def index():
    return render_template("dashboard.html")

@app.route("/data")
def get_data():
    labels = [point[0] for point in data_log]
    values = [point[1] for point in data_log]
    return jsonify({
        "labels": labels,
        "values": values,
        "location": latest_info["location"],
        "risk": latest_info["risk"],
        "freq": latest_info["freq"]
    })

if __name__ == "__main__":
    threading.Thread(target=monitor, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
