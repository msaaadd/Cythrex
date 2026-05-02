import { useEffect, useRef, useState, useMemo } from "react";
import Globe from "react-globe.gl";

export function ThreatMap() {
  const globeRef = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [arcsData, setArcsData] = useState<any[]>([
    {
      startLat: 55.7558,
      startLng: 37.6173, // Moscow
      endLat: 37.7595,
      endLng: -122.4367, // SF
      color: ['#ff0000', '#ff0000']
    },
    {
      startLat: 39.9042,
      startLng: 116.4074, // Beijing
      endLat: 51.5074,
      endLng: -0.1278, // London
      color: ['#ff8800', '#ff8800']
    }
  ]);
  
  const [logs, setLogs] = useState<any[]>([
    { id: 1, source: "Moscow, RU", target: "San Francisco, US", type: "Malware Drop", time: "Just now" },
    { id: 2, source: "Beijing, CN", target: "London, UK", type: "DDoS", time: "1m ago" }
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    // Simulate finding a threat location based on the domain input
    // Generate some random coordinates representing attackers targeting this domain's infrastructure
    const targetLat = Math.random() * 60 - 20;
    const targetLng = Math.random() * 120 - 60;
    
    const newArcs = [];
    const newLogs = [];
    
    // Simulate 3 attacks on the domain
    for (let i = 0; i < 3; i++) {
        const sourceLat = Math.random() * 180 - 90;
        const sourceLng = Math.random() * 360 - 180;
        newArcs.push({
            startLat: sourceLat,
            startLng: sourceLng,
            endLat: targetLat,
            endLng: targetLng,
            color: ['#00ffff', '#ffffff'] // distinct color for searched domain
        });
        
        newLogs.unshift({
            id: Date.now() + i,
            source: `Unknown (${sourceLat.toFixed(1)}, ${sourceLng.toFixed(1)})`,
            target: query,
            type: "Targeted Scan",
            time: "Just now"
        });
    }

    setArcsData(prev => [...prev, ...newArcs]);
    setLogs(prev => [...newLogs, ...prev].slice(0, 10)); // Keep last 10
    
    if (globeRef.current) {
        globeRef.current.pointOfView({ lat: targetLat, lng: targetLng, altitude: 2 }, 1000);
    }
  };

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 1;
    }
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-white mb-2">Live Threat Map</h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">Real-time geographical tracking of active threat indicators</p>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">Status</div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 status-pulse"></span>
                <span className="text-sm font-semibold text-white">Aggregating Global Feeds</span>
            </div>
        </div>
      </div>

      <div className="flex-1 card flex overflow-hidden relative border-[#27272A]">
        <div className="w-[340px] h-full border-r border-[#27272A] flex flex-col bg-[#0A0A0B]/80 backdrop-blur-md z-10">
           <div className="p-6 border-b border-[#27272A]">
             <form onSubmit={handleSearch}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block font-mono">Trace Domain Attacks</label>
                <div className="flex bg-[#161618] border border-[#27272A] rounded-lg overflow-hidden focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
                  <input 
                    type="text" 
                    placeholder="example.com" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none font-mono"
                  />
                  <button type="submit" className="px-4 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors text-[10px] font-mono uppercase tracking-wider">Trace</button>
                </div>
             </form>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 font-mono px-2">Live Attack Log</h2>
             {logs.map(log => (
                 <div key={log.id} className="p-3 bg-[#161618] border border-[#27272A] rounded-lg text-xs font-mono animate-in slide-in-from-left-4 fade-in duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${log.type === 'Targeted Scan' ? 'bg-cyan-900/40 text-cyan-400' : 'bg-red-900/30 text-red-400'}`}>{log.type}</span>
                        <span className="text-zinc-600 text-[10px]">{log.time}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mt-2 text-zinc-300">
                        <div className="truncate text-zinc-400" title={log.source}>{log.source}</div>
                        <div className="text-zinc-600">→</div>
                        <div className="truncate text-white" title={log.target}>{log.target}</div>
                    </div>
                 </div>
             ))}
           </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center bg-[#050505] overflow-hidden">
             <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-10"></div>
             
             <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="#050505"
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={0.2}
                arcDashAnimateTime={1500}
                arcStroke={1}
                width={800}
                height={800}
             />
        </div>
      </div>
    </div>
  );
}
