import { Button } from "@/components/ui/button"
import { Rocket, Dumbbell } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Rocket className="h-8 w-8 text-primary animate-pulse-glow" />
              <Dumbbell className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">GravityFit</h1>
              <p className="text-xs text-muted-foreground">Exoplanet Fitness Training</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" size="sm">
              Planet Search
            </Button>
            <Button variant="ghost" size="sm">
              Gravity Map
            </Button>
            <Button variant="ghost" size="sm">
              About
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
