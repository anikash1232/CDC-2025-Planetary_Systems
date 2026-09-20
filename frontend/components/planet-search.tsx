"use client"

import { useState, useEffect } from "react"
import { Search, Globe, Zap, Orbit, Thermometer, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WorkoutGenerator } from "@/components/workout-generator"
import {
  calculateGravityFraction,
  calculateIntensityIndex,
  getIntensityTier,
  type Exoplanet,
} from "@/lib/exoplanet-data"
import { searchExoplanets as searchExoplanetsAPI, getRandomExoplanets, getExoplanetStats } from "@/lib/exoplanet-service"
import { ExoplanetStatsResponse, api } from "@/lib/api"

export function PlanetSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [showWorkout, setShowWorkout] = useState(false)
  const [planets, setPlanets] = useState<Exoplanet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ExoplanetStatsResponse | null>(null)

  // Load initial random planets and stats
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial planets...')
        setLoading(true)
        setError(null)
        
        // Use API client for environment-aware calls
        const [planetsData, statsData] = await Promise.all([
          api.getRandomExoplanets(200),
          api.getExoplanetStats()
        ])
        
        console.log('Loaded planets:', planetsData.length, planetsData)
        console.log('Loaded stats:', statsData)
        
        // Convert API data to frontend format
        const convertedPlanets = planetsData.map((planet: any) => ({
          id: planet.pl_name.toLowerCase().replace(/\s+/g, '-'),
          name: planet.pl_name,
          hostStar: planet.hostname,
          mass: planet.pl_bmasse,
          radius: planet.pl_rade,
          gravity: planet.g_fraction * 9.81, // Convert to m/s²
          distance: planet.sy_dist ? planet.sy_dist * 3.26 : 0, // Convert parsecs to light years
          temperature: planet.pl_eqt,
          orbitalPeriod: planet.pl_orbper,
          g_fraction: planet.g_fraction,
          intensity_index: planet.intensity_index,
        }))
        
        setPlanets(convertedPlanets)
        setStats(statsData)
        console.log('Planets state updated:', convertedPlanets.length)
      } catch (err) {
        console.error('Error loading exoplanets:', err)
        setError('Failed to load exoplanets')
      } finally {
        console.log('Setting loading to false')
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Search planets when query changes
  useEffect(() => {
    const searchPlanets = async () => {
      if (!searchQuery.trim()) {
        // Load random planets when no search query
        try {
          const planetsData = await api.getRandomExoplanets(200)
          
          const convertedPlanets = planetsData.map((planet: any) => ({
            id: planet.pl_name.toLowerCase().replace(/\s+/g, '-'),
            name: planet.pl_name,
            hostStar: planet.hostname,
            mass: planet.pl_bmasse,
            radius: planet.pl_rade,
            gravity: planet.g_fraction * 9.81,
            distance: planet.sy_dist ? planet.sy_dist * 3.26 : 0,
              temperature: planet.pl_eqt,
            orbitalPeriod: planet.pl_orbper,
            g_fraction: planet.g_fraction,
            intensity_index: planet.intensity_index,
          }))
          
          setPlanets(convertedPlanets)
        } catch (err) {
          console.error('Error loading random planets:', err)
        }
        return
      }

      try {
        setLoading(true)
        const searchData = await api.searchExoplanets(searchQuery, 200)
        
        const convertedPlanets = searchData.exoplanets.map((planet: any) => ({
          id: planet.pl_name.toLowerCase().replace(/\s+/g, '-'),
          name: planet.pl_name,
          hostStar: planet.hostname,
          mass: planet.pl_bmasse,
          radius: planet.pl_rade,
          gravity: planet.g_fraction * 9.81,
          distance: planet.sy_dist ? planet.sy_dist * 3.26 : 0,
          temperature: planet.pl_eqt,
          orbitalPeriod: planet.pl_orbper,
          g_fraction: planet.g_fraction,
          intensity_index: planet.intensity_index,
        }))
        
        setPlanets(convertedPlanets)
      } catch (err) {
        setError('Failed to search exoplanets')
        console.error('Error searching exoplanets:', err)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchPlanets, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handlePlanetSelect = (planet: Exoplanet) => {
    setSelectedPlanet(planet)
  }

  const handleGenerateWorkout = () => {
    if (selectedPlanet) {
      setShowWorkout(true)
    }
  }

  const handleBackToSearch = () => {
    setShowWorkout(false)
    setSelectedPlanet(null)
  }

  if (showWorkout && selectedPlanet) {
    return <WorkoutGenerator planet={selectedPlanet} onBack={handleBackToSearch} />
  }

  return (
    <div className="space-y-8">
      {/* Search Interface */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exoplanets by name or host star..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading exoplanets from NASA database...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-destructive mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading exoplanets</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      )}

      {/* Planet Results Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planets.map((planet) => {
              // Use real data if available, fallback to calculated values
              const gravityFraction = planet.g_fraction ?? (planet.gravity ? calculateGravityFraction(planet.gravity) : 1)
              const intensityIndex = planet.intensity_index ?? calculateIntensityIndex(gravityFraction)
              const intensityTier = getIntensityTier(intensityIndex)

              return (
                <Card
                  key={planet.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
                    selectedPlanet?.id === planet.id
                      ? "border-primary shadow-primary/20 shadow-lg animate-pulse-glow"
                      : "border-border hover:border-primary/50"
                  } bg-card/80 backdrop-blur-sm`}
                  onClick={() => handlePlanetSelect(planet)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-balance">{planet.name}</CardTitle>
                        <CardDescription className="text-sm">
                          <Globe className="inline h-3 w-3 mr-1" />
                          {planet.hostStar}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          intensityTier === "low" ? "secondary" : intensityTier === "medium" ? "default" : "destructive"
                        }
                        className="animate-float"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {intensityIndex}/10
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Gravity Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gravity:</span>
                      <span className="font-mono font-medium">
                        {planet.gravity ? `${planet.gravity.toFixed(1)} m/s²` : "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">vs Earth:</span>
                      <span className="font-mono font-medium text-primary">
                        {gravityFraction.toFixed(2)}x
                      </span>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Orbit className="h-3 w-3" />
                        <span>{planet.orbitalPeriod ? `${planet.orbitalPeriod.toFixed(1)} d` : "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        <span>{planet.temperature ? `${planet.temperature}K` : "Unknown"}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">Distance: {planet.distance ? `${planet.distance.toFixed(2)} ly` : 'Unknown'}</div>

                    {selectedPlanet?.id === planet.id && (
                      <Button className="w-full mt-4" size="sm" onClick={handleGenerateWorkout}>
                        Generate Workout Program
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {planets.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No planets found</h3>
              <p className="text-sm text-muted-foreground">Try searching for different planet names or host stars</p>
            </div>
          )}

          {/* Quick Stats */}
          {stats && (
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h3 className="text-lg font-semibold mb-4 text-center">NASA Exoplanet Database Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.total_planets}</div>
                  <div className="text-sm text-muted-foreground">Total Planets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {Object.entries(stats.intensity_index_distribution).filter(([index, _]) => parseInt(index) <= 3).reduce((sum, [_, count]) => sum + count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Intensity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-chart-3">
                    {Object.entries(stats.intensity_index_distribution).filter(([index, _]) => {
                      const intensity = parseInt(index)
                      return intensity >= 4 && intensity <= 7
                    }).reduce((sum, [_, count]) => sum + count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Intensity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">
                    {Object.entries(stats.intensity_index_distribution).filter(([index, _]) => parseInt(index) >= 8).reduce((sum, [_, count]) => sum + count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">High Intensity</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}