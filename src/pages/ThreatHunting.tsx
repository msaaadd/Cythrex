import { useState } from "react";
import { Search, ShieldAlert, Activity, Database, AlertOctagon, Network } from "lucide-react";
import { getGeminiAI } from "../lib/gemini";
import ReactMarkdown from 'react-markdown';

export function ThreatHunting() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/v1/hunt?ioc=${encodeURIComponent(query)}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch threat intelligence.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing the IOC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-white mb-2">Threat Hunting</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-wider">IOC Lookup & Real-time Intelligence Aggregation</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-11 pr-32 py-4 bg-[#161618] border border-[#27272A] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            placeholder="Search IOC: domain, IP, or file hash..."
          />
          <div className="absolute inset-y-2 right-2">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 h-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md disabled:opacity-50 transition-colors"
            >
              {loading ? "Analyzing..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 font-mono text-sm mb-8">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="flex-1 card overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-[#27272A] flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-mono text-white mb-2">{result.ioc}</h2>
              <div className="flex gap-3">
                <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-[10px] font-mono">{result.type}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-mono ${
                  result.reputation === 'Malicious' ? 'bg-red-900/30 text-red-500' :
                  result.reputation === 'Suspicious' ? 'bg-yellow-900/30 text-yellow-500' :
                  result.reputation === 'Clean' ? 'bg-green-900/30 text-green-500' :
                  'bg-zinc-800 text-zinc-400'
                }`}>{result.reputation}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-black ${result.score > 70 ? 'text-red-500' : 'text-white'}`}>{result.score}</div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1 font-mono">Risk Score</div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 font-mono">Analyst Summary</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{result.summary}</p>
            </div>
            
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 font-mono">Detected Threats</h3>
              {result.detected_threats?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.detected_threats.map((threat: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-mono flex items-center gap-2">
                       <ShieldAlert className="w-3 h-3" />
                       {threat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 font-mono">No specific threats detected.</p>
              )}
            </div>
            
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 font-mono">Related IOCs</h3>
              {result.related_iocs?.length > 0 ? (
                <ul className="space-y-2">
                  {result.related_iocs.map((ioc: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300 font-mono flex items-center gap-2">
                      <Network className="w-4 h-4 text-zinc-500" />
                      {ioc}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 font-mono">No known related infrastructure.</p>
              )}
            </div>

             <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 font-mono">Dark Web & Leaks</h3>
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded flex items-center justify-center ${result.leaked_data_found ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500'}`}>
                    {result.leaked_data_found ? <AlertOctagon className="w-5 h-5"/> : <ShieldAlert className="w-5 h-5" />}
                 </div>
                 <div>
                   <p className="text-sm font-medium text-white">{result.leaked_data_found ? "Exposed Data Found" : "No Leaks Found"}</p>
                   <p className="text-xs text-zinc-500 font-mono">{result.leaked_data_found ? "Matches found in recent breaches" : "Clean across monitored sources"}</p>
                 </div>
              </div>
            </div>

          </div>

          <div className="border-t border-[#27272A] p-6 bg-[#121214]">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
               <Activity className="w-4 h-4 text-cyan-500" />
               Environment Impact Assessment
             </h3>
             <div className="bg-[#1C1C1F] border border-[#27272A] rounded-lg p-4">
                <p className="text-sm text-zinc-300 font-mono mb-4">Did you find this {result.type.toLowerCase()} in your environment?</p>
                <div className="flex gap-4">
                   <button className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded flex-1 text-sm font-mono transition-colors"
                     onClick={() => alert(`REMEDIATION STEPS for ${result.type}:\n\n1. Isolate affected endpoints from the network immediately.\n2. If it's a file, delete or quarantine it if your EDR/AV has not done so already.\n3. If it's a domain/IP, block it at the firewall/proxy level.\n4. Run a full system scan and hunt for lateral movement.\n5. Rotate credentials if any exposure is suspected.`)}>
                     Yes - Show Remediation
                   </button>
                   <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-[#3F3F46] rounded flex-1 text-sm font-mono transition-colors"
                     onClick={() => alert("Marked as not found. Continuing monitoring...")}>
                     No - Dismiss
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
