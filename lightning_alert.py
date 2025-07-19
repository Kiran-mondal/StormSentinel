import time
from sensor_simulator import get_frequency
from notifier import send_alert
from utils import log_event
from location import get_location
from risk_zone import get_risk_level

print("🔧 LightningAlert Running... (Press Ctrl+C to stop)")

location = get_location()
region = location.split(",")[1].strip() if "," in location else "Unknown"
print(f"📍 Your location: {location}")

try:
    while True:
        freq = get_frequency()
        risk = get_risk_level(region, freq)
        log_event(freq, location)

        if "Risk" in risk and "Low" not in risk:
            alert_msg = f"{risk}\n⚠️ Lightning Alert at {location}\nFrequency: {freq} Hz"
            send_alert(alert_msg)
        else:
            print(f"{risk} | Frequency: {freq} Hz")

        time.sleep(5)
except KeyboardInterrupt:
    print("\n🛑 Stopped by user.")
