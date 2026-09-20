"use client"

import { Button } from "@/components/ui/button"
import { Rocket, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavTarget = "search" | "map" | "about"

interface HeaderProps {
  /** The section currently on screen, or undefined while a workout is open. */
  active?: NavTarget
  onNavigate: (target: NavTarget) => void
}

const NAV_ITEMS: { target: NavTarget; label: string }[] = [
  { target: "search", label: "Planet Search" },
  { target: "map", label: "Gravity Map" },
  { target: "about", label: "About" },
]

export function Header({ active, onNavigate }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="flex items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="GravityFit home"
          >
            <div className="relative">
              <Rocket className="h-8 w-8 text-primary animate-pulse-glow" />
              <Dumbbell className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <div>
              <span className="block text-xl font-bold text-foreground">GravityFit</span>
              <p className="text-xs text-muted-foreground">Exoplanet Fitness Training</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map(({ target, label }) => (
              <Button
                key={target}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(target)}
                aria-current={active === target ? "page" : undefined}
                className={cn(
                  active === target && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                )}
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
