import { ShieldAlert, Activity, Database, AlertOctagon } from "lucide-react";

export function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-white mb-2">SOC Dashboard</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-wider">Global Threat Intelligence Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Active Threats" value="1,284" icon={ShieldAlert} trend="+12%" color="text-red-500" />
        <MetricCard title="IOCs Analyzed" value="45.2k" icon={Database} trend="+5%" color="text-cyan-400" />
        <MetricCard title="AI Detections" value="892" icon={Activity} trend="+22%" color="text-green-400" />
        <MetricCard title="Critical Alerts" value="14" icon={AlertOctagon} trend="-2%" color="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">Recent Threat Feeds</h2>
          <div className="space-y-4">
            {[
              { id: "TR-992", type: "Malware", source: "Hybrid Analysis", time: "2m ago", risk: "High" },
              { id: "TR-991", type: "Phishing", source: "OpenPhish", time: "15m ago", risk: "Medium" },
              { id: "TR-990", type: "Botnet", source: "Spamhaus", time: "42m ago", risk: "High" },
              { id: "TR-989", type: "Ransomware", source: "AlienVault OTX", time: "1h ago", risk: "Critical" },
            ].map((feed, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0A0A0B] border border-[#27272A] rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-zinc-500">{feed.id}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{feed.type}</p>
                    <p className="text-xs text-zinc-500 mt-1">{feed.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-zinc-500 mt-1">{feed.time}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    feed.risk === 'Critical' ? 'bg-red-900/30 text-red-500' :
                    feed.risk === 'High' ? 'bg-orange-900/30 text-orange-400' :
                    'bg-yellow-900/30 text-yellow-400'
                  }`}>{feed.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">System Health</h2>
          <div className="space-y-6">
            <HealthIndicator label="Vertex AI Pipeline" status="Operational" />
            <HealthIndicator label="Feed Aggregators" status="Operational" />
            <HealthIndicator label="Cloud Functions API" status="Operational" />
            <HealthIndicator label="Firestore Database" status="Operational" />
            <HealthIndicator label="BigQuery Analytics" status="Operational" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-500 text-xs font-semibold uppercase">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-[10px] font-mono text-green-400">{trend}</span>
      </div>
    </div>
  );
}

function HealthIndicator({ label, status }: { label: string; status: string }) {
  const isOp = status === "Operational";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 rounded ${isOp ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{status}</span>
        {isOp && <span className="w-2 h-2 rounded-full bg-green-500 status-pulse"></span>}
      </div>
    </div>
  );
}
