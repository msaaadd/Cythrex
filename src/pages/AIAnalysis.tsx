import { useState } from "react";
import { getGeminiAI } from "../lib/gemini";
import { BrainCircuit } from "lucide-react";

export function AIAnalysis() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!report.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = getGeminiAI();
      const prompt = `You are a Threat Intelligence AI assistant. Analyze the following security report text.
      
      Report text: "${report}"
      
      Respond with a JSON object. NO MARKDOWN FORMATTING OR BACKTICKS. JUST RAW JSON.
      Include these exact keys:
      {
        "classification": "Main threat family or classification (e.g. Ransomware, Phishing, APT)",
        "iocs_extracted": {
            "ips": ["list of IPs"],
            "domains": ["list of domains"],
            "hashes": ["list of hashes"]
        },
        "ttps": ["List of MITRE ATT&CK techniques mentioned or implied"],
        "confidence": "High | Medium | Low"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing the report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-white mb-2">AI-Powered Threat Analysis</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-wider">NLP Extraction & Classification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="flex flex-col h-full card overflow-hidden">
          <div className="p-4 border-b border-[#27272A] bg-[#1C1C1F]">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Raw Intel Report</h2>
          </div>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 text-sm text-zinc-300 font-mono focus:outline-none resize-none leading-relaxed placeholder-zinc-600"
            placeholder="Paste raw unstructured threat intelligence report, alert email, or log snippet here..."
          />
          <div className="p-4 border-t border-[#27272A] bg-[#1C1C1F] flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !report.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md disabled:opacity-50 transition-colors"
            >
              <BrainCircuit className="w-4 h-4" />
              {loading ? "Extracting..." : "Analyze Report"}
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full card overflow-hidden">
          <div className="p-4 border-b border-[#27272A] bg-[#1C1C1F]">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Structured Extraction</h2>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 font-mono text-sm mb-4">
                Error: {error}
              </div>
            )}
            {!result && !loading && !error && (
              <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm text-center px-8">
                Results will appear here based on Vertex AI / Gemini NLP models.
              </div>
            )}
            {loading && (
              <div className="h-full flex items-center justify-center">
                 <div className="animate-pulse flex items-center gap-3 text-cyan-500">
                    <BrainCircuit className="w-6 h-6 animate-spin" />
                    <span className="font-mono text-[10px] tracking-widest uppercase">Processing Intel...</span>
                 </div>
              </div>
            )}
            {result && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Classification</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium text-white">{result.classification}</span>
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-[10px] font-mono">{result.confidence} Confidence</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">Extracted IOCs - IPs</h3>
                   {result.iocs_extracted?.ips?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.iocs_extracted.ips.map((ip: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 rounded text-xs font-mono">{ip}</span>
                        ))}
                      </div>
                   ) : <p className="text-xs text-zinc-600 font-mono">None found</p>}
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">Extracted IOCs - Domains</h3>
                   {result.iocs_extracted?.domains?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.iocs_extracted.domains.map((domain: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded text-xs font-mono">{domain}</span>
                        ))}
                      </div>
                   ) : <p className="text-xs text-zinc-600 font-mono">None found</p>}
                </div>

                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">Identified TTPs</h3>
                   {result.ttps?.length > 0 ? (
                      <ul className="space-y-2">
                        {result.ttps.map((ttp: string, i: number) => (
                          <li key={i} className="text-sm text-zinc-300 font-mono bg-zinc-800 px-3 py-2 rounded-md border border-[#27272A]">{ttp}</li>
                        ))}
                      </ul>
                   ) : <p className="text-xs text-zinc-600 font-mono">None found</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
