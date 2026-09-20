"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from "recharts"
import { Map, Filter, BarChart3, PieChartIcon, ScanTextIcon as ScatterIcon, Info, Zap, Target, Loader2 } from "lucide-react"
import {
  calculateGravityFraction,
  calculateIntensityIndex,
  getIntensityTier,
  type Exoplanet,
} from "@/lib/exoplanet-data"
import { api } from "@/lib/api"

interface GravityMapProps {
  onPlanetSelect?: (planet: Exoplanet) => void
}

export function GravityMap({ onPlanetSelect }: GravityMapProps) {
  const [viewType, setViewType] = useState<"scatter" | "bar" | "pie">("scatter")
  const [filterTier, setFilterTier] = useState<"all" | "low" | "medium" | "high">("all")
  const [distanceRange, setDistanceRange] = useState([0, 1500])
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [planets, setPlanets] = useState<Exoplanet[]>([])
  const [loading, setLoading] = useState(true)

  // Load planets on mount
  useEffect(() => {
    const loadPlanets = async () => {
      try {
        setLoading(true)
        const data = await api.getRandomExoplanets(200)
        
        // Convert API data to frontend format with calculated fields
        const convertedPlanets = data.map((planet: any) => ({
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
      } catch (error) {
        console.error('Error loading planets for gravity map:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPlanets()
  }, [])

  // Process data for visualization
  const processedData = useMemo(() => {
    return planets
      .filter((planet) => planet.gravity) // Only planets with gravity data
      .map((planet) => {
        const gravityFraction = calculateGravityFraction(planet.gravity!)
        const intensityIndex = calculateIntensityIndex(gravityFraction)
        const intensityTier = getIntensityTier(intensityIndex)

        return {
          ...planet,
          gravityFraction,
          intensityIndex,
          intensityTier,
          // Color coding for visualization
          color: intensityTier === "low" ? "#10b981" : intensityTier === "medium" ? "#f59e0b" : "#ef4444",
        }
      })
      .filter((planet) => {
        // Apply filters
        const tierMatch = filterTier === "all" || planet.intensityTier === filterTier
        const distanceMatch = planet.distance >= distanceRange[0] && planet.distance <= distanceRange[1]
        return tierMatch && distanceMatch
      })
  }, [planets, filterTier, distanceRange])

  // Data for different chart types
  const scatterData = processedData.map((planet) => ({
    x: planet.gravityFraction,
    y: planet.intensityIndex,
    name: planet.name,
    distance: planet.distance,
    temperature: planet.temperature,
    color: planet.color,
    planet: planet,
  }))

  const barData = [
    {
      tier: "Low (1-3)",
      count: processedData.filter((p) => p.intensityTier === "low").length,
      fill: "#10b981",
    },
    {
      tier: "Medium (4-7)",
      count: processedData.filter((p) => p.intensityTier === "medium").length,
      fill: "#f59e0b",
    },
    {
      tier: "High (8-10)",
      count: processedData.filter((p) => p.intensityTier === "high").length,
      fill: "#ef4444",
    },
  ]

  const pieData = barData.map((item) => ({
    name: item.tier,
    value: item.count,
    fill: item.fill,
  }))

  const handlePlanetClick = (data: any) => {
    if (data && data.planet) {
      setSelectedPlanet(data.planet)
      onPlanetSelect?.(data.planet)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">Gravity: {data.x?.toFixed(2)}x Earth</p>
          <p className="text-sm text-muted-foreground">Intensity: {data.y}/10</p>
          <p className="text-sm text-muted-foreground">Distance: {data.distance} ly</p>
          {data.temperature && <p className="text-sm text-muted-foreground">Temp: {data.temperature}K</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading exoplanet data...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Map className="h-6 w-6" />
            Exoplanet Gravity Map
          </CardTitle>
          <CardDescription className="text-base">
            Visualize thousands of exoplanets by their gravity-based intensity tiers for fitness training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{processedData.length}</div>
              <div className="text-sm text-muted-foreground">Planets Shown</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-5">
                {processedData.filter((p) => p.intensityTier === "low").length}
              </div>
              <div className="text-sm text-muted-foreground">Low Intensity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-3">
                {processedData.filter((p) => p.intensityTier === "medium").length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Intensity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {processedData.filter((p) => p.intensityTier === "high").length}
              </div>
              <div className="text-sm text-muted-foreground">High Intensity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Visualization Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Intensity Tier</label>
              <Select value={filterTier} onValueChange={(value: any) => setFilterTier(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="low">Low (1-3)</SelectItem>
                  <SelectItem value="medium">Medium (4-7)</SelectItem>
                  <SelectItem value="high">High (8-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Distance Range (light years)</label>
              <div className="px-2">
                <Slider
                  value={distanceRange}
                  onValueChange={setDistanceRange}
                  max={1500}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{distanceRange[0]} ly</span>
                  <span>{distanceRange[1]} ly</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Tabs value={viewType} onValueChange={(value: any) => setViewType(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="scatter" className="flex items-center gap-1">
                    <ScatterIcon className="h-3 w-3" />
                    Scatter
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Bar
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="flex items-center gap-1">
                    <PieChartIcon className="h-3 w-3" />
                    Pie
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {viewType === "scatter" && <ScatterIcon className="h-5 w-5" />}
            {viewType === "bar" && <BarChart3 className="h-5 w-5" />}
            {viewType === "pie" && <PieChartIcon className="h-5 w-5" />}
            {viewType === "scatter" && "Gravity vs Intensity Scatter Plot"}
            {viewType === "bar" && "Intensity Tier Distribution"}
            {viewType === "pie" && "Training Intensity Breakdown"}
          </CardTitle>
          <CardDescription>
            {viewType === "scatter" && "Each point represents an exoplanet. Click to select for training."}
            {viewType === "bar" && "Number of planets in each intensity category."}
            {viewType === "pie" && "Proportion of planets by training difficulty."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === "scatter" ? (
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Gravity Fraction"
                    domain={[0, "dataMax + 0.5"]}
                    stroke="hsl(var(--foreground))"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Intensity Index"
                    domain={[0, 10]}
                    stroke="hsl(var(--foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter data={scatterData} onClick={handlePlanetClick} className="cursor-pointer">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedPlanet?.id === entry.planet.id ? "hsl(var(--primary))" : "none"}
                        strokeWidth={selectedPlanet?.id === entry.planet.id ? 3 : 0}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              ) : viewType === "bar" ? (
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="tier" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Intensity Tier Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-chart-5/10 rounded-lg border border-chart-5/20">
              <div className="w-4 h-4 rounded-full bg-chart-5"></div>
              <div>
                <div className="font-semibold text-chart-5">Low Intensity (1-3)</div>
                <div className="text-sm text-muted-foreground">≥0.72x Earth gravity • Gravity does the work</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-chart-3/10 rounded-lg border border-chart-3/20">
              <div className="w-4 h-4 rounded-full bg-chart-3"></div>
              <div>
                <div className="font-semibold text-chart-3">Medium Intensity (4-7)</div>
                <div className="text-sm text-muted-foreground">0.28–0.72x Earth gravity • Standard training</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="w-4 h-4 rounded-full bg-destructive"></div>
              <div>
                <div className="font-semibold text-destructive">High Intensity (8-10)</div>
                <div className="text-sm text-muted-foreground">≤0.28x Earth gravity • Hardest workouts</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Planet Info */}
      {selectedPlanet && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Selected Planet: {selectedPlanet.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Host Star:</span>
                <div className="font-medium">{selectedPlanet.hostStar}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Gravity:</span>
                <div className="font-medium">{selectedPlanet.gravity?.toFixed(1)} m/s²</div>
              </div>
              <div>
                <span className="text-muted-foreground">Intensity:</span>
                <div className="font-medium">
                  {calculateIntensityIndex(calculateGravityFraction(selectedPlanet.gravity!))}/10
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Distance:</span>
                <div className="font-medium">{selectedPlanet.distance} ly</div>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => onPlanetSelect?.(selectedPlanet)} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Generate Workout for {selectedPlanet.name}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  )
}
