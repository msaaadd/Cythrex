import { NavLink } from "react-router-dom";
import { LayoutDashboard, Shield, BrainCircuit, Network, Settings, Globe, Lock, LogOut, User } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Shield, label: "Threat Hunting", path: "/hunting" },
  { icon: BrainCircuit, label: "AI Analysis", path: "/analysis" },
  { icon: Globe, label: "Threat Map", path: "/map" },
  { icon: Network, label: "Architecture", path: "/architecture" },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-[#0E0E10] border-r border-[#27272A] text-zinc-300 flex flex-col h-screen shrink-0">
      <div className="p-6 flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 rounded flex items-center justify-center bg-transparent">
          <img src="/logo.png" alt="Cythrex Logo" className="w-full h-full object-contain" onError={(e) => {
             // Fallback to icon if logo not uploaded yet
             e.currentTarget.style.display = 'none';
             e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }} />
          <Shield className="w-5 h-5 text-cyan-400 hidden" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Cythrex</span>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-[#27272A] flex flex-col gap-2">
         {!user ? (
           <NavLink
              to="/auth"
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium w-full",
                  isActive ? "bg-cyan-900/30 text-cyan-400" : "text-cyan-500 hover:bg-cyan-900/20"
                )
              }
            >
              <Lock className="w-4 h-4" />
              <span>Sign In / Pro Access</span>
            </NavLink>
         ) : (
           <div className="flex flex-col gap-1 px-2 py-2 mb-2 bg-[#161618] border border-[#27272A] rounded-md">
             <div className="flex items-center gap-2 mb-2">
               <User className="w-4 h-4 text-cyan-500" />
               <span className="text-xs truncate text-zinc-300 font-mono" title={user}>{user}</span>
             </div>
             <button onClick={logout} className="flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full uppercase tracking-wider font-mono">
               <LogOut className="w-3 h-3" />
               <span>Sign Out</span>
             </button>
           </div>
         )}
        <button className="flex items-center space-x-3 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors w-full rounded-md">
          <Settings className="w-4 h-4" />
          <span>System Config</span>
        </button>
      </div>
    </div>
  );
}
