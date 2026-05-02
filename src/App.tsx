import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ThreatHunting } from "./pages/ThreatHunting";
import { AIAnalysis } from "./pages/AIAnalysis";
import { Architecture } from "./pages/Architecture";
import { ThreatMap } from "./pages/ThreatMap";
import { Auth } from "./pages/Auth";
import { AuthProvider } from "./lib/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-[#0A0A0B]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hunting" element={<ThreatHunting />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/map" element={<ThreatMap />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
