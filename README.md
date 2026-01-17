# GravityFit 

Transform NASA's Exoplanet Archive into personalized fitness training programs. Select any exoplanet and get gravity-scaled workouts designed for that world's conditions.

## Architecture

- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Backend**: FastAPI + Python
- **API**: RESTful endpoints for gravity calculations and workout planning

## Data Processing Documents:
- https://drive.google.com/drive/folders/1EPAfy_xG9MTjEZ5JOqbi9xrAnNF_E401

## Features

- **Planetary Gravity Calculations**: Compute g_fraction and intensity index using NASA exoplanet data
- **Gravity-Scaled Workouts**: Generate personalized training programs based on planetary conditions
- **7-Day Training Plans**: Complete weekly schedules with device setpoints and safety notes
- **Real-time API Integration**: Backend-powered calculations with fallback to frontend logic

## 🚀 Quick Start (For Judges)

**One-Command Setup:**
```bash
# Clone and start both servers
git clone <repository-url>
cd CDC-2025-Planetary_Systems
chmod +x start-dev.sh
./start-dev.sh
```

**Access URLs:**
- **Main Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

> 📋 **Detailed Setup Instructions:** See [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) for comprehensive setup guide.

## Local Development

### Prerequisites

- **Python 3.12+** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### Quick Setup (Recommended)

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd CDC-2025-Planetary_Systems
   ```

2. **Run development script:**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

3. **Open browser:** [http://localhost:3000](http://localhost:3000)

### Manual Setup (Alternative)

#### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Verification

- **Backend Health:** [http://localhost:8000/health](http://localhost:8000/health)
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

### Health Check
- **GET** `/health` - Returns `{ok: true}`

### Predict Intensity Index
- **POST** `/predict`
- **Body**: `{g_fraction: number, alpha?: number, mapping?: "linear"|"nonlinear"}`
- **Response**: `{intensity_index: number, details: {...}}`

### Generate Workout Plan
- **POST** `/plan`
- **Body**: `{intensity_index: number, g_fraction?: number}`
- **Response**: Complete 7-day workout plan with exercises, device setpoints, and safety notes

## Deployment

### Backend Deployment (Render/Railway)

1. Create a new web service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variable: `FRONTEND_ORIGIN=https://your-app.vercel.app`

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel
2. Set build command: `cd frontend && pnpm build`
3. Set output directory: `frontend/.next`
4. Set environment variable: `NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com`

### Environment Variables

**Backend (.env)**:
```
FRONTEND_ORIGIN=http://localhost:3000
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## Planetary Systems Logic

The backend implements the core calculations from the Planetary Systems.ipynb notebook:

1. **g_fraction calculation**: `g_fraction = pl_bmasse / (pl_rade**2)` clamped to [0,1]
2. **Intensity Index mapping**: 
   - Linear: `I = round(1 + 9 * (1 - g_fraction))`
   - Non-linear: `I = round(1 + 9 * (1 - g_fraction^alpha))`
3. **Final clamping**: Intensity index is always clipped to [1,10]

## Project Structure

```
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API client
│   └── public/              # Static assets
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── routers/         # API route handlers
│   │   └── services/        # Business logic
│   └── requirements.txt     # Python dependencies
└── README.md               # This file
```

## Deployment

The project is ready for deployment! See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Test deployment readiness: `./deploy.sh`
2. Deploy backend to Railway/Render
3. Deploy frontend to Vercel (set Root Directory to `frontend`)
4. Set environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with both frontend and backend
5. Submit a pull request

## License

MIT License - see LICENSE file for details
