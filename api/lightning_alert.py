import time
from sensor_simulator import get_frequency
from notifier import send_alert
from utils import log_event
from location import get_location
from risk_zone import get_risk_level

print("🔧 StormSentinel Running... (Press Ctrl+C to stop)")

last_alert_level = "Low Risk"

try:
    while True:
        freq = get_frequency()
        location = get_location()
        region = location.split(",")[1].strip() if "," in location else "Unknown"
        risk = get_risk_level(region, freq)
        log_event(freq, location)

        # Show status
        print(f"{risk} | Frequency: {freq} Hz")

        # Send alert only if risk increased and not already alerted
        if "Risk" in risk and "Low" not in risk and risk != last_alert_level:
            alert_msg = f"{risk}\n⚠️ Lightning Alert at {location}\nFrequency: {freq} Hz"
            send_alert(alert_msg)
            last_alert_level = risk

        # Reset alert when risk drops to Low
        elif "Low" in risk:
            last_alert_level = "Low Risk"

        time.sleep(1)  # faster monitoring
except KeyboardInterrupt:
    print("\n🛑 Stopped by user.")
