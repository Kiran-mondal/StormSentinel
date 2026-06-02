# ⚡ StormSentinel

> Your watchtower against lightning threats.

A cross-platform lightning hazard detection & alerting system that monitors weather threats in real-time. Built with Python and Flask, StormSentinel provides intelligent lightning detection, risk assessment, and multi-channel alerts to keep you safe during severe weather events.

## 🌟 Features

- **Real-time Lightning Detection** - Simulates frequency-based lightning detection with customizable sensors
- **Smart Risk Assessment** - Region-based risk severity detection with intelligent algorithms
- **Desktop Notifications** - Instant alerts on Windows and Linux systems
- **Geolocation Support** - IP-based location detection for personalized alerts
- **Web GUI** - Modern Flask-based web interface for monitoring and configuration
- **Activity Logging** - Comprehensive logging of lightning events with timestamps and locations
- **Offline Support** - Works offline after initial location fetch
- **Cross-Platform** - Supports Windows, Linux, and Termux environments

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Installation

```bash
git clone https://github.com/Kiran-mondal/StormSentinel.git
cd StormSentinel
pip install -r requirements.txt
```

### Running the Application

```bash
python3 web_gui.py
```

The web interface will be accessible at `http://localhost:5000` (or the configured port).

## 📋 Requirements

All dependencies are listed in `requirements.txt`:

```
flask          # Web framework
requests       # HTTP client for geolocation
```

Install them with:
```bash
pip install -r requirements.txt
```

## 🔧 Customization

### Using Real Sensors
Replace the `get_frequency()` function in the core module with actual sensor data:

```python
def get_frequency():
    # Connect to your lightning detection hardware
    # Return frequency value from sensor
    pass
```

### Regional Risk Logic
Modify `risk_zone.py` to implement your region-specific risk assessment:

```python
# Customize risk levels based on your geography
# Adjust sensitivity thresholds and alert criteria
```

### Alert Channels
Enable additional notification methods:
- 📧 Email alerts
- 💬 Telegram bot integration
- 🗺️ Google Maps links in alerts

## 📊 Project Structure

```
StormSentinel/
├── web_gui.py           # Flask web interface
├── risk_zone.py         # Risk assessment logic
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🎯 Roadmap

### Coming Soon
- 🌐 **Google Maps Integration** - Maps link with detected lightning location
- 📤 **Multi-Channel Alerts** - Telegram and Email notifications
- 📊 **Data Export** - JSON/CSV export of frequency logs
- 📈 **Analytics Dashboard** - Historical data visualization
- 🔔 **Smart Notifications** - Customizable alert thresholds

## 💻 Technical Stack

- **Backend**: Python 3
- **Frontend**: HTML5, Flask
- **APIs**: Geolocation (IP-based)
- **Notifications**: Desktop notifications (native OS integration)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 Notes

- The application works **offline** after fetching location data once
- Lightning detection frequency can be tuned for different environments
- Desktop notifications require appropriate system permissions

## ⚠️ Disclaimer

StormSentinel is a detection and alerting tool designed to complement, not replace, official weather warnings and professional lightning detection systems. Always follow local weather authorities' guidance during severe weather events.

## 📧 Contact & Support

For issues, questions, or suggestions, please open an issue on [GitHub Issues](https://github.com/Kiran-mondal/StormSentinel/issues).

## 📄 License

This project is provided as-is. Please check the repository for license details.

---

**Stay safe, stay alert.** ⛈️
