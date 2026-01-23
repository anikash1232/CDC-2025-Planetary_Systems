"use client"

import { useState } from "react"
import { PlanetSearch } from "@/components/planet-search"
import { GravityMap } from "@/components/gravity-map"
import { WorkoutGenerator } from "@/components/workout-generator"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Map } from "lucide-react"
import type { Exoplanet } from "@/lib/exoplanet-data"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("search")
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [showWorkout, setShowWorkout] = useState(false)

  const handlePlanetSelect = (planet: Exoplanet) => {
    setSelectedPlanet(planet)
    setShowWorkout(true)
  }

  const handleBackToSearch = () => {
    setShowWorkout(false)
    setSelectedPlanet(null)
  }

  if (showWorkout && selectedPlanet) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <WorkoutGenerator planet={selectedPlanet} onBack={handleBackToSearch} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            GravityFit
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
            Transform NASA's Exoplanet Archive into personalized fitness training programs. Select any exoplanet and get
            gravity-scaled workouts designed for that world's conditions.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Planet Search
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Gravity Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <PlanetSearch />
          </TabsContent>

          <TabsContent value="map">
            <GravityMap onPlanetSelect={handlePlanetSelect} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
