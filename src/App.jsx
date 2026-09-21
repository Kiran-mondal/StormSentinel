import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

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
    if (earthRef.current) earthRef.current.rotation.y += 0.0010; // ধীরে ঘুরবে
  });

  // অক্ষাংশ ও দ্রাঘিমাংশকে থ্রিডি পজিশনে রূপান্তর
  const get3DPosition = (lat, lon, radius = 1.05) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return [
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ];
  };

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={colorMap} bumpMap={bumpMap} bumpScale={0.015} roughness={0.7} metalness={0.05} />
      </mesh>
      <Atmosphere />
      
      {/* AR পপ-আপ (যদি ডেটা থাকে) */}
      {weatherData && weatherData.lat && weatherData.lon && (
        <Html position={get3DPosition(weatherData.lat, weatherData.lon)} center>
          <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 p-2 rounded-xl text-center shadow-[0_0_15px_rgba(76,215,246,0.3)] pointer-events-none transform -translate-y-10 w-32">
            <p className="text-white font-bold text-sm truncate">{weatherData.location}</p>
            <p className="text-cyan-400 text-xs font-semibold">{weatherData.temp}°C • {weatherData.status}</p>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400/40 mx-auto absolute -bottom-2 left-1/2 -translate-x-1/2"></div>
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
    fetchWeather(); // শুরুতে একবার ডেটা আনবে
    const interval = setInterval(() => fetchWeather(searchCity || 'Kolkata'), 15000); // ১৫ সেকেন্ড পর পর লাইভ আপডেট
    return () => clearInterval(interval);
  }, [searchCity]);

  return (
    <div className="w-full h-screen bg-[#0f131d] relative font-sans overflow-hidden text-slate-200">
      
      {/* UI ওভারলে - Header */}
      <div className="absolute top-5 left-5 right-5 z-10 flex flex-col md:flex-row gap-4 justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-lg">
          <div className="w-10 h-10 bg-cyan-400/10 border border-cyan-400/30 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(76,215,246,0.2)]">⚡</div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">StormSentinel</h1>
            <p className="text-[10px] uppercase tracking-widest text-cyan-400">Live Intelligence</p>
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
            className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-5 py-2.5 rounded-xl hover:bg-cyan-400/20 transition text-sm font-medium"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* UI ওভারলে - Sidebar Panel */}
      <div className="absolute top-28 left-5 z-10 w-72 pointer-events-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Local Metrics</h2>
            <span className="flex items-center gap-1.5 text-[10px] text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>LIVE</span>
          </div>

          {weatherData ? (
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Location</p>
                <p className="text-white font-bold mt-1 text-lg truncate">{weatherData.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Temp</p>
                  <p className="text-white font-semibold text-xl mt-1">{weatherData.temp}°C</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Risk</p>
                  <p className={`font-semibold text-sm mt-2 ${weatherData.risk === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {weatherData.risk}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Wind</span><span className="text-white">{weatherData.wind} km/h</span></div>
                <div className="flex justify-between text-sm mt-2"><span className="text-slate-400">Humidity</span><span className="text-white">{weatherData.humidity}%</span></div>
                <div className="flex justify-between text-sm mt-2"><span className="text-slate-400">Status</span><span className="text-cyan-400">{weatherData.status}</span></div>
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
              
