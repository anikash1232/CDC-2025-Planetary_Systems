"use client"

import { useEffect, useState } from "react"
import { PlanetSearch } from "@/components/planet-search"
import { GravityMap } from "@/components/gravity-map"
import { WorkoutGenerator } from "@/components/workout-generator"
import { Header, type NavTarget } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Map, Trophy, Database, Sigma, HeartPulse } from "lucide-react"
import type { Exoplanet } from "@/lib/exoplanet-data"

/** Height of the sticky header, so a section is not scrolled underneath it. */
const HEADER_OFFSET = 96

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("search")
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [showWorkout, setShowWorkout] = useState(false)
  const [pendingScroll, setPendingScroll] = useState<string | null>(null)
  const [searchResetToken, setSearchResetToken] = useState(0)

  const handlePlanetSelect = (planet: Exoplanet) => {
    setSelectedPlanet(planet)
    setShowWorkout(true)
  }

  const handleBackToSearch = () => {
    setShowWorkout(false)
    setSelectedPlanet(null)
  }

  // Header nav works from the workout view too, so leave that view first and
  // scroll once the target section is actually mounted.
  const handleNavigate = (target: NavTarget) => {
    setShowWorkout(false)
    setSelectedPlanet(null)
    // PlanetSearch opens workouts inside itself, so clearing the page-level
    // state is not enough. Any header nav should land on a clean page.
    setSearchResetToken((n) => n + 1)
    if (target === "about") {
      setPendingScroll("about")
      return
    }
    setActiveTab(target)
    setPendingScroll("explore")
  }

  // Scrolling to a section has two hazards. Closing a workout renders the full
  // planet list underneath, which can move the target thousands of pixels well
  // after the click, and some browsers ignore smooth scrolling entirely.
  // So: aim now, re-aim on every layout change, then finish with an instant
  // scroll that guarantees we arrive even where smooth scrolling is a no-op.
  useEffect(() => {
    if (!pendingScroll || showWorkout) return
    const id = pendingScroll

    const go = (behavior: ScrollBehavior) => {
      const el = document.getElementById(id)
      if (!el) return
      window.scrollTo({
        top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET),
        behavior,
      })
    }

    go("smooth")

    const observer = new ResizeObserver(() => go("smooth"))
    observer.observe(document.body)

    const finish = setTimeout(() => {
      observer.disconnect()
      go("auto")
      setPendingScroll(null)
    }, 900)

    return () => {
      observer.disconnect()
      clearTimeout(finish)
    }
  }, [pendingScroll, showWorkout])

  if (showWorkout && selectedPlanet) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} />
        <main className="container mx-auto px-4 py-8">
          <WorkoutGenerator planet={selectedPlanet} onBack={handleBackToSearch} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header active={activeTab === "map" ? "map" : "search"} onNavigate={handleNavigate} />
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

        <Tabs id="explore" value={activeTab} onValueChange={setActiveTab} className="space-y-8 scroll-mt-24">
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
            <PlanetSearch resetToken={searchResetToken} />
          </TabsContent>

          <TabsContent value="map">
            <GravityMap onPlanetSelect={handlePlanetSelect} />
          </TabsContent>
        </Tabs>

        <section id="about" className="mt-20 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">About GravityFit</h2>
            <p className="text-muted-foreground text-balance max-w-2xl mx-auto">
              Astronauts on the ISS train roughly two hours a day to offset the bone density and muscle loss that come
              with microgravity. GravityFit asks what that regimen would look like on any other world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sigma className="h-5 w-5 text-primary" />
                  How the numbers work
                </CardTitle>
                <CardDescription>Two steps, both computed from published planetary parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Surface gravity relative to Earth:</div>
                  <code className="font-mono text-primary">g = mass / radius²</code>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Training intensity, on a 1–10 scale:</div>
                  <code className="font-mono text-primary">I = round(1 + 9 × (1 − g))</code>
                </div>
                <p className="text-muted-foreground pt-1">
                  Lower gravity means a higher intensity index: with less weight to move, your body has to do the work
                  that gravity would otherwise do for it.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-accent" />
                  The data
                </CardTitle>
                <CardDescription>NASA Exoplanet Archive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Built from the Archive's Planetary Systems table — 429 published measurements covering 261 planets.
                  Many planets appear several times with competing values, so the set is filtered to the row NASA marks
                  as the default parameter set for each planet, leaving{" "}
                  <span className="text-foreground font-medium">190 planets</span>, every one with both a measured mass
                  and radius. The remaining 71 have no default row and are excluded.
                </p>
                <p>
                  Every figure on a planet card — gravity, orbital period, equilibrium temperature, distance — comes
                  from that dataset rather than being estimated.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HeartPulse className="h-5 w-5 text-chart-3" />
                  How workouts are built
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  The intensity index drives a 7-day plan: loads, sets and reps are scaled per exercise, with each
                  movement weighted by how much it actually depends on gravity — deadlifts scale far more than
                  resistance bands.
                </p>
                <p>
                  Plans carry equipment set-points and safety notes, and can be exported to PDF or CSV for use in a real
                  gym.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-chart-5" />
                  Carolina Data Challenge 2025
                </CardTitle>
                <CardDescription>First place.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Built in 24 hours at UNC Chapel Hill in September 2025, competing against 80+ teams, and judged on
                  innovation, technical rigor and data visualization.
                </p>
                <p>
                  The app runs entirely on Next.js — the interface and the plan-generating API ship as one deployment.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
