import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- আইকনিক শহরের ছবির ডেটাবেস ---
const cityLandmarks = {
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=300&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=300&q=80",
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80",
  "tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80",
  "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80",
  "mumbai": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=300&q=80",
  "default": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=300&q=80"
};

// --- কাস্টম শেডার বায়ুমণ্ডল ---
const Atmosphere = () => {
  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
      gl_FragColor = vec4(0.18, 0.58, 1.0, 1.0) * intensity;
    }
  `;
  return (
    <mesh>
      <sphereGeometry args={[1.18, 64, 64]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent={true} depthWrite={false} />
    </mesh>
  );
};

// --- থ্রিডি পৃথিবী ও AR পপ-আপ ---
const Earth = ({ weatherData }) => {
  const earthRef = useRef();
  const [colorMap, bumpMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  ]);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0010;
  });

  const get3DPosition = (lat, lon, radius = 1.05) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return [
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ];
  };

  // শহরের নাম অনুযায়ী ছবি খোঁজা
  let bgUrl = cityLandmarks["default"];
  if (weatherData && weatherData.location) {
    const locName = weatherData.location.toLowerCase();
    for (let key in cityLandmarks) {
      if (locName.includes(key)) {
        bgUrl = cityLandmarks[key];
        break;
      }
    }
  }

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={colorMap} bumpMap={bumpMap} bumpScale={0.015} roughness={0.7} metalness={0.05} />
      </mesh>
      <Atmosphere />
      
      {/* AR পপ-আপ (তীর চিহ্ন ও আইকনিক ব্যাকগ্রাউন্ডসহ) */}
      {weatherData && weatherData.lat && weatherData.lon && (
        <Html position={get3DPosition(weatherData.lat, weatherData.lon)} center>
          <div className="pointer-events-none transform -translate-y-12">
            <div className="relative w-36 h-16 rounded-xl border border-cyan-400/50 shadow-[0_0_15px_rgba(76,215,246,0.4)] overflow-hidden flex flex-col justify-center text-center">
              
              {/* আইকনিক ব্যাকগ্রাউন্ড ছবি */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-screen transition-all duration-500"
                style={{ backgroundImage: `url('${bgUrl}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f131d]/90 to-transparent"></div>
              
              {/* লেবেলের টেক্সট */}
              <div className="relative z-10">
                <p className="text-white font-bold text-sm drop-shadow-md truncate px-1">{weatherData.location}</p>
                <p className="text-cyan-400 text-[10px] font-semibold drop-shadow-md mt-0.5">{weatherData.temp}°C • {weatherData.status}</p>
              </div>
            </div>
            {/* নিচের দিকে পয়েন্ট করা তীর চিহ্ন (Arrow) */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400/60 mx-auto"></div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default function App() {
  const [searchCity, setSearchCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (city = 'Kolkata') => {
    setLoading(true);
    try {
      const res = await fetch(`/data?city=${city}`);
      const data = await res.json();
      if (!data.error) setWeatherData(data);
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => fetchWeather(searchCity || 'Kolkata'), 15000);
    return () => clearInterval(interval);
  }, [searchCity]);

  return (
    <div className="w-full h-screen bg-[#0f131d] relative font-sans overflow-hidden text-slate-200">
      
      {/* UI ওভারলে - Header (মোবাইলেও ঠিকঠাক দেখাবে) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center pointer-events-auto">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-lg w-full md:w-auto">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 border border-cyan-400/30 rounded-xl flex items-center justify-center text-lg md:text-xl shadow-[0_0_15px_rgba(76,215,246,0.2)]">⚡</div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">StormSentinel</h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-cyan-400">Live Intelligence</p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search city..." 
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-cyan-400/50 text-sm w-full md:w-64 backdrop-blur-md"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(searchCity)}
          />
          <button 
            onClick={() => fetchWeather(searchCity)}
            className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-4 py-2.5 rounded-xl hover:bg-cyan-400/20 transition text-sm font-medium shrink-0"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* UI ওভারলে - Data Panel (মোবাইলে নিচে থাকবে, পিসিতে বামে) */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-auto md:top-28 md:w-72 z-10 pointer-events-auto max-h-[40vh] md:max-h-none overflow-y-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-white text-sm md:text-base">Local Metrics</h2>
            <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>LIVE</span>
          </div>

          {weatherData ? (
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Location</p>
                  <p className="text-white font-bold mt-0.5 text-base truncate">{weatherData.location}</p>
                </div>
                <p className="text-white font-semibold text-xl">{weatherData.temp}°C</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Wind</p>
                  <p className="text-white text-sm mt-1">{weatherData.wind} km/h</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Risk</p>
                  <p className={`font-semibold text-sm mt-1 ${weatherData.risk === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {weatherData.risk}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 animate-pulse">Awaiting telemetry...</p>
          )}
        </div>
      </div>

      {/* থ্রিডি ক্যানভাস */}
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 3, 4]} intensity={2.0} />
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
        <Earth weatherData={weatherData} />
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.05} minDistance={1.5} maxDistance={4} />
      </Canvas>
    </div>
  );
                              }
    
