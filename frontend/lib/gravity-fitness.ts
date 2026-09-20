/**
 * Canonical GravityFit domain logic.
 *
 * TypeScript port of the FastAPI services so the same code backs both the
 * deployed route handlers (app/api/*) and the client-side fallback in lib/api.ts:
 *   - backend/app/services/planetary_calculator.py
 *   - backend/app/services/workout_planner.py
 *
 * Keep this in sync with the Python if you ever change one side.
 */

import type { Exercise, Session, WeeklyPlan } from './api'

export type Mapping = 'linear' | 'nonlinear'

/**
 * g_fraction = pl_bmasse / (pl_rade ** 2), in Earth units, clamped to [0, 1].
 */
export function calculateGFraction(plBmasse: number, plRade: number): number {
  if (!(plRade > 0)) {
    throw new Error('Planet radius must be positive')
  }
  return clamp(plBmasse / plRade ** 2, 0, 1)
}

/**
 * Intensity index from gravity fraction.
 *   linear:    I = round(1 + 9 * (1 - g))
 *   nonlinear: I = round(1 + 9 * (1 - g ** alpha))
 * Clamped to [1, 10]. Lower gravity => higher intensity.
 */
export function calculateIntensityIndex(
  gFraction: number,
  alpha: number = 1.0,
  mapping: Mapping = 'linear',
): number {
  const g = clamp(gFraction, 0, 1)
  const raw =
    mapping === 'linear'
      ? Math.round(1 + 9 * (1 - g))
      : Math.round(1 + 9 * (1 - g ** alpha))
  return clamp(raw, 1, 10)
}

export function intensityFormula(mapping: Mapping, alpha: number): string {
  return `I = round(1 + 9 * (1 - g_fraction${mapping === 'nonlinear' ? `^${alpha}` : ''}))`
}

interface BaseExercise {
  name: string
  type: 'strength' | 'cardio' | 'flexibility'
  base_load: number
  base_sets?: number
  base_reps?: number
  scaling_factor: number
}

const BASE_EXERCISES: BaseExercise[] = [
  { name: 'Squats', type: 'strength', base_load: 60, base_sets: 3, base_reps: 12, scaling_factor: 0.8 },
  { name: 'Push-ups', type: 'strength', base_load: 0, base_sets: 3, base_reps: 15, scaling_factor: 0.7 },
  { name: 'Deadlifts', type: 'strength', base_load: 80, base_sets: 3, base_reps: 8, scaling_factor: 0.9 },
  { name: 'Cardio Run', type: 'cardio', base_load: 30, scaling_factor: 0.6 },
  { name: 'Resistance Band', type: 'strength', base_load: 25, base_sets: 3, base_reps: 15, scaling_factor: 0.3 },
  { name: 'Yoga Flow', type: 'flexibility', base_load: 20, scaling_factor: 0.2 },
]

const SESSION_TYPES = [
  'Full Body Strength',
  'Cardio Focus',
  'Upper Body',
  'Active Recovery',
  'Lower Body',
  'HIIT Training',
  'Flexibility & Recovery',
]

/**
 * Generate the 7-day plan. Mirrors generate_workout_plan() in workout_planner.py.
 */
export function generateWorkoutPlan(intensityIndex: number, gFraction?: number | null): WeeklyPlan {
  const hasGravity = gFraction !== undefined && gFraction !== null
  const gravityScale = hasGravity ? 1 + (gFraction! - 1) * 0.5 : 1.0
  const intensityScale = 0.5 + intensityIndex * 0.05

  const sessions: Session[] = []
  const setpointsByExercise = new Map<string, WeeklyPlan['device_setpoints'][number]>()
  const safetyNotes: string[] = []

  SESSION_TYPES.forEach((sessionType, i) => {
    // Exercise selection order matches the Python if/elif chain exactly.
    let selected: BaseExercise[]
    if (sessionType.includes('Strength')) {
      selected = BASE_EXERCISES.filter((ex) => ex.type === 'strength').slice(0, 3)
    } else if (sessionType.includes('Cardio')) {
      selected = BASE_EXERCISES.filter((ex) => ex.type === 'cardio').slice(0, 2)
    } else if (sessionType.includes('Recovery')) {
      selected = BASE_EXERCISES.filter((ex) => ex.type === 'flexibility').slice(0, 2)
    } else {
      selected = BASE_EXERCISES.slice(0, 4)
    }

    const exercises: Exercise[] = selected.map((exercise) => {
      if (exercise.type === 'cardio' || exercise.type === 'flexibility') {
        return {
          name: exercise.name,
          type: exercise.type,
          duration: Math.trunc(exercise.base_load * intensityScale * gravityScale),
        }
      }

      const load = Math.trunc(exercise.base_load * intensityScale * gravityScale)
      // The Python appends one setpoint row per session, which repeats the same
      // exercise (and identical load) across the week. Key by name so the UI
      // shows each piece of equipment once; the values are unchanged.
      setpointsByExercise.set(exercise.name, {
        exercise: exercise.name,
        setpoint: load,
        base_load: exercise.base_load,
        scaled_load: load,
      })

      return {
        name: exercise.name,
        type: exercise.type,
        duration: 0,
        sets: exercise.base_sets,
        reps: Math.trunc((exercise.base_reps ?? 0) / Math.sqrt(intensityScale)),
        load,
        device_setpoint: load,
      }
    })

    const baseDuration = 30 + intensityIndex * 3
    sessions.push({
      day: i + 1,
      name: `Day ${i + 1}: ${sessionType}`,
      duration: Math.trunc(baseDuration * gravityScale),
      exercises,
    })
  })

  if (hasGravity) {
    if (gFraction! < 0.5) {
      safetyNotes.push(
        'Low gravity: Focus on resistance training to maintain bone density',
        'Increase repetitions to compensate for reduced load',
      )
    } else if (gFraction! > 1.5) {
      safetyNotes.push(
        'High gravity: Reduce impact exercises to prevent injury',
        'Monitor heart rate closely during cardio activities',
        'Allow extra recovery time between sets',
      )
    }
  }

  if (intensityIndex >= 8) {
    safetyNotes.push('High intensity: Ensure proper warm-up and cool-down')
  } else if (intensityIndex <= 3) {
    safetyNotes.push('Low intensity: Focus on form and technique')
  }

  return {
    intensity_index: intensityIndex,
    g_fraction: hasGravity ? gFraction! : undefined,
    total_weekly_volume: sessions.reduce((total, s) => total + s.duration, 0),
    sessions,
    device_setpoints: Array.from(setpointsByExercise.values()),
    safety_notes: safetyNotes,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
