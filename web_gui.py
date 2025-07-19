from flask import Flask, render_template_string
import threading
import time

from sensor_simulator import get_frequency
from location import get_location
from risk_zone import get_risk_level
from utils import log_event

app = Flask(__name__)
latest_data = {"freq": 0, "location": "N/A", "risk": "N/A"}

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <title>⚡ StormSentinel Web</title>
  <meta http-equiv="refresh" content="1">
  <style>
    body { font-family: Arial; padding: 20px; background: #111; color: #0f0; }
    .risk { font-weight: bold; font-size: 24px; }
  </style>
</head>
<body>
  <h2>⚡ StormSentinel Web Monitor</h2>
  <p><b>Frequency:</b> {{ freq }} Hz</p>
  <p><b>Location:</b> {{ location }}</p>
  <p class="risk">Risk Level: {{ risk }}</p>
</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML_TEMPLATE, **latest_data)

def monitor():
    global latest_data
    while True:
        freq = get_frequency()
        location = get_location()
        region = location.split(",")[1].strip() if "," in location else "Unknown"
        risk = get_risk_level(region, freq)
        log_event(freq, location)

        latest_data["freq"] = freq
        latest_data["location"] = location
        latest_data["risk"] = risk

        time.sleep(1)

if __name__ == "__main__":
    threading.Thread(target=monitor, daemon=True).start()
    app.run(host="0.0.0.0", port=5000)
