import ReactMarkdown from 'react-markdown';

const markdownContent = `
# Cythrex Architecture & Implementation Guide

This document outlines the complete design, Google Cloud architecture, API specification, and deployment guide for the **Cythrex** Threat Intelligence Platform.

---

## 1. Project Overview
- **Platform Name:** Cythrex
- **Description:** An AI-powered Threat Intelligence Platform designed as a university-level prototype. 
- **Target Users:** SOC Analysts, Incident Responders, Security Engineers, and Cyber Threat Researchers.
- **Goal:** Aggregation of threat intelligence feeds, automatic extraction of IOCs (Indicators of Compromise), AI-driven threat classification, risk scoring, and a centralized hunting dashboard.

---

## 2. Google Cloud Platform (GCP) Architecture

To build a professional, scalable, but realistic university-level prototype, we utilize the following GCP services:

1. **Cloud Run / App Engine (Frontend):** 
   - Hosts the React.js web dashboard. Serverless, automatically scales.
2. **Cloud Functions / Cloud Run (Backend API):**
   - Python-based microservices (FastAPI/Flask) to handle integrations, search queries, and AI analysis requests.
3. **Firestore (Database):**
   - NoSQL document database perfect for storing Threat Feeds, Risk Scores, and extracted IOCs. Fast and searchable.
4. **Pub/Sub (Data Ingestion Pipeline):**
   - Asynchronous message queue. When a new threat feed (RSS/API) is scraped, a message is published here. A subscriber function then processes it.
5. **Vertex AI / Gemini API (Machine Learning):**
   - NLP-based classification of unstructured threat reports (extracting IPs, domains, hashes, and mapping to MITRE ATT&CK).
6. **Cloud IAM & Secret Manager:**
   - Securely stores API keys for VirusTotal, Hybrid Analysis, and Open Threat Exchange (OTX).

### Data Flow Diagram
\`\`\`text
[RSS Feeds / External APIs] 
   |-> (Cloud Function: Scraper) -> [Pub/Sub Topic]
   |-> (Cloud Function: Processor) pulls message -> Uses [Vertex AI] for extraction -> Writes to [Firestore]

[SOC Analyst on React Dashboard] 
   |-> Searches IOC -> [Backend API on Cloud Run]
   |-> API queries [Firestore] OR reaches out to [VirusTotal API] -> Returns JSON to Frontend
\`\`\`

---

## 3. Core Features: Must-Have vs Optional

### Must-Have (MVP for University Project)
- **Threat Feed Aggregation:** Simple Python cron job pulling from an RSS feed (e.g., TheHackerNews, AlienVault OTX) and storing it.
- **Threat Hunting Search Bar:** Lookup an IP or hash using the VirusTotal API.
- **AI Classification:** Paste text, use Gemini to parse {"ips": [], "classification": "..."}.
- **Basic Dashboard UI:** Show active threats, charts, and metrics.

### Optional (If Time Permits)
- **BigQuery Integration:** Exporting logs to BigQuery for advanced historical SQL analytics.
- **Alerting System:** Send an email/Slack notification via SendGrid/webhook if a "Critical" threat is ingested.
- **User Auth (Firebase Auth):** Restricting access to login-only.

---

## 4. Backend API Design (FastAPI)

Below is an example of the RESTful endpoints you will build for the backend.

### GET \`/api/v1/hunt?ioc={query}\`
Looks up an IOC in the database, and reaches out to VirusTotal if not found.
**Response JSON:**
\`\`\`json
{
  "ioc": "192.168.1.1",
  "type": "IP",
  "reputation": "Suspicious",
  "score": 75,
  "detected_threats": ["Trojan.Generic", "Botnet"],
  "related_iocs": ["malicious-domain.com"],
  "leaked_data_found": false,
  "summary": "This IP is associated with known C2 infrastructure."
}
\`\`\`

### POST \`/api/v1/analyze\`
Accepts raw text, calls Vertex AI, and returns structured data.
**Request JSON:** \`{"text": "We detected lateral movement from 10.0.0.5 via psexec..."}\`

---

## 5. Python Starter Code (FastAPI)

Creating a fast, asynchronous API in Python.

\`\`\`python
from fastapi import FastAPI
import requests
import os

app = FastAPI()

VT_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

@app.get("/api/v1/hunt")
def hunt_ioc(ioc: str):
    # 1. Check local Firestore if we have data on this
    # ...
    
    # 2. If not, query VirusTotal
    url = f"https://www.virustotal.com/api/v3/search?query={ioc}"
    headers = {"x-apikey": VT_API_KEY}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        # Parse and return simplified Cythrex schema
        return {
            "ioc": ioc,
            "reputation": "Malicious" if data["data"] else "Clean",
            # ... map other fields
        }
    return {"error": "Failed to contact external intel source"}
\`\`\`

---

## 6. Recommended Datasets & External APIs

To make this project functional without paying for enterprise feeds, use these free tiers:
- **VirusTotal API:** Free tier allows 4 requests/minute. Perfect for the Threat Hunting search context.
- **AlienVault OTX (Open Threat Exchange):** Free API to get "pulses" (threat feeds).
- **Hybrid Analysis API:** Free sandbox reports.
- **URLHaus / ThreatFox (Abuse.ch):** Completely free daily CSVs of malicious payloads and IOCs.

---

## 7. GCP Deployment Guide (Step-by-step)

1. **Setup GCP Project:** Create a new Google Cloud Project named \`threatlens-proto\`. Enable Billing.
2. **Enable APIs:** Enable Vertex AI, Cloud Run, Cloud Functions, and Firestore.
3. **Database Setup:** Go to Firestore, click "Create Database", choose Native Mode, and select your nearest region.
4. **Deploy Backend (Cloud Run):**
   - Write your \`Dockerfile\` for the FastAPI app.
   - Run \`gcloud run deploy threatlens-api --source . --allow-unauthenticated\`.
5. **Setup Secrets:** Go to Secret Manager, add \`VT_API_KEY\`, and grant your Cloud Run service account access to read it.
6. **Deploy Frontend:**
   - Run \`npm run build\` on the React app.
   - Host the static files on Firebase Hosting or Cloud Storage.
`;

export function Architecture() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-white mb-2">System Architecture</h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">Design, Documentation & GCP Implementation Guide</p>
      </div>

      <div className="card p-8 markdown-body prose prose-invert max-w-none prose-pre:bg-[#0A0A0B] prose-pre:border prose-pre:border-[#27272A] prose-headings:font-sans prose-a:text-cyan-400">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
}
