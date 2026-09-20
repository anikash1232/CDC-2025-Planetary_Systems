/**
 * Exoplanet service for converting API data to frontend format
 */

import { api, type Exoplanet as ApiExoplanet } from './api'
import { type Exoplanet } from './exoplanet-data'

export function convertApiExoplanet(apiPlanet: ApiExoplanet): Exoplanet {
  return {
    id: apiPlanet.pl_name.toLowerCase().replace(/\s+/g, '-'),
    name: apiPlanet.pl_name,
    hostStar: apiPlanet.hostname,
    mass: apiPlanet.pl_bmasse,
    radius: apiPlanet.pl_rade,
    gravity: apiPlanet.g_fraction * 9.81, // Convert to m/s²
    distance: apiPlanet.sy_dist ? apiPlanet.sy_dist * 3.26 : 0, // Convert parsecs to light years
    temperature: apiPlanet.pl_eqt,
    orbitalPeriod: apiPlanet.pl_orbper,
    g_fraction: apiPlanet.g_fraction,
    intensity_index: apiPlanet.intensity_index,
  }
}

export async function searchExoplanets(query: string, limit: number = 200): Promise<Exoplanet[]> {
  try {
    const response = await api.searchExoplanets(query, limit)
    return response.exoplanets.map(convertApiExoplanet)
  } catch (error) {
    console.error('Failed to search exoplanets:', error)
    return []
  }
}

export async function getExoplanet(planetName: string): Promise<Exoplanet | null> {
  try {
    const apiPlanet = await api.getExoplanet(planetName)
    return convertApiExoplanet(apiPlanet)
  } catch (error) {
    console.error('Failed to get exoplanet:', error)
    return null
  }
}

export async function getRandomExoplanets(limit: number = 200): Promise<Exoplanet[]> {
  try {
    console.log('Fetching random exoplanets from API...')
    const apiPlanets = await api.getRandomExoplanets(limit)
    console.log('Received exoplanets:', apiPlanets.length)
    return apiPlanets.map(convertApiExoplanet)
  } catch (error) {
    console.error('Failed to get random exoplanets:', error)
    return []
  }
}

export async function getExoplanetStats() {
  try {
    return await api.getExoplanetStats()
  } catch (error) {
    console.error('Failed to get exoplanet stats:', error)
    return null
  }
}
