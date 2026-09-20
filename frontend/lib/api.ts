/**
 * Typed API client for GravityFit backend
 */

import {
  getRandomStaticPlanets,
  searchStaticPlanets,
  STATIC_STATS,
  type StaticExoplanet,
  type StaticStats
} from './static-data'
import { calculateIntensityIndex, generateWorkoutPlan, intensityFormula, type Mapping } from './gravity-fitness'

// Unset by default: the exoplanet catalogue is served from static-data.ts and
// predict/plan are served by this app's own route handlers under /api.
// Set NEXT_PUBLIC_API_BASE to point at a running FastAPI backend instead.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

// Check if we should use static data (no API base configured)
function useStaticData(): boolean {
  return !API_BASE || API_BASE === ''
}

/**
 * The FastAPI backend serves /predict and /plan at its root; when no backend is
 * configured we use this app's own route handlers, which live under /api.
 */
function computeEndpoint(path: 'predict' | 'plan'): string {
  return useStaticData() ? `/api/${path}` : `/${path}`
}

// Types matching the backend API
export interface PredictRequest {
  g_fraction: number
  alpha?: number
  mapping?: 'linear' | 'nonlinear'
}

export interface PredictResponse {
  intensity_index: number
  details: {
    g_fraction: number
    alpha_used: number
    mapping: string
    formula: string
  }
}

export interface PlanRequest {
  intensity_index: number
  g_fraction?: number
}

export interface Exercise {
  name: string
  type: string
  duration: number
  sets?: number
  reps?: number
  load?: number
  device_setpoint?: number
}

export interface Session {
  day: number
  name: string
  duration: number
  exercises: Exercise[]
}

export interface WeeklyPlan {
  intensity_index: number
  g_fraction?: number
  total_weekly_volume: number
  sessions: Session[]
  device_setpoints: Array<{
    exercise: string
    setpoint: number
    base_load: number
    scaled_load: number
  }>
  safety_notes: string[]
}

export interface HealthResponse {
  ok: boolean
}

export interface Exoplanet {
  pl_name: string
  hostname: string
  pl_rade: number  // Earth radii
  pl_bmasse: number  // Earth masses
  g_fraction: number
  intensity_index: number
  pl_orbper?: number  // days
  pl_orbsmax?: number  // AU
  pl_eqt?: number  // Kelvin
  st_teff?: number  // Kelvin
  sy_dist?: number  // parsecs
}

export interface ExoplanetSearchResponse {
  exoplanets: Exoplanet[]
  total: number
  query: string
}

export interface ExoplanetStatsResponse {
  total_planets: number
  g_fraction_range: {
    min: number
    max: number
    mean: number
  }
  intensity_index_distribution: Record<string, number>
  mass_range: {
    min: number
    max: number
    mean: number
  }
  radius_range: {
    min: number
    max: number
    mean: number
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    // Keep the message short: a failing endpoint can return a whole HTML page.
    throw new ApiError(response.status, `Request to ${endpoint} failed with ${response.status}`)
  }

  return response.json()
}

export const api = {
  /**
   * Health check endpoint
   */
  async health(): Promise<HealthResponse> {
    return fetchApi<HealthResponse>('/health')
  },

  /**
   * Predict intensity index from gravity fraction.
   * Falls back to computing it in-process so the UI never fails on a bad response.
   */
  async predict(request: PredictRequest): Promise<PredictResponse> {
    const { g_fraction, alpha = 1.0, mapping = 'linear' } = request
    try {
      return await fetchApi<PredictResponse>(computeEndpoint('predict'), {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (error) {
      console.warn('predict endpoint unavailable, computing locally', error)
      return {
        intensity_index: calculateIntensityIndex(g_fraction, alpha, mapping as Mapping),
        details: {
          g_fraction,
          alpha_used: alpha,
          mapping,
          formula: intensityFormula(mapping as Mapping, alpha),
        },
      }
    }
  },

  /**
   * Generate workout plan from intensity index.
   * Falls back to the same generator the route handler uses.
   */
  async plan(request: PlanRequest): Promise<WeeklyPlan> {
    try {
      return await fetchApi<WeeklyPlan>(computeEndpoint('plan'), {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (error) {
      console.warn('plan endpoint unavailable, computing locally', error)
      return generateWorkoutPlan(request.intensity_index, request.g_fraction)
    }
  },

  /**
   * Search exoplanets
   */
  async searchExoplanets(query: string = '', limit: number = 20): Promise<ExoplanetSearchResponse> {
    if (useStaticData()) {
      const staticPlanets = searchStaticPlanets(query, limit)
      return {
        exoplanets: staticPlanets as Exoplanet[],
        total: staticPlanets.length,
        query: query
      }
    }
    
    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString() })
      return await fetchApi<ExoplanetSearchResponse>(`/exoplanets?${params}`)
    } catch (error) {
      console.warn('Using static fallback data for search')
      const staticPlanets = searchStaticPlanets(query, limit)
      return {
        exoplanets: staticPlanets as Exoplanet[],
        total: staticPlanets.length,
        query: query
      }
    }
  },

  /**
   * Get specific exoplanet by name
   */
  async getExoplanet(planetName: string): Promise<Exoplanet> {
    return fetchApi<Exoplanet>(`/exoplanets/${encodeURIComponent(planetName)}`)
  },

  /**
   * Get exoplanet dataset statistics
   */
  async getExoplanetStats(): Promise<ExoplanetStatsResponse> {
    if (useStaticData()) {
      return STATIC_STATS as ExoplanetStatsResponse
    }
    
    try {
      return await fetchApi<ExoplanetStatsResponse>('/exoplanets/stats')
    } catch (error) {
      console.warn('Using static fallback data for stats')
      return STATIC_STATS as ExoplanetStatsResponse
    }
  },

  /**
   * Get random exoplanets
   */
  async getRandomExoplanets(limit: number = 5): Promise<Exoplanet[]> {
    if (useStaticData()) {
      return getRandomStaticPlanets(limit) as Exoplanet[]
    }
    
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      return await fetchApi<Exoplanet[]>(`/exoplanets/random?${params}`)
    } catch (error) {
      console.warn('Using static fallback data for random planets')
      return getRandomStaticPlanets(limit) as Exoplanet[]
    }
  },
}

export { ApiError }
