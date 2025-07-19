
# ⚡ LightningAlert

A cross-platform lightning hazard detection & alerting tool (Python). Works on Windows, Linux, Termux – no extra hardware required.

## Features

- Simulates frequency-based lightning detection
- Logs lightning activity with timestamp and location
- Sends desktop notifications (Windows/Linux)
- Detects region-based risk severity
- IP-based geolocation support

## Run Instructions

```bash
git clone https://github.com/yourname/LightningAlert.git
cd LightningAlert
pip install -r requirements.txt
python3 lightning_alert.py
```

## Customize

- Replace `get_frequency()` to use real sensors.
- Modify `risk_zone.py` for your regional risk logic.
- Enable email, Telegram, or Google Maps links in alerts.

## Coming Soon (optional upgrades)

- 🌐 Google Maps link in alert
- 📤 Telegram/Email alert integration
- 📊 JSON/CSV export of frequency log
- 🖥️ GUI via Tkinter or Flask Web

> Note: Works offline after fetching location once.
