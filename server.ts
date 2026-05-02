import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import axios from "axios";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/v1/hunt", async (req, res) => {
    const ioc = req.query.ioc as string;
    if (!ioc) {
      return res.status(400).json({ error: "Missing IOC parameter" });
    }

    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!vtApiKey) {
      return res.status(500).json({ error: "Virustotal API key not configured on server" });
    }

    try {
      // Basic detection of type: IP, domain, hash, URL
      let type = "ip-addresses";
      let queryId = ioc.trim();
      
      if (/^https?:\/\//i.test(queryId)) {
        type = "urls";
        // VT Requires Base64URL without padding for URLs
        queryId = Buffer.from(queryId).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      } else if (/^[a-fA-F0-9]{32,64}$/.test(queryId)) {
        type = "files";
      } else if (/[a-zA-Z]/.test(queryId)) {
        type = "domains";
      }

      const url = `https://www.virustotal.com/api/v3/${type}/${queryId}`;
      console.log("Querying VirusTotal:", url);
      
      const response = await axios.get(url, {
        headers: { "x-apikey": vtApiKey }
      });
      
      const vtData = response.data;
      const stats = vtData.data?.attributes?.last_analysis_stats || { malicious: 0, suspicious: 0, undetected: 0 };
      const reputation = stats.malicious > 0 ? "Malicious" : stats.suspicious > 0 ? "Suspicious" : "Clean";
      const score = Math.min(100, (stats.malicious * 10) + (stats.suspicious * 5));
      
      // Extract specific detected threats
      const results = vtData.data?.attributes?.last_analysis_results || {};
      const threats = Object.keys(results)
        .filter((engine: string) => results[engine].category === 'malicious')
        .map((engine: string) => results[engine].result)
        .filter(Boolean)
        .slice(0, 5); // take max 5

      const finalResponse = {
        ioc,
        type: type === 'ip-addresses' ? 'IP' : type === 'files' ? 'Hash' : type === 'urls' ? 'URL' : 'Domain',
        reputation,
        score,
        detected_threats: Array.from(new Set(threats)), // unique values
        related_iocs: [], // We'd need another API call to get relationships, keeping simple for now
        leaked_data_found: false,
        summary: `VirusTotal analysis shows ${stats.malicious} malicious and ${stats.suspicious} suspicious detections.`
      };

      res.json(finalResponse);
    } catch (error: any) {
      console.error("VT API Error:", error.response?.data || error.message);
      // Fallback or send error
      if (error.response?.status === 404) {
        return res.json({
          ioc,
          type: "Unknown",
          reputation: "Unknown",
          score: 0,
          detected_threats: [],
          related_iocs: [],
          leaked_data_found: false,
           summary: "IOC not found in VirusTotal database."
        });
      }
      res.status(500).json({ error: "Failed to communicate with external intelligence sources." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
