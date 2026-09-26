<div align="center">
  <img src="https://github.com/Kiran-mondal/StormSentinel/blob/main/public/logo.svg" alt="StormSentinel Logo" width="250" height="250">
</div>

# ⚡ StormSentinel

**An Enterprise-Grade 3D Weather Intelligence & Monitoring System.**

StormSentinel has evolved into a next-generation, cross-platform weather tracking dashboard. Built with a powerful hybrid architecture (React.js Frontend + Python/Flask Backend), it provides an interactive 3D globe, real-time telemetry, and smart hazard detection wrapped in a stunning glassmorphism UI. Fully optimized for both Desktop browsers and Telegram Web Apps (Mini Apps).

## 🌟 Key Features

- **Interactive 3D Globe:** Smooth 3D Earth rendering with custom GLSL atmospheric shaders using React Three Fiber.
- **Smart AR Pop-ups:** Dynamic, occlusion-aware floating labels with iconic regional background images that adapt to the selected country/city.
- **Real-Time Telemetry:** Live weather data fetching, including temperature, wind speed, and hazard risk assessments.
- **Auto GPS & Reverse Geocoding:** Automatically detects user location and resolves precise city/region names using BigDataCloud API.
- **Unlimited Pinned Locations:** Save and manage favorite cities seamlessly using local storage functionality.
- **Manual Override System:** A secure 'Correct Data' panel for manual data adjustments and system overrides.
- **Telegram Web App Ready:** Native integration with Telegram's Mini App ecosystem with built-in navigation handling.
- **Serverless Architecture:** Optimized for Vercel deployment with dedicated Python API routes handling backend logic.

## 💻 Technical Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Backend:** Python 3, Flask, Vercel Serverless Functions
- **Deployment:** Vercel (`vercel.json` rewrite rules configured)
- **APIs:** BigDataCloud (Reverse Geocoding), Custom Weather Simulators

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v16 or higher)
- Python (3.8 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Kiran-mondal/StormSentinel.git](https://github.com/Kiran-mondal/StormSentinel.git)
   cd StormSentinel

 * Install Frontend Dependencies:
   npm install

 * Install Backend Dependencies:
   pip install -r requirements.txt

 * Run the Development Server:
   npm run dev

   (Note: To fully test the Python backend locally alongside React, we recommend using the Vercel CLI via vercel dev)

📊 Project Architecture
``` bash
StormSentinel/
   ├── api/                   # Python Flask Backend (Vercel Serverless Functions)
   │   ├── index.py           # Main API Router
   │   ├── sensor_simulator.py # Weather Data Logic
   │   └── ...                # Additional backend modules
   ├── public/                # Static Assets (Logo, Web Manifest)
   ├── src/                   # React Frontend
   │   ├── App.jsx            # Main 3D Canvas and UI Dashboard
   │   └── main.jsx           # React Entry Point
   ├── vercel.json            # Deployment routing configuration
   ├── package.json           # Node dependencies
   └── requirements.txt       # Python dependencies
```
# 🤝 Contributing
Contributions are always welcome! Feel free to:
 * Report bugs and issues
 * Suggest new features
 * Submit pull requests
 * Improve documentation
For major changes, please open an issue first on GitHub Issues to discuss what you would like to change.

# ⚠️ Disclaimer
StormSentinel is an advanced detection and visualization tool designed to complement, not replace, official meteorological warnings. Always follow local weather authorities' guidance during severe weather events.

# Stay safe, stay alert. ⛈️
