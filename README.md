<div align="center">

# 🌌 GravityFit

### Personalized Fitness Training for Any Planet in the Universe

[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

### 🏆 1st Place — Carolina Data Challenge 2025
**Outperformed 80+ teams** for innovation, technical rigor, and data visualization

*Built in 24 hours · UNC Chapel Hill · September 2025*

</div>

---

## 📌 Overview

**GravityFit** transforms NASA's Exoplanet Archive (33,000+ records) into personalized, gravity-scaled fitness training programs. Select any exoplanet from the habitable zone and GravityFit calculates that planet's gravitational pull relative to Earth, then generates a complete **7-day workout plan** — adapted to what your body would experience there.

Inspired by the International Space Station's daily exercise protocols used to combat bone density loss and muscle atrophy in microgravity environments.

---

## 🚀 How It Works

```
NASA Exoplanet Archive (33,000+ rows)
              ↓
  g_fraction = pl_bmasse / (pl_rade²)   ← planetary gravity relative to Earth
  g_fraction clamped to [0, 1]
              ↓
  Intensity Index Mapping
  ┌─ Linear:     I = round(1 + 9 × (1 − g_fraction))
  └─ Non-linear: I = round(1 + 9 × (1 − g_fraction^alpha))
  I clamped to [1, 10]
              ↓
  POST /plan  →  7-Day Workout Plan
  (exercises, device setpoints, safety notes, rest days)
              ↓
  Next.js Dashboard  →  Interactive visualizations + plan display
```

**Key insight:** Lower gravity = higher intensity index. On a low-gravity world, muscles and bones need to work harder to stay healthy. GravityFit prescribes the equivalent of what Earth-gravity naturally provides.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.12 |
| **Data** | NASA Exoplanet Archive (pandas, NumPy, scikit-learn) |
| **ML** | Linear regression, TensorFlow |
| **Deployment** | Vercel (frontend) + Render/Railway (backend) |
| **Package Manager** | pnpm |

---

## 📁 Project Structure

```
CDC-2025-Planetary_Systems/
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # API client + utilities
│   └── public/            # Static assets
├── backend/
│   ├── app/
│   │   ├── routers/       # FastAPI route handlers
│   │   └── services/      # Gravity + workout business logic
│   └── requirements.txt
├── start-dev.sh           # One-command dev startup
├── deploy.sh              # Deployment readiness checker
├── vercel.json            # Vercel config
├── DEPLOYMENT.md          # Deployment guide
└── LOCALHOST_SETUP.md     # Local setup guide
```

---

## 🔌 API Reference

### `GET /health`
```json
{ "ok": true }
```

### `POST /predict`
Computes the intensity index from a planet's gravity fraction.
```json
// Request
{ "g_fraction": 0.42, "alpha": 1.0, "mapping": "nonlinear" }

// Response
{
  "intensity_index": 7,
  "details": { "g_fraction": 0.42, "mapping": "nonlinear", "alpha": 1.0 }
}
```

### `POST /plan`
Generates a full 7-day gravity-scaled workout plan.
```json
// Request
{ "intensity_index": 7, "g_fraction": 0.42 }

// Response
{
  "plan": [
    {
      "day": 1,
      "exercises": [...],
      "device_setpoints": {...},
      "safety_notes": "..."
    }
    // ...7 days
  ]
}
```

---

## ⚙️ Gravity Physics

The core formula derived from NASA exoplanet data:

```python
# Surface gravity relative to Earth
g_fraction = pl_bmasse / (pl_rade ** 2)
g_fraction = max(0.0, min(1.0, g_fraction))  # clamp to [0, 1]

# Linear intensity mapping
I_linear = round(1 + 9 * (1 - g_fraction))

# Non-linear intensity mapping (tunable alpha)
I_nonlinear = round(1 + 9 * (1 - g_fraction ** alpha))

# Final clamp
intensity_index = max(1, min(10, I))
```

| Gravity Scenario | g_fraction | Intensity Index | Example |
|:---|:---|:---|:---|
| Earth-like | ~1.0 | 1 | Earth |
| Mars-like | ~0.38 | 7 | Mars |
| Microgravity | ~0.0 | 10 | ISS orbit |

---

## 🚀 Getting Started

### One-command setup
```bash
git clone https://github.com/NP-Code99/CDC-2025-Planetary_Systems.git
cd CDC-2025-Planetary_Systems
chmod +x start-dev.sh
./start-dev.sh
```

| Service | URL |
|:---|:---|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

### Manual setup

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Environment variables

```env
# backend/.env
FRONTEND_ORIGIN=http://localhost:3000

# frontend/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## ☁️ Deployment

**Frontend → Vercel**
- Root directory: `frontend`
- Build command: `pnpm build`
- Env: `NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com`

**Backend → Render / Railway**
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env: `FRONTEND_ORIGIN=https://your-app.vercel.app`

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full guide.

---

## 🗺️ Roadmap

- [x] NASA exoplanet data pipeline (33,000+ rows)
- [x] Gravity fraction + intensity index calculation (linear & non-linear)
- [x] 7-day personalized workout plan generation
- [x] FastAPI backend with Swagger docs
- [x] Next.js dashboard with interactive visualizations
- [x] Vercel + Render deployment
- [x] 1st place — Carolina Data Challenge 2025 (80+ teams)
- [ ] Individual physiological metrics (age, weight, bone density)
- [ ] Expand dataset as new planetary data becomes available
- [ ] Animated planet selector with orbital visualization

---

<div align="center">

**Team:** Nandan Pullakandam · Aditya More · Anirudh Dhawan · Anirudh Kashyap

**Event:** Carolina Data Challenge 2025 · UNC Chapel Hill

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/nandan-pullakandam)
[![GitHub](https://img.shields.io/badge/GitHub-171515?style=flat-square&logo=github&logoColor=white)](https://github.com/NP-Code99)

</div>
